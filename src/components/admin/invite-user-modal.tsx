"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { inviteUserAction } from "@/lib/actions/user-actions";

export function InviteUserModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "BUERO">("BUERO");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function close() {
    setOpen(false);
    setName("");
    setEmail("");
    setError(null);
    setCreated(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await inviteUserAction({ name, email, role });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setCreated(result);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="dark" onClick={() => setOpen(true)}>
        Benutzer einladen
      </Button>
      <Modal open={open} onClose={close} title={created ? "Benutzer eingeladen" : "Benutzer einladen"}>
        {created ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-secondary">
              Zugangsdaten (bitte weitergeben — beim ersten Login muss ein eigenes Passwort vergeben werden):
            </p>
            <div className="rounded-[10px] bg-field-bg-alt p-3 text-sm">
              <div>
                E-Mail: <span className="font-mono font-semibold">{created.email}</span>
              </div>
              <div>
                Temp.-Passwort: <span className="font-mono font-semibold">{created.tempPassword}</span>
              </div>
            </div>
            <Button variant="primary" onClick={close}>
              Fertig
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs text-text-secondary">Rolle</label>
              <Segmented
                options={[
                  { value: "BUERO", label: "Büro" },
                  { value: "ADMIN", label: "Admin" },
                ]}
                value={role}
                onChange={setRole}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-text-secondary">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-text-secondary">E-Mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@sprachvermittler24.de"
              />
            </div>
            {error && <p className="text-[12.5px] font-medium text-pill-red-fg">{error}</p>}
            <div className="mt-2 flex gap-2.5">
              <Button variant="secondary" className="flex-1" onClick={close}>
                Abbrechen
              </Button>
              <Button variant="primary" className="flex-1" onClick={save} disabled={pending || !name || !email}>
                {pending ? "Wird eingeladen…" : "Einladen"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
