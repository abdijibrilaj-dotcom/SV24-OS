import { loginAction } from "@/lib/actions/auth-actions";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const action = loginAction.bind(null, "admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-content-bg px-4">
      <Card className="w-full max-w-[380px]" padded={false}>
        <div className="flex flex-col items-center gap-5 px-8 pb-8 pt-10">
          <Logo withTagline={false} />
          <div className="text-center">
            <div className="text-[20px] font-extrabold">SV24 OS</div>
            <div className="mt-1 text-[13px] text-text-secondary">
              Admin-Backoffice
            </div>
          </div>

          <form action={action} className="mt-1 flex w-full flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs text-text-secondary">
                E-Mail
              </label>
              <Input
                type="email"
                name="email"
                required
                placeholder="info@sprachvermittler24.de"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-text-secondary">
                Passwort
              </label>
              <Input type="password" name="password" required placeholder="••••••••" />
            </div>
            {error && (
              <p className="text-center text-[12.5px] font-medium text-pill-red-fg">
                E-Mail oder Passwort stimmen nicht überein.
              </p>
            )}
            <Button type="submit" variant="primary" className="mt-1 w-full py-3">
              Anmelden
            </Button>
          </form>
        </div>
      </Card>
    </main>
  );
}
