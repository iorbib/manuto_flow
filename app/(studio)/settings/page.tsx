"use client";

import { FormEvent, useEffect, useState } from "react";
import { ActionButton, Card, PageHeader } from "@/components/ui";
import { seedData } from "@/lib/seedData";
import { useStudioData } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
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
    if (!supabase) {
      setCloudStatus("Supabase לא מחובר בפרונט. חסרים משתני סביבה בוורסל.");
      return;
    }

    setCloudStatus("בודקת קריאה וכתיבה לענן...");

    const { data: currentRow, error: readError } = await supabase.from("studio_state").select("data").eq("id", "main").maybeSingle();

    if (readError) {
      setCloudStatus(`קריאה נכשלה: ${readError.message}`);
      return;
    }

    const currentData = currentRow?.data ?? data ?? seedData;
    const { error: writeError } = await supabase
      .from("studio_state")
      .upsert({ id: "main", data: currentData, updated_at: new Date().toISOString() }, { onConflict: "id" })
      .select("updated_at")
      .single();

    if (writeError) {
      setCloudStatus(`כתיבה נכשלה: ${writeError.message}`);
      window.localStorage.setItem("manuto-flow-sync-error", writeError.message);
      return;
    }

    window.localStorage.removeItem("manuto-flow-sync-error");
    setCloudStatus("הכתיבה לענן הצליחה. אם אירוע עדיין נעלם, הבעיה היא בלוגיקת שמירה ולא בהרשאות Supabase.");
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
