-- AppointFlow database schema
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
create extension if not exists "uuid-ossp";

-- Clients table
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  service text,
  notes text,
  created_at timestamptz default now()
);
alter table clients enable row level security;
create policy "Users manage own clients" on clients
  for all using (auth.uid() = user_id);

-- Appointments table
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade,
  client_name text not null,
  service text not null,
  scheduled_at timestamptz not null,
  status text default 'pending' check (status in ('pending','confirmed','done','cancelled')),
  notes text,
  created_at timestamptz default now()
);
alter table appointments enable row level security;
create policy "Users manage own appointments" on appointments
  for all using (auth.uid() = user_id);

-- Follow-ups table
create table if not exists followups (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  appointment_id uuid references appointments(id) on delete cascade,
  client_name text not null,
  message text not null,
  send_at timestamptz not null,
  status text default 'scheduled' check (status in ('scheduled','sent','skipped')),
  created_at timestamptz default now()
);
alter table followups enable row level security;
create policy "Users manage own followups" on followups
  for all using (auth.uid() = user_id);
