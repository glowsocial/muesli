"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { signOut } from "next-auth/react";
import { upload } from '@vercel/blob/client';

type Recording = {
  url: string;
  pathname: string;
  uploadedAt: string;
  size: number;
  title: string;
};

type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  htmlLink?: string;
};

type Note = {
  url: string;
  pathname: string;
  uploadedAt: string;
  title: string;
  preview: string;
};

// Simple SVG icons — no emojis
const MicIcon = () => (
  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const StopIcon = () => (
  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

type Mode = "meeting" | "voice-memo" | "brain-dump" | "content-draft";

const MODES: { value: Mode; label: string; placeholder: string }[] = [
  { value: "meeting", label: "Meeting Notes", placeholder: "e.g. UX Review with Dan" },
  { value: "voice-memo", label: "Voice Memo", placeholder: "e.g. Quick thought on pricing" },
  { value: "brain-dump", label: "Brain Dump", placeholder: "e.g. Product roadmap ideas" },
  { value: "content-draft", label: "Content Draft", placeholder: "e.g. LinkedIn post about AI" },
];

const OPENAI_KEY_STORAGE = "muesli-openai-key";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [status, setStatus] = useState<{
    text: string;
    type: "" | "recording" | "processing" | "success" | "error";
  }>({ text: "", type: "" });
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [mode, setMode] = useState<Mode>("meeting");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [keyDraft, setKeyDraft] = useState("");
  const [keyError, setKeyError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const loadData = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const [recResult, notesResult, calResult] = await Promise.allSettled([
        fetch("/api/recordings", { signal: controller.signal }),
        fetch("/api/notes", { signal: controller.signal }),
        fetch("/api/calendar", { signal: controller.signal })
      ]);

      if (recResult.status === "fulfilled" && recResult.value.ok) {
        const recData = await recResult.value.json();
        setRecordings(recData.recordings || []);
        if (recData.email) setUserEmail(recData.email);
      }
      if (notesResult.status === "fulfilled" && notesResult.value.ok) {
        setNotes(await notesResult.value.json());
      }
      if (calResult.status === "fulfilled" && calResult.value.ok) {
        const calData = await calResult.value.json();
        if (calData.events) setCalendarEvents(calData.events);
      }
    } catch { /* timeout or network error — ignore */ }
    finally { clearTimeout(timeout); }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // When the deployment has no OpenAI key of its own, each person uses theirs.
  // It is kept in this browser only and sent with each notes request.
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.needsOpenAIKey) return;
        setNeedsKey(true);
        setOpenaiKey(window.localStorage.getItem(OPENAI_KEY_STORAGE) || "");
      })
      .catch(() => { /* leave the prompt off; the server still asks for a key */ });
  }, []);

  const saveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const value = keyDraft.trim();
    if (!value.startsWith("sk-")) {
      setKeyError("That does not look like an OpenAI key. It starts with sk-.");
      return;
    }
    window.localStorage.setItem(OPENAI_KEY_STORAGE, value);
    setOpenaiKey(value);
    setKeyDraft("");
    setKeyError("");
  };

  const removeKey = () => {
    window.localStorage.removeItem(OPENAI_KEY_STORAGE);
    setOpenaiKey("");
  };

  const updateTimer = useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");
    setTimer(`${mins}:${secs}`);
  }, []);

  const startRecording = async () => {
    setStatus({ text: "Requesting mic access...", type: "" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
      setStatus({ text: "", type: "recording" });
      startTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(updateTimer, 1000);
    } catch {
      setStatus({ text: "Mic access denied — check browser permissions", type: "error" });
    }
  };

  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        audioStreamRef.current?.getTracks().forEach((t) => t.stop());
        setStatus({ text: "Uploading securely (no size limit!)...", type: "processing" });
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const safeName = (title || "recording").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
        const filename = `${timestamp}_${safeName}.webm`;
        
        const folder = userEmail ? `recordings/${userEmail}` : `recordings/anonymous`;

        try {
          const newBlob = await upload(`${folder}/${filename}`, blob, {
            access: 'private',
            handleUploadUrl: '/api/upload',
            clientPayload: JSON.stringify({ email: userEmail })
          });

          setStatus({ text: "Recording saved securely!", type: "success" });
          setTitle("");
          loadData();
        } catch (error) {
          setStatus({ text: "Upload failed: " + (error as Error).message, type: "error" });
        }
        setIsRecording(false);
        setTimer("00:00");
        startTimeRef.current = null;
        resolve();
      };
      recorder.stop();
    });
  };

  const processRecording = async (pathname: string, recTitle: string) => {
    if (needsKey && !openaiKey) {
      setStatus({ text: "Add your OpenAI key above to generate notes.", type: "error" });
      return;
    }
    setProcessingId(pathname);
    setStatus({ text: `Processing "${recTitle}"...`, type: "processing" });
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(needsKey ? { "x-openai-key": openaiKey } : {}) },
        body: JSON.stringify({ pathname, title: recTitle, mode }),
      });
      const data = await res.json();
      if (data.ok) { 
        setStatus({ text: "Notes generated!", type: "success" }); 
        
        // Push notes to calendar if an event was selected
        if (selectedEventId && data.notesText) {
          setStatus({ text: "Adding to Google Calendar...", type: "processing" });
          try {
            await fetch("/api/calendar", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ eventId: selectedEventId, notesText: data.notesText }),
            });
            setStatus({ text: "Notes added to Calendar!", type: "success" });
          } catch {
             setStatus({ text: "Generated, but couldn't add to calendar", type: "error" });
          }
        }
        
        loadData(); 
      }
      else { setStatus({ text: data.error || "Processing failed", type: "error" }); }
    } catch { setStatus({ text: "Connection error", type: "error" }); }
    setProcessingId(null);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const formatSize = (bytes: number) => {
    const kb = Math.round(bytes / 1024);
    return kb > 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${kb} KB`;
  };

  return (
    <>
      <div className="container">
        {/* Dashboard header */}
        <div className="dash-header">
          <h1 className="dash-brand">Muesli</h1>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost">
            Sign Out
          </button>
        </div>

        {needsKey && (
          <div className="card compact">
            <div className="section-header">
              <h2 className="section-title">Your OpenAI key</h2>
            </div>
            {openaiKey ? (
              <div className="list-item">
                <div className="list-item-info">
                  <div className="key-saved">Key saved in this browser</div>
                  <div className="list-item-meta">Muesli uses it to write your notes. It is never stored on the server.</div>
                </div>
                <button onClick={removeKey} className="btn-sm neutral">Remove key</button>
              </div>
            ) : (
              <form onSubmit={saveKey}>
                <p className="key-help">
                  Muesli writes your notes with your own OpenAI key. It stays in this browser and is sent only when you generate notes.
                  Get a key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">platform.openai.com/api-keys</a>.
                </p>
                <label htmlFor="openai-key" className="sr-only">OpenAI API key</label>
                <div className="key-row">
                  <input
                    id="openai-key"
                    type="password"
                    autoComplete="off"
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    placeholder="sk-..."
                    className="title-input"
                    required
                  />
                  <button type="submit" className="btn-sm accent">Save key</button>
                </div>
                {keyError && <div className="status error" role="alert">{keyError}</div>}
              </form>
            )}
          </div>
        )}

        {/* Recording Card */}
        <div className="card">
          <div className="mode-selector" role="group" aria-label="Recording mode">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                disabled={isRecording}
                aria-pressed={mode === m.value}
                className={`mode-btn ${mode === m.value ? "active" : ""}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {calendarEvents.length > 0 && (
            <div className="calendar-events-wrap" role="group" aria-label="Calendar events" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 8 }}>
              {calendarEvents.map(event => {
                const isSelected = selectedEventId === event.id;
                const date = new Date(event.start);
                const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                return (
                  <button
                    key={event.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedEventId(null);
                        setTitle("");
                      } else {
                        setSelectedEventId(event.id);
                        setTitle(event.summary);
                        setMode("meeting");
                      }
                    }}
                    className={`calendar-event-btn ${isSelected ? "active" : ""}`}
                    disabled={isRecording}
                    aria-pressed={isSelected}
                    style={{
                      flex: "0 0 auto",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: isSelected ? "2px solid var(--accent)" : "1px solid var(--card-border)",
                      background: isSelected ? "var(--accent-bg)" : "var(--card)",
                      cursor: isRecording ? "not-allowed" : "pointer",
                      textAlign: "left",
                      minWidth: 140,
                      maxWidth: 220,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {event.summary}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{time}</div>
                  </button>
                );
              })}
            </div>
          )}

          <label htmlFor="recording-title" className="sr-only">Recording title</label>
          <input
            id="recording-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={MODES.find((m) => m.value === mode)?.placeholder || "Title"}
            disabled={isRecording}
            className="title-input"
          />

          {isRecording && (
            <div className="recording-viz">
              <div className="waveform">
                {[...Array(9)].map((_, i) => (
                  <span key={i} className="wave-bar" />
                ))}
              </div>
              <div className="timer">{timer}</div>
              <div className="recording-badge">
                <span className="dot" />
                Recording
              </div>
            </div>
          )}

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`record-btn ${isRecording ? "stop" : "start"}`}
          >
            {isRecording ? <><StopIcon /> Stop Recording</> : <><MicIcon /> Start Recording</>}
          </button>

          <div role="status" aria-live="polite">
            {status.text && (
              <div className={`status ${status.type}`}>
                {status.type === "processing" && <span className="spinner" aria-hidden="true" />}
                {status.text}
              </div>
            )}
          </div>
        </div>

        {/* Recordings */}
        <div className="card compact">
          <div className="section-header">
            <h2 className="section-title">Recordings</h2>
            {recordings.length > 0 && (
              <span className="section-count">{recordings.length}</span>
            )}
          </div>

          {recordings.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <p>Hit record to get started</p>
            </div>
          ) : (
            <div>
              {recordings.map((r) => (
                <div key={r.pathname} className="list-item">
                  <div className="list-item-info">
                    <div className="list-item-name">{r.title}</div>
                    <div className="list-item-meta">{formatDate(r.uploadedAt)} · {formatSize(r.size)}</div>
                  </div>
                  <button
                    onClick={() => processRecording(r.pathname, r.title)}
                    disabled={processingId === r.pathname}
                    className="btn-sm accent"
                  >
                    {processingId === r.pathname ? <><span className="spinner" aria-hidden="true" /> Processing...</> : "Generate Notes"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card compact">
          <div className="section-header">
            <h2 className="section-title">Notes</h2>
            {notes.length > 0 && (
              <span className="section-count">{notes.length}</span>
            )}
          </div>

          {notes.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <p>Notes will appear here after processing</p>
            </div>
          ) : (
            <div>
              {notes.map((n) => (
                <div key={n.pathname} className="list-item">
                  <div className="list-item-info">
                    <div className="list-item-name">{n.title}</div>
                    <div className="list-item-meta">{formatDate(n.uploadedAt)}</div>
                  </div>
                  <a href={`/api/notes/download?pathname=${encodeURIComponent(n.pathname)}`} download className="btn-sm neutral">
                    <DownloadIcon /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="footer">
          Powered by OpenAI
        </footer>
      </div>
    </>
  );
}
