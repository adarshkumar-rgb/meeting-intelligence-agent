
import { useEffect, useState } from "react";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  ListChecks,
  LoaderCircle,
  MessageSquareText,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [meeting, setMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  async function loadHistory() {
    setHistoryLoading(true);

    try {
      const response = await fetch(`${API}/api/meetings`);

      if (!response.ok) {
        throw new Error("Could not load meeting history.");
      }

      const data = await response.json();
      setMeetings(data.meetings || []);
    } catch (err) {
      setError(
        "Could not connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function analyzeMeeting(event) {
    event.preventDefault();

    if (!transcript.trim()) {
      setError("Please enter a meeting transcript first.");
      return;
    }

    setLoading(true);
    setError("");
    setMeeting(null);

    try {
      const response = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim() || "Untitled Meeting",
          transcript: transcript.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Meeting analysis failed. Please try again."
        );
      }

      setMeeting(data.meeting);
      setTitle("");
      setActiveTab("overview");
      await loadHistory();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function openMeeting(id) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/meetings/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not open this meeting.");
      }

      setMeeting(data);
      setTitle(data.title);
      setTranscript(data.transcript);
      setActiveTab("overview");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startNewMeeting() {
    setMeeting(null);
    setTitle("");
    setTranscript("");
    setError("");
    setActiveTab("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exportMeeting() {
    if (!meeting) return;

    const content = [
      `Meeting: ${meeting.title}`,
      `Created: ${new Date(meeting.created_at).toLocaleString()}`,
      "",
      "SUMMARY",
      meeting.analysis.summary,
      "",
      "KEY POINTS",
      ...(meeting.analysis.key_points || []).map(
        (item) => `- ${item}`
      ),
      "",
      "DECISIONS",
      ...(meeting.analysis.decisions || []).map(
        (item) => `- ${item}`
      ),
      "",
      "ACTION ITEMS",
      ...(meeting.analysis.action_items || []).map(
        (item) =>
          `- ${item.task} | Owner: ${item.owner} | Deadline: ${item.deadline}`
      ),
      "",
      "FOLLOW-UPS",
      ...(meeting.analysis.follow_ups || []).map(
        (item) => `- ${item}`
      ),
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${meeting.title.replace(
      /[^a-z0-9-_]/gi,
      "_"
    )}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const analysis = meeting?.analysis;
  const actionItems = analysis?.action_items || [];
  const decisions = analysis?.decisions || [];
  const keyPoints = analysis?.key_points || [];
  const followUps = analysis?.follow_ups || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Brain size={23} />
          </div>
          <div>
            <h1>MeetMind</h1>
            <p>MEETING INTELLIGENCE</p>
          </div>
        </div>

        <button
          className="new-meeting-btn"
          onClick={startNewMeeting}
        >
          <Plus size={18} />
          New meeting
        </button>

        <div className="sidebar-label">WORKSPACE</div>

        <button
          className={`nav-item ${
            activeTab === "overview" ? "active" : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <Sparkles size={18} />
          Meeting analysis
        </button>

        <button
          className={`nav-item ${
            activeTab === "history" ? "active" : ""
          }`}
          onClick={() => setActiveTab("history")}
        >
          <History size={18} />
          Meeting history
          <span className="nav-count">{meetings.length}</span>
        </button>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>AI engine connected</strong>
            <span>FastAPI · Gemini</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            {activeTab === "history"
              ? "Meeting history"
              : "Meeting analysis"}
          </div>
          <div className="topbar-right">
            <span className="connection-pill">
              <span className="status-dot" />
              System ready
            </span>
            <div className="avatar">M</div>
          </div>
        </header>

        <div className="page-content">
          {activeTab === "history" ? (
            <section className="history-page">
              <div className="page-heading">
                <div>
                  <span className="eyebrow">YOUR WORKSPACE</span>
                  <h2>Meeting history</h2>
                  <p>
                    Revisit previous conversations and their
                    action items.
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={startNewMeeting}
                >
                  <Plus size={17} />
                  New meeting
                </button>
              </div>

              <div className="history-card">
                <div className="history-card-heading">
                  <h3>Saved meetings</h3>
                  <button
                    className="icon-btn"
                    onClick={loadHistory}
                    disabled={historyLoading}
                    aria-label="Refresh history"
                  >
                    <RefreshCw
                      size={17}
                      className={
                        historyLoading ? "spin" : ""
                      }
                    />
                  </button>
                </div>

                {meetings.length === 0 ? (
                  <div className="empty-state">
                    <History size={30} />
                    <h3>No saved meetings yet</h3>
                    <p>
                      Analyze your first transcript to see it here.
                    </p>
                  </div>
                ) : (
                  meetings.map((item) => (
                    <button
                      key={item.id}
                      className="history-row"
                      onClick={() => openMeeting(item.id)}
                    >
                      <div className="history-file-icon">
                        <FileText size={19} />
                      </div>
                      <div className="history-row-info">
                        <strong>{item.title}</strong>
                        <span>
                          {new Date(
                            item.created_at
                          ).toLocaleString()}
                        </span>
                      </div>
                      <span className="meeting-id">
                        #{item.id}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>
          ) : (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">
                    AI-POWERED PRODUCTIVITY
                  </span>
                  <h2>Meeting intelligence</h2>
                  <p>
                    Turn conversations into clear outcomes,
                    decisions, and actionable tasks.
                  </p>
                </div>

                {meeting && (
                  <button
                    className="secondary-btn"
                    onClick={exportMeeting}
                  >
                    <FileText size={17} />
                    Export report
                  </button>
                )}
              </section>

              {error && (
                <div className="error-banner">
                  <span>{error}</span>
                  <button
                    onClick={() => setError("")}
                    aria-label="Dismiss error"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              <section className="workspace-grid">
                <div className="input-card">
                  <div className="card-heading">
                    <div className="heading-icon purple">
                      <MessageSquareText size={19} />
                    </div>
                    <div>
                      <h3>Meeting transcript</h3>
                      <p>Provide the conversation to analyze.</p>
                    </div>
                  </div>

                  <form onSubmit={analyzeMeeting}>
                    <label htmlFor="meeting-title">
                      Meeting title
                    </label>
                    <input
                      id="meeting-title"
                      type="text"
                      placeholder="e.g. Weekly project sync"
                      value={title}
                      onChange={(event) =>
                        setTitle(event.target.value)
                      }
                      maxLength={200}
                    />

                    <div className="transcript-label">
                      <label htmlFor="transcript">
                        Transcript
                      </label>
                      <span>
                        {transcript.length.toLocaleString()} / 100,000
                      </span>
                    </div>

                    <textarea
                      id="transcript"
                      placeholder={
                        "Paste your meeting transcript here...\n\nAsha: We need to finalize the dashboard by Friday.\nRahul: I'll complete the charts by Wednesday."
                      }
                      value={transcript}
                      onChange={(event) =>
                        setTranscript(event.target.value)
                      }
                      maxLength={100000}
                      rows={11}
                    />

                    <div className="input-footer">
                      <span>
                        <Sparkles size={14} />
                        Powered by Gemini
                      </span>
                      <button
                        className="primary-btn analyze-btn"
                        type="submit"
                        disabled={
                          loading || !transcript.trim()
                        }
                      >
                        {loading ? (
                          <>
                            <LoaderCircle
                              size={17}
                              className="spin"
                            />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles size={17} />
                            Analyze meeting
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="privacy-note">
                    <CheckCircle2 size={15} />
                    Your transcript is saved to your local
                    meeting database.
                  </div>
                </div>

                <div className="results-column">
                  <div className="results-header">
                    <div>
                      <span className="eyebrow">
                        INTELLIGENCE REPORT
                      </span>
                      <h3>
                        {meeting
                          ? meeting.title
                          : "Meeting insights"}
                      </h3>
                    </div>
                    {meeting && (
                      <span className="success-pill">
                        <CheckCircle2 size={14} />
                        Analyzed
                      </span>
                    )}
                  </div>

                  {!analysis ? (
                    <div className="results-empty">
                      <div className="empty-illustration">
                        <Brain size={35} />
                        <Sparkles
                          size={17}
                          className="floating-sparkle"
                        />
                      </div>
                      <h3>Your insights will appear here</h3>
                      <p>
                        Submit a transcript to generate a summary,
                        identify decisions, and extract action items.
                      </p>
                      <div className="feature-preview">
                        <span>
                          <CheckCircle2 size={15} /> Smart summaries
                        </span>
                        <span>
                          <CheckCircle2 size={15} /> Action tracking
                        </span>
                        <span>
                          <CheckCircle2 size={15} /> Decision capture
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="stats-grid">
                        <div className="stat-card">
                          <div className="stat-icon blue">
                            <ListChecks size={18} />
                          </div>
                          <strong>{actionItems.length}</strong>
                          <span>Action items</span>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon green">
                            <Target size={18} />
                          </div>
                          <strong>{decisions.length}</strong>
                          <span>Decisions</span>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon orange">
                            <CalendarDays size={18} />
                          </div>
                          <strong>{followUps.length}</strong>
                          <span>Follow-ups</span>
                        </div>
                      </div>

                      <div className="result-card summary-card">
                        <div className="result-title">
                          <div className="section-icon purple">
                            <Brain size={17} />
                          </div>
                          <h4>Executive summary</h4>
                        </div>
                        <p>{analysis.summary}</p>
                        <div className="result-meta">
                          <Clock3 size={14} />
                          {new Date(
                            meeting.created_at
                          ).toLocaleString()}
                        </div>
                      </div>

                      <div className="result-card">
                        <div className="result-title">
                          <div className="section-icon blue">
                            <ListChecks size={17} />
                          </div>
                          <h4>Action items</h4>
                          <span className="section-count">
                            {actionItems.length}
                          </span>
                        </div>

                        {actionItems.length === 0 ? (
                          <p className="muted-text">
                            No explicit action items identified.
                          </p>
                        ) : (
                          <div className="action-list">
                            {actionItems.map((item, index) => (
                              <div
                                className="action-item"
                                key={`${index}-${item.task}`}
                              >
                                <div className="action-number">
                                  {index + 1}
                                </div>
                                <div className="action-content">
                                  <strong>{item.task}</strong>
                                  <div className="action-meta">
                                    <span>
                                      <Users size={13} />
                                      {item.owner || "Unknown"}
                                    </span>
                                    <span>
                                      <CalendarDays size={13} />
                                      {item.deadline ||
                                        "Not specified"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="result-card">
                        <div className="result-title">
                          <div className="section-icon green">
                            <Target size={17} />
                          </div>
                          <h4>Key points</h4>
                        </div>
                        {keyPoints.length ? (
                          <ul className="insight-list">
                            {keyPoints.map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="muted-text">
                            No key points identified.
                          </p>
                        )}
                      </div>

                      <div className="result-card">
                        <div className="result-title">
                          <div className="section-icon orange">
                            <CheckCircle2 size={17} />
                          </div>
                          <h4>Decisions</h4>
                          <span className="section-count">
                            {decisions.length}
                          </span>
                        </div>
                        {decisions.length ? (
                          <ul className="insight-list">
                            {decisions.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="muted-text">
                            No explicit decisions identified.
                          </p>
                        )}
                      </div>

                      <div className="result-card">
                        <div className="result-title">
                          <div className="section-icon purple">
                            <MessageSquareText size={17} />
                          </div>
                          <h4>Follow-ups</h4>
                        </div>
                        {followUps.length ? (
                          <ul className="insight-list">
                            {followUps.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="muted-text">
                            No follow-ups identified.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        <footer className="app-footer">
          <span>MeetMind · Meeting Intelligence Agent</span>
          <span>React · FastAPI · Gemini · SQLite</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
