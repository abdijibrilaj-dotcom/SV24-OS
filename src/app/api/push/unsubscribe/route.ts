import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { endpoint } = (await req.json()) as { endpoint?: string };
  if (!endpoint) return new NextResponse("Invalid request", { status: 400 });

  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: session.user.id } });

  return NextResponse.json({ ok: true });
}
