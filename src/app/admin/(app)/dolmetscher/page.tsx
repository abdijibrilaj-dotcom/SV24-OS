import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { interpreterStatusMeta } from "@/lib/status";
import { formatEUR } from "@/lib/format";
import { avatarColor } from "@/lib/avatar-color";
import { NewInterpreterModal } from "@/components/admin/new-interpreter-modal";

export default async function DolmetscherPage() {
  const interpreters = await prisma.interpreter.findMany({
    orderBy: { humanId: "asc" },
    include: {
      _count: { select: { jobs: { where: { status: { in: ["CONFIRMED", "COMPLETED"] } } } } },
    },
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <NewInterpreterModal />
      </div>
      <Card padded={false}>
        <div className="overflow-x-auto px-5 pb-1 pt-2">
          <table className="w-full min-w-[760px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-[1.5px] border-[#F1F2F4] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
                <th className="px-1 py-3">ID</th>
                <th className="px-1 py-3">Name</th>
                <th className="px-1 py-3">Sprachen</th>
                <th className="px-1 py-3">Status</th>
                <th className="px-1 py-3">Einsätze</th>
                <th className="px-1 py-3">Bewertung</th>
                <th className="px-1 py-3">Gutschrift</th>
              </tr>
            </thead>
            <tbody>
              {interpreters.map((i) => {
                const color = avatarColor(i.name);
                const meta = interpreterStatusMeta[i.status];
                return (
                  <tr key={i.id} className="border-t border-[#F1F2F4] hover:bg-[#FAFAFB]">
                    <td className="px-1 py-2.5 font-semibold text-text-secondary">{i.humanId}</td>
                    <td className="px-1 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold"
                          style={{ background: color.bg, color: color.fg }}
                        >
                          {i.initials}
                        </div>
                        {i.name}
                      </div>
                    </td>
                    <td className="px-1 py-2.5">{i.langs.join(", ")}</td>
                    <td className="px-1 py-2.5">
                      <Pill tone={meta.tone}>{meta.label}</Pill>
                    </td>
                    <td className="px-1 py-2.5">{i._count.jobs}</td>
                    <td className="px-1 py-2.5">{Number(i.rating).toFixed(1)} ★</td>
                    <td className="px-1 py-2.5 font-semibold">{formatEUR(Number(i.payoutTotal))}</td>
                  </tr>
                );
              })}
              {interpreters.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-tertiary">
                    Noch keine Dolmetscher angelegt.
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
