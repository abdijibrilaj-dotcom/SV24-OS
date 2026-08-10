import path from "path";
import { readdir, stat } from "fs/promises";
import { Card } from "@/components/ui/card";
import { CreateBackupButton } from "@/components/admin/create-backup-button";
import { formatDate } from "@/lib/format";

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "storage", "backups");

async function listBackups() {
  try {
    const files = await readdir(BACKUP_DIR);
    const withStats = await Promise.all(
      files
        .filter((f) => f.endsWith(".sql"))
        .map(async (f) => {
          const s = await stat(path.join(BACKUP_DIR, f));
          return { name: f, size: s.size, mtime: s.mtime };
        })
    );
    return withStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  } catch {
    return [];
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function BackupsPage() {
  const backups = await listBackups();

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="max-w-[55ch] text-[13px] text-text-secondary">
          Manuelle Datenbank-Backups (pg_dump der Produktionsdatenbank). Für automatische, regelmäßige
          Backups zusätzlich einen Cronjob auf dem Hostsystem einrichten (siehe README).
        </div>
        <CreateBackupButton />
      </div>
      <Card padded={false}>
        <div className="overflow-x-auto px-5 pb-1 pt-2">
          <table className="w-full min-w-[520px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-[1.5px] border-[#F1F2F4] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
                <th className="px-1 py-3">Datei</th>
                <th className="px-1 py-3">Erstellt</th>
                <th className="px-1 py-3">Größe</th>
                <th className="px-1 py-3" />
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.name} className="border-t border-[#F1F2F4] hover:bg-[#FAFAFB]">
                  <td className="px-1 py-2.5 font-mono text-[12.5px]">{b.name}</td>
                  <td className="px-1 py-2.5">{formatDate(b.mtime)}</td>
                  <td className="px-1 py-2.5">{formatSize(b.size)}</td>
                  <td className="px-1 py-2.5">
                    <a
                      href={`/api/backups/${b.name}`}
                      className="text-[12.5px] font-semibold text-[#334155]"
                    >
                      Herunterladen
                    </a>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-tertiary">
                    Noch keine Backups erstellt.
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
