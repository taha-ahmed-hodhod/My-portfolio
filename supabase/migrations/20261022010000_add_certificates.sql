create table if not exists public.certificates (
  id bigint generated always as identity primary key,
  title text not null default '',
  issuer text not null default '',
  issue_date date,
  image_url text not null default '',
  verification_url text not null default '',
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

drop policy if exists "public read published certificates" on public.certificates;
drop policy if exists "single admin write certificates" on public.certificates;

create policy "public read published certificates"
  on public.certificates for select to public
  using (is_published = true);

create policy "single admin write certificates"
  on public.certificates for all to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

begin;
  alter publication supabase_realtime add table public.certificates;
exception
  when duplicate_object then null;
end;
