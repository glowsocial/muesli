import type { Message } from "@anthropic-ai/sdk/resources/messages";

export const TRANSCRIPTION_MODEL = "gpt-transcribe";
export const NOTES_MODEL = "claude-sonnet-5-5";

export function getNotesText(message: Pick<Message, "content" | "stop_reason">): string {
  if (message.stop_reason === "refusal") {
    throw new Error("The notes model declined this recording. No notes were saved.");
  }
  if (message.stop_reason !== "end_turn") {
    throw new Error("Notes generation did not finish. No partial notes were saved. Try a shorter recording.");
  }
  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n\n")
    .trim();
  if (!text) {
    throw new Error("The notes model returned no notes. Please try again.");
  }
  return text;
}
