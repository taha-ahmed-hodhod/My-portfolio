import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function getPortfolioContext() {
  const client = getClient();
  if (!client) throw new Error('SUPABASE_NOT_CONFIGURED');

  const [profile, experiences, projects, skills, education, certificates, testimonials] = await Promise.all([
    client.from('profile').select('name_en,name_ar,role_en,role_ar,intro_en,intro_ar,about_en,about_ar'),
    client.from('experiences').select('date_en,date_ar,company_en,company_ar,role_en,role_ar,body_en,body_ar').order('sort_order'),
    client.from('projects').select('name,year,category,headline_en,headline_ar,summary_en,summary_ar,problem,solution,my_role,tags,demo_url,code_url').order('sort_order'),
    client.from('skill_groups').select('title_en,title_ar,items_en,items_ar').order('sort_order'),
    client.from('education').select('kind,title_en,title_ar,org_en,org_ar,date_en,date_ar,details_en,details_ar').order('sort_order'),
    client.from('certificates').select('title,issuer,issue_date,verification_url,is_published').order('sort_order'),
    client.from('testimonials').select('client_name,client_role,client_company,content,rating,status').eq('status', 'approved').order('sort_order'),
  ]);

  if (profile.error) throw profile.error;
  if (!profile.data) throw new Error('PROFILE_NOT_FOUND');

  const lines = [];
  const p = profile.data;
  lines.push(`Profile: ${text(p.name_en)} (${text(p.name_ar)}), ${text(p.role_en)} (${text(p.role_ar)}).`);
  lines.push(`Introduction (English): ${text(p.intro_en)}`);
  lines.push(`Introduction (Arabic): ${text(p.intro_ar)}`);
  lines.push(`About (English): ${text(p.about_en)}`);
  lines.push(`About (Arabic): ${text(p.about_ar)}`);

  lines.push('\nExperience:');
  for (const item of experiences.data ?? []) {
    lines.push(`- ${text(item.company_en)} / ${text(item.company_ar)} — ${text(item.role_en)} / ${text(item.role_ar)} (${text(item.date_en)}). ${text(item.body_en)} ${text(item.body_ar)}`);
  }

  lines.push('\nProjects:');
  for (const item of projects.data ?? []) {
    const tags = Array.isArray(item.tags) ? item.tags.filter((tag) => typeof tag === 'string').join(', ') : '';
    const extra = [
      item.my_role ? `Role: ${text(item.my_role)}` : '',
      item.problem ? `Challenge: ${text(item.problem)}` : '',
      item.solution ? `Solution: ${text(item.solution)}` : '',
    ].filter(Boolean).join('. ');
    lines.push(`- ${text(item.name)} (${text(item.year)}, ${text(item.category)}). ${text(item.headline_en)} ${text(item.headline_ar)}. ${text(item.summary_en)} ${text(item.summary_ar)}. Technologies: ${tags}.${extra ? ` ${extra}.` : ''}`);
  }

  lines.push('\nSkills & Technical Toolkit:');
  for (const item of skills.data ?? []) {
    lines.push(`- ${text(item.title_en)} / ${text(item.title_ar)}: ${text(item.items_en)} / ${text(item.items_ar)}`);
  }

  lines.push('\nCertificates & Credentials:');
  for (const cert of certificates.data ?? []) {
    if (cert.is_published !== false) {
      const date = cert.issue_date || '';
      const cred = cert.verification_url ? ` (Verification: ${cert.verification_url})` : '';
      lines.push(`- ${text(cert.title)} issued by ${text(cert.issuer)} ${date ? `(${date})` : ''}${cred}`);
    }
  }

  lines.push('\nClient Testimonials & Feedback:');
  for (const rev of testimonials.data ?? []) {
    const roleComp = [text(rev.client_role), text(rev.client_company)].filter(Boolean).join(' at ');
    const rating = rev.rating ? `[${rev.rating}/5 stars]` : '';
    lines.push(`- ${text(rev.client_name)}${roleComp ? ` (${roleComp})` : ''}: "${text(rev.content)}" ${rating}`);
  }

  lines.push('\nEducation:');
  for (const item of education.data ?? []) {
    lines.push(`- ${text(item.title_en)} / ${text(item.title_ar)} — ${text(item.org_en)} / ${text(item.org_ar)} (${text(item.date_en)}). ${text(item.details_en)} ${text(item.details_ar)}`);
  }

  return lines.join('\n').slice(0, 30_000);
}
