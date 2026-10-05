import test from "node:test";
import assert from "node:assert/strict";
import { getNotesText } from "../lib/ai.ts";

test("returns the trimmed notes from a completed response", () => {
  const notes = getNotesText({
    status: "completed",
    incomplete_details: null,
    output_text: "\n# Meeting notes\n\n- [ ] Alex: Share draft Friday\n  ",
  });
  assert.equal(notes, "# Meeting notes\n\n- [ ] Alex: Share draft Friday");
});

test("does not save declined, truncated, or unfinished responses", () => {
  const cases = [
    { status: "incomplete", incomplete_details: { reason: "content_filter" } },
    { status: "incomplete", incomplete_details: { reason: "max_output_tokens" } },
    { status: "failed", incomplete_details: null },
    { status: "in_progress", incomplete_details: null },
    { incomplete_details: null },
  ];
  for (const response of cases) {
    assert.throws(() => getNotesText({ ...response, output_text: "Incomplete notes" }), /No .*notes were saved/);
  }
  assert.throws(
    () => getNotesText({ status: "incomplete", incomplete_details: { reason: "content_filter" }, output_text: "x" }),
    /declined this recording/,
  );
});

test("does not save empty or whitespace notes", () => {
  for (const output_text of ["", "   \n\t "]) {
    assert.throws(() => getNotesText({ status: "completed", incomplete_details: null, output_text }), /returned no notes/);
  }
});
