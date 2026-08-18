import Link from "next/link";
import { RouteFallback } from "@/components/ui/route-fallback";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <RouteFallback
        icon="not-found"
        title="Seite nicht gefunden"
        description="Diese Adresse gibt es nicht."
        action={
          <Link href="/" className="mt-2 inline-block rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white">
            Zur Startseite
          </Link>
        }
      />
    </div>
  );
}
