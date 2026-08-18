import { prisma } from "@/lib/prisma";

/**
 * Shared helper so every screen shows the real unread-notification count
 * instead of a hardcoded 0 — used by every page that renders MobileScreen's
 * "brand" header outside of the portal home pages (which already computed
 * this inline before this helper existed).
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, unread: true } });
}
