"use client";

import { Card, PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/pricing";
import { useStudioData } from "@/lib/storage";

export default function SettingsPage() {
  const { data } = useStudioData();
  const settings = [
    ["מע״מ ברירת מחדל", `${data.businessSettings.vatRate * 100}%`],
    ["משך אירוע ברירת מחדל", `${data.businessSettings.defaultEventHours} שעות`],
    ["עלות צבעים", formatCurrency(data.businessSettings.defaultPaintCost)],
    ["עלות גלזורה", formatCurrency(data.businessSettings.defaultGlazeCost)],
    ["עלות אריזה", formatCurrency(data.businessSettings.defaultPackagingCost)],
    ["עלות שריפה", formatCurrency(data.businessSettings.defaultFiringCost)],
    ["עלות לוגיסטיקה", formatCurrency(data.businessSettings.defaultLogisticsCost)]
  ];

  return (
    <>
      <PageHeader title="הגדרות" description="ערכי ברירת מחדל מתוך שכבת הדאטה המקומית. עריכה מלאה שלהם תיכנס בשלב הבא." />
      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {settings.map(([label, value]) => (
            <div key={label} className="rounded-3xl bg-white/60 p-4">
              <p className="text-sm font-black text-clay">{label}</p>
              <p className="mt-1 text-2xl font-black text-ink">{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
