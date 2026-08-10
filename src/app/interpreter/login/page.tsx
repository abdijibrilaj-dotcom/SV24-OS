import Link from "next/link";
import { loginAction } from "@/lib/actions/auth-actions";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { SalutationToggle } from "@/components/auth/salutation-toggle";
import { Button } from "@/components/ui/button";

export default async function InterpreterLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const action = loginAction.bind(null, "interpreter");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-8 pt-16">
      <Logo className="w-28" />
      <div className="-mt-1 text-center">
        <div className="text-[22px] font-extrabold">SV24 OS</div>
        <div className="mt-1 text-[13px] text-text-secondary">
          Dolmetscher-App
        </div>
      </div>

      <form action={action} className="mt-1 flex w-full flex-col gap-3">
        <SalutationToggle />
        <div>
          <label className="mb-1.5 block text-xs text-text-secondary">
            E-Mail
          </label>
          <Input
            type="email"
            name="email"
            required
            placeholder="elif.yildiz@sprachvermittler24.de"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-text-secondary">
            Passwort
          </label>
          <Input
            type="password"
            name="password"
            required
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="text-center text-[12.5px] font-medium text-pill-red-fg">
            E-Mail, Passwort oder Anrede stimmen nicht überein.
          </p>
        )}
        <Button type="submit" variant="primary" className="mt-1 w-full py-3.5">
          Anmelden
        </Button>
        <Link
          href="#"
          className="mt-0.5 text-center text-[13px] font-semibold text-text-secondary"
        >
          Passwort vergessen?
        </Link>
      </form>
    </main>
  );
}
