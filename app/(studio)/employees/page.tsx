"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarClock, Edit3, Plus, Search, Trash2 } from "lucide-react";
import { ActionButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { createId, useStudioData } from "@/lib/storage";
import type { Employee, EmployeeWorkActivity, EmployeeWorkLog } from "@/lib/types";
import { formatCurrency } from "@/lib/pricing";

const emptyEmployee: Employee = {
  id: "",
  name: "",
  role: "עובדת",
  hourlyRate: 55,
  phone: "",
  isActive: true,
  notes: ""
};

const activityLabels: Record<EmployeeWorkActivity, string> = {
  workshop: "סדנה",
  glazing: "גלזורה",
  packing: "אריזה",
  firing: "שריפה",
  delivery: "משלוח / איסוף",
  studio: "עבודת סטודיו",
  admin: "ניהול / תיאומים",
  other: "אחר"
};

function createEmptyWorkLog(employee?: Employee, eventId = ""): EmployeeWorkLog {
  return {
    id: "",
    employeeId: employee?.id ?? "",
    eventId,
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "13:00",
    hours: 4,
    hourlyRate: employee?.hourlyRate ?? 55,
    activity: "workshop",
    note: "",
    createdAt: new Date().toISOString()
  };
}

export default function EmployeesPage() {
  const { data, addEmployee, updateEmployee, deleteEmployee, addEmployeeWorkLog, updateEmployeeWorkLog, deleteEmployeeWorkLog } = useStudioData();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Employee>(emptyEmployee);
  const [workLogForm, setWorkLogForm] = useState<EmployeeWorkLog>(() => createEmptyWorkLog());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWorkLogFormOpen, setIsWorkLogFormOpen] = useState(false);

  const employees = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return data.employees;
    return data.employees.filter((employee) => [employee.name, employee.role, employee.phone, employee.notes].some((field) => field.toLowerCase().includes(value)));
  }, [data.employees, query]);

  const workLogs = useMemo(
    () => [...(data.employeeWorkLogs ?? [])].sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`)),
    [data.employeeWorkLogs]
  );

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const currentMonthEvents = useMemo(
    () =>
      data.events
        .filter((event) => event.date.startsWith(currentMonth) && event.status !== "cancelled")
        .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)),
    [currentMonth, data.events]
  );

  const monthSummary = useMemo(() => {
    return data.employees.map((employee) => {
      const employeeLogs = workLogs.filter((log) => log.employeeId === employee.id && log.date.startsWith(currentMonth));
      const hours = employeeLogs.reduce((sum, log) => sum + log.hours, 0);
      const cost = employeeLogs.reduce((sum, log) => sum + log.hours * log.hourlyRate, 0);
      return { employee, hours, cost, logs: employeeLogs.length };
    });
  }, [data.employees, workLogs]);

  function submitEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (form.id) updateEmployee(form);
    else addEmployee({ ...form, id: createId("emp") });
    setForm(emptyEmployee);
    setIsFormOpen(false);
  }

  function openWorkLogForm(employee?: Employee, eventId = "") {
    setWorkLogForm(createEmptyWorkLog(employee ?? data.employees.find((item) => item.isActive) ?? data.employees[0], eventId));
    setIsWorkLogFormOpen(true);
  }

  function submitWorkLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workLogForm.employeeId || workLogForm.hours <= 0) return;

    if (workLogForm.id) updateEmployeeWorkLog(workLogForm);
    else addEmployeeWorkLog({ ...workLogForm, id: createId("hours"), createdAt: new Date().toISOString() });

    setWorkLogForm(createEmptyWorkLog(data.employees[0]));
    setIsWorkLogFormOpen(false);
  }

  function updateWorkLog(patch: Partial<EmployeeWorkLog>) {
    setWorkLogForm((current) => {
      const next = { ...current, ...patch };
      if (patch.startTime || patch.endTime) {
        next.hours = calculateHours(next.startTime, next.endTime);
      }
      return next;
    });
  }

  function selectWorkLogEmployee(employeeId: string) {
    const employee = data.employees.find((item) => item.id === employeeId);
    updateWorkLog({ employeeId, hourlyRate: employee?.hourlyRate ?? workLogForm.hourlyRate });
  }

  return (
    <>
      <PageHeader
        title="עובדות"
        description="צוות חי, תעריפים ויומן שעות בפועל: סדנאות, גלזורה, אריזה, שריפה, משלוחים ועבודת סטודיו."
        action={
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => openWorkLogForm()}>
              <span className="inline-flex items-center gap-2">
                <CalendarClock size={17} />
                רישום שעות
              </span>
            </ActionButton>
            <ActionButton tone="quiet" onClick={() => { setForm(emptyEmployee); setIsFormOpen(true); }}><span className="inline-flex items-center gap-2"><Plus size={17} />עובדת חדשה</span></ActionButton>
          </div>
        }
      />

      <Card className="mb-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-clay">לוח צוות חודשי</p>
            <h2 className="text-2xl font-black text-ink">אירועי {formatMonthLabel(currentMonth)}</h2>
          </div>
          <span className="rounded-full bg-mint px-4 py-2 text-sm font-black text-emerald-950">{currentMonthEvents.length} אירועים</span>
        </div>
        {currentMonthEvents.length ? (
          <div className="space-y-3">
            {currentMonthEvents.map((studioEvent) => {
              const assignedEmployees = studioEvent.assignments
                .map((assignment) => data.employees.find((employee) => employee.id === assignment.employeeId))
                .filter((employee): employee is Employee => Boolean(employee));
              const loggedHours = workLogs.filter((log) => log.eventId === studioEvent.id).reduce((sum, log) => sum + log.hours, 0);

              return (
                <div key={studioEvent.id} className="rounded-[24px] bg-white/60 p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-center">
                    <div>
                      <h3 className="text-xl font-black text-ink">{studioEvent.title}</h3>
                      <p className="mt-1 text-sm font-bold text-clay">{formatDate(studioEvent.date)} · {studioEvent.startTime || "שעה לא צוינה"}-{studioEvent.endTime || ""}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-clay">איפה</p>
                      <p className="font-bold text-ink">{studioEvent.address || "לא צוינה כתובת"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-clay">מי עובדת</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {assignedEmployees.length ? (
                          assignedEmployees.map((employee) => (
                            <button
                              key={employee.id}
                              type="button"
                              onClick={() => openWorkLogForm(employee, studioEvent.id)}
                              className="rounded-full bg-peach/70 px-3 py-1 text-sm font-black text-ink"
                            >
                              {employee.name}
                            </button>
                          ))
                        ) : (
                          <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-black text-clay">אין שיבוץ</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:justify-end">
                      <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-black text-clay">{formatNumber(loggedHours)} ש׳ נרשמו</span>
                      <ActionButton tone="quiet" onClick={() => openWorkLogForm(assignedEmployees[0], studioEvent.id)}>
                        <Plus size={16} />
                      </ActionButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="אין אירועים החודש" body="כשיהיו אירועים בחודש הנוכחי, הם יופיעו כאן עם שיבוץ עובדות, שעה וכתובת." />
        )}
      </Card>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {monthSummary.map(({ employee, hours, cost, logs }) => (
          <Card key={employee.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-clay">החודש</p>
                <h2 className="text-2xl font-black text-ink">{employee.name}</h2>
              </div>
              <ActionButton tone="quiet" onClick={() => openWorkLogForm(employee)}>
                <Plus size={16} />
              </ActionButton>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <SmallMetric label="שעות" value={formatNumber(hours)} />
              <SmallMetric label="רשומות" value={String(logs)} />
              <SmallMetric label="עלות" value={formatCurrency(cost)} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="mb-5">
        <label className="flex items-center gap-3">
          <Search className="text-coral" size={20} />
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש עובדת" />
        </label>
      </Card>

      {isFormOpen ? (
        <Card className="mb-5">
          <form onSubmit={submitEmployee} className="grid gap-4 md:grid-cols-2">
            <Input label="שם" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <label>
              <span className="mb-2 block text-sm font-black text-clay">תפקיד</span>
              <select className="input" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Employee["role"] })}>
                <option value="בעלים">בעלים</option>
                <option value="עובדת">עובדת</option>
                <option value="פרילנס">פרילנס</option>
              </select>
            </label>
            <Input label="עלות לשעה" type="number" value={String(form.hourlyRate)} onChange={(value) => setForm({ ...form, hourlyRate: Number(value) })} />
            <Input label="טלפון" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <label className="flex items-center gap-3 rounded-3xl bg-white/60 p-4 font-black text-clay">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
              פעילה
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-black text-clay">הערות</span>
              <textarea className="input min-h-24" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            <div className="flex gap-2 md:col-span-2">
              <ActionButton type="submit">{form.id ? "שמירת שינוי" : "הוספת עובדת"}</ActionButton>
              <ActionButton tone="quiet" onClick={() => setIsFormOpen(false)}>ביטול</ActionButton>
            </div>
          </form>
        </Card>
      ) : null}

      {isWorkLogFormOpen ? (
        <Card className="mb-5">
          <form onSubmit={submitWorkLog} className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm font-black text-clay">עובדת</span>
              <select className="input" value={workLogForm.employeeId} onChange={(event) => selectWorkLogEmployee(event.target.value)} required>
                <option value="">בחירת עובדת</option>
                {data.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-black text-clay">סוג עבודה</span>
              <select className="input" value={workLogForm.activity} onChange={(event) => updateWorkLog({ activity: event.target.value as EmployeeWorkActivity })}>
                {(Object.keys(activityLabels) as EmployeeWorkActivity[]).map((activity) => (
                  <option key={activity} value={activity}>
                    {activityLabels[activity]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-black text-clay">אירוע קשור</span>
              <select className="input" value={workLogForm.eventId} onChange={(event) => updateWorkLog({ eventId: event.target.value })}>
                <option value="">ללא אירוע</option>
                {[...data.events].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)).map((studioEvent) => (
                  <option key={studioEvent.id} value={studioEvent.id}>
                    {studioEvent.date} · {studioEvent.title}
                  </option>
                ))}
              </select>
            </label>
            <Input label="תאריך" type="date" value={workLogForm.date} onChange={(value) => updateWorkLog({ date: value })} required />
            <Input label="התחלה" type="time" value={workLogForm.startTime} onChange={(value) => updateWorkLog({ startTime: value })} />
            <Input label="סיום" type="time" value={workLogForm.endTime} onChange={(value) => updateWorkLog({ endTime: value })} />
            <Input label="שעות בפועל" type="number" value={String(workLogForm.hours)} onChange={(value) => updateWorkLog({ hours: Number(value) })} />
            <Input label="תעריף לשעה" type="number" value={String(workLogForm.hourlyRate)} onChange={(value) => updateWorkLog({ hourlyRate: Number(value) })} />
            <label className="md:col-span-3">
              <span className="mb-2 block text-sm font-black text-clay">הערה</span>
              <textarea
                className="input min-h-24"
                value={workLogForm.note}
                onChange={(event) => updateWorkLog({ note: event.target.value })}
                placeholder="למשל: גלזורה לכלים של האירוע, אריזה למשלוח, נסיעה לאיסוף..."
              />
            </label>
            <div className="flex gap-2 md:col-span-3">
              <ActionButton type="submit">{workLogForm.id ? "שמירת שעות" : "הוספת שעות"}</ActionButton>
              <ActionButton tone="quiet" onClick={() => setIsWorkLogFormOpen(false)}>ביטול</ActionButton>
            </div>
          </form>
        </Card>
      ) : null}

      {employees.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-ink">{employee.name}</h2>
                  <p className="mt-1 font-bold text-clay">{employee.role}</p>
                </div>
                <div className="flex gap-2">
                  <ActionButton tone="quiet" onClick={() => { setForm(employee); setIsFormOpen(true); }}><Edit3 size={16} /></ActionButton>
                  <ActionButton tone="danger" onClick={() => window.confirm("למחוק את העובדת?") && deleteEmployee(employee.id)}><Trash2 size={16} /></ActionButton>
                </div>
              </div>
              <p className="mt-5 rounded-full bg-peach/60 px-4 py-2 text-center font-black text-ink">{formatCurrency(employee.hourlyRate)} לשעה</p>
              <p className="mt-3 font-bold text-clay">{employee.phone || "אין טלפון"}</p>
              <p className={`mt-3 font-black ${employee.isActive ? "text-emerald-700" : "text-red-800"}`}>{employee.isActive ? "פעילה" : "לא פעילה"}</p>
              <p className="mt-3 text-sm font-bold leading-6 text-clay">{employee.notes}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="אין עובדות להצגה" body="אפשר להוסיף את מי שמגיעה לסדנאות ולחשב עלויות בהצעות." />
      )}

      <Card className="mt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-clay">יומן שעות</p>
            <h2 className="text-2xl font-black text-ink">שעות בפועל</h2>
          </div>
          <ActionButton tone="quiet" onClick={() => openWorkLogForm()}>
            <Plus size={16} />
          </ActionButton>
        </div>
        {workLogs.length ? (
          <div className="space-y-3">
            {workLogs.map((workLog) => {
              const employee = data.employees.find((item) => item.id === workLog.employeeId);
              const event = data.events.find((item) => item.id === workLog.eventId);
              return (
                <div key={workLog.id} className="rounded-[24px] bg-white/60 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-ink">{employee?.name ?? "עובדת לא ידועה"} · {activityLabels[workLog.activity]}</h3>
                      <p className="mt-1 font-bold text-clay">
                        {formatDate(workLog.date)} · {workLog.startTime}-{workLog.endTime} · {formatNumber(workLog.hours)} שעות
                      </p>
                      <p className="mt-1 text-sm font-bold text-clay">{event ? `אירוע: ${event.title}` : "ללא אירוע משויך"}</p>
                      {workLog.note ? <p className="mt-3 text-sm font-bold leading-6 text-clay">{workLog.note}</p> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-peach/70 px-4 py-2 font-black text-ink">{formatCurrency(workLog.hours * workLog.hourlyRate)}</span>
                      <ActionButton tone="quiet" onClick={() => { setWorkLogForm(workLog); setIsWorkLogFormOpen(true); }}><Edit3 size={16} /></ActionButton>
                      <ActionButton tone="danger" onClick={() => window.confirm("למחוק את רישום השעות?") && deleteEmployeeWorkLog(workLog.id)}><Trash2 size={16} /></ActionButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="אין עדיין שעות רשומות" body="אפשר להתחיל לרשום שעות של סדנה, גלזורה, אריזה, שריפה, משלוח או כל עבודת סטודיו אחרת." />
        )}
      </Card>
    </>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/60 px-2 py-3">
      <p className="text-lg font-black text-ink">{value}</p>
      <p className="text-xs font-black text-clay">{label}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-clay">{label}</span>
      <input className="input" type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function calculateHours(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return Math.max(0, Number(((end - start) / 60).toFixed(2)));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("he-IL", { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("he-IL", { month: "long", year: "numeric" });
}
