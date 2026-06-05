import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { getClient, getProduct } from "@/lib/data";
import type { Event } from "@/lib/types";
import { Card, StatusBadge, StatusTimeline } from "./ui";

export function EventCard({ event }: { event: Event }) {
  const client = getClient(event.clientId);
  const product = getProduct(event.productId);

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={`/events/${event.id}`} className="text-2xl font-black text-ink hover:text-coral">
            {event.title}
          </Link>
          <p className="mt-1 text-clay">
            {client?.name} · {event.customEventType}
          </p>
        </div>
        <StatusBadge status={event.status} />
      </div>
      <div className="grid gap-3 text-sm font-bold text-clay sm:grid-cols-3">
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={17} />
          {event.date} · {event.time}
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin size={17} />
          {event.city}, {event.venue}
        </span>
        <span className="inline-flex items-center gap-2">
          <Users size={17} />
          {event.participantCount} משתתפים · {product?.name}
        </span>
      </div>
      <StatusTimeline status={event.status} />
    </Card>
  );
}
