import test from "node:test";
import assert from "node:assert/strict";
import { isOwnUploadPath } from "../lib/upload-path.ts";

const me = "kathleen@example.com";

test("allows a file in your own recordings folder", () => {
  assert.equal(isOwnUploadPath(`recordings/${me}/2026-10-06T10-00-00_standup.webm`, me), true);
});

test("rejects another person's folder", () => {
  assert.equal(isOwnUploadPath("recordings/someone@else.com/x.webm", me), false);
});

test("rejects the anonymous folder the dashboard uses before it knows your email", () => {
  assert.equal(isOwnUploadPath("recordings/anonymous/x.webm", me), false);
});

test("rejects paths outside the recordings folder, and a bare folder", () => {
  assert.equal(isOwnUploadPath(`notes/${me}/x.webm`, me), false);
  assert.equal(isOwnUploadPath(`recordings/${me}/`, me), false);
  assert.equal(isOwnUploadPath(`recordings/${me}`, me), false);
  assert.equal(isOwnUploadPath("x.webm", me), false);
});

test("rejects dot segments that try to climb out of the folder", () => {
  assert.equal(isOwnUploadPath(`recordings/${me}/../someone@else.com/x.webm`, me), false);
  assert.equal(isOwnUploadPath(`recordings/${me}/./x.webm`, me), false);
});

test("rejects a folder whose name only starts like yours", () => {
  assert.equal(isOwnUploadPath(`recordings/${me}.evil.com/x.webm`, me), false);
});

test("rejects everything when there is no signed-in email", () => {
  assert.equal(isOwnUploadPath("recordings//x.webm", ""), false);
  assert.equal(isOwnUploadPath("recordings/anonymous/x.webm", ""), false);
});
