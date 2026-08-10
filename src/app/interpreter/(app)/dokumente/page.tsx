import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { CardMobile } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { documentStatusMeta } from "@/lib/status";
import { formatDate } from "@/lib/format";
import { uploadDocumentAction } from "@/lib/actions/document-actions";

export default async function InterpreterDokumentePage() {
  const session = await auth();
  const interpreterId = session!.user.interpreterId!;

  const documents = await prisma.document.findMany({
    where: { interpreterId },
    orderBy: { name: "asc" },
  });

  return (
    <MobileScreen header={{ mode: "back", title: "Dokumente", backHref: "/interpreter/profil" }} tabBar={undefined}>
      {documents.map((d) => {
        const meta = documentStatusMeta[d.status];
        return (
          <CardMobile key={d.id} className="mb-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[14px] font-bold">{d.name}</div>
                <div className="mt-0.5 text-xs text-text-tertiary">
                  {d.uploadedAt
                    ? `Hochgeladen am ${formatDate(d.uploadedAt)}`
                    : d.expiresAt
                      ? `Läuft ab am ${formatDate(d.expiresAt)}`
                      : "Noch nicht hochgeladen"}
                </div>
              </div>
              <Pill tone={meta.tone}>{meta.label}</Pill>
            </div>
            <form action={uploadDocumentAction.bind(null, d.id)} className="mt-3 flex flex-col gap-2">
              <input
                type="file"
                name="file"
                required
                accept="application/pdf,image/*"
                className="w-full text-[12.5px] file:mr-3 file:rounded-[8px] file:border-0 file:bg-field-bg-alt file:px-3 file:py-1.5 file:text-[12px] file:font-semibold"
              />
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-text-secondary">Gültig bis (optional)</label>
                <input
                  type="date"
                  name="expiresAt"
                  className="rounded-[8px] border border-field-border bg-field-bg-alt px-2 py-1 text-[12px]"
                />
              </div>
              <button
                type="submit"
                className="self-start rounded-[8px] bg-navy px-3 py-1.5 text-[12.5px] font-bold text-white"
              >
                Hochladen
              </button>
            </form>
          </CardMobile>
        );
      })}
      {documents.length === 0 && (
        <div className="py-6 text-center text-[13px] text-text-tertiary">Keine Dokumente hinterlegt.</div>
      )}
    </MobileScreen>
  );
}
