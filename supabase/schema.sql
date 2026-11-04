-- ============================================================================
-- Men's Reproductive Health — Supabase Backend Schema
-- Project ID: ytiwdumsfdrwxszxglep
-- Includes:
--   1. public.patients         (Authenticated Patient Accounts: Name, Year, Phone, City, Goal)
--   2. public.doctors          (Authenticated Doctor Accounts & Medical Specialty)
--   3. public.appointments     (Patient Demographics + Selected Symptoms + Meeting Requests)
--   4. public.doctor_responses (Doctor Acceptance & Cooperative Care Plans)
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Authenticated Patients Table
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  birth_year integer not null,
  phone_number text not null default '',
  city_location text not null default '',
  marital_goal text not null default '',
  gmail_email text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.patients
  add column if not exists gmail_email text not null default '';

create unique index if not exists idx_patients_name_unique
  on public.patients (lower(patient_name));

create unique index if not exists idx_patients_gmail_unique
  on public.patients (lower(gmail_email))
  where gmail_email <> '';

-- 2. Authenticated Doctors Table
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  doctor_name text not null,
  doctor_specialty text not null,
  gmail_email text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.doctors
  add column if not exists gmail_email text not null default '';

create unique index if not exists idx_doctors_name_unique
  on public.doctors (lower(doctor_name));

create unique index if not exists idx_doctors_gmail_unique
  on public.doctors (lower(gmail_email))
  where gmail_email <> '';

-- 3. Patient Symptom & Doctor Meeting Requests Table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  session_token text not null,
  patient_id uuid references public.patients(id) on delete set null,
  patient_name text not null default '',
  patient_birth_year integer,
  patient_phone text not null default '',
  patient_city text not null default '',
  patient_goal text not null default '',
  patient_gmail text not null default '',
  specialist_id text not null,
  doctor_name_en text not null,
  doctor_name_ar text not null,
  clinic_name_en text not null,
  clinic_name_ar text not null,
  city_en text not null,
  city_ar text not null,
  appointment_slot text not null,
  modality_en text not null,
  modality_ar text not null,
  risk_level text not null default 'low' check (risk_level in ('low', 'moderate', 'high')),
  composite_score integer not null default 0,
  patient_query_en text not null,
  patient_query_ar text not null,
  user_recommendation_en text not null,
  user_recommendation_ar text not null,
  selected_symptoms jsonb not null default '[]'::jsonb,
  intake_snapshot jsonb not null default '{}'::jsonb,
  consent_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'cooperating')),
  created_at timestamptz not null default now()
);

-- Upgrade existing public.appointments table safely
alter table public.appointments
  add column if not exists patient_id uuid references public.patients(id) on delete set null,
  add column if not exists patient_name text not null default '',
  add column if not exists patient_birth_year integer,
  add column if not exists patient_phone text not null default '',
  add column if not exists patient_city text not null default '',
  add column if not exists patient_goal text not null default '',
  add column if not exists patient_gmail text not null default '',
  add column if not exists selected_symptoms jsonb not null default '[]'::jsonb;

-- 4. Doctor Acceptance & Cooperative Care Plans Table
create table if not exists public.doctor_responses (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  doctor_name_en text not null,
  doctor_name_ar text not null,
  response_status text not null default 'accepted' check (response_status in ('accepted', 'cooperating')),
  confirmed_slot text not null,
  approved_actions_en jsonb not null default '[]'::jsonb,
  approved_actions_ar jsonb not null default '[]'::jsonb,
  clinician_note_en text not null default '',
  clinician_note_ar text not null default '',
  responded_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_appointments_created_at on public.appointments(created_at desc);
create index if not exists idx_appointments_status on public.appointments(status);

-- Row Level Security
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.doctor_responses enable row level security;

drop policy if exists "Allow public access patients" on public.patients;
create policy "Allow public access patients"
  on public.patients for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public access doctors" on public.doctors;
create policy "Allow public access doctors"
  on public.doctors for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public access appointments" on public.appointments;
create policy "Allow public access appointments"
  on public.appointments for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public access doctor_responses" on public.doctor_responses;
create policy "Allow public access doctor_responses"
  on public.doctor_responses for all
  to anon, authenticated
  using (true)
  with check (true);

-- Realtime Publications
do $$
begin
  alter publication supabase_realtime add table public.patients;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.doctors;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.appointments;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.doctor_responses;
exception when duplicate_object then null;
end $$;
