# SV24 OS auf einem Netcup-Server produktiv nutzen

Diese Anleitung führt Schritt für Schritt durch die Inbetriebnahme auf einem
gemieteten Netcup-Server (vServer/Root-Server), inklusive kostenlosem
HTTPS-Zertifikat. Sie richtet sich an jemanden ohne Programmiererfahrung —
jeder Befehl wird per Copy & Paste in ein Terminal (SSH-Verbindung zum
Server) eingegeben.

## 0. Was du vorher brauchst

- Einen Netcup-Server mit **Ubuntu 22.04 oder 24.04** (bei Bestellung auswählen).
- Eine **Domain oder Subdomain**, die du besitzt (z. B. `app.sprachvermittler24.de`).
  Falls du schon `sprachvermittler24.de` hast, reicht es, beim Domain-Anbieter
  einen neuen **A-Record** anzulegen: `app` → IP-Adresse deines Netcup-Servers.
  Das findest du meist unter "DNS-Verwaltung" im Kundenportal deines
  Domain-Anbieters.
- Die **IP-Adresse** deines Servers (steht im Netcup-Kundenportal (SCP)).

DNS-Änderungen brauchen oft 10 Minuten bis mehrere Stunden, bis sie überall
wirken — das kannst du direkt zu Beginn einrichten und währenddessen mit den
nächsten Schritten weitermachen.

## 1. Mit dem Server verbinden

Windows: Terminal/PowerShell öffnen, dann:

```
ssh root@DEINE-SERVER-IP
```

Beim ersten Verbinden nach "yes" bestätigen, dann das Passwort eingeben, das
du von Netcup per E-Mail bekommen hast.

## 2. Docker installieren

Copy & Paste, Zeile für Zeile:

```
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
```

Prüfen, ob es geklappt hat:

```
docker --version
docker compose version
```

Beide Befehle sollten eine Versionsnummer anzeigen, keinen Fehler.

## 3. Firewall einrichten

Nur die drei nötigen Ports öffnen (SSH, HTTP, HTTPS) — alles andere bleibt
von außen unerreichbar:

```
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

## 4. Projekt auf den Server bringen

Am einfachsten über Git (falls dein Projekt schon in einem privaten
GitHub-/GitLab-Repository liegt):

```
apt install -y git
git clone DEINE-REPOSITORY-URL sv24-os
cd sv24-os
```

Falls das Projekt noch nirgends in einem Git-Repository liegt: Sag mir
Bescheid, dann richten wir das gemeinsam ein — das ist der einfachste Weg,
um Codeänderungen später sauber auf den Server zu bringen.

## 5. Produktions-Zugangsdaten anlegen

**Wichtig:** Auf dem Server niemals die `.env`-Datei von deinem PC
wiederverwenden — für den echten Betrieb brauchst du neue, eigene Secrets.

```
cp .env.example .env
```

Jetzt `.env` mit einem Editor öffnen:

```
nano .env
```

Trage folgende Werte ein (Pfeiltasten zum Navigieren, am Ende mit `Strg+O`
speichern, `Enter`, dann `Strg+X` zum Schließen):

- `DATABASE_URL` — lassen wie in der Beispieldatei, nur falls du das
  Postgres-Passwort unten änderst, hier ebenfalls anpassen.
- `AUTH_SECRET` — einen neuen, zufälligen Wert erzeugen (nächster Schritt).
- `NEXTAUTH_URL` — deine echte Adresse, z. B. `https://app.sprachvermittler24.de`
  (mit `https`, nicht `http`!).
- `POSTGRES_PASSWORD` — ein neues, sicheres Passwort (nächster Schritt).

Einen zufälligen, sicheren Wert für `AUTH_SECRET` erzeugen:

```
openssl rand -base64 32
```

Den ausgegebenen Wert kopieren und bei `AUTH_SECRET="..."` einsetzen.
Genauso für `POSTGRES_PASSWORD` — entweder denselben Befehl noch einmal
ausführen oder ein eigenes sicheres Passwort wählen.

Die Felder für sevDesk/E-Mail-Import/SMTP kannst du vorerst leer lassen,
solange diese Integrationen nicht produktiv genutzt werden.

## 6. Domain in der Caddy-Konfiguration eintragen

```
nano Caddyfile
```

In der ersten Zeile `app.sprachvermittler24.de` durch deine echte Domain
ersetzen, dann speichern (`Strg+O`, `Enter`, `Strg+X`).

## 7. Starten

```
docker compose -f docker-compose.prod.yml up -d --build
```

Der erste Start dauert ein paar Minuten (Build der App, Zertifikatsanfrage
bei Let's Encrypt). Fortschritt live mitverfolgen:

```
docker compose -f docker-compose.prod.yml logs -f
```

(Mit `Strg+C` verlässt du nur die Log-Ansicht — die App läuft im Hintergrund
weiter.)

Danach sollte `https://deine-domain.de` erreichbar sein und automatisch ein
gültiges Schloss-Symbol im Browser zeigen.

## 8. Erste Einrichtung / Login

Falls die Datenbank noch leer ist, kannst du die Demo-/Beispieldaten aus dem
lokalen Testen NICHT einfach übernehmen — für den echten Betrieb legst du
frisch echte Admin-Zugänge an. Sag mir, wenn du an diesem Punkt bist, dann
setzen wir gemeinsam die ersten echten Admin- und Büro-Zugänge auf, statt der
Testdaten aus `prisma/seed.ts`.

## 9. Backups

Über den Admin-Bereich → "Backups" kannst du jederzeit manuell ein
Datenbank-Backup erstellen und herunterladen. Für den Produktivbetrieb
empfehle ich zusätzlich:

- Regelmäßig (z. B. wöchentlich) ein Backup herunterladen und **außerhalb**
  des Servers speichern (eigener PC, Cloud-Speicher) — ein Backup, das nur
  auf demselben Server liegt, hilft nicht, falls der Server komplett
  ausfällt.
- Optional: im Netcup-Kundenportal (SCP) prüfen, ob automatische
  Server-Snapshots gebucht werden können — das sichert den ganzen Server,
  nicht nur die Datenbank.

## 10. Updates einspielen

Wenn wir gemeinsam Codeänderungen vorgenommen haben und du sie live
schalten willst:

```
cd sv24-os
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Sicherheits-Checkliste vor dem Livegang

- [ ] `AUTH_SECRET` und `POSTGRES_PASSWORD` sind neu generierte, zufällige
      Werte — nicht die aus der lokalen Testumgebung.
- [ ] `NEXTAUTH_URL` beginnt mit `https://` und zeigt auf die echte Domain.
- [ ] Die Standard-Admin-Zugänge aus `prisma/seed.ts` (Testdaten) werden
      NICHT produktiv verwendet — echte Zugänge frisch anlegen.
- [ ] Firewall ist aktiv (`ufw status` zeigt nur 22, 80, 443 als "ALLOW").
- [ ] Ein erstes Backup wurde erstellt und außerhalb des Servers gespeichert.
