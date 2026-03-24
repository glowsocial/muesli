import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "recordings/" });

    const recordings = blobs
      .filter((b) => b.pathname.endsWith(".webm") || b.pathname.endsWith(".wav"))
      .map((b) => {
        const filename = b.pathname.split("/").pop() || "";
        const title = filename
          .replace(/^\d{4}.*?_/, "")
          .replace(/\.(webm|wav)$/, "")
          .replace(/-/g, " ");

        return {
          url: b.url,
          pathname: b.pathname,
          uploadedAt: b.uploadedAt,
          size: b.size,
          title: title || "Untitled",
        };
      })
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

    return NextResponse.json(recordings);
  } catch (error) {
    console.error("List recordings error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
