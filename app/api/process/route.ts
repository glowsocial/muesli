import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for Pro plan

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { pathname, title } = await request.json();

    if (!pathname) {
      return NextResponse.json(
        { ok: false, error: "No recording pathname provided" },
        { status: 400 }
      );
    }

    // Step 1: Download audio from Vercel Blob
    console.log(`🎙️ Downloading: ${pathname}`);
    const audioUrl = `${process.env.BLOB_READ_WRITE_TOKEN ? "" : ""}`;

    // Fetch the audio file from its blob URL
    const { blobs } = await (
      await import("@vercel/blob")
    ).list({ prefix: pathname });
    const blob = blobs.find((b) => b.pathname === pathname);

    if (!blob) {
      return NextResponse.json(
        { ok: false, error: "Recording not found" },
        { status: 404 }
      );
    }

    const audioResponse = await fetch(blob.url);
    const audioBuffer = await audioResponse.arrayBuffer();

    // Step 2: Transcribe with Whisper
    console.log("🤖 Transcribing with Whisper...");
    const audioFile = new File([audioBuffer], "recording.webm", {
      type: "audio/webm",
    });

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      response_format: "text",
    });

    const transcript = transcription as unknown as string;

    if (!transcript || transcript.trim().length < 20) {
      return NextResponse.json({
        ok: false,
        error:
          "Transcript too short — the recording may not have captured audio properly.",
      });
    }

    console.log(
      `📝 Transcript: ${transcript.length} chars`
    );

    // Step 3: Generate notes with Claude
    console.log("🧠 Generating notes with Claude...");
    const meetingDate = new Date().toISOString().split("T")[0];

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `You are a professional meeting notes assistant. Generate structured, actionable meeting notes from the following transcript.

Meeting Title: ${title || "Untitled Meeting"}
Date: ${meetingDate}

Format the notes as Obsidian-compatible Markdown with this structure:
- YAML frontmatter with tags, date, meeting title
- Summary (2-3 sentences)
- Key Decisions (bullet points)
- Action Items (checkbox format with @assignees if identifiable)
- Discussion Notes (organized by topic with h3 headers)

Be concise but thorough. Extract every actionable item. Use professional language.

TRANSCRIPT:
${transcript}`,
        },
      ],
    });

    const notesContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Step 4: Save notes to Vercel Blob
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const safeName = (title || "meeting")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 50);
    const notesFilename = `${timestamp}_${safeName}.md`;

    const notesBlob = await put(`notes/${notesFilename}`, notesContent, {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/markdown",
    });

    console.log(`✅ Notes saved: ${notesFilename}`);

    return NextResponse.json({
      ok: true,
      notesFile: notesFilename,
      notesUrl: notesBlob.url,
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Processing failed",
      },
      { status: 500 }
    );
  }
}
