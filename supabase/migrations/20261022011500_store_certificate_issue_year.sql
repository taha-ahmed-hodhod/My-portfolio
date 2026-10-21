alter table public.certificates
  alter column issue_date type text
  using issue_date::text;
