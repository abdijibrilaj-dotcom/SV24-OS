import type { PillTone } from "@/components/ui/pill";
import type {
  InterpreterStatus,
  ClientStatus,
  InvoiceStatus,
  JobStatus,
  DocumentStatus,
  DispatchStatus,
  UserStatus,
  Role,
  ResidentStatus,
  ServiceType,
} from "@prisma/client";

export const interpreterStatusMeta: Record<
  InterpreterStatus,
  { label: string; tone: PillTone }
> = {
  AKTIV: { label: "Aktiv", tone: "green" },
  URLAUB: { label: "Urlaub", tone: "amber" },
  INAKTIV: { label: "Inaktiv", tone: "gray" },
};

export const clientStatusMeta: Record<
  ClientStatus,
  { label: string; tone: PillTone }
> = {
  AKTIV: { label: "Aktiv", tone: "green" },
  INAKTIV: { label: "Inaktiv", tone: "gray" },
};

export const invoiceStatusMeta: Record<
  InvoiceStatus,
  { label: string; tone: PillTone }
> = {
  OFFEN: { label: "Offen", tone: "blue" },
  UEBERFAELLIG: { label: "Überfällig", tone: "red" },
  BEZAHLT: { label: "Bezahlt", tone: "green" },
};

export const jobStatusMeta: Record<
  JobStatus,
  { label: string; tone: PillTone }
> = {
  PENDING: { label: "Ausstehend", tone: "amber" },
  CONFIRMED: { label: "Bestätigt", tone: "green" },
  COMPLETED: { label: "Erledigt", tone: "gray" },
  DECLINED: { label: "Abgelehnt", tone: "red" },
};

export const documentStatusMeta: Record<
  DocumentStatus,
  { label: string; tone: PillTone }
> = {
  AKTUELL: { label: "Aktuell", tone: "green" },
  LAEUFT_AB: { label: "Läuft ab", tone: "amber" },
  FEHLT: { label: "Fehlt", tone: "red" },
};

export const dispatchStatusMeta: Record<
  DispatchStatus,
  { label: string; tone: PillTone }
> = {
  OFFEN: { label: "Offen", tone: "amber" },
  ZUGEWIESEN: { label: "Zugewiesen", tone: "green" },
};

export const userStatusMeta: Record<
  UserStatus,
  { label: string; tone: PillTone }
> = {
  AKTIV: { label: "Aktiv", tone: "green" },
  EINGELADEN: { label: "Eingeladen", tone: "blue" },
  INAKTIV: { label: "Inaktiv", tone: "gray" },
};

export const roleMeta: Record<Role, { label: string; tone: PillTone }> = {
  ADMIN: { label: "Admin", tone: "blue" },
  BUERO: { label: "Büro", tone: "gray" },
  INTERPRETER: { label: "Dolmetscher", tone: "green" },
};

export const residentStatusMeta: Record<ResidentStatus, { label: string; tone: PillTone }> = {
  AKTIV: { label: "Aktiv", tone: "green" },
  ABGESCHLOSSEN: { label: "Abgeschlossen", tone: "gray" },
};

export const serviceTypeMeta: Record<ServiceType, { label: string; tone: PillTone }> = {
  DOLMETSCHEN: { label: "Dolmetschen", tone: "blue" },
  SOZIALBETREUUNG: { label: "Sozialbetreuung", tone: "green" },
  SPRACHKURS: { label: "Sprachkurs", tone: "amber" },
  VERWALTUNGSBEGLEITUNG: { label: "Verwaltungsbegleitung", tone: "gray" },
  SONSTIGES: { label: "Sonstiges", tone: "gray" },
};
