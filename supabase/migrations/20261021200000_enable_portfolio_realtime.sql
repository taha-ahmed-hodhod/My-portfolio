-- Publish content changes so the public portfolio can refresh without a page reload.
do $$
begin
  alter publication supabase_realtime add table
    public.profile,
    public.experiences,
    public.projects,
    public.skill_groups,
    public.education;
exception
  when duplicate_object then null;
end
$$;
