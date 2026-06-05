"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    function checkAuth() {
      const authenticated = isAuthenticated();
      setAllowed(authenticated);
      setChecked(true);

      if (!authenticated) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    }

    checkAuth();
    window.addEventListener("manuto-auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("manuto-auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname, router]);

  if (!checked || !allowed) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream px-4">
        <div className="studio-card max-w-sm rounded-[28px] p-6 text-center">
          <p className="text-xl font-black text-ink">בודקת התחברות...</p>
          <p className="mt-2 text-sm text-clay">עוד רגע נכנסים למנותו.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
