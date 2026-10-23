-- Add testimonials and site_settings tables with RLS and realtime
create table if not exists public.testimonials (
  id bigint generated always as identity primary key,
  client_name text not null,
  client_role text not null default '',
  client_company text not null default '',
  content text not null,
  rating integer not null default 5,
  avatar_url text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "public read approved testimonials"
  on public.testimonials for select to public
  using (status = 'approved');

create policy "public insert pending testimonials"
  on public.testimonials for insert to public
  with check (status = 'pending');

create policy "single admin write testimonials"
  on public.testimonials for all to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "public read site_settings"
  on public.site_settings for select to public
  using (true);

create policy "single admin write site_settings"
  on public.site_settings for all to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

insert into public.site_settings (key, value)
values ('testimonials_visible', 'true')
on conflict (key) do nothing;

begin;
  alter publication supabase_realtime add table public.testimonials;
exception
  when duplicate_object then null;
end;

begin;
  alter publication supabase_realtime add table public.site_settings;
exception
  when duplicate_object then null;
end;
