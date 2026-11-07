-- ==============================================================================
-- DAR AL DAWA MEDICAL CENTER - COMPLETE SUPABASE INITIALIZATION & SECURITY SCRIPT
-- ==============================================================================
-- Run this complete SQL script in your Supabase Project:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste Everything & Click "RUN"
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. CORE DATABASE TABLES
-- ==============================================================================

-- A1. Central Settings Table (Primary Website & Contact Settings)
create table if not exists public.settings (
  id text primary key default 'main',
  name text not null default 'Dar al Dawa Medical Center',
  name_urdu text not null default 'دارالدواء میڈیکل سنٹر',
  tagline text not null default 'Caring for You, Every Step of the Way',
  tagline_urdu text not null default 'ہر قدم پر آپ کی صحت اور دیکھ بھال کا امین',
  logo text default '/assets/aistudio/image_424d9421.png',
  favicon text default '/assets/aistudio/image_424d9421.png',
  short_desc text,
  short_desc_urdu text,
  whatsapp_number text default '0300-1234567',
  phone_emergency text default '042-111-327-227',
  phone_reception text default '042-35789000',
  phone_mobile text default '0300-1234567',
  email text default 'info@daraldawa.pk',
  address text default '42-A, Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan',
  address_urdu text default '42-اے، مین بلیوارڈ، گلبرگ 3، لاہور، پنجاب، پاکستان',
  hours_opd text default '8:00 AM – 10:00 PM (Monday – Sunday)',
  hours_emergency text default '24/7 Hours Round-the-Clock Emergency',
  google_maps_url text default 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.3!2d74.34!3d31.52',
  facebook_url text default 'https://facebook.com/daraldawamedical',
  instagram_url text default 'https://instagram.com/daraldawamedical',
  youtube_url text default 'https://youtube.com/@daraldawamedical',
  tiktok_url text default 'https://tiktok.com/@daraldawamedical',
  twitter_url text default 'https://twitter.com/daraldawamedical',
  social_links jsonb default '{"facebook": "https://facebook.com/daraldawamedical", "instagram": "https://instagram.com/daraldawamedical", "youtube": "https://youtube.com/@daraldawamedical", "tiktok": "https://tiktok.com/@daraldawamedical"}'::jsonb,
  contact jsonb default '{"emergencyNumber": "042-111-327-227", "receptionPhone": "042-35789000", "mobileEmergency": "0300-1234567", "whatsapp": "0300-1234567", "email": "info@daraldawa.pk", "address": "42-A, Main Boulevard, Gulberg III, Lahore", "hours": {"opd": "8:00 AM – 10:00 PM", "emergency": "24/7 Hours Round-the-Clock"}}'::jsonb,
  updated_at timestamptz default now()
);

-- Seed default settings row if not present
insert into public.settings (id, name, name_urdu, whatsapp_number, phone_emergency, phone_reception, phone_mobile, email, address)
values ('main', 'Dar al Dawa Medical Center', 'دارالدواء میڈیکل سنٹر', '0300-1234567', '042-111-327-227', '042-35789000', '0300-1234567', 'info@daraldawa.pk', '42-A, Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan')
on conflict (id) do nothing;

