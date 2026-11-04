-- ==============================================================================
-- DAR AL DAWA MEDICAL CENTER - SUPABASE DATABASE & STORAGE INITIALIZATION SCRIPT
-- ==============================================================================
-- Run this complete SQL script in your Supabase Project:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Click "RUN"
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. CREATE TABLES

-- A. Hospital General Settings
create table if not exists public.hospital_settings (
  id text primary key default 'main',
  name text not null default 'Dar al Dawa Medical Center',
  name_urdu text not null default 'دار الدواء میڈیکل سنٹر',
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

-- E. Doctors (with Foreign Key to Departments)
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

-- F. Appointments
create table if not exists public.appointments (
  id text primary key,
  token text,
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

-- G. Services & Facilities
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

-- H. Health Packages
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

-- I. Gallery
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

-- J. Testimonials
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

-- K. FAQs
create table if not exists public.faqs (
  id text primary key,
  question text not null,
  question_urdu text not null,
  answer text not null,
  answer_urdu text not null,
  category text default 'general',
  created_at timestamptz default now()
);

-- L. Contact Messages
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

-- M. Activity Logs
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
-- 3. SUPABASE STORAGE BUCKET: "images"
-- ==============================================================================

-- Create public 'images' bucket
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.hospital_settings enable row level security;
alter table public.operational_settings enable row level security;
alter table public.homepage_settings enable row level security;
alter table public.departments enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.gallery enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.messages enable row level security;
alter table public.activity_logs enable row level security;

-- Drop any conflicting existing policies
drop policy if exists "Public read hospital_settings" on public.hospital_settings;
drop policy if exists "Admin manage hospital_settings" on public.hospital_settings;
drop policy if exists "Public read operational_settings" on public.operational_settings;
drop policy if exists "Admin manage operational_settings" on public.operational_settings;
drop policy if exists "Public read homepage_settings" on public.homepage_settings;
drop policy if exists "Admin manage homepage_settings" on public.homepage_settings;
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
drop policy if exists "Public insert messages" on public.messages;
drop policy if exists "Admin manage messages" on public.messages;
drop policy if exists "Admin manage activity_logs" on public.activity_logs;

-- Policies: Public Read + Authenticated Admin Full Control

-- Hospital Settings
create policy "Public read hospital_settings" on public.hospital_settings for select using (true);
create policy "Admin manage hospital_settings" on public.hospital_settings for all to authenticated using (true) with check (true);

-- Operational Settings
create policy "Public read operational_settings" on public.operational_settings for select using (true);
create policy "Admin manage operational_settings" on public.operational_settings for all to authenticated using (true) with check (true);

-- Homepage Settings
create policy "Public read homepage_settings" on public.homepage_settings for select using (true);
create policy "Admin manage homepage_settings" on public.homepage_settings for all to authenticated using (true) with check (true);

-- Departments
create policy "Public read departments" on public.departments for select using (true);
create policy "Admin manage departments" on public.departments for all to authenticated using (true) with check (true);

-- Doctors
create policy "Public read doctors" on public.doctors for select using (true);
create policy "Admin manage doctors" on public.doctors for all to authenticated using (true) with check (true);

-- Services
create policy "Public read services" on public.services for select using (true);
create policy "Admin manage services" on public.services for all to authenticated using (true) with check (true);

-- Packages
create policy "Public read packages" on public.packages for select using (true);
create policy "Admin manage packages" on public.packages for all to authenticated using (true) with check (true);

-- Gallery
create policy "Public read gallery" on public.gallery for select using (true);
create policy "Admin manage gallery" on public.gallery for all to authenticated using (true) with check (true);

-- Testimonials
create policy "Public read testimonials" on public.testimonials for select using (true);
create policy "Admin manage testimonials" on public.testimonials for all to authenticated using (true) with check (true);

-- FAQs
create policy "Public read faqs" on public.faqs for select using (true);
create policy "Admin manage faqs" on public.faqs for all to authenticated using (true) with check (true);

-- Appointments:
-- ANYONE (public) can insert an appointment booking.
-- ONLY logged-in Admin (authenticated) can view, edit, or delete appointments.
create policy "Public insert appointments" on public.appointments for insert with check (true);
create policy "Admin manage appointments" on public.appointments for all to authenticated using (true) with check (true);

-- Messages:
-- ANYONE (public) can submit a contact message.
-- ONLY logged-in Admin can view or delete messages.
create policy "Public insert messages" on public.messages for insert with check (true);
create policy "Admin manage messages" on public.messages for all to authenticated using (true) with check (true);

-- Activity Logs:
create policy "Admin manage activity_logs" on public.activity_logs for all to authenticated using (true) with check (true);

-- ==============================================================================
-- 5. STORAGE POLICIES FOR "images" BUCKET
-- ==============================================================================

drop policy if exists "Public Access for Images" on storage.objects;
drop policy if exists "Admin Upload to Images" on storage.objects;
drop policy if exists "Admin Update Images" on storage.objects;
drop policy if exists "Admin Delete Images" on storage.objects;

-- Anyone can view images (public CDN)
create policy "Public Access for Images"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- Logged-in admin can upload images
create policy "Admin Upload to Images"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'images' );

-- Logged-in admin can update images
create policy "Admin Update Images"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'images' );

-- Logged-in admin can delete images
create policy "Admin Delete Images"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'images' );
