import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase, isSupabaseConfigured, STORAGE_BUCKET, isAdminEmail } from '../lib/supabase';
import { defaultData } from '../default-content';
import type { Profile, Experience, Project, SkillGroup, Education, ProjectCategoryOption, Technology, Certificate } from '../types';

type Tab = 'profile' | 'experiences' | 'projects' | 'skills' | 'education' | 'categories' | 'technologies' | 'certificates';

/* ---------- small form helpers ---------- */

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="af">
      <span>{label}</span>
      {textarea
        ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

function technologySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[+#]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function skillTechnologyNames(groups: Array<Pick<SkillGroup, 'items_en'>>): string[] {
  return [...new Set(groups
    .flatMap((group) => group.items_en.split(/[·,]/))
    .map((name) => name.trim())
    .filter(Boolean))];
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const details = error as { message?: string; details?: string; hint?: string; code?: string };
    return [details.message, details.details, details.hint, details.code ? `code: ${details.code}` : '']
      .filter(Boolean)
      .join(' — ') || JSON.stringify(error);
  }
  return String(error);
}

async function uploadImage(file: File, folder: string): Promise<string> {
  if (!supabase) throw new Error('not configured');
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) throw new Error('Use a JPG, PNG, or WebP image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Images must be 10 MB or smaller.');

  const optimized = await optimizeImage(file);
  const path = folder + '/' + Date.now() + '.webp';
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, optimized, {
    upsert: true,
    contentType: 'image/webp',
  });
  if (error) throw error;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function optimizeImage(file: File): Promise<Blob> {
  const image = await createImageBitmap(file);
  const maxDimension = 2000;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the image.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', 0.84);
  });
  if (!blob) throw new Error('Could not optimize the image.');
  return blob;
}

function ImagePicker({ value, folder, onChange }: { value: string; folder: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="af image-picker">
      <span>Image</span>
      <div className="image-picker-row">
        {value ? <img src={value} alt="" /> : <div className="image-empty">No image</div>}
        <div>
          <label className="upload-btn">
            {busy ? 'Uploading…' : 'Upload image'}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={busy}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setBusy(true);
                try { onChange(await uploadImage(f, folder)); }
                catch (err) { alert('Upload failed: ' + (err instanceof Error ? err.message : String(err))); }
                finally { setBusy(false); e.target.value = ''; }
              }}
            />
          </label>
          <input className="image-url" placeholder="…or paste image URL" value={value} onChange={(e) => onChange(e.target.value)} />
          {value && <button type="button" className="link-btn" onClick={() => onChange('')}>Remove</button>}
        </div>
      </div>
    </div>
  );
}

/* ---------- main dashboard ---------- */

