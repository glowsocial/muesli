import { NextResponse } from "next/server";
import { connection } from "next/server";
import { hasServerOpenAIKey } from "@/lib/config";

// Tells the dashboard whether to ask for an OpenAI key. Never returns a key.
export async function GET() {
  await connection();
  return NextResponse.json({ needsOpenAIKey: !hasServerOpenAIKey() });
}
