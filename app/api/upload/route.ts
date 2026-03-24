import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;
    const title = (formData.get("title") as string) || "recording";

    if (!audio) {
      return NextResponse.json(
        { ok: false, error: "No audio file received" },
        { status: 400 }
      );
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const safeName = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 50);
    const filename = `${timestamp}_${safeName}.webm`;

    const blob = await put(`recordings/${filename}`, audio, {
      access: "public",
      addRandomSuffix: false,
      contentType: audio.type || "audio/webm",
    });

    console.log(
      `📤 Uploaded: ${filename} (${(audio.size / 1024).toFixed(0)} KB)`
    );

    return NextResponse.json({
      ok: true,
      filename,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
