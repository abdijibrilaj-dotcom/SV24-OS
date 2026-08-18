import { redirect } from "next/navigation";
import { Building2, Languages, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { ROLE_PORTAL } from "@/lib/portals";
import { Logo } from "@/components/logo";

export default async function RootPage() {
  const session = await auth();
  if (session?.user) {
    redirect(`/${ROLE_PORTAL[session.user.role]}`);
  }

  const portals = [
    {
      href: "/admin/login",
      label: "Admin",
      desc: "Backoffice für die Geschäftsleitung",
      icon: ShieldCheck,
    },
    {
      href: "/buero/login",
      label: "Büro",
      desc: "Tagesgeschäft & Buchungen",
      icon: Building2,
    },
    {
      href: "/interpreter/login",
      label: "Dolmetscher",
      desc: "Jobs, Verfügbarkeit & Auszahlungen",
      icon: Languages,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-content-bg px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo className="h-14 w-auto" />
        <div className="text-sm text-text-secondary">Bitte wähle deinen Bereich aus</div>
      </div>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {portals.map((p) => (
          <a
            key={p.href}
            href={p.href}
            className="flex flex-col gap-3 rounded-[18px] border border-card-border bg-card-bg p-6 shadow-[var(--shadow-card-desktop)] transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-field-bg-alt text-navy">
              <p.icon size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-text-primary">{p.label}</div>
              <div className="mt-1 text-[13px] text-text-secondary">{p.desc}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="text-xs text-text-tertiary">© {new Date().getFullYear()} Sprachvermittler24</div>
    </main>
  );
}
