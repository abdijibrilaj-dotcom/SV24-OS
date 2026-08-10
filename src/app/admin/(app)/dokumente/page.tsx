import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { documentStatusMeta } from "@/lib/status";
import { formatDate } from "@/lib/format";

export default async function DokumentePage() {
  const documents = await prisma.document.findMany({
    include: { interpreter: true },
    orderBy: [{ status: "desc" }, { interpreter: { name: "asc" } }],
  });

  return (
    <div>
      <div className="mb-4 max-w-[60ch] text-[13px] text-text-secondary">
        Übersicht aller Compliance-Dokumente. Hochgeladen wird von den Dolmetscher:innen selbst in der
        Dolmetscher-App.
      </div>
      <Card padded={false}>
        <div className="overflow-x-auto px-5 pb-1 pt-2">
          <table className="w-full min-w-[640px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-[1.5px] border-[#F1F2F4] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
                <th className="px-1 py-3">Dolmetscher</th>
                <th className="px-1 py-3">Dokument</th>
                <th className="px-1 py-3">Status</th>
                <th className="px-1 py-3">Läuft ab / hochgeladen</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => {
                const meta = documentStatusMeta[d.status];
                return (
                  <tr key={d.id} className="border-t border-[#F1F2F4] hover:bg-[#FAFAFB]">
                    <td className="px-1 py-2.5">{d.interpreter.name}</td>
                    <td className="px-1 py-2.5">{d.name}</td>
                    <td className="px-1 py-2.5">
                      <Pill tone={meta.tone}>{meta.label}</Pill>
                    </td>
                    <td className="px-1 py-2.5 text-text-secondary">
                      {d.expiresAt ? formatDate(d.expiresAt) : d.uploadedAt ? formatDate(d.uploadedAt) : "—"}
                    </td>
                  </tr>
                );
              })}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-tertiary">
                    Keine Dokumente vorhanden.
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
