import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { initialsFromName } from "@/lib/ids";
import { syncCompletedJobs } from "@/lib/actions/job-actions";

// Belt-and-suspenders alongside the auth() call below (which already
// forces dynamic rendering): every admin page is live per-request data
// and must never be prerendered at build time. See the equivalent buero
// layout for why that matters for the Docker build specifically.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  await syncCompletedJobs();

  const unreadCount = user
    ? await prisma.notification.count({
        where: { userId: user.id, unread: true },
      })
    : 0;

  return (
    <div className="flex min-h-screen bg-[#EEF1F4] text-text-primary">
      <AdminSidebar
        userName={user?.name ?? ""}
        userRoleLabel="Admin"
        initials={initialsFromName(user?.name ?? "?")}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader unreadCount={unreadCount} />
        <div className="flex-1 overflow-auto px-8 pb-16 pt-7">{children}</div>
      </div>
    </div>
  );
}
