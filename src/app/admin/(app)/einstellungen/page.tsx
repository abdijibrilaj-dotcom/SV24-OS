import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { updateIntegrationSettingsAction, updatePricingSettingsAction } from "@/lib/actions/settings-actions";

function EnvStatus({ label, present }: { label: string; present: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[#F1F2F4] py-2 text-[13px] last:border-0">
      <span className="text-text-secondary">{label}</span>
      <Pill tone={present ? "green" : "gray"}>{present ? "gesetzt" : "nicht gesetzt"}</Pill>
    </div>
  );
}

export default async function EinstellungenPage() {
  const integration = await prisma.integrationSettings.findUnique({ where: { id: 1 } });
  const pricing = await prisma.pricingSettings.findUnique({ where: { id: 1 } });

  const sevdeskTokenSet = !!process.env.SEVDESK_API_TOKEN;
  const emailImportSet = !!process.env.EMAIL_IMPORT_HOST;
  const smtpSet = !!process.env.SMTP_HOST;
  const vapidSet = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY;

  return (
    <div className="grid max-w-3xl gap-5">
      <Card>
        <div className="mb-1 text-[15px] font-bold">Server-Konfiguration</div>
        <p className="mb-3 text-[12.5px] text-text-secondary">
          Diese Werte werden über Umgebungsvariablen auf dem Server gesetzt (siehe .env.example) — nicht
          hier in der Oberfläche, damit keine Zugangsdaten in der Datenbank landen.
        </p>
        <EnvStatus label="sevDesk API-Token (SEVDESK_API_TOKEN)" present={sevdeskTokenSet} />
        <EnvStatus label="E-Mail-Import-Postfach (EMAIL_IMPORT_HOST)" present={emailImportSet} />
        <EnvStatus label="SMTP-Versand (SMTP_HOST)" present={smtpSet} />
        <EnvStatus label="Web Push (VAPID-Schlüssel)" present={vapidSet} />
      </Card>

      <Card>
        <div className="mb-1 text-[15px] font-bold">Integrationen</div>
        <p className="mb-4 text-[12.5px] text-text-secondary">
          Anzeige-Status für die Rechnungen-Ansicht. Erst auf &bdquo;verbunden&ldquo; stellen, sobald der
          API-Token oben tatsächlich gesetzt und geprüft ist.
        </p>
        <form action={updateIntegrationSettingsAction} className="flex flex-col gap-4">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="sevdeskConnected"
              defaultChecked={integration?.sevdeskConnected}
              className="h-4 w-4 accent-navy"
            />
            sevDesk als verbunden anzeigen
          </label>
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">sevDesk Organisation (Label)</label>
            <input
              name="sevdeskOrgName"
              defaultValue={integration?.sevdeskOrgName ?? ""}
              placeholder="z.B. Sprachvermittler24 GmbH"
              className="w-full max-w-sm rounded-[10px] border border-field-border bg-field-bg-alt px-3 py-2.5 text-sm outline-none focus:border-[#93C5FD] focus:ring-4 focus:ring-[#DBEAFE]"
            />
          </div>
          <hr className="border-[#F1F2F4]" />
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="emailImportEnabled"
              defaultChecked={integration?.emailImportEnabled}
              className="h-4 w-4 accent-navy"
            />
            E-Mail-Import aktiv anzeigen
          </label>
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Import-Postfach (Label)</label>
            <input
              name="emailImportAddress"
              defaultValue={integration?.emailImportAddress ?? ""}
              placeholder="anfragen@sprachvermittler24.de"
              className="w-full max-w-sm rounded-[10px] border border-field-border bg-field-bg-alt px-3 py-2.5 text-sm outline-none focus:border-[#93C5FD] focus:ring-4 focus:ring-[#DBEAFE]"
            />
          </div>
          <div>
            <Button type="submit" variant="primary">
              Speichern
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-1 text-[15px] font-bold">Preise</div>
        <p className="mb-4 text-[12.5px] text-text-secondary">
          Nur ein Referenzwert für den aktuell einheitlichen Satz — wird noch nicht automatisch in Rechnungen
          oder Auszahlungen übernommen, die trägst du wie bisher selbst ein. Sag Bescheid, falls das künftig
          automatisch berechnet werden soll.
        </p>
        <form action={updatePricingSettingsAction} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Satz pro Einsatz — Auftraggeber (€)</label>
            <input
              name="clientRatePerJob"
              defaultValue={pricing?.clientRatePerJob?.toString() ?? ""}
              placeholder="z.B. 85,00"
              className="w-full max-w-sm rounded-[10px] border border-field-border bg-field-bg-alt px-3 py-2.5 text-sm outline-none focus:border-[#93C5FD] focus:ring-4 focus:ring-[#DBEAFE]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Satz pro Einsatz — Dolmetscher (€)</label>
            <input
              name="interpreterRatePerJob"
              defaultValue={pricing?.interpreterRatePerJob?.toString() ?? ""}
              placeholder="z.B. 45,00"
              className="w-full max-w-sm rounded-[10px] border border-field-border bg-field-bg-alt px-3 py-2.5 text-sm outline-none focus:border-[#93C5FD] focus:ring-4 focus:ring-[#DBEAFE]"
            />
          </div>
          <div>
            <Button type="submit" variant="primary">
              Speichern
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
