import { changePasswordAction } from "@/lib/actions/account-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ChangePasswordForm({ error }: { error?: string }) {
  return (
    <Card className="w-full max-w-[380px]">
      <div className="mb-1 text-base font-extrabold">Neues Passwort festlegen</div>
      <p className="mb-4 text-[13px] text-text-secondary">
        Aus Sicherheitsgründen musst du bei der ersten Anmeldung ein eigenes
        Passwort vergeben.
      </p>
      <form action={changePasswordAction} className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-xs text-text-secondary">
            Neues Passwort
          </label>
          <Input type="password" name="password" required minLength={8} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-text-secondary">
            Passwort wiederholen
          </label>
          <Input type="password" name="confirm" required minLength={8} />
        </div>
        {error && (
          <p className="text-[12.5px] font-medium text-pill-red-fg">
            Die Passwörter stimmen nicht überein oder sind zu kurz (min. 8 Zeichen).
          </p>
        )}
        <Button type="submit" variant="primary" className="mt-1 w-full py-3">
          Passwort speichern
        </Button>
      </form>
    </Card>
  );
}
