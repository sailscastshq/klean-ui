import { gzipSync, gunzipSync } from "node:zlib";

const PREFIX = "gzip:";

export function archiveSource(source) {
  return `${PREFIX}${gzipSync(Buffer.from(source), { level: 9 }).toString("base64")}`;
}

export function unarchiveSource(archive) {
  if (typeof archive !== "string" || !archive.startsWith(PREFIX)) {
    throw new TypeError("Invalid Klean source archive.");
  }

  return gunzipSync(
    Buffer.from(archive.slice(PREFIX.length), "base64"),
  ).toString("utf8");
}
