# Backend Setup (Supabase)

## Prerequisites
- Supabase project created
- Get API values from Settings → API
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or ANON key during transition)

## Local env
Create `.env.local` in the repo root:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
```

## Apply schema
Use the SQL editor in Supabase and paste `DOC/supabase_schema.sql`. Run it to create tables and enable RLS placeholders.

## Seeding products
With the dev server running, call:

```
curl -X POST http://localhost:3001/api/seed
```

Then visit `/products` and `/cart` locally.
