import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '../lib/supabase';
import { defaultData } from '../default-content';
import type { Profile, Experience, Project, SkillGroup, Education } from '../types';

type Tab = 'profile' | 'experiences' | 'projects' | 'skills' | 'education';

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

async function uploadImage(file: File, folder: string): Promise<string> {
  if (!supabase) throw new Error('not configured');
  const ext = file.name.split('.').pop() || 'jpg';
  const path = folder + '/' + Date.now() + '.' + ext;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
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

  const [profile, setProfile] = useState<Profile>(defaultData.profile);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [education, setEducation] = useState<Education[]>([]);

  const flash = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(''), 3000); };

  const load = useCallback(async () => {
    if (!supabase) return;
    const [pr, ex, pj, sk, ed] = await Promise.all([
      supabase.from('profile').select('*').eq('id', 1).maybeSingle(),
      supabase.from('experiences').select('*').order('sort_order'),
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('skill_groups').select('*').order('sort_order'),
      supabase.from('education').select('*').order('sort_order'),
    ]);
    if (pr.data) setProfile({ ...defaultData.profile, ...pr.data });
    setExperiences(ex.data ?? []);
    setProjects(pj.data ?? []);
    setSkills(sk.data ?? []);
    setEducation(ed.data ?? []);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/admin', { replace: true });
      else { setReady(true); load(); }
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
    const { id, ...values } = row;
    const query = id == null
      ? supabase.from(table).insert(values)
      : supabase.from(table).update(values).eq('id', id);
    const { error } = await query;
    setSaving(false);
    if (error) alert(error.message); else { flash('Saved ✓'); load(); }
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
        <Link to="/" className="admin-back">← Portfolio</Link>
        <nav>
          {(['profile', 'experiences', 'projects', 'skills', 'education'] as Tab[]).map((k) => (
            <button key={k} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>{k}</button>
          ))}
        </nav>
        <button className="link-btn" onClick={async () => { await supabase?.auth.signOut(); navigate('/admin'); }}>Sign out</button>
      </header>
      {saved && <div className="admin-saved">{saved}</div>}

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
                    <option value="fullstack">fullstack</option>
                    <option value="frontend">frontend</option>
                    <option value="backend">backend</option>
                    <option value="other">other</option>
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
              <Field label="المهارات (عربي)" value={row.items_ar} onChange={set('items_ar')} />
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
}) {
  const [editing, setEditing] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);

  const startEdit = (row: T) => { setEditing({ ...row }); setIsNew(false); };
  const startNew = () => { setEditing(props.makeNew()); setIsNew(true); };

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2>{props.title}</h2>
        <button className="text-action" onClick={startNew}>+ Add new</button>
      </div>

      {editing && (
        <div className="editor-box">
          {props.render(editing, (key) => (v) => {
            let value: unknown = v;
            if (key === 'sort_order') value = Number(v) || 0;
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
