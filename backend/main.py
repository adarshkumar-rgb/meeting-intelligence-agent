
from datetime import datetime, timezone
from pathlib import Path
import json
import sqlite3

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from gemini_service import analyze_meeting


# ---------------- CONFIGURATION ----------------

app = FastAPI(title="Meeting Intelligence Agent")

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "meeting_history.db"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- DATABASE ----------------

def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                transcript TEXT NOT NULL,
                analysis TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


initialize_database()


# ---------------- REQUEST MODEL ----------------

class MeetingRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=100000)
    title: str = Field(
        default="Untitled Meeting",
        min_length=1,
        max_length=200
    )


# ---------------- HELPERS ----------------

def meeting_to_dict(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "transcript": row["transcript"],
        "analysis": json.loads(row["analysis"]),
        "created_at": row["created_at"],
    }


# ---------------- API ROUTES ----------------

@app.get("/")
def home():
    return {
        "message": "Meeting Intelligence API is running",
        "docs": "/docs"
    }


@app.post("/api/analyze", status_code=201)
def analyze(request: MeetingRequest):
    transcript = request.transcript.strip()
    title = request.title.strip()

    if not transcript:
        raise HTTPException(
            status_code=422,
            detail="Transcript cannot be empty."
        )

    if not title:
        raise HTTPException(
            status_code=422,
            detail="Meeting title cannot be empty."
        )

    try:
        result = analyze_meeting(transcript)
    except Exception as exc:
        print(f"Meeting analysis error: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Meeting analysis failed. Please try again."
        ) from exc

    created_at = datetime.now(timezone.utc).isoformat()

    try:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO meetings
                    (title, transcript, analysis, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (
                    title,
                    transcript,
                    json.dumps(result),
                    created_at,
                ),
            )
            meeting_id = cursor.lastrowid

            row = connection.execute(
                "SELECT * FROM meetings WHERE id = ?",
                (meeting_id,),
            ).fetchone()

    except sqlite3.Error as exc:
        print(f"Database error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Analysis succeeded, but saving the meeting failed."
        ) from exc

    return {
        "status": "success",
        "meeting": meeting_to_dict(row),
    }


@app.get("/api/meetings")
def list_meetings(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, title, created_at
            FROM meetings
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        ).fetchall()

        total = connection.execute(
            "SELECT COUNT(*) FROM meetings"
        ).fetchone()[0]

    return {
        "total": total,
        "meetings": [dict(row) for row in rows],
    }


@app.get("/api/meetings/{meeting_id}")
def get_meeting(meeting_id: int):
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM meetings WHERE id = ?",
            (meeting_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found."
        )

    return meeting_to_dict(row)
