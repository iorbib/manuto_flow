import { EventCard } from "@/components/event-card";
import { InlineLink, PageHeader } from "@/components/ui";
import { events } from "@/lib/data";

export default function EventsPage() {
  return (
    <>
      <PageHeader
        title="אירועים"
        description="כל הסדנאות, מהפנייה הראשונה ועד החזרת הכלים אחרי שריפה ואריזה."
        action={<InlineLink href="/quotes">לבנות הצעה</InlineLink>}
      />
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </>
  );
}
