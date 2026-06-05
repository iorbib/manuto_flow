"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { ActionButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { clientStatusLabels } from "@/lib/seedData";
import { createId, useStudioData } from "@/lib/storage";
import type { Client } from "@/lib/types";

const emptyClient: Client = {
  id: "",
  name: "",
  contactName: "",
  phone: "",
  email: "",
  clientType: "company",
  clientStatus: "interested",
  notes: ""
};

export default function ClientsPage() {
  const { data, addClient, updateClient, deleteClient } = useStudioData();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Client>(emptyClient);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredClients = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return data.clients;
    return data.clients.filter((client) =>
      [client.name, client.contactName, client.phone, client.email, client.notes, clientStatusLabels[client.clientStatus]].some((field) => field.toLowerCase().includes(value))
    );
  }, [data.clients, query]);

  function submitClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;

    if (form.id) {
      updateClient(form);
    } else {
      addClient({ ...form, id: createId("client") });
    }

    setForm(emptyClient);
    setIsFormOpen(false);
  }

  return (
    <>
      <PageHeader
        title="לקוחות"
        description="לקוחות שאפשר לערוך באמת: פרטי קשר, סוג לקוח והערות שנשמרות אחרי רענון."
        action={
          <ActionButton
            onClick={() => {
              setForm(emptyClient);
              setIsFormOpen(true);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={17} />
              לקוח חדש
            </span>
          </ActionButton>
        }
      />

      <Card className="mb-5">
        <label className="flex items-center gap-3">
          <Search className="text-coral" size={20} />
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש לפי שם, טלפון או הערה" />
        </label>
      </Card>

      {isFormOpen ? (
        <Card className="mb-5">
          <form onSubmit={submitClient} className="grid gap-4 md:grid-cols-2">
            <Input label="שם לקוח / חברה" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Input label="איש קשר" value={form.contactName} onChange={(value) => setForm({ ...form, contactName: value })} />
            <Input label="טלפון" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <Input label="אימייל" value={form.email} onChange={(value) => setForm({ ...form, email: value })} type="email" />
            <label>
              <span className="mb-2 block text-sm font-black text-clay">סוג לקוח</span>
              <select className="input" value={form.clientType} onChange={(event) => setForm({ ...form, clientType: event.target.value as Client["clientType"] })}>
                <option value="company">חברה</option>
                <option value="therapy_center">מרכז טיפולי</option>
                <option value="school">בית ספר</option>
                <option value="private">פרטי</option>
                <option value="community">קהילה</option>
                <option value="other">אחר</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-black text-clay">סטטוס לקוח</span>
              <select className="input" value={form.clientStatus} onChange={(event) => setForm({ ...form, clientStatus: event.target.value as Client["clientStatus"] })}>
                {Object.entries(clientStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-black text-clay">הערות</span>
              <textarea className="input min-h-28" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            <div className="flex gap-2 md:col-span-2">
              <ActionButton type="submit">{form.id ? "שמירת שינוי" : "הוספת לקוח"}</ActionButton>
              <ActionButton tone="quiet" onClick={() => setIsFormOpen(false)}>
                ביטול
              </ActionButton>
            </div>
          </form>
        </Card>
      ) : null}

      {filteredClients.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredClients.map((client) => (
            <Card key={client.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-ink">{client.name}</h2>
                  <p className="mt-1 font-bold text-clay">{client.contactName || "אין איש קשר"}</p>
                  <p className="mt-2 inline-flex rounded-full bg-mint/70 px-3 py-1 text-sm font-black text-emerald-950">{clientStatusLabels[client.clientStatus]}</p>
                </div>
                <div className="flex gap-2">
                  <ActionButton
                    tone="quiet"
                    onClick={() => {
                      setForm(client);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit3 size={16} />
                  </ActionButton>
                  <ActionButton tone="danger" onClick={() => window.confirm("למחוק את הלקוח?") && deleteClient(client.id)}>
                    <Trash2 size={16} />
                  </ActionButton>
                </div>
              </div>
              <div className="mt-4 grid gap-2 font-bold text-clay">
                <p>{client.phone || "אין טלפון"}</p>
                <p>{client.email || "אין אימייל"}</p>
                <p className="rounded-3xl bg-peach/45 p-4 leading-7 text-ink">{client.notes || "אין הערות עדיין."}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="אין לקוחות להצגה" body="אפשר להוסיף לקוח ראשון ואז לחבר אליו אירועים והצעות." />
      )}
    </>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-clay">{label}</span>
      <input className="input" type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
