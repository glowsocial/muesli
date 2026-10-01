import test from "node:test";
import assert from "node:assert/strict";
import { getNotesText } from "../lib/ai.ts";

test("reads notes after thinking blocks and keeps all text blocks", () => {
  const notes = getNotesText({
    stop_reason: "end_turn",
    content: [
      { type: "thinking", thinking: "", signature: "sample" },
      { type: "text", text: "# Meeting notes", citations: null },
      { type: "text", text: "- [ ] Alex: Share draft Friday", citations: null },
    ],
  });
  assert.equal(notes, "# Meeting notes\n\n- [ ] Alex: Share draft Friday");
});

test("does not save refusal, truncated, or oversized-context responses", () => {
  for (const stop_reason of ["refusal", "max_tokens", "model_context_window_exceeded"]) {
    assert.throws(() => getNotesText({ stop_reason, content: [{ type: "text", text: "Incomplete notes", citations: null }] }), /No .*notes were saved/);
  }
});

test("does not save empty notes or a thinking-only response", () => {
  for (const content of [[], [{ type: "text", text: "  ", citations: null }], [{ type: "thinking", thinking: "", signature: "sample" }]]) {
    assert.throws(() => getNotesText({ stop_reason: "end_turn", content }), /returned no notes/);
  }
});
