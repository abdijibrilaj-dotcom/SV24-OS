// Every page here reads live, per-request data straight from Prisma.
// Without this, Next tries to prerender pages that don't happen to call
// auth() (e.g. Kalender, Rechnungen) at build time — which fails because
// the database isn't reachable yet during `docker build`, and would be
// wrong even if it were (this data must never be build-time-cached).
export const dynamic = "force-dynamic";

export default function BueroAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
