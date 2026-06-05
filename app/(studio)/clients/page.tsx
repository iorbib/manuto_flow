import { Phone, StickyNote } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { clients, events } from "@/lib/data";

export default function ClientsPage() {
  return (
    <>
      <PageHeader title="לקוחות" description="פרטי קשר, הערות, והיסטוריית אירועים ראשונית לכל לקוח." />
      <div className="grid gap-4 md:grid-cols-2">
        {clients.map((client) => {
          const clientEvents = events.filter((event) => event.clientId === client.id);
          return (
            <Card key={client.id}>
              <h2 className="text-2xl font-black text-ink">{client.name}</h2>
              <p className="mt-1 font-bold text-clay">{client.contactName} · {client.city}</p>
              <p className="mt-4 inline-flex items-center gap-2 font-black text-ink">
                <Phone size={17} />
                {client.phone}
              </p>
              <p className="mt-4 flex gap-2 rounded-3xl bg-peach/45 p-4 font-bold leading-7 text-ink">
                <StickyNote className="mt-1 shrink-0 text-coral" size={18} />
                {client.notes}
              </p>
              <p className="mt-4 text-sm font-black text-clay">{clientEvents.length} אירועים במערכת</p>
            </Card>
          );
        })}
      </div>
    </>
  );
}
