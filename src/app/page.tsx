import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROLE_PORTAL } from "@/lib/portals";
import { Logo } from "@/components/logo";

export default async function RootPage() {
  const session = await auth();
  if (session?.user) {
    redirect(`/${ROLE_PORTAL[session.user.role]}`);
  }

  const portals = [
    { href: "/admin/login", label: "Admin", desc: "Backoffice für die Geschäftsleitung" },
    { href: "/buero/login", label: "Büro", desc: "Tagesgeschäft & Buchungen" },
    { href: "/interpreter/login", label: "Dolmetscher", desc: "Jobs, Verfügbarkeit & Auszahlungen" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-content-bg px-6">
      <Logo className="h-16 w-auto" />
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {portals.map((p) => (
          <a
            key={p.href}
            href={p.href}
            className="rounded-[18px] border border-card-border bg-card-bg p-6 shadow-[var(--shadow-card-desktop)] transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="text-lg font-bold text-text-primary">{p.label}</div>
            <div className="mt-1 text-sm text-text-secondary">{p.desc}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
