import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "notes/" });

    const notes = blobs
      .filter((b) => b.pathname.endsWith(".md"))
      .map((b) => {
        const filename = b.pathname.split("/").pop() || "";
        const title = filename
          .replace(/^\d{4}.*?_/, "")
          .replace(/\.md$/, "")
          .replace(/-/g, " ");

        return {
          url: b.url,
          pathname: b.pathname,
          uploadedAt: b.uploadedAt,
          title: title || "Untitled",
          preview: "", // We'd need to fetch content for preview
        };
      })
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

    return NextResponse.json(notes);
  } catch (error) {
    console.error("List notes error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
