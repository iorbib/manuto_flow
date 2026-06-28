"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CalendarClock, ClipboardCheck, Heart, PackageSearch, Paintbrush, ReceiptText } from "lucide-react";
import { ActionButton, InlineLink } from "@/components/ui";
import { calculateEventPricing, formatCurrency } from "@/lib/pricing";
import { dailySupportMessages } from "@/lib/seedData";
import { useStudioData } from "@/lib/storage";
import type { Employee, EmployeeWorkLog, Event } from "@/lib/types";

const manutoLogoUrl = "https://manuto.co.il/wp-content/uploads/2023/04/manuto_logo_pink_black-e1703362069976.png";
const lowStockThreshold = 10;

export default function DashboardPage() {
  const { data } = useStudioData();
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = getLocalMonthKey(new Date());
  const nextEvent =
    data.events
      .filter((event) => event.date >= today)
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0] ?? data.events[0];
  const openQuotes = data.quotes.filter((quote) => quote.status !== "approved");
  const lowInventory = data.products
    .filter((product) => product.isActive)
    .map((product) => {
      const inventory = data.inventory.find((item) => item.productId === product.id);
      const reservedQuantity = getReservedQuantity(data.events, product.id, today);
      const quantityOnHand = inventory?.quantityOnHand ?? 0;

      return {
        product,
        reservedQuantity,
        availableQuantity: quantityOnHand - reservedQuantity
      };
    })
    .filter((item) => item.availableQuantity < lowStockThreshold)
    .sort((first, second) => first.availableQuantity - second.availableQuantity);
  const studioEvents = data.events.filter((event) => ["completed", "studio_work", "glazing", "firing", "packing"].includes(event.status));
  const monthlyFinance = calculateMonthlyFinance(data.events, data.employeeWorkLogs ?? [], data.employees, currentMonth, data.businessSettings.vatRate);
  const supportMessages = [...dailySupportMessages, ...(data.dailySupportMessages ?? [])].filter(Boolean);
  const dailySupportMessage = supportMessages[getDayOfYear(new Date()) % supportMessages.length] ?? "בואי נתחיל בדבר הבא שעל השולחן.";

  return (
    <div className="space-y-6">
      <section className="motion-rise overflow-hidden rounded-[2.4rem] border border-clay/10 bg-[#fffdf8] shadow-[0_30px_90px_rgba(122,76,62,0.14)]">
        <div className="grid min-h-[430px] lg:grid-cols-[1fr_390px]">
          <div className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="absolute inset-x-0 top-0 h-2 bg-coral" />
            <div className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-blush/28 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-10 h-52 w-52 rounded-full bg-mint/35 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <img src={manutoLogoUrl} alt="Manuto" className="h-auto w-44 max-w-[70vw]" />
                <p className="mt-8 text-sm font-black text-clay/75">שולחן עבודה יומי</p>
                <h1 className="mt-3 max-w-3xl text-5xl font-black leading-[0.98] tracking-normal text-ink sm:text-6xl">מה מחכה היום בסטודיו?</h1>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="אירועים" value={data.events.length} />
                <Metric label="הצעות פתוחות" value={openQuotes.length} />
                <Metric label="פריטים" value={data.products.length} />
                <Metric label="מתעניינים" value={data.clients.filter((client) => client.clientStatus === "interested").length} />
              </div>
            </div>
          </div>

          <aside className="border-t border-clay/10 bg-[#f7dfd6] p-6 sm:p-8 lg:border-r lg:border-t-0">
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <div className="mb-5 flex items-center gap-2 font-black text-clay">
                  <CalendarClock size={19} />
                  האירוע הבא
                </div>
                {nextEvent ? (
                  <div>
                    <p className="text-4xl font-black leading-tight text-ink">{nextEvent.title}</p>
                    <p className="mt-4 text-lg font-black text-clay">
                      {nextEvent.date} · {nextEvent.startTime || "ללא שעה"}
                    </p>
                    <p className="mt-2 font-bold leading-7 text-clay/90">{nextEvent.address || "ללא כתובת"}</p>
                    <p className="mt-6 border-t border-clay/15 pt-5 font-bold leading-8 text-ink/80">{nextEvent.eventDescription || nextEvent.internalNotes || "אין תיאור עדיין."}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-black leading-tight text-ink">עוד אין אירועים.</p>
                    <p className="mt-3 font-bold leading-7 text-clay">בואי נוסיף את הסדנה הראשונה.</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <InlineLink href="/events">{nextEvent ? "לערוך אירועים" : "הוספת אירוע ראשון"}</InlineLink>
                <Link href="/schedule" className="inline-flex items-center gap-2 rounded-full border border-clay/15 bg-white/60 px-4 py-2 font-black text-clay transition hover:bg-white active:scale-[0.98]">
                  סידור עבודה
                  <ArrowLeft size={18} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <WorkPanel icon={<ReceiptText size={20} />} title={`החודש בכסף · ${formatMonthLabel(currentMonth)}`} href="/events" action={<ActionButton tone="quiet">אירועים</ActionButton>} tone="bg-mint/35">
        {monthlyFinance.eventCount ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MoneyTile label="כולל מע״מ" value={monthlyFinance.revenueIncVat} tone="bg-white/70" />
              <MoneyTile label="לפני מע״מ" value={monthlyFinance.revenueExVat} tone="bg-white/70" />
              <MoneyTile label="כלים" value={monthlyFinance.ceramicCost} tone="bg-peach/60" />
              <MoneyTile label="שעות עבודה" value={monthlyFinance.employeeCost} tone="bg-blush/55" />
              <MoneyTile label="נשאר לפני מסים" value={monthlyFinance.grossProfit} tone={monthlyFinance.grossProfit >= 0 ? "bg-coral/80" : "bg-red-100"} />
            </div>
            <div className="grid gap-3 text-sm font-black text-clay sm:grid-cols-3">
              <FinanceNote label="אירועים בחישוב" value={`${monthlyFinance.eventCount}`} />
              <FinanceNote label="שעות מתוכננות" value={`${formatNumber(monthlyFinance.plannedEmployeeHours)} שעות`} />
              <FinanceNote label="שעות בפועל שנרשמו" value={`${formatNumber(monthlyFinance.loggedEmployeeHours)} שעות · ${formatCurrency(monthlyFinance.loggedEmployeeCost)}`} />
            </div>
          </div>
        ) : (
          <p className="font-bold text-clay">אין עדיין אירועים החודש שאפשר לסכם מהם הכנסות והוצאות.</p>
        )}
      </WorkPanel>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr_1fr]">
        <WorkPanel icon={<Heart size={20} />} title="הפתק של היום" tone="bg-blush/35">
          <p className="text-2xl font-black leading-10 text-ink">{dailySupportMessage}</p>
        </WorkPanel>

        <WorkPanel icon={<ClipboardCheck size={20} />} title="הצעות פתוחות" action={<ActionButton tone="quiet">לניהול</ActionButton>} href="/quotes">
          {openQuotes.length ? (
            <div className="divide-y divide-clay/10">
              {openQuotes.slice(0, 4).map((quote) => {
                const event = data.events.find((item) => item.id === quote.eventId);
                return (
                  <div key={quote.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="font-black text-ink">{event?.title || "הצעה ללא אירוע"}</span>
                    <span className="font-mono text-sm font-black text-clay">{formatCurrency(quote.items.reduce((sum, item) => sum + item.quantity * item.pricePerParticipantIncVat, 0))}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-bold text-clay">אין הצעות פתוחות כרגע.</p>
          )}
        </WorkPanel>

        <WorkPanel icon={<PackageSearch size={20} />} title="מלאי שכדאי לבדוק" action={<ActionButton tone="quiet">מלאי</ActionButton>} href="/inventory">
          {lowInventory.length ? (
            <div className="space-y-2">
              {lowInventory.slice(0, 5).map((item) => (
                <div key={item.product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-3 py-3 font-bold text-clay">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <AlertTriangle size={17} className="shrink-0 text-coral" />
                    <span className="truncate">{item.product.name}</span>
                  </span>
                  <span className="shrink-0 font-mono font-black text-ink">{item.availableQuantity}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-bold text-clay">המלאי נראה רגוע כרגע.</p>
          )}
        </WorkPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <WorkPanel icon={<Paintbrush size={20} />} title="סטודיו" href="/tasks">
          {studioEvents.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {studioEvents.slice(0, 6).map((event) => (
                <Link key={event.id} href="/tasks" className="rounded-2xl bg-white/60 px-4 py-3 font-black text-ink transition hover:-translate-y-0.5">
                  {event.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="font-bold text-clay">אין כרגע אירועים שמחכים לעבודה בסטודיו.</p>
          )}
        </WorkPanel>

        <div className="overflow-hidden rounded-[2rem] border border-clay/10 bg-ink p-6 text-paper shadow-[0_30px_90px_rgba(61,48,43,0.18)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-paper/60">MANUTO FLOW</p>
              <h2 className="mt-2 text-3xl font-black">מבט קצר על מה שצריך לזוז היום.</h2>
              <p className="mt-3 max-w-xl font-bold leading-7 text-paper/70">אירועים קרובים, הצעות פתוחות וסטודיו שצריך תשומת לב.</p>
            </div>
            <div className="hidden h-20 w-20 shrink-0 place-items-center rounded-[1.5rem] bg-paper/10 p-3 sm:grid">
              <img src={manutoLogoUrl} alt="Manuto" className="h-auto w-full invert-[0.02]" />
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <DarkChip label="אירוע" value={nextEvent?.title ?? "אין"} />
            <DarkChip label="פתוחות" value={`${openQuotes.length}`} />
            <DarkChip label="סטודיו" value={`${studioEvents.length}`} />
          </div>
        </div>
      </section>
    </div>
  );
}

function WorkPanel({ icon, title, children, action, href, tone = "bg-white/50" }: { icon: React.ReactNode; title: string; children: React.ReactNode; action?: React.ReactNode; href?: string; tone?: string }) {
  const content = (
    <section className={`motion-rise rounded-[2rem] border border-clay/10 ${tone} p-5 shadow-[0_22px_70px_rgba(122,76,62,0.1),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-black text-ink">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-coral text-white shadow-soft">{icon}</span>
          <h2 className="text-xl font-black">{title}</h2>
        </div>
        {href && action ? <Link href={href}>{action}</Link> : action}
      </div>
      {children}
    </section>
  );

  return content;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.4rem] border border-clay/10 bg-white/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="text-xs font-black text-clay/75">{label}</p>
      <p className="mt-2 font-mono text-3xl font-black text-ink">{value}</p>
    </div>
  );
}

function DarkChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-paper/10 bg-paper/10 p-4">
      <p className="text-xs font-black text-paper/60">{label}</p>
      <p className="mt-2 truncate font-black text-paper">{value}</p>
    </div>
  );
}

function MoneyTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-[1.4rem] border border-clay/10 ${tone} p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]`}>
      <p className="text-xs font-black text-clay/75">{label}</p>
      <p className="mt-2 whitespace-nowrap font-mono text-2xl font-black text-ink">{formatCurrency(value)}</p>
    </div>
  );
}

function FinanceNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/55 px-4 py-3">
      <span className="text-clay/70">{label}</span>
      <span className="mx-2 text-ink">{value}</span>
    </div>
  );
}

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getLocalMonthKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `${month}/${year}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("he-IL", { maximumFractionDigits: 1 }).format(value);
}

function getReservedQuantity(events: Event[], productId: string, today: string) {
  return events
    .filter((event) => event.date >= today && !["cancelled", "delivered", "paid", "closed"].includes(event.status))
    .flatMap((event) => event.items ?? [])
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

function calculateMonthlyFinance(events: Event[], workLogs: EmployeeWorkLog[], employees: Employee[], monthKey: string, vatRate: number) {
  const billableEvents = events.filter((event) => event.date.startsWith(monthKey) && !["cancelled"].includes(event.status));

  const eventTotals = billableEvents.reduce(
    (totals, event) => {
      const pricing = calculateEventPricing(event, employees, vatRate);
      const plannedHours = event.assignments.reduce((sum, assignment) => sum + assignment.eventHours, 0);

      return {
        revenueIncVat: totals.revenueIncVat + pricing.revenueIncVat,
        revenueExVat: totals.revenueExVat + pricing.revenueExVat,
        ceramicCost: totals.ceramicCost + pricing.ceramicCost,
        employeeCost: totals.employeeCost + pricing.employeeCost,
        directCosts: totals.directCosts + pricing.directCosts,
        grossProfit: totals.grossProfit + pricing.grossProfit,
        plannedEmployeeHours: totals.plannedEmployeeHours + plannedHours
      };
    },
    {
      revenueIncVat: 0,
      revenueExVat: 0,
      ceramicCost: 0,
      employeeCost: 0,
      directCosts: 0,
      grossProfit: 0,
      plannedEmployeeHours: 0
    }
  );

  const loggedWork = workLogs.filter((log) => log.date.startsWith(monthKey));
  const loggedEmployeeHours = loggedWork.reduce((sum, log) => sum + log.hours, 0);
  const loggedEmployeeCost = loggedWork.reduce((sum, log) => sum + log.hours * log.hourlyRate, 0);

  return {
    ...eventTotals,
    eventCount: billableEvents.length,
    loggedEmployeeHours,
    loggedEmployeeCost
  };
}
