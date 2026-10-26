import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { defaultData } from '../default-content';
import type { PortfolioData } from '../types';

async function fetchRemote(): Promise<PortfolioData> {
  if (!supabase) throw new Error('not configured');
  const [profile, experiences, projects, skills, education, categories, technologies, certificates, testimonials, settings] = await Promise.all([
    supabase.from('profile').select('*').eq('id', 1).maybeSingle(),
    supabase.from('experiences').select('*').order('sort_order'),
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('skill_groups').select('*').order('sort_order'),
    supabase.from('education').select('*').order('sort_order'),
    supabase.from('project_categories').select('id,slug,name_en,name_ar,sort_order').order('sort_order'),
    supabase.from('technologies').select('id,slug,name,icon,sort_order').order('sort_order'),
    supabase.from('certificates').select('id,title,issuer,issue_date,image_url,verification_url,is_published,sort_order').eq('is_published', true).order('sort_order'),
    supabase.from('testimonials').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('key,value'),
  ]);
  const err = profile.error || experiences.error || projects.error || skills.error || education.error || categories.error || technologies.error || certificates.error || testimonials.error;
  if (err) throw err;
  if (!profile.data) throw new Error('empty profile');

  const getSetting = (k: string, def = true) => {
    const item = settings.data?.find((s) => s.key === k);
    return item ? item.value === 'true' : def;
  };

  const parsedSettings = {
    testimonials_button_visible: getSetting('testimonials_button_visible', true),
    section_work_visible: getSetting('section_work_visible', true),
    section_about_visible: getSetting('section_about_visible', true),
    section_experience_visible: getSetting('section_experience_visible', true),
    section_certificates_visible: getSetting('section_certificates_visible', true),
    section_testimonials_visible: getSetting('section_testimonials_visible', true),
  };

  return {
    profile: { ...defaultData.profile, ...profile.data },
    experiences: experiences.data?.length ? experiences.data : defaultData.experiences,
    projects: projects.data?.length ? projects.data : defaultData.projects,
    skills: skills.data?.length ? skills.data : defaultData.skills,
    education: education.data?.length ? education.data : defaultData.education,
    categories: categories.data?.length ? categories.data : defaultData.categories,
    technologies: technologies.data?.length ? technologies.data : defaultData.technologies,
    certificates: certificates.data ?? [],
    testimonials: testimonials.data ?? [],
    testimonialsVisible: parsedSettings.section_testimonials_visible,
    settings: parsedSettings,
    source: 'remote',
  };
}

let inFlightPromise: Promise<PortfolioData> | null = null;
let cachedData: PortfolioData | null = null;

export function invalidatePortfolioCache() {
  cachedData = null;
  inFlightPromise = null;
}

async function fetchRemoteDeduplicated(): Promise<PortfolioData> {
  if (inFlightPromise) return inFlightPromise;
  inFlightPromise = fetchRemote()
    .then((result) => {
      cachedData = result;
      inFlightPromise = null;
      return result;
    })
    .catch((err) => {
      inFlightPromise = null;
      throw err;
    });
  return inFlightPromise;
}

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(cachedData);
  const [error, setError] = useState<string>('');

  const load = useCallback(async (bypassCache = false) => {
    if (!isSupabaseConfigured) {
      setData(defaultData);
      return;
    }
    if (!bypassCache && cachedData) {
      setData(cachedData);
    }
    try {
      const fresh = await (bypassCache ? fetchRemote() : fetchRemoteDeduplicated());
      setData(fresh);
    } catch (e) {
      setData((prev) => prev ?? defaultData);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when user returns to portfolio tab
  useEffect(() => {
    const handleFocus = () => {
      cachedData = null;
      void load(true);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [load]);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const handleRealtimeChange = () => {
      cachedData = null;
      void load(true);
    };

    const channel = client
      .channel('portfolio-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_groups' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'education' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_categories' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'technologies' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, handleRealtimeChange)
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [load]);

  return { data, error, reload: load };
}
