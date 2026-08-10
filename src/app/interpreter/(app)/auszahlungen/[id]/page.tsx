import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { formatEUR, formatDate } from "@/lib/format";

export default async function GutschriftViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const payout = await prisma.payout.findUnique({
    where: { id },
    include: { interpreter: true },
  });
  if (!payout || payout.interpreterId !== session!.user.interpreterId) notFound();

  return (
    <MobileScreen header={{ mode: "back", title: "Gutschrift", backHref: "/interpreter/auszahlungen" }} tabBar={undefined}>
      <div className="rounded-2xl border border-card-border-mobile bg-white p-5 shadow-[var(--shadow-card-mobile)]">
        <div className="text-xs text-text-secondary">Zeitraum</div>
        <div className="text-lg font-extrabold">{payout.period}</div>

        <div className="mt-4 grid grid-cols-2 gap-3.5 text-[13px]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.04em] text-text-tertiary">Name</div>
            <div className="mt-0.5 font-medium">{payout.interpreter.name}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.04em] text-text-tertiary">Hochgeladen am</div>
            <div className="mt-0.5 font-medium">{formatDate(payout.uploadedAt)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-[10px] uppercase tracking-[0.04em] text-text-tertiary">Betrag</div>
            <div className="mt-0.5 text-xl font-extrabold">{formatEUR(Number(payout.amount), true)}</div>
          </div>
        </div>
      </div>

      {payout.fileUrl ? (
        <a
          href={`/api/files/${payout.fileUrl}`}
          className="mt-4 block rounded-xl bg-navy py-3 text-center text-sm font-bold text-white"
        >
          Als PDF herunterladen
        </a>
      ) : (
        <div className="mt-4 rounded-xl border border-field-border py-3 text-center text-[12.5px] text-text-tertiary">
          Noch keine Datei hinterlegt — bitte im Büro nachfragen.
        </div>
      )}
    </MobileScreen>
  );
}
