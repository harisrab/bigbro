export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <main>{children}</main>
    </div>
  );
}
