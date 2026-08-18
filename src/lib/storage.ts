import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const STORAGE_ROOT = process.env.STORAGE_DIR || path.join(process.cwd(), "storage");

// Documents/payout slips are scans of ID cards, certificates, payslips —
// PDFs and photos only. Kept as an allowlist (not a blocklist) since that
// fails safe against file types we didn't think of.
const ALLOWED_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg", ".heic", ".webp"]);
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

/**
 * Persists an uploaded file to local disk under storage/<subdir>/ and
 * returns the relative path used both as the DB fileUrl and as the path
 * segment the authenticated /api/files route resolves against. Not
 * public: files are only reachable through that route's permission check.
 *
 * Validates extension and size server-side — the <input accept="..."> on
 * the form only hints at the browser's file picker and is trivially
 * bypassed, so this is the real check.
 */
export async function saveUploadedFile(file: File, subdir: string): Promise<string> {
  const ext = (path.extname(file.name) || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Nicht unterstützter Dateityp. Erlaubt: PDF, JPG, PNG, HEIC, WEBP.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Datei ist zu groß (maximal 15 MB).");
  }

  const dir = path.join(STORAGE_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `${subdir}/${filename}`;
}

export function resolveStoragePath(relPath: string): string {
  return path.join(STORAGE_ROOT, relPath);
}
