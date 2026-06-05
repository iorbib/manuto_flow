import { Card, PageHeader } from "@/components/ui";
import { businessSettings } from "@/lib/data";
import { formatCurrency } from "@/lib/pricing";

export default function SettingsPage() {
  const settings = [
    ["מע״מ ברירת מחדל", `${businessSettings.vatRate * 100}%`],
    ["משך אירוע ברירת מחדל", `${businessSettings.defaultEventHours} שעות`],
    ["עלות צבעים", formatCurrency(businessSettings.defaultPaintCost)],
    ["עלות גלזורה", formatCurrency(businessSettings.defaultGlazeCost)],
    ["עלות אריזה", formatCurrency(businessSettings.defaultPackagingCost)],
    ["עלות שריפה", formatCurrency(businessSettings.defaultFiringCost)],
    ["עלות לוגיסטיקה", formatCurrency(businessSettings.defaultLogisticsCost)]
  ];

  return (
    <>
      <PageHeader title="הגדרות" description="ערכי ברירת מחדל שמשפיעים על תמחור ותכנון אירועים." />
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
