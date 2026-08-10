import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const STORAGE_ROOT = process.env.STORAGE_DIR || path.join(process.cwd(), "storage");

/**
 * Persists an uploaded file to local disk under storage/<subdir>/ and
 * returns the relative path used both as the DB fileUrl and as the path
 * segment the authenticated /api/files route resolves against. Not
 * public: files are only reachable through that route's permission check.
 */
export async function saveUploadedFile(file: File, subdir: string): Promise<string> {
  const dir = path.join(STORAGE_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `${subdir}/${filename}`;
}

export function resolveStoragePath(relPath: string): string {
  return path.join(STORAGE_ROOT, relPath);
}
