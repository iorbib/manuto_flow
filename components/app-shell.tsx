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
        <header className="fixed inset-x-0 top-0 z-40 hidden border-b border-clay/10 bg-paper/100 px-8 py-4 shadow-[0_18px_60px_rgba(122,76,62,0.08)] backdrop-blur-2xl lg:block">
          <div className="mx-auto flex max-w-[1500px] items-center gap-6">
            <Link href="/dashboard" className="group flex w-64 shrink-0 items-center gap-3">
              <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-[1.4rem] bg-white/80 p-2 shadow-[0_18px_45px_rgba(122,76,62,0.13),inset_0_1px_0_rgba(255,255,255,0.75)] transition duration-300 group-hover:-translate-y-0.5">
                <img src={manutoLogoUrl} alt="Manuto" className="h-auto w-full" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-black leading-tight text-ink">Manuto Flow</span>
                <span className="block text-xs font-bold text-clay/75">גרסה {appVersion}</span>
              </span>
            </Link>

            <nav className="mobile-nav-scroll flex flex-1 gap-2 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-black transition duration-200 ease-out active:scale-[0.98] ${
                      active ? "bg-coral text-white shadow-soft" : "text-clay hover:bg-white/75 hover:text-ink"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleSignOut}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/75 text-clay shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition hover:text-ink active:scale-[0.98]"
              title="יציאה"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <nav className="mobile-nav-scroll fixed bottom-0 right-0 z-40 flex w-full gap-1 overflow-x-auto border-t border-clay/10 bg-paper/90 px-2 py-2 pb-[env(safe-area-inset-bottom)] shadow-soft backdrop-blur-xl lg:hidden">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 min-w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-black transition duration-200 ease-out active:scale-[0.98] ${
                  active ? "bg-coral text-white shadow-soft" : "text-clay hover:bg-white/60 hover:text-ink"
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-14 min-w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-bold text-clay transition hover:bg-peach/50 hover:text-ink"
          >
            <LogOut size={19} />
            <span>יציאה</span>
          </button>
        </nav>

        <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-10 lg:pt-32">
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
