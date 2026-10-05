import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { audioExtension } from "@/lib/audio";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { blobs } = await list({ prefix: `recordings/${session.user.email}/` });

    const recordings = blobs
      .filter((b) => audioExtension(b.pathname) !== null)
      .map((b) => {
        const filename = b.pathname.split("/").pop() || "";
        const title = filename
          .replace(/^\d{4}.*?_/, "")
          .replace(/\.[a-z0-9]+$/i, "")
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

    return NextResponse.json({ recordings, email: session.user.email });
  } catch (error) {
    console.error("List recordings error:", error);
    return NextResponse.json({ recordings: [] }, { status: 200 });
  }
}
