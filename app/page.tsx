"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Recording = {
  url: string;
  pathname: string;
  uploadedAt: string;
  size: number;
  title: string;
};

type Note = {
  url: string;
  pathname: string;
  uploadedAt: string;
  title: string;
  preview: string;
};

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [status, setStatus] = useState<{
    text: string;
    type: "" | "recording" | "processing" | "success" | "error";
  }>({ text: "", type: "" });
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [recRes, notesRes] = await Promise.all([
        fetch("/api/recordings"),
        fetch("/api/notes"),
      ]);
      if (recRes.ok) setRecordings(await recRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

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
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
      setStatus({ text: "", type: "recording" });
      startTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(updateTimer, 1000);
    } catch {
      setStatus({
        text: "Mic access denied — check browser permissions",
        type: "error",
      });
    }
  };

  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        audioStreamRef.current?.getTracks().forEach((t) => t.stop());
        setStatus({ text: "Uploading audio...", type: "processing" });

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("title", title || "recording");

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.ok) {
            setStatus({ text: "Recording saved!", type: "success" });
            setTitle("");
            loadData();
          } else {
            setStatus({ text: data.error || "Upload failed", type: "error" });
          }
        } catch {
          setStatus({ text: "Upload failed", type: "error" });
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
    setProcessingId(pathname);
    setStatus({ text: `Processing "${recTitle}"...`, type: "processing" });
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname, title: recTitle }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ text: "Notes generated!", type: "success" });
        loadData();
      } else {
        setStatus({ text: data.error || "Processing failed", type: "error" });
      }
    } catch {
      setStatus({ text: "Connection error", type: "error" });
    }
    setProcessingId(null);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const formatSize = (bytes: number) => {
    const kb = Math.round(bytes / 1024);
    return kb > 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${kb} KB`;
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <span className="emoji">🥣</span>
          <h1>Muesli</h1>
        </div>
        <p>Record anything · Get AI-powered notes</p>
      </header>

      {/* Recording Card */}
      <div className="card">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's this recording? e.g. UX Review with Dan"
          disabled={isRecording}
          className="title-input"
        />

        {/* Waveform visualizer */}
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
          {isRecording ? "⏹  Stop Recording" : "🎤  Start Recording"}
        </button>

        {status.text && (
          <div className={`status ${status.type}`}>
            {status.type === "processing" && <span className="spinner" />}
            {status.type === "success" && "✓ "}
            {status.text}
          </div>
        )}
      </div>

      {/* Recordings */}
      <div className="card compact">
        <div className="section-header">
          <span className="section-title">Recordings</span>
          {recordings.length > 0 && (
            <span className="section-count">{recordings.length}</span>
          )}
        </div>

        {recordings.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎙️</div>
            <p>Hit record to get started</p>
          </div>
        ) : (
          <div>
            {recordings.map((r) => (
              <div key={r.pathname} className="list-item">
                <div className="list-item-info">
                  <div className="list-item-name">{r.title}</div>
                  <div className="list-item-meta">
                    {formatDate(r.uploadedAt)} · {formatSize(r.size)}
                  </div>
                </div>
                <button
                  onClick={() => processRecording(r.pathname, r.title)}
                  disabled={processingId === r.pathname}
                  className="btn-sm accent"
                >
                  {processingId === r.pathname ? (
                    <>
                      <span className="spinner" /> Processing...
                    </>
                  ) : (
                    "Generate Notes"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card compact">
        <div className="section-header">
          <span className="section-title">Notes</span>
          {notes.length > 0 && (
            <span className="section-count">{notes.length}</span>
          )}
        </div>

        {notes.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📝</div>
            <p>Notes will appear here after processing</p>
          </div>
        ) : (
          <div>
            {notes.map((n) => (
              <div key={n.pathname} className="list-item">
                <div className="list-item-info">
                  <div className="list-item-name">{n.title}</div>
                  <div className="list-item-meta">
                    {formatDate(n.uploadedAt)}
                  </div>
                </div>
                <a href={n.url} download className="btn-sm neutral">
                  ↓ Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer">
        Powered by Whisper + Claude · ~$0.21 per meeting
      </footer>
    </div>
  );
}
