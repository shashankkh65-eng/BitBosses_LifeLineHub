
-- DONOR PROFILES
create table public.donor_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  donor_id text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);
alter table public.donor_profiles enable row level security;

create policy "Donors can view own profile" on public.donor_profiles
  for select to authenticated using (auth.uid() = id);
create policy "Donors can insert own profile" on public.donor_profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "Donors can update own profile" on public.donor_profiles
  for update to authenticated using (auth.uid() = id);

-- Donor ID generator: DONOR + 6 digit zero padded
create or replace function public.generate_donor_id()
returns text language plpgsql as $$
declare
  new_id text;
  exists_count int;
begin
  loop
    new_id := 'DONOR' || lpad(floor(random() * 1000000)::text, 6, '0');
    select count(*) into exists_count from public.donor_profiles where donor_id = new_id;
    exit when exists_count = 0;
  end loop;
  return new_id;
end;
$$;

-- Auto-create donor profile from signup metadata
create or replace function public.handle_new_donor()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.raw_user_meta_data->>'role') = 'donor' then
    insert into public.donor_profiles (id, donor_id, full_name, email, phone)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'donor_id', public.generate_donor_id()),
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.email,
      coalesce(new.raw_user_meta_data->>'phone', '')
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_donor();

-- ORGANISATIONS
create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  latitude double precision,
  longitude double precision,
  needs text[] not null default '{}',
  description text,
  bank_account_name text,
  bank_account_number text,
  ifsc_code text,
  qr_code_url text,
  created_at timestamptz not null default now()
);
alter table public.organisations enable row level security;
create policy "Anyone authenticated can view organisations" on public.organisations
  for select to authenticated using (true);

-- INDIVIDUAL REQUESTS
create table public.individual_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  requirement text not null,
  urgency text not null default 'medium',
  location text,
  created_at timestamptz not null default now()
);
alter table public.individual_requests enable row level security;
create policy "Anyone authenticated can view individual requests" on public.individual_requests
  for select to authenticated using (true);

-- EMERGENCY REQUESTS
create table public.emergency_requests (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text,
  urgency text not null default 'high',
  location text,
  created_at timestamptz not null default now()
);
alter table public.emergency_requests enable row level security;
create policy "Anyone authenticated can view emergency requests" on public.emergency_requests
  for select to authenticated using (true);

-- DONATIONS
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donor_profiles(id) on delete cascade,
  org_id uuid references public.organisations(id) on delete set null,
  category text not null,
  amount numeric not null check (amount > 0),
  status text not null default 'pending',
  proof_image text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.donations enable row level security;
create policy "Donors can view own donations" on public.donations
  for select to authenticated using (auth.uid() = donor_id);
create policy "Donors can create own donations" on public.donations
  for insert to authenticated with check (auth.uid() = donor_id);
create policy "Donors can update own donations" on public.donations
  for update to authenticated using (auth.uid() = donor_id);

-- STORAGE BUCKET for payment proofs (private)
insert into storage.buckets (id, name, public) values ('donation-proofs', 'donation-proofs', false);

create policy "Donors can upload own proofs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'donation-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Donors can view own proofs" on storage.objects
  for select to authenticated
  using (bucket_id = 'donation-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
