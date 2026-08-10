import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { CardMobile } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export default async function BueroBenachrichtigungenPage() {
  const session = await auth();
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  await prisma.notification.updateMany({
    where: { userId: session!.user.id, unread: true },
    data: { unread: false },
  });

  return (
    <MobileScreen header={{ mode: "back", title: "Benachrichtigungen", backHref: "/buero" }} tabBar={undefined}>
      {notifications.map((n) => (
        <CardMobile key={n.id} className="mb-2 flex items-start gap-2.5">
          {n.unread && <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2563EB]" />}
          <div className={n.unread ? "" : "ml-[15px]"}>
            <div className="text-[13.5px]">{n.text}</div>
            <div className="mt-0.5 text-[11px] text-text-tertiary">{formatDate(n.createdAt)}</div>
          </div>
        </CardMobile>
      ))}
      {notifications.length === 0 && (
        <div className="py-6 text-center text-[13px] text-text-tertiary">Keine Benachrichtigungen.</div>
      )}
    </MobileScreen>
  );
}
