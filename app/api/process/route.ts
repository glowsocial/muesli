import { get, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/auth";
import { getNotesText, NOTES_MODEL, TRANSCRIPTION_MODEL } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for Pro plan

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { pathname, title, mode = "meeting" } = await request.json();

    if (!pathname) {
      return NextResponse.json(
        { ok: false, error: "No recording pathname provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Add your OpenAI API key (OPENAI_API_KEY) to generate notes." },
        { status: 500 }
      );
    }

    // Lazy-init client (env vars not available at build time)
    const openai = new OpenAI({ apiKey });

    // Step 1: Download audio from Vercel Blob
    console.log(`Downloading: ${pathname}`);

    // Recordings are private and each user reads only their own folder.
    const recording = pathname.startsWith(`recordings/${session.user.email}/`)
      ? await get(pathname, { access: "private" })
      : null;

    if (!recording || recording.statusCode !== 200) {
      return NextResponse.json(
        { ok: false, error: "Recording not found" },
        { status: 404 }
      );
    }

    const audioBuffer = await new Response(recording.stream).arrayBuffer();

    // Step 2: Transcribe with the current speech model
    console.log(`Transcribing with ${TRANSCRIPTION_MODEL}...`);
    const audioFile = new File([audioBuffer], "recording.webm", {
      type: "audio/webm",
    });

    const transcription = await openai.audio.transcriptions.create({
      model: TRANSCRIPTION_MODEL,
      file: audioFile,
      response_format: "json",
    });

    const transcript = transcription.text;

    if (!transcript || transcript.trim().length < 20) {
      return NextResponse.json({
        ok: false,
        error:
          "Transcript too short -- the recording may not have captured audio properly.",
      });
    }

    console.log(
      `Transcript: ${transcript.length} chars`
    );

    // Step 3: Generate notes with OpenAI — prompt depends on mode
    console.log(`Generating notes (mode: ${mode})...`);
    const meetingDate = new Date().toISOString().split("T")[0];

    const prompts: Record<string, string> = {
      meeting: `You are a professional meeting notes assistant. Generate structured, actionable meeting notes from the following transcript.

Meeting Title: ${title || "Untitled Meeting"}
Date: ${meetingDate}

Format the notes as Obsidian-compatible Markdown with this structure:
- YAML frontmatter with tags, date, meeting title
- Summary (2-3 sentences)
- Key Decisions (bullet points)
- Action Items (checkbox format with @assignees if identifiable)
- Discussion Notes (organized by topic with h3 headers)

Be concise but thorough. Extract every actionable item. Use professional language.`,

      "voice-memo": `You are a personal voice note assistant. Clean up and structure the following voice memo transcript into clear, readable notes.

Title: ${title || "Voice Memo"}
Date: ${meetingDate}

Format as Obsidian-compatible Markdown:
- YAML frontmatter with tags, date, title
- Clean summary of what was said (fix grammar, remove filler words, keep the speaker's voice)
- Key points highlighted as bullet points
- Any to-dos or follow-ups extracted as checkboxes

Keep it natural and concise. This is a personal note, not a formal document.`,

      "brain-dump": `You are a thinking partner who helps organize scattered thoughts. The following is a brain dump -- someone thinking out loud, probably jumping between topics.

Title: ${title || "Brain Dump"}
Date: ${meetingDate}

Format as Obsidian-compatible Markdown:
- YAML frontmatter with tags, date, title
- Organize the thoughts into logical clusters/themes (use h3 headers for each theme)
- Under each theme, list the key ideas as bullet points
- Add a "Connections" section at the end noting any interesting links between themes
- Extract any action items or decisions as checkboxes

Preserve the original ideas faithfully. Add structure, not opinions.`,

      "content-draft": `You are a content writer who turns spoken ideas into polished drafts. The following transcript is someone talking through a content idea.

Title: ${title || "Content Draft"}
Date: ${meetingDate}

Format as Obsidian-compatible Markdown:
- YAML frontmatter with tags, date, title, status: draft
- Turn the spoken content into a well-structured written piece (blog post, LinkedIn post, or newsletter -- match the speaker's apparent intent)
- Use clear headers, short paragraphs, and a conversational but professional tone
- Add a "Hook" at the top (a compelling opening line)
- End with a call-to-action or closing thought
- Include a "Raw Notes" section at the bottom with key quotes from the transcript

Make it publication-ready while preserving the speaker's authentic voice.`,
    };

    const systemPrompt = prompts[mode] || prompts.meeting;

    // The notes model reasons before it writes, and reasoning spends output
    // tokens. 16384 leaves well over 4096 for the notes at low effort.
    const response = await openai.responses.create({
      model: NOTES_MODEL,
      instructions: systemPrompt,
      input: `TRANSCRIPT:\n${transcript}`,
      max_output_tokens: 16384,
      reasoning: { effort: "low" },
    });

    const notesContent = getNotesText(response);

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

    await put(`notes/${session.user.email}/${notesFilename}`, notesContent, {
      access: "private",
      addRandomSuffix: false,
      contentType: "text/markdown",
    });

    console.log(`✅ Notes saved: ${notesFilename}`);

    return NextResponse.json({
      ok: true,
      notesFile: notesFilename,
      notesText: notesContent,
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
