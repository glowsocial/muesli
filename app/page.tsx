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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Load recordings and notes
  const loadData = useCallback(async () => {
    try {
      const [recRes, notesRes] = await Promise.all([
        fetch("/api/recordings"),
        fetch("/api/notes"),
      ]);
      if (recRes.ok) setRecordings(await recRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Timer
  const updateTimer = useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");
    setTimer(`${mins}:${secs}`);
  }, []);

  // Start recording
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
      setStatus({ text: "Recording...", type: "recording" });
      startTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(updateTimer, 1000);
    } catch {
      setStatus({
        text: "Mic access denied — check browser permissions",
        type: "error",
      });
    }
  };

  // Stop recording
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
            setStatus({
              text: `Saved! ${data.filename}`,
              type: "success",
            });
            loadData();
          } else {
            setStatus({
              text: data.error || "Upload failed",
              type: "error",
            });
          }
        } catch {
          setStatus({ text: "Upload failed — connection error", type: "error" });
        }

        setIsRecording(false);
        setTimer("00:00");
        startTimeRef.current = null;
        resolve();
      };

      recorder.stop();
    });
  };

  // Process recording
  const processRecording = async (pathname: string) => {
    const recTitle = pathname
      .split("/")
      .pop()
      ?.replace(/^\d{4}.*?_/, "")
      .replace(/\.(wav|webm)$/, "")
      .replace(/-/g, " ");

    setStatus({
      text: `Processing ${recTitle}...`,
      type: "processing",
    });

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname, title: recTitle }),
      });
      const data = await res.json();

      if (data.ok) {
        setStatus({
          text: "Notes generated!",
          type: "success",
        });
        loadData();
      } else {
        setStatus({
          text: data.error || "Processing failed",
          type: "error",
        });
      }
    } catch {
      setStatus({ text: "Connection error", type: "error" });
    }
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

  const statusColor = {
    "": "text-[var(--text-muted)]",
    recording: "text-[var(--danger)] font-medium",
    processing: "text-[var(--accent)]",
    success: "text-[var(--success)]",
    error: "text-[var(--danger-light)]",
  };

  return (
    <div className="max-w-[640px] mx-auto px-6 py-10">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
          🥣 Muesli
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          AI meeting notes — click to record
        </p>
      </header>

      {/* Controls */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's this recording? e.g. UX Review with Dan"
          className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-hover)] rounded-xl text-[var(--text-primary)] text-base outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-dim)] mb-5"
        />

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full py-4 rounded-xl text-lg font-semibold transition-all cursor-pointer ${
            isRecording
              ? "bg-[var(--danger)] text-white animate-pulse-ring hover:bg-[var(--danger-light)]"
              : "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] text-[var(--bg-main)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(245,158,11,0.3)]"
          }`}
        >
          {isRecording ? "⏹ Stop Recording" : "Start Recording"}
        </button>

        {isRecording && (
          <div className="text-3xl font-bold text-center text-[var(--danger)] mt-3 tabular-nums">
            {timer}
          </div>
        )}

        {status.text && (
          <div className={`text-center mt-4 text-sm ${statusColor[status.type]}`}>
            {status.text}
          </div>
        )}
      </div>

      {/* Recordings */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
        <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          📁 Recordings
        </h2>
        {recordings.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)] text-center py-4">
            No recordings yet
          </p>
        ) : (
          <div className="space-y-0 divide-y divide-[var(--border)]">
            {recordings.map((r) => (
              <div
                key={r.pathname}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {r.title}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {formatDate(r.uploadedAt)} · {formatSize(r.size)}
                  </div>
                </div>
                <button
                  onClick={() => processRecording(r.pathname)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] hover:bg-[var(--accent-bg-hover)] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Generate Notes
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
        <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          📝 Notes
        </h2>
        {notes.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)] text-center py-4">
            No notes yet
          </p>
        ) : (
          <div className="space-y-0 divide-y divide-[var(--border)]">
            {notes.map((n) => (
              <div key={n.pathname} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {n.title}
                  </div>
                  <a
                    href={n.url}
                    download
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-input)] border border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--border-hover)] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Download .md
                  </a>
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  {formatDate(n.uploadedAt)}
                </div>
                {n.preview && (
                  <div className="text-xs text-[var(--text-dim)] mt-2 line-clamp-2">
                    {n.preview}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
