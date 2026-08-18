import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "storage", "backups");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN) return new NextResponse("Forbidden", { status: 403 });

  const { filename } = await params;
  if (filename.includes("..") || filename.includes("/")) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const filePath = path.join(BACKUP_DIR, filename);
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error("not a file");
    const buffer = await readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
