export const TRANSCRIPTION_MODEL = "gpt-transcribe";
export const NOTES_MODEL = process.env.OPENAI_NOTES_MODEL?.trim() || "gpt-6.1-sol";

export type NotesResponse = {
  status?: string;
  incomplete_details?: { reason?: string } | null;
  output_text: string;
};

export function getNotesText(response: NotesResponse): string {
  if (response.incomplete_details?.reason === "content_filter") {
    throw new Error("The notes model declined this recording. No notes were saved.");
  }
  if (response.status !== "completed") {
    throw new Error("Notes generation did not finish. No partial notes were saved. Try a shorter recording.");
  }
  const text = (response.output_text ?? "").trim();
  if (!text) {
    throw new Error("The notes model returned no notes. Please try again.");
  }
  return text;
}
