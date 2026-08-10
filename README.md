# SV24 OS

Produktive Web-Anwendung für Sprachvermittler24 — Admin-Backoffice (Desktop) sowie
Büro- und Dolmetscher-App (mobile PWA), auf einer gemeinsamen Datenbank.

Gebaut nach dem Handoff-Paket (`README.md`-Spezifikation + Klick-Dummys +
Screenshots) als echter Next.js/PostgreSQL-Stack mit echter Auth, echten
Rollen und echtem Web Push — kein simulierter Demo-State mehr.

## Stack

- **Next.js 15** (App Router, TypeScript, Server Actions) — bewusst auf 15.x
  gepinnt statt der zum Bauzeitpunkt aktuellen 16-Preview, die inkompatible
  Breaking Changes zur bekannten App-Router-API mitbringt.
- **PostgreSQL + Prisma** als Datenbankschicht (`prisma/schema.prisma`)
- **NextAuth (Auth.js) v5**, Credentials-Provider, drei Portale mit echter
  Rollenprüfung in `middleware.ts`
- **Tailwind CSS v4** mit den Design-Tokens aus dem Handoff als Theme
- **web-push** für echtes Web Push (VAPID) statt der simulierten Push-Demo
- Lokales, authentifiziertes Datei-Storage für Dokumente/Auszahlungs-PDFs
  (`lib/storage.ts` + `/api/files/[...path]`)

## Portale

| Portal | URL-Präfix | Login |
|---|---|---|
| Admin (Desktop-Backoffice) | `/admin` | `/admin/login` |
| Büro (mobile PWA) | `/buero` | `/buero/login` |
| Dolmetscher (mobile PWA) | `/interpreter` | `/interpreter/login` |

Jedes Portal hat eine eigene Login-Seite und eigene Rollenprüfung
(`middleware.ts`) — ein Admin-Account kann sich nicht über `/buero/login`
anmelden und umgekehrt. Beim ersten Login mit einem temporären Passwort
wird ein eigenes Passwort erzwungen (`mustResetPassword`).

## Lokale Entwicklung

```bash
npm install
cp .env.example .env   # Werte anpassen, insb. DATABASE_URL

npx prisma migrate deploy   # Schema anlegen
npm run db:seed             # Demodaten + die beiden echten Admin-Accounts

npm run dev
```

Die Seed-Ausgabe zeigt das temporäre Passwort für alle angelegten Accounts
(`SV24-Start!`) — muss beim ersten Login geändert werden.

### Admin-Zugänge (aus dem Auftrag)

- **Abdi Jibril** — `info@sprachvermittler24.de` (Geschäftsführer)
- **Natalia Maciejewska** — `natalia.sprachvermittler24@gmx.de` (Mitarbeiterin)

Beide Accounts haben vollen, gleichwertigen Admin-Zugriff (echte
Rollenprüfung, nicht nur ein Anzeige-Label).

## Umgebungsvariablen

Siehe `.env.example` für die vollständige Liste. Wichtig:

- `DATABASE_URL` — PostgreSQL-Verbindung
- `AUTH_SECRET` — mit `openssl rand -base64 32` erzeugen
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — mit
  `npx web-push generate-vapid-keys` erzeugen; ohne diese Werte läuft die
  App weiter, Push-Benachrichtigungen werden dann aber übersprungen
  (In-App-Benachrichtigungen funktionieren immer, unabhängig von Push)
- `SEVDESK_API_TOKEN`, `EMAIL_IMPORT_*`, `SMTP_*` — **aktuell bewusst leer
  lassen**. Diese Integrationen sind laut Auftrag nur UI-/Konfigurations-seitig
  vorzubereiten, nicht produktiv anzubinden (siehe Abschnitt unten).

## Vorbereitete, nicht produktiv verbundene Integrationen

Wie im Auftrag gefordert sind zwei Integrationen bewusst nur vorbereitet:

- **sevDesk**: `IntegrationSettings`-Tabelle + Status-Pill in
  Rechnungen/Einstellungen, `SEVDESK_API_TOKEN` als Env-Var-Platzhalter.
  Keine echten API-Calls. Für die produktive Anbindung: sevDesk-API-Client
  ergänzen (Rechnungs-Sync, Zahlungsstatus) und den Env-Status in
  `/admin/einstellungen` als Basis nutzen.
- **E-Mail-Import**: Workflow (Matching → Anfrage senden → Bestätigung)
  ist voll funktionsfähig und persistiert — es fehlt nur der tatsächliche
  IMAP-Import-Job, der neue `EmailImport`-Zeilen automatisch aus
  eingehenden Mails anlegt (`EMAIL_IMPORT_*`-Variablen sind dafür
  vorgesehen). Aktuell werden `EmailImport`-Einträge über den Seed bzw.
  manuell in der DB angelegt.

