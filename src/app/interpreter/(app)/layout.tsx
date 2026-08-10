// See src/app/buero/(app)/layout.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default function InterpreterAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
