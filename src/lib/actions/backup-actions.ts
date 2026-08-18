"use server";

import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

const execFileAsync = promisify(execFile);

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "storage", "backups");

export async function createBackupAction(): Promise<{ ok: true; file: string } | { error: string }> {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN) return { error: "Keine Berechtigung." };

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return { error: "DATABASE_URL ist nicht gesetzt." };

  await mkdir(BACKUP_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `sv24os-backup-${timestamp}.sql`;
  const filePath = path.join(BACKUP_DIR, filename);

  // The DB password is passed via the PGPASSWORD env var rather than as
  // part of the connection string argument — process argv (unlike env) is
  // visible to any other local user via `ps aux` / /proc/<pid>/cmdline.
  let connectionUrl = databaseUrl;
  let pgPassword: string | undefined;
  try {
    const parsed = new URL(databaseUrl);
    pgPassword = parsed.password ? decodeURIComponent(parsed.password) : undefined;
    parsed.password = "";
    connectionUrl = parsed.toString();
  } catch {
    // Not a parseable URL — fall back to passing it through as-is.
  }

  try {
    await execFileAsync(
      "pg_dump",
      ["--no-owner", "--no-privileges", "-f", filePath, connectionUrl],
      { env: { ...process.env, ...(pgPassword ? { PGPASSWORD: pgPassword } : {}) } }
    );
  } catch (err) {
    return { error: `Backup fehlgeschlagen: ${(err as Error).message}` };
  }

  revalidatePath("/admin/backups");
  return { ok: true, file: filename };
}
