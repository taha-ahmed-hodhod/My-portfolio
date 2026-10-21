import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { defaultData } from '../default-content';
import type { PortfolioData } from '../types';

async function fetchRemote(): Promise<PortfolioData> {
  if (!supabase) throw new Error('not configured');
  const [profile, experiences, projects, skills, education, categories, technologies, certificates] = await Promise.all([
    supabase.from('profile').select('*').eq('id', 1).maybeSingle(),
    supabase.from('experiences').select('*').order('sort_order'),
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('skill_groups').select('*').order('sort_order'),
    supabase.from('education').select('*').order('sort_order'),
    supabase.from('project_categories').select('id,slug,name_en,name_ar,sort_order').order('sort_order'),
    supabase.from('technologies').select('id,slug,name,icon,sort_order').order('sort_order'),
    supabase.from('certificates').select('id,title,issuer,issue_date,image_url,verification_url,is_published,sort_order').eq('is_published', true).order('sort_order'),
  ]);
  const err = profile.error || experiences.error || projects.error || skills.error || education.error || categories.error || technologies.error || certificates.error;
  if (err) throw err;
  if (!profile.data) throw new Error('empty profile');
  return {
    profile: { ...defaultData.profile, ...profile.data },
    experiences: experiences.data?.length ? experiences.data : defaultData.experiences,
    projects: projects.data?.length ? projects.data : defaultData.projects,
    skills: skills.data?.length ? skills.data : defaultData.skills,
    education: education.data?.length ? education.data : defaultData.education,
    categories: categories.data?.length ? categories.data : defaultData.categories,
    technologies: technologies.data?.length ? technologies.data : defaultData.technologies,
    certificates: certificates.data ?? [],
    source: 'remote',
  };
}

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string>('');

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setData(defaultData);
      return;
    }
    try {
      setData(await fetchRemote());
    } catch (e) {
      // Fallback keeps the site presentable before the Supabase schema is installed.
      setData(defaultData);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const channel = client
      .channel('portfolio-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' }, () => { void load(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, () => { void load(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => { void load(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_groups' }, () => { void load(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'education' }, () => { void load(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_categories' }, () => { void load(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'technologies' }, () => { void load(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, () => { void load(); })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [load]);

  return { data, error, reload: load };
}
