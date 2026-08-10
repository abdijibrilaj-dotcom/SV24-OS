import { auth } from "@/lib/auth";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { BueroTabBar } from "@/components/buero/buero-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { initialsFromName } from "@/lib/ids";
import { logoutAction } from "@/lib/actions/auth-actions";

export default async function BueroMehrPage() {
  const session = await auth();

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/buero/benachrichtigungen", unreadCount: 0 }}
      tabBar={<BueroTabBar />}
    >
      <CardMobile className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
          {initialsFromName(session!.user.name ?? "?")}
        </div>
        <div>
          <div className="text-[14.5px] font-bold">{session!.user.name}</div>
          <div className="text-xs text-text-secondary">{session!.user.email}</div>
        </div>
      </CardMobile>

      <form action={logoutAction.bind(null, "buero")}>
        <button
          type="submit"
          className="w-full rounded-xl border border-field-border bg-white py-3 text-sm font-bold text-pill-red-fg"
        >
          Abmelden
        </button>
      </form>
    </MobileScreen>
  );
}
