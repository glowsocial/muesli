// A recording may only be uploaded into the signed-in person's own folder.
// The browser picks the upload path, so the server has to check it: reads and
// processing are scoped to `recordings/<email>/`, and a path outside it would put
// a file into somebody else's list.
export function isOwnUploadPath(pathname: string, email: string): boolean {
  if (!email) return false;
  const prefix = `recordings/${email}/`;
  if (!pathname.startsWith(prefix)) return false;
  const rest = pathname.slice(prefix.length);
  if (!rest) return false;
  return rest.split("/").every((part) => part !== ".." && part !== ".");
}
