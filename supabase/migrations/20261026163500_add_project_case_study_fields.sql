-- Add case study fields to projects (problem, solution / what was done, and my_role)
alter table public.projects
  add column if not exists problem text not null default '',
  add column if not exists solution text not null default '',
  add column if not exists my_role text not null default '';
