"use client";

import { FormEvent, useEffect, useState } from "react";
import { ActionButton, Card, PageHeader } from "@/components/ui";
import { useStudioData } from "@/lib/storage";
import type { BusinessSettings } from "@/lib/types";

export default function SettingsPage() {
  const { data, updateSettings } = useStudioData();
  const [form, setForm] = useState<BusinessSettings>(data.businessSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(data.businessSettings);
  }, [data.businessSettings]);

  function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSettings(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <>
      <PageHeader title="הגדרות" description="כל העלויות שמשמשות כברירת מחדל להצעות ואירועים. קל לשנות בלי להיכנס לקוד." />
      <Card>
        <form onSubmit={submitSettings} className="grid gap-4 sm:grid-cols-2">
          <NumberField label="מע״מ" suffix="%" value={Math.round(form.vatRate * 100)} onChange={(value) => setForm({ ...form, vatRate: value / 100 })} />
          <NumberField label="משך אירוע ברירת מחדל" suffix="שעות" value={form.defaultEventHours} onChange={(value) => setForm({ ...form, defaultEventHours: value })} />
          <NumberField label="עלות צבעים" suffix="₪" value={form.defaultPaintCost} onChange={(value) => setForm({ ...form, defaultPaintCost: value })} />
          <NumberField label="עלות גלזורה" suffix="₪" value={form.defaultGlazeCost} onChange={(value) => setForm({ ...form, defaultGlazeCost: value })} />
          <NumberField label="עלות אריזה" suffix="₪" value={form.defaultPackagingCost} onChange={(value) => setForm({ ...form, defaultPackagingCost: value })} />
          <NumberField label="עלות שריפה" suffix="₪" value={form.defaultFiringCost} onChange={(value) => setForm({ ...form, defaultFiringCost: value })} />
          <NumberField label="עלות לוגיסטיקה" suffix="₪" value={form.defaultLogisticsCost} onChange={(value) => setForm({ ...form, defaultLogisticsCost: value })} />
          <div className="flex items-end gap-3">
            <ActionButton type="submit">שמירת הגדרות</ActionButton>
            {saved ? <span className="pb-2 font-black text-emerald-700">נשמר</span> : null}
          </div>
        </form>
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