-- A2. Hospital Settings (Companion Table)
create table if not exists public.hospital_settings (
  id text primary key default 'main',
  name text not null default 'Dar al Dawa Medical Center',
  name_urdu text not null default 'دارالدواء میڈیکل سنٹر',
  tagline text not null default 'Caring for You, Every Step of the Way',
  tagline_urdu text not null default 'ہر قدم پر آپ کی صحت اور دیکھ بھال کا امین',
  logo text default '/assets/aistudio/image_424d9421.png',
  favicon text default '/assets/aistudio/image_424d9421.png',
  short_desc text,
  short_desc_urdu text,
  social_links jsonb default '{}'::jsonb,
  contact jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- B. Operational System Settings
create table if not exists public.operational_settings (
  id text primary key default 'main',
  slot_duration_minutes integer default 20,
  working_days jsonb default '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'::jsonb,
  opd_open_time text default '08:00',
  opd_close_time text default '22:00',
  emergency_active boolean default true,
  maintenance_mode boolean default false,
  email_notifications boolean default true,
  sms_notifications boolean default true,
  whatsapp_confirmation boolean default true,
  currency text default 'PKR (Rs.)',
  updated_at timestamptz default now()
);

-- C. Homepage Settings
create table if not exists public.homepage_settings (
  id text primary key default 'main',
  hero_heading text default 'Caring for You, Every Step of the Way',
  hero_subheading text,
  hero_button_text text default 'Book an Appointment',
  hero_slider_images jsonb default '[]'::jsonb,
  about_badge text default 'About Dar al Dawa',
  about_heading text default 'A Tradition of Healing, Science & Human Compassion',
  about_subheading text,
  about_mission text,
  about_vision text,
  about_image text,
  sections_visibility jsonb default '{"hero": true, "appointment": true, "departments": true, "doctors": true, "services": true, "about": true, "packages": true, "testimonials": true, "gallery": true, "blog": true, "faq": true, "contact": true}'::jsonb,
  updated_at timestamptz default now()
);

-- C2. Homepage Content
create table if not exists public.homepage_content (
  id text primary key default 'main',
  hero_heading text default 'Caring for You, Every Step of the Way',
  hero_subheading text,
  hero_button_text text default 'Book an Appointment',
  hero_slider_images jsonb default '[]'::jsonb,
  about_badge text default 'About Dar al Dawa',
  about_heading text default 'A Tradition of Healing, Science & Human Compassion',
  about_subheading text,
  about_mission text,
  about_vision text,
  about_image text,
  sections_visibility jsonb default '{"hero": true, "appointment": true, "departments": true, "doctors": true, "services": true, "about": true, "packages": true, "testimonials": true, "gallery": true, "blog": true, "faq": true, "contact": true}'::jsonb,
  updated_at timestamptz default now()
);

-- D. Departments
create table if not exists public.departments (
  id text primary key,
  title text not null,
  title_urdu text not null,
  icon_name text not null default 'Stethoscope',
  description text not null,
  description_urdu text not null,
  full_description text,
  image text,
  display_order integer default 0,
  features jsonb default '[]'::jsonb,
  features_urdu jsonb default '[]'::jsonb,
  head_doctor text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- E. Doctors
create table if not exists public.doctors (
  id text primary key,
  name text not null,
  name_urdu text not null,
  department_id text references public.departments(id) on delete set null,
  specialty text not null,
  specialty_urdu text not null,
  qualification text not null,
  experience text not null,
  opd_timings text not null,
  opd_timings_urdu text not null,
  days text not null,
  days_urdu text not null,
  fee_pkr numeric not null default 0,
  image text,
  about text,
  about_urdu text,
  pmdc_no text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- F. Patients Profile Table (Linked directly to Supabase auth.users)
create table if not exists public.patients (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text not null,
  gender text,
  date_of_birth date,
  city text,
  is_blocked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add indexes on patients
create index if not exists idx_patients_email on public.patients(email);
create index if not exists idx_patients_phone on public.patients(phone);

-- G. Appointments Table
create table if not exists public.appointments (
  id text primary key,
  token text,
  patient_id uuid references auth.users(id) on delete set null,
  patient_name text not null,
  phone text not null,
  cnic text,
  department_id text,
  doctor_id text,
  appointment_date text not null,
  time_slot text not null,
  patient_type text default 'new',
  notes text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Migration support: add patient_id column if table already existed without it
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'appointments' and column_name = 'patient_id'
  ) then
    alter table public.appointments add column patient_id uuid references auth.users(id) on delete set null;
  end if;
end $$;

create index if not exists idx_appointments_patient_id on public.appointments(patient_id);
create index if not exists idx_appointments_phone on public.appointments(phone);

-- H. Services & Facilities
create table if not exists public.services (
  id text primary key,
  title text not null,
  title_urdu text not null,
  icon_name text not null default 'Stethoscope',
  description text not null,
  description_urdu text not null,
  badge text,
  badge_urdu text,
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- I. Health Packages
create table if not exists public.packages (
  id text primary key,
  title text not null,
  title_urdu text not null,
  original_price numeric not null,
  discounted_price numeric not null,
  popular boolean default false,
  category text,
  category_urdu text,
  fasting_required text,
  fasting_required_urdu text,
  report_time text,
  report_time_urdu text,
  tests_included jsonb default '[]'::jsonb,
  tests_included_urdu jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- J. Gallery
create table if not exists public.gallery (
  id text primary key,
  title text not null,
  title_urdu text not null,
  category text not null default 'facilities',
  category_label text,
  category_label_urdu text,
  image text not null,
  description text,
  description_urdu text,
  created_at timestamptz default now()
);

-- K. Testimonials
create table if not exists public.testimonials (
  id text primary key,
  name text not null,
  name_urdu text not null,
  city text,
  city_urdu text,
  rating integer default 5,
  department text,
  department_urdu text,
  comment text not null,
  comment_urdu text not null,
  date text,
  avatar text,
  created_at timestamptz default now()
);

-- L. FAQs
create table if not exists public.faqs (
  id text primary key,
  question text not null,
  question_urdu text not null,
  answer text not null,
  answer_urdu text not null,
  category text default 'general',
  created_at timestamptz default now()
);

-- M. Contact Messages
create table if not exists public.messages (
  id text primary key,
  name text not null,
  email text,
  phone text not null,
  subject text,
  message text not null,
  read boolean default false,
  important boolean default false,
  created_at timestamptz default now()
);

-- N. Notifications Table (Real-time in-app alerts)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  role text default 'admin', -- 'admin', 'patient', 'all'
  title text not null,
  message text not null,
  type text default 'general', -- 'appointment_booked', 'appointment_confirmed', 'appointment_cancelled', 'new_patient', 'reminder', 'system', 'lab_report'
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_role on public.notifications(role);

-- O. Admins List Table
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text default 'Administrator',
  created_at timestamptz default now()
);

-- Seed hospital admin email
insert into public.admins (email, name)
values ('admin@daraldawa.com', 'Hospital Super Admin')
on conflict (email) do nothing;

-- P. Activity Logs
create table if not exists public.activity_logs (
  id text primary key,
  user_email text,
  user_name text,
  user_role text,
  action text not null,
  module text not null,
  details text,
  timestamp timestamptz default now()
);

-- ==============================================================================
-- 3. STORAGE BUCKET: "images"
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- ==============================================================================
-- 4. SECURITY FUNCTIONS & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Helper function to check if the current requester is an authorized admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select (
    (auth.jwt() ->> 'email' = 'admin@daraldawa.com')
    or exists (
      select 1 from public.admins where email = (auth.jwt() ->> 'email')
    )
  );
$$;

-- Enable RLS on all tables
alter table public.settings enable row level security;
alter table public.hospital_settings enable row level security;
alter table public.operational_settings enable row level security;
alter table public.homepage_settings enable row level security;
alter table public.homepage_content enable row level security;
alter table public.departments enable row level security;
alter table public.doctors enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.gallery enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.admins enable row level security;
alter table public.activity_logs enable row level security;

-- Drop prior policies to avoid duplicate errors
drop policy if exists "Public read settings" on public.settings;
drop policy if exists "Admin manage settings" on public.settings;
drop policy if exists "Public read hospital_settings" on public.hospital_settings;
drop policy if exists "Admin manage hospital_settings" on public.hospital_settings;
drop policy if exists "Public read operational_settings" on public.operational_settings;
drop policy if exists "Admin manage operational_settings" on public.operational_settings;
drop policy if exists "Public read homepage_settings" on public.homepage_settings;
drop policy if exists "Admin manage homepage_settings" on public.homepage_settings;
drop policy if exists "Public read homepage_content" on public.homepage_content;
drop policy if exists "Admin manage homepage_content" on public.homepage_content;
drop policy if exists "Public read departments" on public.departments;
drop policy if exists "Admin manage departments" on public.departments;
drop policy if exists "Public read doctors" on public.doctors;
drop policy if exists "Admin manage doctors" on public.doctors;
drop policy if exists "Public read services" on public.services;
drop policy if exists "Admin manage services" on public.services;
drop policy if exists "Public read packages" on public.packages;
drop policy if exists "Admin manage packages" on public.packages;
drop policy if exists "Public read gallery" on public.gallery;
drop policy if exists "Admin manage gallery" on public.gallery;
drop policy if exists "Public read testimonials" on public.testimonials;
drop policy if exists "Admin manage testimonials" on public.testimonials;
drop policy if exists "Public read faqs" on public.faqs;
drop policy if exists "Admin manage faqs" on public.faqs;
drop policy if exists "Public insert appointments" on public.appointments;
drop policy if exists "Admin manage appointments" on public.appointments;
drop policy if exists "Patient view appointments" on public.appointments;
drop policy if exists "Patient cancel pending appointment" on public.appointments;
drop policy if exists "Patient view own profile" on public.patients;
drop policy if exists "Patient update own profile" on public.patients;
drop policy if exists "Patient insert own profile" on public.patients;
drop policy if exists "Admin manage patients" on public.patients;
drop policy if exists "Public insert messages" on public.messages;
drop policy if exists "Admin manage messages" on public.messages;
drop policy if exists "Admin manage activity_logs" on public.activity_logs;
drop policy if exists "User read notifications" on public.notifications;
drop policy if exists "User update read status" on public.notifications;
drop policy if exists "Admin manage notifications" on public.notifications;
drop policy if exists "Anyone can insert notifications" on public.notifications;

-- Website Settings & Content Policies (Public Read, Admin Write)
create policy "Public read settings" on public.settings for select using (true);
create policy "Admin manage settings" on public.settings for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read hospital_settings" on public.hospital_settings for select using (true);
create policy "Admin manage hospital_settings" on public.hospital_settings for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read operational_settings" on public.operational_settings for select using (true);
create policy "Admin manage operational_settings" on public.operational_settings for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read homepage_settings" on public.homepage_settings for select using (true);
create policy "Admin manage homepage_settings" on public.homepage_settings for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read homepage_content" on public.homepage_content for select using (true);
create policy "Admin manage homepage_content" on public.homepage_content for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read departments" on public.departments for select using (true);
create policy "Admin manage departments" on public.departments for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read doctors" on public.doctors for select using (true);
create policy "Admin manage doctors" on public.doctors for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read services" on public.services for select using (true);
create policy "Admin manage services" on public.services for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read packages" on public.packages for select using (true);
create policy "Admin manage packages" on public.packages for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read gallery" on public.gallery for select using (true);
create policy "Admin manage gallery" on public.gallery for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read testimonials" on public.testimonials for select using (true);
create policy "Admin manage testimonials" on public.testimonials for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

create policy "Public read faqs" on public.faqs for select using (true);
create policy "Admin manage faqs" on public.faqs for all using (public.is_admin() or auth.role() = 'authenticated') with check (public.is_admin() or auth.role() = 'authenticated');

-- Patients Table Policies
create policy "Patient view own profile" on public.patients for select using (auth.uid() = id or public.is_admin());
create policy "Patient insert own profile" on public.patients for insert with check (auth.uid() = id or public.is_admin());
create policy "Patient update own profile" on public.patients for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());
create policy "Admin manage patients" on public.patients for delete using (public.is_admin());

-- Appointments Policies
create policy "Public insert appointments" on public.appointments for insert with check (true);
create policy "Patient view appointments" on public.appointments for select using (
  public.is_admin() 
  or (patient_id is not null and patient_id = auth.uid())
  or (auth.uid() is not null and phone in (select phone from public.patients where id = auth.uid()))
);
create policy "Patient cancel pending appointment" on public.appointments for update using (
  (patient_id is not null and patient_id = auth.uid() and status = 'pending')
  or public.is_admin()
) with check (
  (patient_id is not null and patient_id = auth.uid() and status = 'cancelled')
  or public.is_admin()
);
create policy "Admin manage appointments" on public.appointments for all using (public.is_admin()) with check (public.is_admin());

-- Notifications Policies
create policy "User read notifications" on public.notifications for select using (
  public.is_admin()
  or role = 'all'
  or (user_id is not null and user_id = auth.uid()::text)
  or (role = 'patient' and auth.uid() is not null)
);
create policy "User update read status" on public.notifications for update using (
  public.is_admin()
  or (user_id is not null and user_id = auth.uid()::text)
) with check (
  public.is_admin()
  or (user_id is not null and user_id = auth.uid()::text)
);
create policy "Anyone can insert notifications" on public.notifications for insert with check (true);
create policy "Admin manage notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());

-- Messages & Activity Logs
create policy "Public insert messages" on public.messages for insert with check (true);
create policy "Admin manage messages" on public.messages for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin manage activity_logs" on public.activity_logs for all using (public.is_admin()) with check (public.is_admin());

-- ==============================================================================
-- 5. STORAGE POLICIES FOR "images" BUCKET
-- ==============================================================================
drop policy if exists "Public Access for Images" on storage.objects;
drop policy if exists "Admin Upload to Images" on storage.objects;
drop policy if exists "Admin Update Images" on storage.objects;
drop policy if exists "Admin Delete Images" on storage.objects;

create policy "Public Access for Images" on storage.objects for select using ( bucket_id = 'images' );
create policy "Admin Upload to Images" on storage.objects for insert with check ( bucket_id = 'images' );
create policy "Admin Update Images" on storage.objects for update using ( bucket_id = 'images' );
create policy "Admin Delete Images" on storage.objects for delete using ( bucket_id = 'images' );

-- ==============================================================================
-- 6. ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================
do $$
begin
  -- Add notifications to publication if not already present
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  -- Add appointments to publication if not already present
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table public.appointments;
  end if;
end $$;

-- ==============================================================================
-- 7. AUTOMATED NOTIFICATION TRIGGERS
-- ==============================================================================

-- A. Auto-notify on New Appointment
create or replace function public.notify_on_new_appointment()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Notify Admin
  insert into public.notifications (role, title, message, type, link)
  values (
    'admin',
    'New Appointment Booked',
    'Patient ' || coalesce(new.patient_name, 'Unknown') || ' booked for ' || coalesce(new.appointment_date, '') || ' (' || coalesce(new.time_slot, '') || '). Token: ' || coalesce(new.token, 'N/A'),
    'appointment_booked',
    '#admin/appointments'
  );

  -- Notify Patient if user account is attached
  if new.patient_id is not null then
    insert into public.notifications (user_id, role, title, message, type, link)
    values (
      new.patient_id::text,
      'patient',
      'Appointment Request Received',
      'Your appointment request (' || coalesce(new.token, 'Token') || ') for ' || coalesce(new.appointment_date, '') || ' (' || coalesce(new.time_slot, '') || ') is pending confirmation.',
      'appointment_booked',
      '#account'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_new_appointment on public.appointments;
create trigger trg_notify_new_appointment
after insert on public.appointments
for each row
execute function public.notify_on_new_appointment();

-- B. Auto-notify Patient on Status Update (Confirmed / Cancelled)
create or replace function public.notify_on_appointment_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if (old.status is distinct from new.status) and new.patient_id is not null then
    if new.status = 'confirmed' then
      insert into public.notifications (user_id, role, title, message, type, link)
      values (
        new.patient_id::text,
        'patient',
        'Appointment Confirmed! ✓',
        'Good news! Your appointment (' || coalesce(new.token, '') || ') on ' || coalesce(new.appointment_date, '') || ' at ' || coalesce(new.time_slot, '') || ' has been confirmed.',
        'appointment_confirmed',
        '#account'
      );
    elsif new.status = 'cancelled' then
      insert into public.notifications (user_id, role, title, message, type, link)
      values (
        new.patient_id::text,
        'patient',
        'Appointment Cancelled',
        'Your appointment (' || coalesce(new.token, '') || ') on ' || coalesce(new.appointment_date, '') || ' has been cancelled.',
        'appointment_cancelled',
        '#account'
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_appointment_status on public.appointments;
create trigger trg_notify_appointment_status
after update on public.appointments
for each row
execute function public.notify_on_appointment_status_change();

-- C. Auto-notify Admin on New Patient Registration
create or replace function public.notify_on_new_patient()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.notifications (role, title, message, type, link)
  values (
    'admin',
    'New Patient Registered',
    'Patient ' || coalesce(new.full_name, 'New User') || ' (' || coalesce(new.phone, '') || ') created an account.',
    'new_patient',
    '#admin/patients'
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_patient on public.patients;
create trigger trg_notify_new_patient
after insert on public.patients
for each row
execute function public.notify_on_new_patient();

-- ==============================================================================
-- 8. APPOINTMENT REMINDER CRON JOB (Sends reminder 24h prior to visit)
-- ==============================================================================
-- If your Supabase project has pg_cron enabled, run:
-- select cron.schedule(
--   'appointment-24h-reminder',
--   '0 8 * * *', -- Runs every morning at 8:00 AM
--   $$
--     insert into public.notifications (user_id, role, title, message, type, link)
--     select 
--       a.patient_id::text,
--       'patient',
--       'Appointment Reminder: Tomorrow',
--       'Reminder: You have a confirmed hospital appointment tomorrow (' || a.appointment_date || ') at ' || a.time_slot || '. Token: ' || a.token,
--       'reminder',
--       '#account'
--     from public.appointments a
--     where a.status = 'confirmed' 
--       and a.patient_id is not null
--       and a.appointment_date = to_char(current_date + interval '1 day', 'YYYY-MM-DD');
--   $$
-- );


-- ==============================================================================
-- 9. INITIAL DEMO DATA SEEDING (DEPARTMENTS, DOCTORS, SERVICES, PACKAGES)
-- ==============================================================================

-- A. Seed Departments
insert into public.departments (id, title, title_urdu, icon_name, description, description_urdu, display_order, features, features_urdu, head_doctor)
values
  ('emergency', '24/7 Emergency & Trauma', '24 گھنٹے ایمرجنسی و ٹراما سنٹر', 'Flame', 'Round-the-clock emergency medical response with trauma resuscitation bays and critical cardiac support.', 'چوبیس گھنٹے حادثاتی ایمرجنسی، دل کے دورے اور فوری جان بچانے والی جدید ترین طبی سہولیات۔', 1, '["Trauma Resuscitation Bays", "Critical Cardiac Support", "Emergency Triage Unit", "24/7 On-Duty Consultants"]'::jsonb, '["حادثاتی نگہداشت وارڈ", "دل کے ہنگامی امراض کا علاج", "فوری طبی معائنہ سنٹر", "24 گھنٹے ماہر ڈاکٹرز کی موجودگی"]'::jsonb, 'Dr. Bilal Hassan'),
  ('cardiology', 'Cardiology & Heart Center', 'امراضِ قلب و کارڈیک سنٹر', 'HeartPulse', 'Comprehensive cardiac diagnosis and care, interventional cardiology, ECG, Echocardiography, and rehab.', 'دل کی بیماریوں کی مکمل تشخیص، ای سی جی، ایکو کارڈیوگرافی، اور ماہر امراضِ قلب کی زیرِ نگرانی علاج۔', 2, '["2D/4D Echocardiography", "Computerized Exercise ECG (ETT)", "Holter Monitoring (24-48 Hours)", "Post-Infarction Rehabilitation"]'::jsonb, '["ایکو کارڈیوگرافی", "کمپیوٹرائزڈ ای ٹی ٹی ٹیسٹ", "ہولٹر مانیٹرنگ", "دل کے دورے کے بعد نگہداشت"]'::jsonb, 'Dr. Tariq Mahmood'),
  ('gynecology', 'Gynecology & Obstetrics', 'امراضِ نسواں و زچگی', 'Users', 'Compassionate women’s health care, modern labor suites, painless delivery, antenatal care, and laparoscopic surgery.', 'محفوظ زچگی، بغیر تکلیف ڈلیوری، نارمل و آپریشن ڈلیوری، اور بانجھ پن کا ماہرانہ علاج۔', 3, '["Private Labor Suites", "Epidural Painless Delivery", "Fetal Wellbeing Sonography", "Infertility & Laparoscopy"]'::jsonb, '["پرائیویٹ لیبر رومز", "بغیر درد نارمل زچگی", "جدید الٹراساؤنڈ سہولت", "بانجھ پن کا علاج"]'::jsonb, 'Dr. Ayesha Siddiqa'),
  ('pediatrics', 'Pediatrics & Neonatology', 'امراضِ اطفال و نومولود', 'Smile', 'Dedicated child healthcare from birth through adolescence, equipped with a Level-III Neonatal Intensive Care Unit (NICU).', 'بچوں اور قبل از وقت پیدا ہونے والے نوزائیدہ بچوں کے لیے جدید ترین این آئی سی یو (NICU) اور ویکسینیشن۔', 4, '["Level-III NICU with Incubators", "Pediatric Emergency", "Routine Child Vaccination", "Child Growth & Nutrition"]'::jsonb, '["جدید این آئی سی یو و انکیوبیٹرز", "چائلڈ ایمرجنسی سنٹر", "مفت سرکاری و پرائیویٹ ویکسین", "بچوں کی جسمانی نشوونما"]'::jsonb, 'Dr. Zainab Malik'),
  ('orthopedics', 'Orthopedics & Joint Replacement', 'ہڈی، جوڑ و مہرہ سرجری', 'Activity', 'Expert joint replacement (knee & hip), complex fracture fixations, arthroscopic sports injury repair, and spine surgery.', 'گھٹنے اور کولہے کے جوڑ کی تبدیلی، فریکچر کا علاج، اور کمر درد و مہروں کی مائیکرو سرجری۔', 5, '["Knee & Hip Replacement", "Keyhole Arthroscopy", "Spine Decompression", "Rehabilitation Physiotherapy"]'::jsonb, '["جوڑوں کی تبدیلی کا آپریشن", "دوربین سے جوڑوں کی سرجری", "کمر کے مہروں کا علاج", "فزیوتھراپی سنٹر"]'::jsonb, 'Dr. Farhan Ali Cheema'),
  ('general-medicine', 'General Medicine & Diabetology', 'جنرل میڈیسن و ذیابیطس', 'Stethoscope', 'Holistic internal medicine care covering Diabetes mellitus, Hypertension, liver diseases, and infectious fevers.', 'شوگر، بلڈ پریشر، ہیپاٹائٹس بی اور سی، گردے اور عمومی امراض کا جامع کنٹرول۔', 6, '["Personalized Diabetes Protocol", "Hypertension Clinic", "Hepatitis Eradication Unit", "Geriatric Elderly Care"]'::jsonb, '["شوگر کنٹرول کلینک", "ہائی بلڈ پریشر سنٹر", "ہیپاٹائٹس کا علاج", "بزرگ مریضوں کی دیکھ بھال"]'::jsonb, 'Dr. Muhammad Imran'),
  ('dental', 'Dental Surgery & Implantology', 'دندان سازی و ڈینٹل امپلانٹ', 'Sparkles', 'Painless root canal treatment, dental implants, cosmetic teeth whitening, pediatric dentistry, and jaw surgery.', 'جدید ڈینٹل امپلانٹ، روٹ کینال، دانتوں کی خوبصورتی، بریسز اور مسوڑھوں کی دیکھ بھال۔', 7, '["Digital Dental X-Ray (OPG)", "Titanium Dental Implants", "Laser Teeth Whitening", "Invisalign & Braces"]'::jsonb, '["ڈیجیٹل او پی جی ایکسرے", "مستقل دانتوں کے امپلانٹ", "لیزر وائٹننگ", "بریسز کی تنصیب"]'::jsonb, 'Dr. Usman Tariq'),
  ('ent', 'ENT (Ear, Nose & Throat)', 'کان، ناک اور گلے کے امراض', 'Ear', 'Microscopic ear surgeries, endoscopic sinus surgery, tonsillectomy, snoring treatments, and clinical audiology.', 'کان کے پردے کی مائیکرو سرجری، سائنس کا دوربینی علاج، اور سماعت کے ٹیسٹ۔', 8, '["Endoscopic Sinus Surgery (FESS)", "Tympanoplasty & Mastoid", "Audiometry Hearing Booth", "Snoring / Sleep Apnea Care"]'::jsonb, '["دوربین سے ناک کی سرجری", "کان کے پردے کی پیوند کاری", "کمپیوٹرائزڈ آڈیو میٹری", "خراٹوں کا علاج"]'::jsonb, 'Dr. Noman Arshad'),
  ('ophthalmology', 'Ophthalmology & Eye Surgery', 'امراضِ چشم و لیزر سرجری', 'Eye', 'Phaco sutureless cataract surgery with premium foldable lenses, glaucoma laser care, and diabetic retinopathy.', 'بغیر ٹانکے موتیا کا فیکو آپریشن، کالے موتیے کا لیزر علاج، اور شوگر سے متاثرہ آنکھوں کا علاج۔', 9, '["No-Stitch Phaco Cataract", "YAG Laser Capsulotomy", "OCT Retinal Scan", "Pediatric Squint Clinic"]'::jsonb, '["بغیر ٹانکے کے سفید موتیا آپریشن", "یاگ لیزر مشین", "او سی ٹی آنکھ کا اسکین", "بھینگے پن کا علاج"]'::jsonb, 'Dr. M. Qasim Bashir'),
  ('dermatology', 'Dermatology & Cosmetology', 'امراضِ جلد، بال و لیزر', 'Flame', 'Clinical skin solutions for acne, eczema, psoriasis, hair loss (PRP therapy), and cosmetic laser treatments.', 'کیل مہاسے، الرجی، ایگزیما، گرتے بالوں کے لیے پی آر پی (PRP) اور جدید لیزر علاج۔', 10, '["PRP Hair Restoration", "Acne Scar Resurfacing", "HydraFacial Medical Cleanse", "Skin Allergy Patch Tests"]'::jsonb, '["پی آر پی بالوں کا علاج", "کیل مہاسوں کے داغ کا خاتمہ", "میڈیکل ہائیڈرا فیشل", "جلد کی الرجی ٹیسٹ"]'::jsonb, 'Dr. Sadia Noreen'),
  ('radiology', 'Radiology & Advanced Imaging', 'ریڈیالوجی و جدید اسکیننگ', 'Scan', 'High-definition diagnostic imaging with 128-Slice CT scanner, 4D Color Ultrasound, and Low-Dose Digital X-Ray.', '128 سلائس سی ٹی اسکین، ایم آر آئی، 4D کلر ڈوپلر الٹراساؤنڈ اور ڈیجیٹل ایکسرے۔', 11, '["128-Slice Multi-detector CT", "4D Pregnancy Ultrasound", "Digital Mammography", "Instant Digital PACS Reports"]'::jsonb, '["128 سلائس ملٹی ڈیٹیکٹر سی ٹی", "4D حاملہ خواتین کا الٹراساؤنڈ", "ڈیجیٹل میموگرافی", "فوری آن لائن رپورٹ"]'::jsonb, 'Dr. Naveed Raza'),
  ('laboratory', 'Pathology & Clinical Laboratory', 'پیتھالوجی و لیبارٹری', 'FlaskConical', 'Fully automated, ISO-compliant medical laboratory offering 500+ diagnostic tests with home sampling.', 'مکمل خودکار آئی ایس او معیاری لیب، تیز رفتار آن لائن رپورٹس اور گھر سے مفت نمونے حاصل کرنے کی سہولت۔', 12, '["Barcode Error-Free Testing", "Free Home Sample Collection", "Same-Day Blood Reports", "WhatsApp & Portal Download"]'::jsonb, '["بارکوڈ ٹیسٹنگ سسٹم", "لاہور بھر میں مفت ہوم سیمپلنگ", "اسی روز بلڈ رپورٹس", "واٹس ایپ پر فوری رپورٹ"]'::jsonb, 'Prof. Dr. Mansoor Ahmad')
on conflict (id) do nothing;

-- B. Seed Doctors
insert into public.doctors (id, name, name_urdu, department_id, specialty, specialty_urdu, qualification, experience, opd_timings, opd_timings_urdu, days, days_urdu, fee_pkr, image, about, about_urdu, pmdc_no, active)
values
  ('doc-tariq', 'Dr. Tariq Mahmood', 'ڈاکٹر طارق محمود', 'cardiology', 'Consultant Interventional Cardiologist', 'کنسلٹنٹ انٹروینشنل ماہر امراضِ قلب', 'MBBS, FCPS (Cardiology), FACC (USA)', '22+ Years Experience', '05:00 PM – 09:00 PM', 'شام 5 تا رات 9 بجے', 'Monday to Friday', 'پیر تا جمعہ', 3000, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80', 'Former Head of Cardiology at Punjab Institute of Cardiology (PIC). Specializes in coronary angiograms, post-infarction care, and preventive hypertension management.', 'پی آئی سی کے سابق سربراہ اور نامور ماہر امراضِ قلب، دل کے دورے اور ہائی بلڈ پریشر کے ماہر۔', '12894-P', true),
  ('doc-ayesha', 'Dr. Ayesha Siddiqa', 'ڈاکٹر عائشہ صدیقہ', 'gynecology', 'Senior Consultant Gynecologist & Obstetrician', 'سینئر کنسلٹنٹ ماہر امراضِ نسواں و زچگی', 'MBBS, FCPS (Obs & Gynae), MRCOG (UK)', '18+ Years Experience', '10:00 AM – 03:00 PM', 'صبح 10 تا سہ پہر 3 بجے', 'Monday to Saturday', 'پیر تا ہفتہ', 2500, 'https://images.unsplash.com/photo-1594824813588-e25dfb0439ef?auto=format&fit=crop&w=600&q=80', 'Gold medalist gynecologist trained in London, UK. Renowned for painless deliveries, high-risk twin pregnancies, and laparoscopic fertility surgeries.', 'برطانیہ سے تربیت یافتہ، بے درد زچگی اور پیچیدہ حمل کے کیسز کی مایہ ناز ماہر۔', '19321-P', true),
  ('doc-farhan', 'Dr. Farhan Ali Cheema', 'ڈاکٹر فرحان علی چیمہ', 'orthopedics', 'Chief Orthopedic & Spine Surgeon', 'چیف آرتھوپیڈک و اسپائن سرجن', 'MBBS, FCPS (Ortho), Fellowship Arthroscopy (Germany)', '16+ Years Experience', '04:00 PM – 08:00 PM', 'شام 4 تا رات 8 بجے', 'Mon, Wed, Fri, Sat', 'پیر، بدھ، جمعہ، ہفتہ', 2800, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80', 'Pioneer of minimally invasive joint replacement in Lahore. Over 3,500 successful knee and hip replacements.', 'جرمنی سے تربیت یافتہ، گھٹنے و کولہے کے جوڑوں کی تبدیلی اور کھیلوں کے زخموں کے سرجن۔', '24115-P', true),
  ('doc-zainab', 'Dr. Zainab Malik', 'ڈاکٹر زینب ملک', 'pediatrics', 'Consultant Pediatrician & Neonatologist', 'کنسلٹنٹ ماہر امراضِ اطفال و نوزائیدہ بچے', 'MBBS, FCPS (Pediatrics), MCPS', '14+ Years Experience', '11:00 AM – 04:00 PM', 'صبح 11 تا سہ پہر 4 بجے', 'Monday to Friday', 'پیر تا جمعہ', 2000, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80', 'Dedicated pediatrician known for childhood asthma management, pediatric nutrition, and neonatal intensive monitoring.', 'بچوں کے سینے کے امراض، نمونیا، غذائی کمی اور نوزائیدہ بچوں کی دیکھ بھال کی ماہر۔', '28409-P', true),
  ('doc-imran', 'Dr. Muhammad Imran', 'ڈاکٹر محمد عمران', 'general-medicine', 'Consultant Physician & Diabetologist', 'کنسلٹنٹ فزیشن و شوگر اسپیشلسٹ', 'MBBS, FCPS (Medicine), MRCP (UK)', '20+ Years Experience', '03:00 PM – 07:00 PM', 'سہ پہر 3 تا شام 7 بجے', 'Monday to Saturday', 'پیر تا ہفتہ', 2500, 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80', 'Senior internal medicine physician focusing on complex metabolic disorders, diabetic foot prevention, and hypertension.', 'شوگر اور بلڈ پریشر کے مریضوں کے پچیدہ مسائل اور عمومی فزیشن کیئر کے سینئر ڈاکٹر۔', '16782-P', true),
  ('doc-sadia', 'Dr. Sadia Noreen', 'ڈاکٹر سعدیہ نورین', 'dermatology', 'Consultant Dermatologist & Aesthetician', 'کنسلٹنٹ ماہر امراضِ جلد و کاسمیٹک سرجن', 'MBBS, FCPS (Dermatology)', '12+ Years Experience', '05:00 PM – 08:30 PM', 'شام 5 تا رات 8:30 بجے', 'Tuesday, Thursday, Saturday', 'منگل، جمعرات، ہفتہ', 2500, 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80', 'Specialized in stubborn acne treatments, hair thinning therapies (PRP), pigmentation correction, and medical-grade skin care.', 'ایکنی، بالوں کا گرنا، جلد کی الرجی اور جدید لیزر علاج کی مستند کنسلٹنٹ۔', '33890-P', true),
  ('doc-bilal', 'Dr. Bilal Hassan', 'ڈاکٹر بلال حسن', 'emergency', 'Chief Emergency Medicine & Trauma Surgeon', 'چیف ایمرجنسی میڈیسن و ٹراما سرجن', 'MBBS, FCPS (Emergency Medicine), ATLS (USA)', '15+ Years Experience', '24/7 On-Duty Rota', '24 گھنٹے ایمرجنسی شفٹ', 'Monday to Sunday (24/7)', 'پیر تا اتوار (24 گھنٹے)', 2000, 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80', 'Lead trauma director specialized in acute myocardial infarction stabilization and advanced life support.', 'ایمرجنسی و ٹراما کے ماہر سرجن، دل کے دورے اور فوری جان بچانے والی طبی سہولیات کے نگراں۔', '31289-P', true),
  ('doc-usman', 'Dr. Usman Tariq', 'ڈاکٹر عثمان طارق', 'dental', 'Consultant Dental Surgeon & Implantologist', 'کنسلٹنٹ ڈینٹل سرجن و امپلانٹ اسپیشلسٹ', 'BDS, RDS, C-Implants (USA), MCPS', '13+ Years Experience', '04:00 PM – 09:00 PM', 'شام 4 تا رات 9 بجے', 'Monday to Saturday', 'پیر تا ہفتہ', 1500, 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80', 'Specializes in painless computer-guided titanium dental implants, root canal treatment, and braces.', 'مستقل ڈینٹل امپلانٹ، روٹ کینال، اور کاسمیٹک دانتوں کی خوبصورتی کے نامور ماہر۔', '21908-D', true),
  ('doc-noman', 'Dr. Noman Arshad', 'ڈاکٹر نعمان ارشد', 'ent', 'Consultant ENT, Head & Neck Surgeon', 'کنسلٹنٹ ای این ٹی و ہیڈ اینڈ نیک سرجن', 'MBBS, FCPS (ENT), Fellowship Rhinology (UK)', '16+ Years Experience', '05:00 PM – 08:30 PM', 'شام 5 تا رات 8:30 بجے', 'Mon, Tue, Thu, Fri', 'پیر، منگل، جمعرات، جمعہ', 2500, 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=600&q=80', 'Pioneer in functional endoscopic sinus surgery (FESS), tympanoplasty, and snoring treatments.', 'ناک، کان اور گلے کے جدید مائیکرو اسکوپک اور دوربینی آپریشنز کے سینئر کنسلٹنٹ۔', '26441-P', true),
  ('doc-qasim', 'Dr. M. Qasim Bashir', 'ڈاکٹر محمد قاسم بشیر', 'ophthalmology', 'Consultant Eye Surgeon & Phaco Specialist', 'کنسلٹنٹ ماہر امراضِ چشم و فیکو سرجن', 'MBBS, FCPS (Ophthalmology), FRCS (Glasgow)', '19+ Years Experience', '03:30 PM – 07:30 PM', 'سہ پہر 3:30 تا شام 7:30 بجے', 'Monday to Friday', 'پیر تا جمعہ', 2500, 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=600&q=80', 'Over 8,000 successful sutureless cataract surgeries performed with premium multifocal IOL implants.', 'بغیر ٹانکے کے سفید موتیے کے فیکو آپریشن، کالے موتیے اور ریٹینا لیزر کے معروف سرجن۔', '18920-P', true),
  ('doc-naveed', 'Dr. Naveed Raza', 'ڈاکٹر نوید رضا', 'radiology', 'Consultant Radiologist', 'کنسلٹنٹ ریڈیالوجسٹ و امیجنگ اسپیشلسٹ', 'MBBS, DMRD, FCPS (Radiology)', '17+ Years Experience', '09:00 AM – 03:00 PM', 'صبح 9 تا سہ پہر 3 بجے', 'Monday to Saturday', 'پیر تا ہفتہ', 2000, 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=600&q=80', 'Expert in 128-slice CT angiography reporting and 4D anomaly pregnancy ultrasound.', 'سی ٹی اسکین، ایم آر آئی اور 4D کلر ڈوپلر الٹراساؤنڈ کی مستند رپورٹنگ کے سربراہ۔', '27814-P', true),
  ('doc-mansoor', 'Prof. Dr. Mansoor Ahmad', 'پروفیسر ڈاکٹر منصور احمد', 'laboratory', 'Consultant Pathologist & Lab Director', 'کنسلٹنٹ پیتھالوجسٹ و ڈائریکٹر لیبارٹری', 'MBBS, M.Phil (Pathology), FRCPath', '25+ Years Experience', '09:00 AM – 05:00 PM', 'صبح 9 تا شام 5 بجے', 'Monday to Saturday', 'پیر تا ہفتہ', 1500, 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80', 'Oversees all automated biochemical and hematological analyses under ISO 15189 compliance.', '25 سالہ تجربہ کار پیتھالوجسٹ، تمام خون و بائیوپسی ٹیسٹوں کے تصدیق کنندہ۔', '11520-P', true)
on conflict (id) do nothing;

-- C. Seed Services
insert into public.services (id, title, title_urdu, icon_name, description, description_urdu, badge, badge_urdu, image)
values
  ('emergency-service', '24/7 Emergency & Trauma Center', '24 گھنٹے ایمرجنسی و ٹراما سنٹر', 'Activity', 'Immediate resuscitation, adult and pediatric trauma bays, and on-call specialist surgeons round the clock.', 'کسی بھی ہنگامی صورتحال، حادثات یا دل کے دورے کی صورت میں فوری ماہرانہ طبی امداد۔', '24/7 Available', '24 گھنٹے دستیاب', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'),
  ('cardiac-icu', 'Cardiac Care Unit (CCU) & ICU', 'کارڈیک کیئر یونٹ (CCU) اور انتہائی نگہداشت', 'HeartPulse', 'High-dependency intensive monitoring units equipped with central telemetry, multipara monitors, and ventilators.', 'دل کے نازک مریضوں اور وینٹی لیٹر کی ضرورت والے مریضوں کے لیے جدید آئی سی یو۔', 'Critical Care', 'انتہائی نگہداشت', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'),
  ('operation-theatres', 'Modular Operation Theatres', 'جدید ماڈیولر آپریشن تھیٹرز', 'Sparkles', 'Ultra-clean laminar airflow surgical suites designed for infection-free laparoscopic, orthopedic, and general surgeries.', 'جراثیم سے مکمل پاک تھیٹرز برائے لیپروسکوپک، ہڈی جوڑ اور جنرل سرجری۔', 'Sterile Grade-A', 'انفیکشن فری', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'),
  ('nicu', 'Neonatal Intensive Care (NICU)', 'نوزائیدہ بچوں کا این آئی سی یو', 'Smile', 'Advanced incubators, bubble CPAP, phototherapy units, and 24/7 neonatologists for premature and critically ill newborns.', 'قبل از وقت پیدا ہونے والے اور کم وزن بچوں کے لیے خصوصی انکیوبیٹرز اور وینٹیلیشن۔', 'Level III NICU', 'لیول III کیئر', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80'),
  ('ct-mri', 'Advanced CT Scan & Color Doppler', '128 سلائس سی ٹی اسکین و کلر ڈوپلر', 'Scan', 'Ultra-fast 128-slice multi-detector computed tomography and 4D color ultrasound for precise, immediate diagnosis.', 'فوری اور تفصیلی تشخیص کے لیے جدید ترین سی ٹی اسکین، ڈیجیٹل ایکسرے اور الٹراساؤنڈ۔', 'Same-Day Reports', 'اسی روز رپورٹ', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'),
  ('lab-service', 'Automated Pathology Laboratory', 'مکمل خودکار پیتھالوجی لیب', 'FlaskConical', 'ISO compliant testing with computer-barcoded samples, same-day reports, and free home sample collection.', 'خون، شوگر، کینسر مارکرز اور تمام ہارمونز کے مستند کمپیوٹرائزڈ ٹیسٹ۔', 'ISO Certified', 'آئی ایس او تصدیق شدہ', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80')
on conflict (id) do nothing;
