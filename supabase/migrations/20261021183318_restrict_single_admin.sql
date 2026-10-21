-- Restrict portfolio mutations to the single configured administrator.
-- The email must match the email claim in the Supabase Auth JWT.

drop policy if exists "admin write profile" on public.profile;
drop policy if exists "admin write experiences" on public.experiences;
drop policy if exists "admin write projects" on public.projects;
drop policy if exists "admin write skill_groups" on public.skill_groups;
drop policy if exists "admin write education" on public.education;

create policy "single admin write profile"
  on public.profile
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

create policy "single admin write experiences"
  on public.experiences
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

create policy "single admin write projects"
  on public.projects
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

create policy "single admin write skill_groups"
  on public.skill_groups
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

create policy "single admin write education"
  on public.education
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com');

drop policy if exists "admin upload portfolio files" on storage.objects;
drop policy if exists "admin update portfolio files" on storage.objects;
drop policy if exists "admin delete portfolio files" on storage.objects;

create policy "single admin upload portfolio files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio'
    and (auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com'
  );

create policy "single admin update portfolio files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com'
  )
  with check (
    bucket_id = 'portfolio'
    and (auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com'
  );

create policy "single admin delete portfolio files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (auth.jwt() ->> 'email') = 'tahahodhod650@gmail.com'
  );