Beide bewusst so gehalten, damit nichts fälschlich als "verbunden"
erscheint, das es nicht ist.

## Echtes Web Push

`public/sw.js` + `lib/push.ts` + `lib/push-client.ts` implementieren
echtes Web Push (VAPID) statt des simulierten Push-Banners aus dem
Klick-Dummy:

1. Dolmetscher aktiviert Push im Profil-Screen (`/interpreter/profil`) —
   fordert Browser-Berechtigung an, registriert den Service Worker,
   abonniert und speichert die Subscription in `push_subscriptions`.
2. Bei Auftragszuweisung (Smart Dispatch **oder** E-Mail-Import-Workflow)
   ruft der Server `notifyUser()` auf: legt eine In-App-Benachrichtigung an
   **und** verschickt — falls eine Subscription existiert — eine echte
   Push-Notification.
3. Der In-App-"Neuer Auftrag"-Banner auf dem Home-Screen ist keine reine
   UI-Deko mehr: er erscheint nur, wenn tatsächlich ein `Job` in den
   letzten 5 Minuten für diesen Dolmetscher angelegt wurde.

## Fortlaufende Dolmetscher-ID

`lib/ids.ts` vergibt `D-1001`, `D-1002`, … zentral im Backend über eine
eigene Sequenz-Tabelle (`id_sequences`), transaktionssicher — nicht per
`MAX(id)+1`, damit gelöschte Dolmetscher keine Nummer wiederverwenden.
Wird sowohl beim Anlegen im Admin (`/admin/dolmetscher`) als auch
implizit beim Interpreter-Onboarding verwendet.

## Docker-Deployment

```bash
cp .env.example .env   # Werte anpassen
docker compose build
docker compose up -d
docker compose exec app npx tsx prisma/seed.ts   # einmalig, für Erstdaten
```

`docker-entrypoint.sh` führt vor dem Start automatisch
`prisma migrate deploy` aus. Die Postgres-Daten sowie hochgeladene
Dokumente/Auszahlungen/Backups liegen in benannten Docker-Volumes
(`db-data`, `app-storage`) und überleben Container-Neustarts.

> **Hinweis zur Build-Umgebung dieser Session:** Das Dockerfile und
> `docker-compose.yml` sind syntaktisch validiert (`docker compose config`),
> aber in dieser Sandbox war ausgehender Zugriff auf Docker Hub durch die
> Netzwerk-Policy blockiert — ein echter `docker build` konnte hier nicht
> bis zum Ende durchlaufen. Bitte beim ersten Build in eurer eigenen
> Umgebung gegenprüfen.

### Manuelle Backups

`/admin/backups` führt echte `pg_dump`-Backups aus (kein UI-Mock) und legt
sie unter `storage/backups/` ab (im Docker-Setup: das `app-storage`-Volume).
Für automatische, regelmäßige Backups zusätzlich einen Cronjob auf dem
Hostsystem einrichten, der z. B. `docker compose exec` gegen einen kleinen
Backup-Trigger-Endpunkt bzw. direkt `pg_dump` gegen die `DATABASE_URL`
aufruft.

## Bekannte Lücken / nächste Schritte

- **Auftraggeber/Client-Portal**: laut Handoff explizit "nicht Teil dieses
  Handoffs" — nicht gebaut.
- **Logo**: Das Original-Logo (`sv24-logo.png`) lag dem Handoff-Paket nicht
  als Datei bei (nur als Bild im Chat sichtbar, dort nicht aus der Sandbox
  lesbar). `components/logo.tsx` ist eine handgezeichnete, farbtreue
  Nachbildung als Platzhalter — durch das Original ersetzen, sobald es als
  Datei vorliegt.
- **PWA-Manifest**: aktuell ein gemeinsames `manifest.webmanifest` für alle
  Portale statt drei separat scoped PWAs — für "auf dem Homescreen
  installieren" ausreichend, für getrennte App-Identitäten ggf. später
  aufteilen.
- Node-Sicherheitswarnungen (`npm audit`): 3 verbleibende „high"-Findings
  stecken ausschließlich in Next.js' eigener, gebündelter `postcss`/`sharp`-
  Kopie (Build-Zeit-Bildoptimierung) und werden erst mit dem Wechsel auf
  Next 16 behoben — das war die bewusste Abwägung „stabile, bekannte
  API-Version" vs. „neueste Patches". Bei Gelegenheit auf eine gepatchte
  Next-15-Version prüfen bzw. den Umstieg auf 16 separat evaluieren.
