"use client";

import { FormEvent, useEffect, useState } from "react";
import { ActionButton, Card, PageHeader } from "@/components/ui";
import { useStudioData } from "@/lib/storage";
import type { BusinessSettings } from "@/lib/types";

export default function SettingsPage() {
  const { data, updateSettings } = useStudioData();
  const [form, setForm] = useState<BusinessSettings>(data.businessSettings);
  const [saved, setSaved] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("עוד לא בוצעה בדיקת ענן.");

  useEffect(() => {
    setForm(data.businessSettings);
  }, [data.businessSettings]);

  function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSettings(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function testCloudWrite() {
    setCloudStatus("בודקת קריאה דרך השרת...");

    const readResponse = await fetch("/api/studio-state", { cache: "no-store" }).catch(() => null);
    if (!readResponse?.ok) {
      const payload = (await readResponse?.json().catch(() => null)) as { error?: string } | null;
      setCloudStatus(`קריאה נכשלה: ${payload?.error ?? "אין תגובה מהשרת"}`);
      return;
    }

    setCloudStatus("בודקת כתיבה דרך השרת...");

    const writeResponse = await fetch("/api/studio-state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data })
    }).catch(() => null);

    if (!writeResponse?.ok) {
      const payload = (await writeResponse?.json().catch(() => null)) as { error?: string } | null;
      const message = payload?.error ?? "אין תגובה מהשרת";
      setCloudStatus(`כתיבה נכשלה: ${message}`);
      window.localStorage.setItem("manuto-flow-sync-error", message);
      return;
    }

    window.localStorage.removeItem("manuto-flow-sync-error");
    setCloudStatus("הקריאה והכתיבה דרך השרת הצליחו.");
  }

  return (
    <>
      <PageHeader title="הגדרות" description="הגדרות בסיס לחישובי אירועים והצעות. עלויות סטודיו גלובליות ינוהלו בהמשך בנפרד." />
      <Card className="mb-5">
        <form onSubmit={submitSettings} className="grid gap-4 sm:grid-cols-2">
          <NumberField label="מע״מ" suffix="%" value={Math.round(form.vatRate * 100)} onChange={(value) => setForm({ ...form, vatRate: value / 100 })} />
          <NumberField label="משך אירוע ברירת מחדל" suffix="שעות" value={form.defaultEventHours} onChange={(value) => setForm({ ...form, defaultEventHours: value })} />
          <div className="flex items-end gap-3">
            <ActionButton type="submit">שמירת הגדרות</ActionButton>
            {saved ? <span className="pb-2 font-black text-emerald-700">נשמר</span> : null}
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-ink">בדיקת סנכרון ענן</h2>
            <p className="mt-1 text-sm text-clay">{cloudStatus}</p>
          </div>
          <ActionButton onClick={testCloudWrite}>בדיקת כתיבה ל־Supabase</ActionButton>
        </div>
      </Card>
    </>
  );
}

function NumberField({
  label,
  suffix,
  value,
  onChange
}: {
  label: string;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-clay">{label}</span>
      <div className="flex items-center gap-2 rounded-[1.25rem] border border-clay/15 bg-white/70 px-4">
        <input className="w-full bg-transparent py-3 text-ink outline-none" type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} />
        <span className="font-black text-clay">{suffix}</span>
      </div>
    </label>
  );
}
