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
            loadData();
          } else {
            setStatus({
              text: data.error || "Upload failed",
              type: "error",
            });
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
        setStatus({
          text: data.error || "Processing failed",
          type: "error",
        });
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
    <div className="relative z-10 max-w-[640px] mx-auto px-5 py-12 sm:px-6">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-4xl">🥣</span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            Muesli
          </h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] tracking-wide">
          Record anything · Get AI-powered notes
        </p>
      </header>

      {/* Recording Card */}
      <div className="glass-card p-8 mb-6">
        {/* Title Input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's this recording?"
            disabled={isRecording}
            className="focus-ring w-full px-5 py-3.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-base outline-none focus:border-[var(--accent)] transition-all duration-200 placeholder:text-[var(--text-dim)] disabled:opacity-50"
          />
        </div>

        {/* Recording Visualizer */}
        {isRecording && (
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-end justify-center h-8 mb-4">
              {[...Array(9)].map((_, i) => (
                <span key={i} className="wave-bar" />
              ))}
            </div>
            <div className="text-4xl font-bold text-[var(--danger)] tabular-nums tracking-tight">
              {timer}
            </div>
            <div className="badge badge-recording mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Recording
            </div>
          </div>
        )}

        {/* Record Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`btn-shine w-full py-4 rounded-2xl text-lg font-semibold transition-all duration-300 cursor-pointer ${
            isRecording
              ? "bg-[var(--danger)] text-white animate-pulse-ring hover:bg-red-500"
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-[var(--bg-main)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(245,158,11,0.3)]"
          }`}
        >
          {isRecording ? "⏹  Stop Recording" : "🎤  Start Recording"}
        </button>

        {/* Status */}
        {status.text && (
          <div
            className={`text-center mt-5 text-sm font-medium transition-all duration-300 ${
              status.type === "error"
                ? "text-red-400"
                : status.type === "success"
                ? "text-emerald-400"
                : status.type === "processing"
                ? "text-amber-400"
                : "text-[var(--text-muted)]"
            }`}
          >
            {status.type === "processing" && (
              <span className="inline-block w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mr-2 align-middle" />
            )}
            {status.type === "success" && <span className="mr-1">✓</span>}
            {status.type === "error" && <span className="mr-1">✗</span>}
            {status.text}
          </div>
        )}
      </div>

      {/* Recordings */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
            Recordings
          </h2>
          {recordings.length > 0 && (
            <span className="text-xs text-[var(--text-dim)] tabular-nums">
              {recordings.length}
            </span>
          )}
        </div>

        {recordings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2 opacity-40">🎙️</div>
            <p className="text-sm text-[var(--text-dim)]">
              Hit record to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {recordings.map((r) => (
              <div key={r.pathname} className="list-item-hover flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {r.title}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {formatDate(r.uploadedAt)} · {formatSize(r.size)}
                  </div>
                </div>
                <button
                  onClick={() => processRecording(r.pathname, r.title)}
                  disabled={processingId === r.pathname}
                  className="ml-3 px-4 py-2 text-xs font-medium rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-wait"
                >
                  {processingId === r.pathname ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                      Processing
                    </span>
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
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
            Notes
          </h2>
          {notes.length > 0 && (
            <span className="text-xs text-[var(--text-dim)] tabular-nums">
              {notes.length}
            </span>
          )}
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2 opacity-40">📝</div>
            <p className="text-sm text-[var(--text-dim)]">
              Notes will appear here after processing
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {notes.map((n) => (
              <div key={n.pathname} className="list-item-hover flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate capitalize">
                    {n.title}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {formatDate(n.uploadedAt)}
                  </div>
                </div>
                <a
                  href={n.url}
                  download
                  className="ml-3 px-4 py-2 text-xs font-medium rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  ↓ Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center mt-10 text-xs text-[var(--text-dim)]">
        Powered by Whisper + Claude · ~$0.21 per meeting
      </footer>
    </div>
  );
}
