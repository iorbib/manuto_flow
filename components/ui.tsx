import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { statusColors, statusLabels, statusTimeline } from "@/lib/seedData";
import type { EventStatus } from "@/lib/types";

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-3 h-1.5 w-14 rounded-full bg-coral/80" />
        <h1 className="text-3xl font-black leading-tight tracking-normal text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-base font-bold leading-7 text-clay/85">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`studio-card motion-rise rounded-[1.65rem] p-5 ${className}`}>{children}</section>;
}

export function StatCard({ label, value, tone = "bg-peach" }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="overflow-hidden">
      <div className={`mb-4 h-1.5 w-16 rounded-full ${tone}`} />
      <p className="text-sm font-black text-clay/80">{label}</p>
      <p className="mt-2 font-mono text-3xl font-black tracking-normal text-ink">{value}</p>
    </Card>
  );
}

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export function StatusTimeline({ status }: { status: EventStatus }) {
  const currentIndex = Math.max(
    0,
    statusTimeline.findIndex((item) => item.key === status)
  );

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex min-w-[680px] items-center gap-2">
        {statusTimeline.map((item, index) => {
          const complete = index <= currentIndex;
          return (
            <div key={item.key} className="flex flex-1 items-center gap-2">
              <div className="flex flex-1 flex-col items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${complete ? "bg-coral" : "bg-sand"}`} />
                <span className={`text-xs font-bold ${complete ? "text-ink" : "text-clay/70"}`}>{item.label}</span>
              </div>
              {index < statusTimeline.length - 1 ? (
                <div className={`h-1 flex-1 rounded-full ${index < currentIndex ? "bg-coral" : "bg-sand"}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 font-black text-white shadow-soft transition active:scale-[0.98]">
      {children}
      <ArrowLeft size={18} />
    </Link>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="text-center">
      <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-coral/70" />
      <p className="text-xl font-black text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-xl font-bold leading-7 text-clay/85">{body}</p>
    </Card>
  );
}

export function ActionButton({
  children,
  tone = "primary",
  type = "button",
  onClick
}: {
  children: React.ReactNode;
  tone?: "primary" | "quiet" | "danger";
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  const styles = {
    primary: "bg-coral text-white shadow-soft hover:bg-[#e97870]",
    quiet: "border border-clay/10 bg-white/70 text-clay hover:bg-white hover:text-ink",
    danger: "bg-red-100 text-red-900 hover:bg-red-200"
  };

  return (
    <button type={type} onClick={onClick} className={`min-h-11 rounded-full px-4 py-2 text-sm font-black transition duration-200 ease-out active:scale-[0.98] ${styles[tone]}`}>
      {children}
    </button>
  );
}
