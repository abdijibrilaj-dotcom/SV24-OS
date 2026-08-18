import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RouteFallback } from "@/components/ui/route-fallback";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EEF1F4]">
      <RouteFallback
        icon="not-found"
        title="Seite nicht gefunden"
        description="Diese Adresse gibt es nicht (mehr). Möglicherweise wurde der Datensatz gelöscht oder der Link ist veraltet."
        action={
          <Link href="/admin">
            <Button variant="primary" className="mt-2">Zur Übersicht</Button>
          </Link>
        }
      />
    </div>
  );
}
