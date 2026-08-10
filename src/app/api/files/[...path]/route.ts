import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { auth } from "@/lib/auth";
import { resolveStoragePath } from "@/lib/storage";
import { Role } from "@prisma/client";

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
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
