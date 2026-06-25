# AppointFlow — Free Appointment + Follow-up CRM

A fully working CRM for small service businesses. Built with React + Supabase. **100% free to deploy and run.**

## What it does
- Appointment booking with status tracking (pending / confirmed / done / cancelled)
- Client directory auto-built from appointments
- Follow-up scheduling with message templates
- User accounts (each business gets their own login)

---

## Deploy for free in 3 steps

### Step 1 — Set up Supabase (free database + auth)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project**, give it a name (e.g. "appointflow"), set a password, choose a region
3. Once created, go to **SQL Editor** and paste the contents of `supabase/migrations/001_schema.sql` — click **Run**
4. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://abcdef.supabase.co`)
   - **anon public** key

### Step 2 — Deploy to Vercel (free hosting)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign up free
3. Click **New Project** → import your GitHub repo
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy** — Vercel builds and hosts it automatically

### Step 3 — Done!

Your app is live at `https://your-project.vercel.app`. Share this URL with clients or use it yourself.

---

## Run locally (for development)

```bash
# Install dependencies
npm install

# Copy and fill in your Supabase credentials
cp .env.example .env
# Edit .env with your values

# Start dev server
npm run dev
```

Open `http://localhost:5173`

---

## How to make money with this

1. **Run it yourself** — use it for your own business for free
2. **White-label it** — deploy separate instances for each paying client
3. **SaaS model** — add Stripe, charge ₱299–₱599/month per business

## Tech stack (all free)

| Tool | Purpose | Cost |
|------|---------|------|
| React + Vite | Frontend | Free |
| Supabase | Database + Auth | Free (up to 500MB, 50k users) |
| Vercel | Hosting | Free (up to 100GB bandwidth) |

## File structure

```
appointflow/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Sidebar + nav
│   │   └── AppointmentModal.jsx # Add/edit appointments
│   ├── pages/
│   │   ├── Auth.jsx            # Login / signup
│   │   ├── Dashboard.jsx       # Stats + today's schedule
│   │   ├── Appointments.jsx    # Full appointment list
│   │   ├── Clients.jsx         # Client directory
│   │   └── Followups.jsx       # Follow-up scheduler
│   ├── lib/
│   │   └── supabase.js         # Supabase client
│   ├── App.jsx                 # Router + auth guard
│   └── index.css               # Global styles
├── supabase/
│   └── migrations/
│       └── 001_schema.sql      # Database tables
├── .env.example                # Env vars template
├── vercel.json                 # Vercel routing config
└── package.json
```
