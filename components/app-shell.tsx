"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Home,
  Package,
  Paintbrush,
  ScrollText,
  Settings,
  Sparkles,
  Users,
  WalletCards
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "היום", icon: Home },
  { href: "/calendar", label: "יומן", icon: CalendarDays },
  { href: "/events", label: "אירועים", icon: Paintbrush },
  { href: "/quotes", label: "הצעות", icon: ScrollText },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/inventory", label: "מלאי", icon: Package },
  { href: "/employees", label: "עובדות", icon: WalletCards },
  { href: "/tasks", label: "סטודיו", icon: ClipboardList },
  { href: "/settings", label: "הגדרות", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <aside className="fixed bottom-0 right-0 z-40 w-full border-t border-clay/10 bg-paper/95 px-2 py-2 shadow-soft backdrop-blur lg:bottom-auto lg:top-0 lg:h-screen lg:w-72 lg:border-l lg:border-t-0 lg:px-5 lg:py-6">
        <Link href="/dashboard" className="mb-8 hidden items-center gap-3 lg:flex">
          <span className="grid h-12 w-12 place-items-center rounded-3xl bg-coral text-white shadow-soft">
            <Sparkles size={22} />
          </span>
          <span>
            <span className="block text-xl font-black text-ink">Manuto Flow</span>
            <span className="block text-sm text-clay">שולחן סטודיו דיגיטלי</span>
          </span>
        </Link>

        <nav className="grid grid-cols-5 gap-1 lg:grid-cols-1 lg:gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-bold transition lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:text-base ${
                  active ? "bg-coral text-white shadow-soft" : "text-clay hover:bg-peach/50 hover:text-ink"
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:mr-72 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
