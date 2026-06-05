# Manuto Flow

MVP Hebrew RTL management app for Manuto, a mobile ceramic painting workshop business.

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase-ready schema
- Hebrew RTL, mobile-first UI

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Supabase

The first database schema is in `supabase/schema.sql`.

The current UI uses local seed data from `lib/data.ts` so the MVP can run before Supabase Auth and Postgres are connected. Add these env vars when connecting real data:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## MVP scope

Included: dashboard, calendar, events, event detail, quotes, quote builder, quote detail, clients, inventory, employees, studio tasks, settings, pricing calculations, status timeline, supplier catalog structure.

Not included yet: file uploads, images, WhatsApp, invoices, live Minerco scraping, complex permissions, AI chat.
