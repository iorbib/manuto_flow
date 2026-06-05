"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { ActionButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { createId, useStudioData } from "@/lib/storage";
import type { Employee } from "@/lib/types";
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

export default function EmployeesPage() {
  const { data, addEmployee, updateEmployee, deleteEmployee } = useStudioData();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Employee>(emptyEmployee);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const employees = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return data.employees;
    return data.employees.filter((employee) => [employee.name, employee.role, employee.phone, employee.notes].some((field) => field.toLowerCase().includes(value)));
  }, [data.employees, query]);

  function submitEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (form.id) updateEmployee(form);
    else addEmployee({ ...form, id: createId("emp") });
    setForm(emptyEmployee);
    setIsFormOpen(false);
  }

  return (
    <>
      <PageHeader
        title="עובדות"
        description="צוות חי: תעריפים, זמינות, טלפונים והערות."
        action={<ActionButton onClick={() => { setForm(emptyEmployee); setIsFormOpen(true); }}><span className="inline-flex items-center gap-2"><Plus size={17} />עובדת חדשה</span></ActionButton>}
      />

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
    </>
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
