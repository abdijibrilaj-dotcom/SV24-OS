import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { resolveStoragePath } from "@/lib/storage";
import { Role } from "@prisma/client";

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".heic": "image/heic",
  ".webp": "image/webp",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { path: segments } = await params;
  if (segments.some((s) => s.includes("..") || s.includes("/"))) {
    return new NextResponse("Invalid path", { status: 400 });
  }
  const [kind, interpreterId, filename] = segments;
  if ((kind !== "documents" && kind !== "payouts") || !interpreterId || !filename) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isOwner = session.user.role === Role.INTERPRETER && session.user.interpreterId === interpreterId;
  const isStaff = session.user.role === Role.ADMIN || session.user.role === Role.BUERO;
  if (!isOwner && !isStaff) return new NextResponse("Forbidden", { status: 403 });

  const filePath = resolveStoragePath(segments.join("/"));
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error("not a file");
    const buffer = await readFile(filePath);
    const mime = MIME_BY_EXT[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=0, no-store",
        // Only PDFs/images are ever accepted by the upload validation in
        // lib/storage.ts, but nosniff is cheap defense-in-depth against the
        // browser ever guessing a different (executable) content type.
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
