import { Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill, type PillTone } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { avatarColor } from "@/lib/avatar-color";
import { formatDate } from "@/lib/format";
import {
  confirmEmailImportAction,
  rejectEmailImportAction,
  sendRequestAction,
} from "@/lib/actions/email-import-actions";

function stageBadge(status: string, stage: string): { label: string; tone: PillTone } {
  if (status === "NEU") return { label: "Neu", tone: "blue" };
  if (status === "ABGELEHNT") return { label: "Abgelehnt", tone: "gray" };
  if (stage === "GESUCHT") return { label: "Dolmetscher wird gesucht", tone: "amber" };
  if (stage === "WARTET") return { label: "Wartet auf Bestätigung", tone: "amber" };
  if (stage === "BESTAETIGT") return { label: "Bestätigt", tone: "green" };
  return { label: status, tone: "gray" };
}

export default async function EmailImportPage() {
  const imports = await prisma.emailImport.findMany({
    include: { matchedInterpreter: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4 max-w-[70ch] text-[13px] text-text-secondary">
        Eingehende Terminanfragen aus Postfach-E-Mails, automatisch in Felder erkannt. Bitte prüfen und
        bestätigen, bevor der Auftrag angelegt wird.
      </div>

      {imports.map((e) => {
        const badge = stageBadge(e.status, e.workflowStage);
        const mi = e.matchedInterpreter;
        const color = mi ? avatarColor(mi.name) : null;

        return (
          <Card key={e.id} className="mb-3.5" padded={false}>
            <div className="px-5 py-[18px]">
              <div className="mb-3.5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[15px] font-bold">
                    {e.residentName}{" "}
                    <span className="text-[12.5px] font-medium text-text-tertiary">· Reg.-Nr. {e.regNr}</span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-text-secondary">{e.source}</div>
                </div>
                <Pill tone={badge.tone}>{badge.label}</Pill>
              </div>

              <div className="mb-3.5 grid grid-cols-4 gap-3.5 rounded-xl bg-field-bg-alt p-3.5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-text-tertiary">Termin</div>
                  <div className="mt-0.5 text-[13.5px] font-semibold">{formatDate(e.date)}, {e.time}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-text-tertiary">Sprache</div>
                  <div className="mt-0.5 text-[13.5px] font-semibold">{e.language}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-text-tertiary">Ort</div>
                  <div className="mt-0.5 text-[13.5px] font-semibold">{e.location}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-text-tertiary">Kontakt</div>
                  <div className="mt-0.5 text-[13.5px] font-semibold">{e.contact}</div>
                </div>
              </div>

              {e.note && (
                <div className="mb-3.5 rounded-[10px] bg-[#FFFBEB] px-3 py-2 text-[12.5px] text-[#B45309]">
                  {e.note}
                </div>
              )}

              {e.status === "NEU" && (
                <div className="flex gap-2.5">
                  <form action={confirmEmailImportAction.bind(null, e.id)}>
                    <SubmitButton pendingText="Wird angelegt…">Bestätigen &amp; Auftrag anlegen</SubmitButton>
                  </form>
                  <form action={rejectEmailImportAction.bind(null, e.id)}>
                    <SubmitButton variant="outline" pendingText="Wird abgelehnt…">Ablehnen</SubmitButton>
                  </form>
                </div>
              )}

              {e.status === "IN_BEARBEITUNG" && e.workflowStage === "GESUCHT" && (
                <>
                  {mi ? (
                    <>
                      <div className="mb-3 flex items-center gap-3 rounded-xl border border-card-border-mobile p-3">
                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold"
                          style={{ background: color!.bg, color: color!.fg }}
                        >
                          {mi.initials}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{mi.name}</div>
                          <div className="text-xs text-text-secondary">
                            {mi.langs.join(", ")} · {Number(mi.rating).toFixed(1)} ★
                          </div>
                        </div>
                        <Pill tone="green">{e.matchScore}% Match</Pill>
                      </div>
                      <form action={sendRequestAction.bind(null, e.id)}>
                        <SubmitButton pendingText="Wird gesendet…">Anfrage an Dolmetscher:in senden</SubmitButton>
                      </form>
                    </>
                  ) : (
                    <div className="text-[12.5px] text-text-tertiary">
                      Kein passender Dolmetscher gefunden — bitte manuell über Dispatch oder Kalender zuweisen.
                    </div>
                  )}
                </>
              )}

              {e.status === "IN_BEARBEITUNG" && e.workflowStage === "WARTET" && mi && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <Pill tone="amber">Wartet auf {mi.name}</Pill>
                  <div className="text-xs text-text-tertiary">Push-Anfrage in der Dolmetscher-App gesendet</div>
                </div>
              )}

              {e.status === "IN_BEARBEITUNG" && e.workflowStage === "BESTAETIGT" && mi && (
                <>
                  <Pill tone="green" className="mb-3">
                    Bestätigt von {mi.name}
                  </Pill>
                  <div className="rounded-xl border border-card-border-mobile bg-[#F9FAFB] px-4 py-3.5">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
                      Automatische E-Mail an {e.contact}
                    </div>
                    <div className="mb-1.5 text-[13px] font-bold">
                      Betreff: Dolmetscher:in bestätigt — Termin {formatDate(e.date)}, {e.time}
                    </div>
                    <div className="text-[13px] leading-[1.7] text-[#374151]">
                      Sehr geehrte/r {e.contact},<br />
                      für den Termin am {formatDate(e.date)} um {e.time} ({e.language}) übernimmt {mi.name}.
                      <br />
                      <br />
                      Mit freundlichen Grüßen
                      <br />
                      SV24 Team
                    </div>
                  </div>
                </>
              )}

              {e.status === "ABGELEHNT" && (
                <div className="text-[12.5px] text-text-tertiary">Anfrage abgelehnt.</div>
              )}
            </div>
          </Card>
        );
      })}

      {imports.length === 0 && (
        <Card>
          <EmptyState icon={Mail} title="Keine E-Mail-Anfragen vorhanden." />
        </Card>
      )}
    </div>
  );
}
