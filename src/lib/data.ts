import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { defaultData } from '../default-content';
import type { PortfolioData } from '../types';

async function fetchRemote(): Promise<PortfolioData> {
  if (!supabase) throw new Error('not configured');
  const [profile, experiences, projects, skills, education] = await Promise.all([
    supabase.from('profile').select('*').eq('id', 1).maybeSingle(),
    supabase.from('experiences').select('*').order('sort_order'),
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('skill_groups').select('*').order('sort_order'),
    supabase.from('education').select('*').order('sort_order'),
  ]);
  const err = profile.error || experiences.error || projects.error || skills.error || education.error;
  if (err) throw err;
  if (!profile.data) throw new Error('empty profile');
  return {
    profile: { ...defaultData.profile, ...profile.data },
    experiences: experiences.data?.length ? experiences.data : defaultData.experiences,
    projects: projects.data?.length ? projects.data : defaultData.projects,
    skills: skills.data?.length ? skills.data : defaultData.skills,
    education: education.data?.length ? education.data : defaultData.education,
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

  return { data, error, reload: load };
}
