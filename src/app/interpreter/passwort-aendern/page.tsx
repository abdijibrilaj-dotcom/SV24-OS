import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-content-bg-mobile px-4">
      <ChangePasswordForm error={error} />
    </main>
  );
}
