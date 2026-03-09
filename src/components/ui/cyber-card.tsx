import { clsx } from "clsx";

export function CyberCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={clsx("cyber-card", className)}>{children}</section>;
}
