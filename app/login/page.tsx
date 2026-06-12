"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { signIn, isAuthenticated } from "@/lib/auth";

const manutoLogoUrl = "https://manuto.co.il/wp-content/uploads/2023/04/manuto_logo_pink_black-e1703362069976.png";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginLoading() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-cream px-4">
      <div className="studio-card max-w-sm rounded-[28px] p-6 text-center">
        <p className="text-xl font-black text-ink">טוענת כניסה...</p>
      </div>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(next);
    }
  }, [next, router]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const ok = await signIn(username, password);
    setIsSubmitting(false);

    if (!ok) {
      setError("שם משתמש או סיסמה לא נכונים.");
      return;
    }

    router.replace(next);
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-[2rem] bg-white/72 p-3 shadow-[0_22px_65px_rgba(122,76,62,0.15),inset_0_1px_0_rgba(255,255,255,0.78)]">
            <img src={manutoLogoUrl} alt="Manuto" className="h-auto w-full" />
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-normal text-ink">Manuto Flow</h1>
          <p className="mt-2 font-bold text-clay/80">כניסה לשולחן הסטודיו של מנותו</p>
        </div>

        <form onSubmit={submitLogin} className="studio-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint text-ink">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-ink">התחברות</h2>
              <p className="text-sm text-clay">כניסה למורשים בלבד.</p>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-clay">שם משתמש</span>
            <input
              className="input"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="doralona"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-black text-clay">סיסמה</span>
            <input
              className="input"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm font-black text-red-900">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 min-h-12 w-full rounded-full bg-coral px-5 py-3 font-black text-white shadow-soft transition hover:bg-[#e97870] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? "נכנסת..." : "כניסה"}
          </button>
        </form>
      </section>
    </main>
  );
}
