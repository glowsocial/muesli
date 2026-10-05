import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

// Notes are private in storage, so the download goes through the signed-in session.
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const pathname = request.nextUrl.searchParams.get("pathname") || "";
    if (!pathname.startsWith(`notes/${session.user.email}/`) || !pathname.endsWith(".md")) {
      return NextResponse.json({ ok: false, error: "Note not found" }, { status: 404 });
    }

    const note = await get(pathname, { access: "private" });
    if (!note || note.statusCode !== 200) {
      return NextResponse.json({ ok: false, error: "Note not found" }, { status: 404 });
    }

    const filename = (pathname.split("/").pop() || "notes.md").replace(/[^A-Za-z0-9._-]/g, "-");
    return new NextResponse(note.stream, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Download note error:", error);
    return NextResponse.json({ ok: false, error: "Could not download the note" }, { status: 500 });
  }
}
