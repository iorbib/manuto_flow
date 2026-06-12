"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Home,
  Package,
  Paintbrush,
  ScrollText,
  Settings,
  LogOut,
  Users,
  WalletCards
} from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { signOut } from "@/lib/auth";

const navigation = [
  { href: "/dashboard", label: "היום", icon: Home },
  { href: "/calendar", label: "יומן", icon: CalendarDays },
  { href: "/schedule", label: "סידור", icon: CalendarClock },
  { href: "/events", label: "אירועים", icon: Paintbrush },
  { href: "/quotes", label: "הצעות", icon: ScrollText },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/products", label: "פריטים", icon: Package },
  { href: "/inventory", label: "מלאי", icon: Package },
  { href: "/employees", label: "עובדות", icon: WalletCards },
  { href: "/tasks", label: "סטודיו", icon: ClipboardList },
  { href: "/settings", label: "הגדרות", icon: Settings }
];

const appVersion = "2026-06-11-sync-safe";
const manutoLogoUrl = "https://manuto.co.il/wp-content/uploads/2023/04/manuto_logo_pink_black-e1703362069976.png";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  return (
    <AuthGate>
      <div className="min-h-[100dvh] pb-28 lg:pb-0">
        <aside className="fixed bottom-0 right-0 z-40 w-full border-t border-clay/10 bg-paper/92 px-2 py-2 shadow-soft backdrop-blur-xl lg:bottom-auto lg:top-0 lg:h-[100dvh] lg:w-72 lg:border-l lg:border-t-0 lg:bg-paper/74 lg:px-5 lg:py-6">
          <div className="mb-8 hidden items-center justify-between gap-3 lg:flex">
            <Link href="/dashboard" className="group flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-[1.4rem] bg-white/72 p-2 shadow-[0_18px_45px_rgba(122,76,62,0.13),inset_0_1px_0_rgba(255,255,255,0.75)] transition duration-300 group-hover:-translate-y-0.5">
                <img src={manutoLogoUrl} alt="Manuto" className="h-auto w-full" />
              </span>
              <span>
                <span className="block text-xl font-black text-ink">Manuto Flow</span>
                <span className="block text-sm font-bold text-clay/85">שולחן סטודיו דיגיטלי</span>
                <span className="block text-[11px] font-bold text-clay/70">גרסה {appVersion}</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 text-clay transition hover:text-ink"
              title="יציאה"
            >
              <LogOut size={18} />
            </button>
          </div>

          <nav className="mobile-nav-scroll flex gap-1 overflow-x-auto pb-[env(safe-area-inset-bottom)] lg:grid lg:grid-cols-1 lg:gap-2 lg:overflow-visible lg:pb-0">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex min-h-14 min-w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-black transition duration-200 ease-out active:scale-[0.98] lg:min-h-0 lg:min-w-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:text-base ${
                    active ? "bg-coral text-white shadow-soft" : "text-clay hover:bg-white/62 hover:text-ink"
                  }`}
                >
                  {active ? <span className="absolute right-2 hidden h-6 w-1 rounded-full bg-white/75 lg:block" /> : null}
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-14 min-w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-bold text-clay transition hover:bg-peach/50 hover:text-ink lg:hidden"
            >
              <LogOut size={19} />
              <span>יציאה</span>
            </button>
          </nav>
        </aside>

        <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:mr-72 lg:px-8 lg:py-8">
          <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
            <img src={manutoLogoUrl} alt="Manuto" className="h-auto w-28" />
            <span className="text-left text-[11px] font-bold text-clay/60">גרסה {appVersion}</span>
          </div>
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