export function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
    const [loadError, setLoadError] = useState('');

  const [profile, setProfile] = useState<Profile>(defaultData.profile);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [categories, setCategories] = useState<ProjectCategoryOption[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const flash = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(''), 3000); };

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoadError('');
    const client = supabase;
    const [pr, ex, pj, sk, ed, ca, te, ce] = await Promise.all([
      client.from('profile').select('*').eq('id', 1).maybeSingle(),
      client.from('experiences').select('*').order('sort_order'),
      client.from('projects').select('*').order('sort_order'),
      client.from('skill_groups').select('*').order('sort_order'),
      client.from('education').select('*').order('sort_order'),
      client.from('project_categories').select('*').order('sort_order'),
      client.from('technologies').select('*').order('sort_order'),
      client.from('certificates').select('*').order('sort_order'),
    ]);
    const error = pr.error || ex.error || pj.error || sk.error || ed.error || ca.error || te.error || ce.error;
    if (error) {
      setLoadError(error.message);
      return;
    }
    if (pr.data) setProfile({ ...defaultData.profile, ...pr.data });
    setExperiences(ex.data ?? []);
    setProjects(pj.data ?? []);
    setSkills(sk.data ?? []);
    setEducation(ed.data ?? []);
    setCategories(ca.data ?? []);
    setTechnologies(te.data ?? []);
    setCertificates((ce.data ?? []).map((certificate) => ({ ...certificate, issue_date: certificate.issue_date ?? '' })));
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    client.auth.getSession().then(async ({ data }) => {
      if (!data.session || !isAdminEmail(data.session.user.email)) {
        if (data.session) await client.auth.signOut();
        navigate('/admin', { replace: true });
      } else {
        setReady(true);
        load();
      }
    });
  }, [navigate, load]);

  async function saveProfile() {
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase.from('profile').upsert({ ...profile, id: 1 });
    setSaving(false);
    if (error) alert(error.message); else flash('Profile saved ✓');
  }

  async function saveRow(table: string, row: Record<string, unknown>) {
    if (!supabase) return;
    setSaving(true);
    try {
      const { id, ...values } = row;
      if (table === 'skill_groups') values.items_ar = values.items_en;
      const query = id == null
        ? supabase.from(table).insert(values)
        : supabase.from(table).update(values).eq('id', id);
      const { error } = await query;
      if (error) throw error;

      if (table === 'skill_groups') {
        await syncTechnologies();
      }
      flash('Saved ✓');
      await refreshTable(table);
    } catch (saveError) {
      alert(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function syncTechnologies() {
    if (!supabase) return;
    const [groupsResult, existingResult] = await Promise.all([
      supabase
      .from('skill_groups')
      .select('items_en,items_ar')
      .order('sort_order'),
      supabase.from('technologies').select('id,slug,name'),
    ]);
    if (groupsResult.error) throw new Error(`Could not read skills: ${errorMessage(groupsResult.error)}`);
    if (existingResult.error) throw new Error(`Could not read technologies: ${errorMessage(existingResult.error)}`);

    const names = skillTechnologyNames(groupsResult.data ?? []);
    const existing = existingResult.data ?? [];

    const matchedIds = new Set<number>();
    const matchedTechnology = (slug: string, name: string) => (existing ?? []).find((technology) =>
      technology.slug === slug || technologySlug(technology.name) === technologySlug(name)
    );
    for (const name of names) {
      const current = matchedTechnology(technologySlug(name), name);
      if (current) matchedIds.add(current.id);
    }

    const staleIds = (existing ?? [])
      .map((technology) => technology.id)
      .filter((id) => !matchedIds.has(id));
    const records = names.map((name, index) => {
      const current = matchedTechnology(technologySlug(name), name);
      return {
        ...(current ? { id: current.id } : {}),
        slug: technologySlug(name),
        name,
        icon: current ? undefined : '',
        sort_order: index + 1,
      };
    });
    const operations: PromiseLike<{ error: unknown }>[] = [];
    if (staleIds.length > 0) operations.push(supabase.from('technologies').delete().in('id', staleIds));
    if (records.length > 0) operations.push(supabase.from('technologies').upsert(records));
    const results = await Promise.all(operations);
    const failed = results.find((result) => result.error);
    if (failed?.error) throw new Error(`Could not synchronize technologies: ${errorMessage(failed.error)}`);
  }

  async function refreshTable(table: string) {
    if (!supabase) return;
    if (table === 'skill_groups') {
      const [skillsResult, technologiesResult] = await Promise.all([
        supabase.from('skill_groups').select('*').order('sort_order'),
        supabase.from('technologies').select('*').order('sort_order'),
      ]);
      if (skillsResult.error) throw skillsResult.error;
      if (technologiesResult.error) throw technologiesResult.error;
      setSkills(skillsResult.data ?? []);
      setTechnologies(technologiesResult.data ?? []);
      return;
    }
    const result = await supabase.from(table).select('*').order('sort_order');
    if (result.error) throw result.error;
    if (table === 'experiences') setExperiences(result.data ?? []);
    if (table === 'projects') setProjects(result.data ?? []);
    if (table === 'education') setEducation(result.data ?? []);
    if (table === 'project_categories') setCategories(result.data ?? []);
    if (table === 'technologies') setTechnologies(result.data ?? []);
    if (table === 'certificates') {
      setCertificates((result.data ?? []).map((certificate) => ({ ...certificate, issue_date: certificate.issue_date ?? '' })));
    }
  }

  async function deleteRow(table: string, id: number) {
    if (!supabase || !confirm('Delete this item?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert(error.message); else { flash('Deleted'); load(); }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <Link to="/" className="admin-back">← Portfolio</Link>
          <h1>Supabase not connected</h1>
          <div className="admin-setup">
            <p>Add your credentials to <code>.env</code> and rebuild:</p>
            <pre>VITE_SUPABASE_URL=https://xxxx.supabase.co{'\n'}VITE_SUPABASE_ANON_KEY=eyJ...</pre>
          </div>
        </div>
      </div>
    );
  }
  if (!ready) return <div className="admin-page"><div className="admin-card"><p>Loading…</p></div></div>;

  const up = (key: keyof Profile) => (v: string) => setProfile((s) => ({ ...s, [key]: v }));

  return (
    <div className="admin-page admin-wide">
      <header className="admin-top">
        <div className="admin-brand">
          <Link to="/" className="admin-back">← Portfolio</Link>
          <span>ADMIN WORKSPACE</span>
        </div>
        <nav aria-label="Admin sections">
          {([
            ['profile', 'Profile'],
            ['experiences', 'Experience'],
            ['projects', 'Projects'],
            ['skills', 'Skills'],
            ['education', 'Education'],
            ['categories', 'Categories'],
            ['technologies', 'Technologies'],
            ['certificates', 'Certificates'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button key={key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{label}</button>
          ))}
        </nav>
        <button className="link-btn" onClick={async () => { await supabase?.auth.signOut(); navigate('/admin'); }}>Sign out</button>
      </header>
      {saved && <div className="admin-saved">{saved}</div>}
      {loadError && (
        <div className="admin-error admin-operation-error" role="alert">
          Could not load dashboard data: {loadError}
          <button className="link-btn" onClick={() => void load()}>Try again</button>
        </div>
      )}

      {tab === 'profile' && (
        <section className="admin-section">
          <h2>Profile / الملف الشخصي</h2>
          <ImagePicker value={profile.photo_url} folder="avatar" onChange={up('photo_url')} />
          <div className="af-grid">
            <Field label="Name (EN)" value={profile.name_en} onChange={up('name_en')} />
            <Field label="الاسم (عربي)" value={profile.name_ar} onChange={up('name_ar')} />
            <Field label="Job title (EN)" value={profile.role_en} onChange={up('role_en')} />
            <Field label="المسمى الوظيفي (عربي)" value={profile.role_ar} onChange={up('role_ar')} />
            <Field label="Statement (EN) — two lines" value={profile.statement_en} onChange={up('statement_en')} textarea />
            <Field label="الجملة التعريفية (عربي)" value={profile.statement_ar} onChange={up('statement_ar')} textarea />
            <Field label="Intro (EN)" value={profile.intro_en} onChange={up('intro_en')} textarea />
            <Field label="نبذة قصيرة (عربي)" value={profile.intro_ar} onChange={up('intro_ar')} textarea />
            <Field label="About (EN)" value={profile.about_en} onChange={up('about_en')} textarea />
            <Field label="نبذة عني (عربي)" value={profile.about_ar} onChange={up('about_ar')} textarea />
            <Field label="Location (EN)" value={profile.location_en} onChange={up('location_en')} />
            <Field label="الموقع (عربي)" value={profile.location_ar} onChange={up('location_ar')} />
            <Field label="Availability (EN)" value={profile.available_en} onChange={up('available_en')} />
            <Field label="حالة التوفر (عربي)" value={profile.available_ar} onChange={up('available_ar')} />
            <Field label="Email" value={profile.email} onChange={up('email')} />
            <Field label="Phone" value={profile.phone} onChange={up('phone')} />
            <Field label="GitHub URL" value={profile.github} onChange={up('github')} />
            <Field label="LinkedIn URL" value={profile.linkedin} onChange={up('linkedin')} />
            <Field label="Years label (e.g. 2024 — 2026)" value={profile.years_label} onChange={up('years_label')} />
          </div>
          <button className="primary-action" disabled={saving} onClick={saveProfile}>{saving ? 'Saving…' : 'Save profile'}<span aria-hidden="true">↘</span></button>
        </section>
      )}

      {tab === 'experiences' && (
        <CollectionEditor<Experience>
          title="Experience / الخبرات"
          rows={experiences}
          makeNew={() => ({ date_en: '', date_ar: '', company_en: '', company_ar: '', role_en: '', role_ar: '', body_en: '', body_ar: '', sort_order: experiences.length + 1 })}
          onSave={(r) => saveRow('experiences', r as unknown as Record<string, unknown>)}
          onDelete={(id) => deleteRow('experiences', id)}
          render={(row, set) => (
            <div className="af-grid">
              <Field label="Date (EN)" value={row.date_en} onChange={set('date_en')} />
              <Field label="التاريخ (عربي)" value={row.date_ar} onChange={set('date_ar')} />
              <Field label="Company (EN)" value={row.company_en} onChange={set('company_en')} />
              <Field label="الجهة (عربي)" value={row.company_ar} onChange={set('company_ar')} />
              <Field label="Role (EN)" value={row.role_en} onChange={set('role_en')} />
              <Field label="الدور (عربي)" value={row.role_ar} onChange={set('role_ar')} />
              <Field label="Description (EN)" value={row.body_en} onChange={set('body_en')} textarea />
              <Field label="الوصف (عربي)" value={row.body_ar} onChange={set('body_ar')} textarea />
              <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
            </div>
          )}
          afterSave={(rows) => setExperiences(rows)}
          table="experiences"
        />
      )}

      {tab === 'projects' && (
        <CollectionEditor<Project>
          title="Projects / المشاريع"
          rows={projects}
          makeNew={() => ({ name: '', year: String(new Date().getFullYear()), category: 'fullstack', headline_en: '', headline_ar: '', summary_en: '', summary_ar: '', tags: [], demo_url: '', code_url: '', image_url: '', sort_order: projects.length + 1 })}
          onSave={(r) => saveRow('projects', r as unknown as Record<string, unknown>)}
          onDelete={(id) => deleteRow('projects', id)}
          render={(row, set) => (
            <>
              <ImagePicker value={row.image_url} folder="projects" onChange={set('image_url')} />
              <div className="af-grid">
                <Field label="Name" value={row.name} onChange={set('name')} />
                <Field label="Year" value={row.year} onChange={set('year')} />
                <label className="af">
                  <span>Category</span>
                  <select value={row.category} onChange={(e) => set('category')(e.target.value)}>
                    {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name_en}</option>)}
                  </select>
                </label>
                <Field label="Tags (comma separated)" value={row.tags.join(', ')} onChange={(v) => set('tags')(v)} />
                <Field label="Headline (EN)" value={row.headline_en} onChange={set('headline_en')} />
                <Field label="العنوان (عربي)" value={row.headline_ar} onChange={set('headline_ar')} />
                <Field label="Summary (EN)" value={row.summary_en} onChange={set('summary_en')} textarea />
                <Field label="الوصف (عربي)" value={row.summary_ar} onChange={set('summary_ar')} textarea />
                <Field label="Live demo URL" value={row.demo_url} onChange={set('demo_url')} />
                <Field label="Source code URL" value={row.code_url} onChange={set('code_url')} />
                <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
              </div>
            </>
          )}

          afterSave={(rows) => setProjects(rows)}
          table="projects"
        />
      )}

      {tab === 'categories' && (
        <CollectionEditor<ProjectCategoryOption>
          title="Project categories"
          rows={categories}
          makeNew={() => ({ slug: '', name_en: '', name_ar: '', sort_order: categories.length + 1 })}
          onSave={(row) => saveRow('project_categories', row as unknown as Record<string, unknown>)}
          onDelete={(id) => deleteRow('project_categories', id)}
          render={(row, set) => (
            <div className="af-grid">
              <Field label="Slug" value={row.slug} onChange={set('slug')} />
              <Field label="Name (EN)" value={row.name_en} onChange={set('name_en')} />
              <Field label="الاسم (عربي)" value={row.name_ar} onChange={set('name_ar')} />
              <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
            </div>
          )}
          afterSave={setCategories}
          table="project_categories"
        />
      )}

      {tab === 'technologies' && (
        <CollectionEditor<Technology>
          title="Technologies"
          rows={technologies}
          makeNew={() => ({ slug: '', name: '', icon: '', sort_order: technologies.length + 1 })}
          onSave={(row) => saveRow('technologies', row as unknown as Record<string, unknown>)}
          onDelete={(id) => deleteRow('technologies', id)}
          render={(row, set) => (
            <div className="af-grid">
              <div className="af">
                <span>Name</span>
                <strong>{row.name}</strong>
              </div>
              <div className="af">
                <span>Icon</span>
                <strong>Detected automatically from the technology name</strong>
              </div>
              <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
            </div>
          )}
          afterSave={setTechnologies}
          table="technologies"
          allowAdd={false}
        />
      )}

      {tab === 'certificates' && (
        <CollectionEditor<Certificate>
          title="Certificates"
          rows={certificates}
          makeNew={() => ({ title: '', issuer: '', issue_date: '', image_url: '', verification_url: '', is_published: false, sort_order: certificates.length + 1 })}
          onSave={(row) => saveRow('certificates', row as unknown as Record<string, unknown>)}
          onDelete={(id) => deleteRow('certificates', id)}
          render={(row, set) => (
            <div className="af-grid">
              <Field label="Title" value={row.title} onChange={set('title')} />
              <Field label="Issuer" value={row.issuer} onChange={set('issuer')} />
              <Field label="Issue year" value={row.issue_date} onChange={set('issue_date')} />
              <ImagePicker value={row.image_url} folder="certificates" onChange={set('image_url')} />
              <Field label="Verification URL" value={row.verification_url} onChange={set('verification_url')} />
              <label className="af">
                <span>Published</span>
                <input type="checkbox" checked={row.is_published} onChange={(event) => set('is_published')(String(event.target.checked))} />
              </label>
              <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
            </div>
          )}
          afterSave={setCertificates}
          table="certificates"
        />
      )}

      {tab === 'skills' && (
        <CollectionEditor<SkillGroup>
          title="Skill groups / المهارات"
          rows={skills}
          makeNew={() => ({ title_en: '', title_ar: '', items_en: '', items_ar: '', sort_order: skills.length + 1 })}
          onSave={(r) => saveRow('skill_groups', r as unknown as Record<string, unknown>)}
          onDelete={(id) => deleteRow('skill_groups', id)}
          render={(row, set) => (
            <div className="af-grid">
              <Field label="Title (EN)" value={row.title_en} onChange={set('title_en')} />
              <Field label="العنوان (عربي)" value={row.title_ar} onChange={set('title_ar')} />
              <Field label="Items (EN)" value={row.items_en} onChange={set('items_en')} />
              <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
            </div>
          )}
          afterSave={(rows) => setSkills(rows)}
          table="skill_groups"
        />
      )}

      {tab === 'education' && (
        <CollectionEditor<Education>
          title="Education & courses / التعليم"
          rows={education}
          makeNew={() => ({ kind: 'course', title_en: '', title_ar: '', org_en: '', org_ar: '', date_en: '', date_ar: '', details_en: '', details_ar: '', sort_order: education.length + 1 })}
          onSave={(r) => saveRow('education', r as unknown as Record<string, unknown>)}
          onDelete={(id) => deleteRow('education', id)}
          render={(row, set) => (
            <div className="af-grid">
              <label className="af">
                <span>Kind</span>
                <select value={row.kind} onChange={(e) => set('kind')(e.target.value)}>
                  <option value="degree">degree</option>
                  <option value="course">course</option>
                </select>
              </label>
              <Field label="Title (EN)" value={row.title_en} onChange={set('title_en')} />
              <Field label="العنوان (عربي)" value={row.title_ar} onChange={set('title_ar')} />
              <Field label="Organization (EN)" value={row.org_en} onChange={set('org_en')} />
              <Field label="الجهة (عربي)" value={row.org_ar} onChange={set('org_ar')} />
              <Field label="Date (EN)" value={row.date_en} onChange={set('date_en')} />
              <Field label="التاريخ (عربي)" value={row.date_ar} onChange={set('date_ar')} />
              <Field label="Details (EN)" value={row.details_en} onChange={set('details_en')} />
              <Field label="تفاصيل (عربي)" value={row.details_ar} onChange={set('details_ar')} />
              <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
            </div>
          )}
          afterSave={(rows) => setEducation(rows)}
          table="education"
        />
      )}
    </div>
  );
}

/* ---------- generic collection editor ---------- */

function CollectionEditor<T extends { id?: number; sort_order: number }>(props: {
  title: string;
  rows: T[];
  table: string;
  makeNew: () => T;
  onSave: (row: T) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  render: (row: T, set: (key: keyof T) => (v: string) => void) => React.ReactNode;
  afterSave: (rows: T[]) => void;
  allowAdd?: boolean;
}) {
  const [editing, setEditing] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);

  const startEdit = (row: T) => { setEditing({ ...row }); setIsNew(false); };
  const startNew = () => { setEditing(props.makeNew()); setIsNew(true); };

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2>{props.title}</h2>
        {props.allowAdd !== false && <button className="text-action" onClick={startNew}>+ Add new</button>}
      </div>

      {editing && (
        <div className="editor-box">
          {props.render(editing, (key) => (v) => {
            let value: unknown = v;
            if (key === 'sort_order') value = Number(v) || 0;
            if (key === 'is_published') value = v === 'true';
            const arr = (editing as unknown as Record<string, unknown>)[key as string];
            if (Array.isArray(arr)) value = v.split(',').map((s) => s.trim()).filter(Boolean);
            setEditing({ ...editing, [key]: value });
          })}
          <div className="editor-actions">
            <button
              className="primary-action"
              onClick={async () => {
                await props.onSave(editing);
                setEditing(null);
              }}
            >
              {isNew ? 'Create' : 'Save'}<span aria-hidden="true">↘</span>
            </button>
            <button className="link-btn" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <ul className="row-list">
        {props.rows.map((row) => {
          const label =
            (row as unknown as { name?: string }).name ||
            (row as unknown as { company_en?: string }).company_en ||
            (row as unknown as { title?: string }).title ||
            (row as unknown as { title_en?: string }).title_en ||
            '#' + row.id;
          return (
            <li key={row.id}>
              <span>{label}</span>
              <div>
                <button className="link-btn" onClick={() => startEdit(row)}>Edit</button>
                {row.id != null && <button className="link-btn danger" onClick={() => props.onDelete(row.id!)}>Delete</button>}
              </div>
            </li>
          );
        })}
        {props.rows.length === 0 && <li className="row-empty">Nothing here yet — click “Add new”.</li>}
      </ul>
    </section>
  );
}
