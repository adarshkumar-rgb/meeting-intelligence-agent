# MeetMind -- AI-Powered Meeting Intelligence Agent

MeetMind is an AI-powered meeting intelligence application that turns
meeting transcripts into structured, useful outputs. It uses Google
Gemini to generate meeting summaries, identify action items, extract key
discussion points and decisions, and save meeting analyses in a local
SQLite database.

## Features

-   AI-powered meeting transcript analysis
-   Concise meeting summaries
-   Extraction of explicitly stated action items, owners, and deadlines
-   Key discussion points and decisions
-   SQLite-backed meeting history
-   View previously saved meeting analyses
-   Export analysis as a text report
-   React-based dashboard

## Technology Stack

**Frontend:** React, Vite, JavaScript, CSS, lucide-react

**Backend:** Python, FastAPI, Google Gemini API (`google-genai`),
SQLite, Uvicorn

## Project Structure

``` text
meeting-intelligence-agent/
├── backend/
│   ├── main.py
│   ├── gemini_service.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

The SQLite database is generated locally by the backend. Do not commit
local databases, virtual environments, dependency folders, or secret
environment files.

## Prerequisites

-   Python 3.10 or later
-   Node.js and npm
-   A Google Gemini API key

## Installation and Setup

### 1. Clone the repository

``` bash
git clone https://github.com/adarshkumar-rgb/meeting-intelligence-agent.git
cd meeting-intelligence-agent
```

### 2. Set up the backend

``` bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows CMD:**

``` cmd
venv\Scripts\activate
```

**Windows PowerShell:**

``` powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

``` env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
```

Replace the placeholder with your own API key. Never commit or share the
`.env` file.

### 3. Run the backend

From the `backend` directory:

``` bash
uvicorn main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

Interactive API documentation: `http://127.0.0.1:8000/docs`

### 4. Set up the frontend

Open a second terminal:

``` bash
cd frontend
npm install
```

### 5. Run the frontend

``` bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Keep both frontend and backend terminals running while using the
application.

## API Endpoints

  Method   Endpoint                       Description
  -------- ------------------------------ ------------------------------------------
  GET      `/`                            Backend root endpoint
  POST     `/api/analyze`                 Analyze a transcript and save the result
  GET      `/api/meetings`                Retrieve saved meetings
  GET      `/api/meetings/{meeting_id}`   Retrieve a specific meeting

See `http://127.0.0.1:8000/docs` for interactive API documentation and
request schemas.

## How It Works

1.  Enter a meeting title and paste the transcript into the frontend.
2.  Submit the transcript for analysis.
3.  The FastAPI backend sends the transcript to the Gemini analysis
    service.
4.  Gemini returns structured meeting insights.
5.  The backend stores the meeting and analysis in SQLite.
6.  The frontend displays the summary, action items, key points,
    decisions, and follow-ups.
7.  Open saved meetings from the meeting history.

## Security Notes

-   Store API keys in `backend/.env`.
-   Keep `.env`, local databases, virtual environments, `node_modules`,
    and build output out of Git.
-   Never commit API keys, credentials, or private meeting transcripts.
-   Keep `.env.example` limited to placeholder values.

## Current Scope

MeetMind currently analyzes text transcripts. Live meeting recording and
automatic video-conferencing integrations are not part of the current
scope.

## Future Enhancements

-   Audio upload and speech-to-text transcription
-   Live meeting transcription
-   Speaker identification
-   Search and filtering across meeting history
-   PDF report generation
-   Calendar and meeting-platform integrations
-   User authentication and cloud storage

## Contributing

Contributions and suggestions are welcome. Fork the repository, create a
feature branch, make and test your changes, and submit a pull request
describing your contribution.

## License

No license has been specified yet. Add a license before presenting the
project as open source for reuse.
