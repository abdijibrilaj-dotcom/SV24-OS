import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import { roleMeta, userStatusMeta } from "@/lib/status";
import { formatDate } from "@/lib/format";
import { InviteUserModal } from "@/components/admin/invite-user-modal";

export default async function BenutzerPage() {
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <InviteUserModal />
      </div>
      <Card padded={false}>
        <div className="overflow-x-auto px-5 pb-1 pt-2">
          <table className="w-full min-w-[680px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-[1.5px] border-[#F1F2F4] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
                <th className="px-1 py-3">Name</th>
                <th className="px-1 py-3">Rolle</th>
                <th className="px-1 py-3">E-Mail</th>
                <th className="px-1 py-3">Letzter Login</th>
                <th className="px-1 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const role = roleMeta[u.role];
                const status = userStatusMeta[u.status];
                return (
                  <tr key={u.id} className="border-t border-[#F1F2F4] hover:bg-[#FAFAFB]">
                    <td className="px-1 py-2.5 font-medium">{u.name}</td>
                    <td className="px-1 py-2.5">
                      <Pill tone={role.tone}>{role.label}</Pill>
                    </td>
                    <td className="px-1 py-2.5">{u.email}</td>
                    <td className="px-1 py-2.5">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "—"}</td>
                    <td className="px-1 py-2.5">
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={Users} title="Noch keine Benutzer angelegt." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
