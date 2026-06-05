"use client";

import { useMemo, useState } from "react";
import { Calculator, Plus } from "lucide-react";
import { businessSettings, employees, products } from "@/lib/data";
import { calculatePricing, formatCurrency, formatPercent } from "@/lib/pricing";
import { Card } from "./ui";

export function QuoteBuilder() {
  const [participantCount, setParticipantCount] = useState(24);
  const [productId, setProductId] = useState(products[0].id);
  const product = products.find((item) => item.id === productId) ?? products[0];
  const [price, setPrice] = useState(product.defaultParticipantPriceIncVat);
  const [eventHours, setEventHours] = useState(businessSettings.defaultEventHours);
  const [employeeIds, setEmployeeIds] = useState(["emp_alona", "emp_shaked"]);
  const [expenses, setExpenses] = useState({
    paintCost: businessSettings.defaultPaintCost,
    glazeCost: businessSettings.defaultGlazeCost,
    packagingCost: businessSettings.defaultPackagingCost,
    firingCost: businessSettings.defaultFiringCost,
    logisticsCost: businessSettings.defaultLogisticsCost,
    extraExpenses: 0
  });

  const pricing = useMemo(
    () =>
      calculatePricing({
        participantCount,
        product,
        pricePerParticipantIncVat: price,
        eventHours,
        assignments: employeeIds.map((employeeId) => ({ employeeId, eventHours })),
        expenses
      }),
    [employeeIds, eventHours, expenses, participantCount, price, product]
  );

  function updateExpense(key: keyof typeof expenses, value: number) {
    setExpenses((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
      <Card>
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral text-white">
            <Calculator size={22} />
          </span>
          <div>
            <h2 className="text-2xl font-black text-ink">בואי נבנה הצעה</h2>
            <p className="text-clay">המספרים מתעדכנים תוך כדי כדי לראות כמה אוויר נשאר.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="כמות משתתפים">
            <input className="input" type="number" min="1" value={participantCount} onChange={(event) => setParticipantCount(Number(event.target.value))} />
          </Field>
          <Field label="מוצר">
            <select
              className="input"
              value={productId}
              onChange={(event) => {
                const nextProduct = products.find((item) => item.id === event.target.value) ?? products[0];
                setProductId(nextProduct.id);
                setPrice(nextProduct.defaultParticipantPriceIncVat);
              }}
            >
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="מחיר למשתתף כולל מע״מ">
            <input className="input" type="number" min="0" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
          </Field>
          <Field label="שעות אירוע">
            <input className="input" type="number" min="1" value={eventHours} onChange={(event) => setEventHours(Number(event.target.value))} />
          </Field>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-black text-clay">מי מגיעה לאירוע</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {employees.map((employee) => (
              <label
                key={employee.id}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 font-bold ${
                  employeeIds.includes(employee.id) ? "border-coral bg-peach/60 text-ink" : "border-clay/10 bg-white/60 text-clay"
                }`}
              >
                <span>{employee.name}</span>
                <input
                  type="checkbox"
                  checked={employeeIds.includes(employee.id)}
                  onChange={(event) => {
                    setEmployeeIds((current) =>
                      event.target.checked ? [...current, employee.id] : current.filter((id) => id !== employee.id)
                    );
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="צבעים">
            <input className="input" type="number" min="0" value={expenses.paintCost} onChange={(event) => updateExpense("paintCost", Number(event.target.value))} />
          </Field>
          <Field label="גלזורה">
            <input className="input" type="number" min="0" value={expenses.glazeCost} onChange={(event) => updateExpense("glazeCost", Number(event.target.value))} />
          </Field>
          <Field label="אריזה">
            <input className="input" type="number" min="0" value={expenses.packagingCost} onChange={(event) => updateExpense("packagingCost", Number(event.target.value))} />
          </Field>
          <Field label="שריפה">
            <input className="input" type="number" min="0" value={expenses.firingCost} onChange={(event) => updateExpense("firingCost", Number(event.target.value))} />
          </Field>
          <Field label="לוגיסטיקה">
            <input className="input" type="number" min="0" value={expenses.logisticsCost} onChange={(event) => updateExpense("logisticsCost", Number(event.target.value))} />
          </Field>
          <Field label="הוצאות נוספות">
            <input className="input" type="number" min="0" value={expenses.extraExpenses} onChange={(event) => updateExpense("extraExpenses", Number(event.target.value))} />
          </Field>
        </div>

        <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white">
          <Plus size={18} />
          לשמור טיוטת הצעה
        </button>
      </Card>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <Card className="space-y-4 bg-paper">
          <div>
            <p className="text-sm font-black text-clay">סיכום דביק</p>
            <h3 className="text-2xl font-black text-ink">כמה נשאר באמת</h3>
          </div>
          <SummaryRow label="הכנסה כולל מע״מ" value={formatCurrency(pricing.revenueIncVat)} />
          <SummaryRow label="הכנסה ללא מע״מ" value={formatCurrency(pricing.revenueExVat)} />
          <SummaryRow label="עלות קרמיקה" value={formatCurrency(pricing.ceramicCost)} />
          <SummaryRow label="עלות עובדות" value={formatCurrency(pricing.employeeCost)} />
          <SummaryRow label="צבעים" value={formatCurrency(expenses.paintCost)} />
          <SummaryRow label="גלזורה" value={formatCurrency(expenses.glazeCost)} />
          <SummaryRow label="אריזה" value={formatCurrency(expenses.packagingCost)} />
          <SummaryRow label="שריפה" value={formatCurrency(expenses.firingCost)} />
          <SummaryRow label="לוגיסטיקה" value={formatCurrency(expenses.logisticsCost)} />
          <div className="rounded-3xl bg-mint/70 p-4">
            <SummaryRow label="נשאר לפני מסים ושאר הוצאות" value={formatCurrency(pricing.grossProfit)} strong />
            <SummaryRow label="כמה אוויר נשאר" value={formatPercent(pricing.margin)} strong />
          </div>
          <p className="rounded-3xl bg-peach/60 p-4 font-bold leading-7 text-ink">{pricing.recommendation}</p>
        </Card>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-clay">{label}</span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "font-black text-ink" : "font-bold text-clay"}`}>
      <span>{label}</span>
      <span className="whitespace-nowrap">{value}</span>
    </div>
  );
}
