import { syncCompletedJobs } from "@/lib/actions/job-actions";

// See src/app/buero/(app)/layout.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default async function InterpreterAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await syncCompletedJobs();
  return children;
}
