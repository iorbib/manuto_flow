"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Sparkles } from "lucide-react";
import { signIn, isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4">
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
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#ffe9df,_#fffaf1_38%,_#f8dcd6_100%)] px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.75rem] bg-coral text-white shadow-soft">
            <Sparkles size={28} />
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-normal text-ink">Manuto Flow</h1>
          <p className="mt-2 text-clay">כניסה לשולחן הסטודיו של מנותו</p>
        </div>

        <form onSubmit={submitLogin} className="studio-card rounded-[32px] p-6">
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
            className="mt-6 min-h-12 w-full rounded-full bg-coral px-5 py-3 font-black text-white shadow-soft transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? "נכנסת..." : "כניסה"}
          </button>
        </form>
      </section>
    </main>
  );
}
