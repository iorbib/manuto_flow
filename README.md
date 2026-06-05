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

The current UI uses `localStorage` persistence through `lib/storage.ts`. Initial data is seeded from `lib/seedData.ts` only when no saved browser data exists. Add these env vars when connecting real Supabase data:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## MVP scope

Included: dashboard, calendar, functional event CRUD, quote builder with live calculations, functional quote CRUD, functional client CRUD, functional product catalog CRUD, inventory view, functional employee CRUD, studio tasks, settings, pricing calculations, status timeline, supplier catalog structure, and localStorage persistence after refresh.

Not included yet: file uploads, images, WhatsApp, invoices, live Minerco scraping, complex permissions, AI chat.
