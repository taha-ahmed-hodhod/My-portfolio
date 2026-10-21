-- Add manageable categories and technologies without changing existing project data.
create table if not exists public.project_categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_en text not null default '',
  name_ar text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.technologies (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null default '',
  icon text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.project_categories enable row level security;
alter table public.technologies enable row level security;

drop policy if exists "public read project categories" on public.project_categories;
drop policy if exists "single admin write project categories" on public.project_categories;
drop policy if exists "public read technologies" on public.technologies;
drop policy if exists "single admin write technologies" on public.technologies;

create policy "public read project categories"
  on public.project_categories for select to public using (true);
create policy "single admin write project categories"
  on public.project_categories for all to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

create policy "public read technologies"
  on public.technologies for select to public using (true);
create policy "single admin write technologies"
  on public.technologies for all to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

insert into public.project_categories (slug, name_en, name_ar, sort_order)
values
  ('fullstack', 'Full Stack', 'Full Stack', 1),
  ('frontend', 'Frontend', 'Frontend', 2),
  ('backend', 'Backend', 'Backend', 3),
  ('other', 'Other', 'أخرى', 4)
on conflict (slug) do nothing;

insert into public.technologies (slug, name, sort_order)
select lower(regexp_replace(trim(tag), '[^a-zA-Z0-9]+', '-', 'g')), trim(tag), row_number() over (order by trim(tag))
from (
  select distinct unnest(tags) as tag
  from public.projects
) source
where trim(tag) <> ''
on conflict (slug) do nothing;

do $$
begin
  alter publication supabase_realtime add table public.project_categories, public.technologies;
exception
  when duplicate_object then null;
end
$$;
