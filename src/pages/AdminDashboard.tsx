import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase, isSupabaseConfigured, STORAGE_BUCKET, isAdminEmail } from '../lib/supabase';
import { defaultData } from '../default-content';
import type { Profile, Experience, Project, SkillGroup, Education, ProjectCategoryOption, Technology, Certificate, Testimonial } from '../types';

type Tab =
  | 'profile'
  | 'projects'
  | 'categories'
  | 'technologies'
  | 'certificates'
  | 'testimonials'
  | 'experiences'
  | 'skills'
  | 'education'
  | 'settings';

/* ---------- form helpers ---------- */

function Field({ label, value, onChange, textarea, placeholder }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string }) {
  return (
    <label className="af">
      <span>{label}</span>
      {textarea
        ? <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        : <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
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

/* ---------- Image Upload & Optimization Pipeline (PHASE 4) ---------- */

async function optimizeImage(file: File): Promise<{ blob: Blob; originalSize: number; optimizedSize: number }> {
  // If it's already a small WebP (< 500KB), don't degrade it further
  if (file.type === 'image/webp' && file.size < 500 * 1024) {
    return { blob: file, originalSize: file.size, optimizedSize: file.size };
  }

  const image = await createImageBitmap(file);
  const maxDimension = 1920;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not initialize canvas context for optimization.');

  // Render with high quality smoothing
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', 0.85);
  });
  if (!blob) throw new Error('Could not optimize image to WebP.');

  return { blob, originalSize: file.size, optimizedSize: blob.size };
}

async function uploadImage(file: File, folder: string, onProgress?: (status: string) => void): Promise<string> {
  if (!supabase) throw new Error('Supabase client is not configured.');
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) throw new Error('Unsupported format. Please upload JPG, PNG, or WebP.');
  if (file.size > 12 * 1024 * 1024) throw new Error('File exceeds 12 MB maximum limit.');

  onProgress?.('Optimizing image (WebP)…');
  const { blob, originalSize, optimizedSize } = await optimizeImage(file);

  const savedPercent = Math.round(((originalSize - optimizedSize) / originalSize) * 100);
  onProgress?.(`Uploading WebP (${savedPercent > 0 ? `-${savedPercent}%` : 'ready'})…`);

  const path = `${folder}/${Date.now()}.webp`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: 'image/webp',
    cacheControl: '3600',
  });
  if (error) throw error;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ---------- ImagePicker: Raw URLs completely hidden (PHASE 4) ---------- */

function ImagePicker({ value, folder, onChange }: { value: string; folder: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Extract a readable file identifier from the URL
  const displayName = value
    ? value.split('/').pop()?.split('?')[0] || 'Optimized asset'
    : '';

  return (
    <div className="af image-picker-card">
      <span className="image-picker-label">Media Asset</span>
      <div className="image-picker-body">
        <div className="image-preview-wrapper">
          {value ? (
            <img src={value} alt="Preview" className="image-preview-thumb" />
          ) : (
            <div className="image-empty-placeholder">
              <span className="placeholder-icon">📷</span>
              <span className="placeholder-text">No image selected</span>
            </div>
          )}
        </div>

        <div className="image-actions-wrapper">
          {value ? (
            <div className="image-status-bar">
              <span className="image-status-indicator">● Active Asset</span>
              <span className="image-filename" title={displayName}>{displayName}</span>
            </div>
          ) : (
            <span className="image-status-hint">JPEG, PNG, or WebP up to 10MB</span>
          )}

          {busy && (
            <div className="image-upload-progress">
              <span className="spinner" />
              <span>{statusText || 'Processing…'}</span>
            </div>
          )}

          {uploadError && (
            <div className="image-upload-error" role="alert">
              {uploadError}
            </div>
          )}

          <div className="image-buttons-row">
            <label className="primary-action image-upload-btn">
              {busy ? 'Uploading…' : value ? 'Replace image' : 'Choose image'}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={busy}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setBusy(true);
                  setUploadError('');
                  try {
                    const newUrl = await uploadImage(f, folder, setStatusText);
                    onChange(newUrl);
                  } catch (err) {
                    setUploadError(err instanceof Error ? err.message : String(err));
                  } finally {
                    setBusy(false);
                    setStatusText('');
                    e.target.value = '';
                  }
                }}
              />
            </label>

            {value && (
              <button
                type="button"
                className="text-action image-remove-btn"
                onClick={() => {
                  if (confirm('Remove this image?')) onChange('');
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Admin Dashboard with Persistent Sidebar (PHASE 1) ---------- */

export function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [loadError, setLoadError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUserEmail, setAdminUserEmail] = useState('');

  const [profile, setProfile] = useState<Profile>(defaultData.profile);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [categories, setCategories] = useState<ProjectCategoryOption[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, boolean>>({
    testimonials_button_visible: true,
    section_work_visible: true,
    section_about_visible: true,
    section_experience_visible: true,
    section_certificates_visible: true,
    section_testimonials_visible: true,
  });

  const flash = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(''), 3000); };

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoadError('');
    const client = supabase;
    const [pr, ex, pj, sk, ed, ca, te, ce, tm, st] = await Promise.all([
      client.from('profile').select('*').eq('id', 1).maybeSingle(),
      client.from('experiences').select('*').order('sort_order'),
      client.from('projects').select('*').order('sort_order'),
      client.from('skill_groups').select('*').order('sort_order'),
      client.from('education').select('*').order('sort_order'),
      client.from('project_categories').select('*').order('sort_order'),
      client.from('technologies').select('*').order('sort_order'),
      client.from('certificates').select('*').order('sort_order'),
      client.from('testimonials').select('*').order('created_at', { ascending: false }),
      client.from('site_settings').select('key,value'),
    ]);

    const error = pr.error || ex.error || pj.error || sk.error || ed.error || ca.error || te.error || ce.error || tm.error;
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
    setTestimonials(tm.data ?? []);

    const parsed: Record<string, boolean> = {
      testimonials_button_visible: true,
      section_work_visible: true,
      section_about_visible: true,
      section_experience_visible: true,
      section_certificates_visible: true,
      section_testimonials_visible: true,
    };
    st.data?.forEach((row) => {
      parsed[row.key] = row.value === 'true';
    });
    setSiteSettings(parsed);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    client.auth.getSession().then(async ({ data }) => {
      if (!data.session || !isAdminEmail(data.session.user.email)) {
        if (data.session) await client.auth.signOut();
        navigate('/admin', { replace: true });
      } else {
        setAdminUserEmail(data.session.user.email || 'Admin');
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
      supabase.from('skill_groups').select('items_en,items_ar').order('sort_order'),
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

    const staleIds = (existing ?? []).map((t) => t.id).filter((id) => !matchedIds.has(id));
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
    const result = await supabase.from(table).select('*').order(table === 'testimonials' ? 'created_at' : 'sort_order', { ascending: table !== 'testimonials' });
    if (result.error) throw result.error;
    if (table === 'experiences') setExperiences(result.data ?? []);
    if (table === 'projects') setProjects(result.data ?? []);
    if (table === 'education') setEducation(result.data ?? []);
    if (table === 'project_categories') setCategories(result.data ?? []);
    if (table === 'technologies') setTechnologies(result.data ?? []);
    if (table === 'certificates') {
      setCertificates((result.data ?? []).map((c) => ({ ...c, issue_date: c.issue_date ?? '' })));
    }
    if (table === 'testimonials') setTestimonials(result.data ?? []);
  }

  async function deleteRow(table: string, id: number) {
    if (!supabase || !confirm('Delete this item permanently?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert(error.message); else { flash('Deleted'); load(); }
  }

  /* Testimonials moderation controls */
  async function setTestimonialStatus(id: number, status: 'approved' | 'rejected' | 'pending') {
    if (!supabase) return;
    const { error } = await supabase.from('testimonials').update({ status }).eq('id', id);
    if (error) alert(error.message);
    else {
      flash(`Testimonial ${status} ✓`);
      refreshTable('testimonials');
    }
  }

  async function toggleSetting(key: string, value: boolean) {
    if (!supabase) return;
    setSiteSettings((prev) => ({ ...prev, [key]: value }));
    const { error } = await supabase.from('site_settings').upsert({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    });
    if (error) {
      alert(`Could not save setting: ${error.message}`);
      setSiteSettings((prev) => ({ ...prev, [key]: !value }));
    } else {
      flash('Setting updated ✓');
    }
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
  if (!ready) return <div className="admin-page"><div className="admin-card"><p>Authenticating admin workspace…</p></div></div>;

  const up = (key: keyof Profile) => (v: string) => setProfile((s) => ({ ...s, [key]: v }));

  const navGroups: { label: string; items: { key: Tab; title: string; count?: number; icon: string }[] }[] = [
    {
      label: 'Core Portfolio',
      items: [
        { key: 'profile', title: 'Profile Info', icon: '👤' },
        { key: 'projects', title: 'Projects', count: projects.length, icon: '💼' },
        { key: 'categories', title: 'Categories', count: categories.length, icon: '🏷️' },
        { key: 'technologies', title: 'Tech Stack', count: technologies.length, icon: '⚡' },
      ],
    },
    {
      label: 'Showcase & Social Proof',
      items: [
        { key: 'certificates', title: 'Certificates', count: certificates.length, icon: '🎓' },
        {
          key: 'testimonials',
          title: 'Client Reviews',
          count: testimonials.filter((t) => t.status === 'pending').length || testimonials.length,
          icon: '💬',
        },
      ],
    },
    {
      label: 'Experience & Background',
      items: [
        { key: 'experiences', title: 'Work Experience', count: experiences.length, icon: '⏳' },
        { key: 'skills', title: 'Skill Groups', count: skills.length, icon: '🛠️' },
        { key: 'education', title: 'Education & Courses', count: education.length, icon: '🏛️' },
      ],
    },
    {
      label: 'System & Configuration',
      items: [
        { key: 'settings', title: 'Site Settings', icon: '⚙️' },
      ],
    },
  ];

  return (
    <div className="admin-shell">
      {/* Mobile topbar */}
      <div className="admin-mobile-bar">
        <button className="admin-burger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation">
          ☰
        </button>
        <span className="admin-mobile-title">Taha Portfolio Admin</span>
        <Link to="/" className="admin-exit-link">Exit ↗</Link>
      </div>

      {/* Persistent Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-back-btn">← Public Portfolio</Link>
          <div className="admin-brand-box">
            <span className="admin-badge-dot" />
            <h1 className="admin-brand-title">Control Center</h1>
          </div>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Administrative Navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="admin-nav-group">
              <span className="admin-group-label">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  className={`admin-nav-item ${tab === item.key ? 'is-active' : ''}`}
                  onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                >
                  <span className="nav-item-icon" aria-hidden="true">{item.icon}</span>
                  <span className="nav-item-title">{item.title}</span>
                  {item.count != null && (
                    <span className={`nav-item-count ${item.key === 'testimonials' && testimonials.some((t) => t.status === 'pending') ? 'count-pending' : ''}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill" title={adminUserEmail}>
            <span className="admin-avatar">TA</span>
            <span className="admin-email-text">{adminUserEmail}</span>
          </div>
          <button
            className="admin-signout-btn"
            onClick={async () => {
              await supabase?.auth.signOut();
              navigate('/admin');
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-stage">
        <header className="admin-stage-header">
          <div>
            <h2 className="admin-stage-title">
              {navGroups.flatMap((g) => g.items).find((i) => i.key === tab)?.title}
            </h2>
            <span className="admin-stage-sub">Database Synchronized with Supabase</span>
          </div>
          {saved && <div className="admin-saved-toast">{saved}</div>}
        </header>

        {loadError && (
          <div className="admin-error-banner" role="alert">
            <span>Could not load data: {loadError}</span>
            <button className="link-btn" onClick={() => void load()}>Retry</button>
          </div>
        )}

        <div className="admin-stage-body">
          {tab === 'profile' && (
            <section className="admin-panel">
              <div className="admin-panel-head">
                <h3>Bio & Profile Details</h3>
                <button className="primary-action" disabled={saving} onClick={saveProfile}>
                  {saving ? 'Saving…' : 'Save Changes'} <span aria-hidden="true">✓</span>
                </button>
              </div>

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
                <Field label="About me (EN)" value={profile.about_en} onChange={up('about_en')} textarea />
                <Field label="عني (عربي)" value={profile.about_ar} onChange={up('about_ar')} textarea />
                <Field label="Location (EN)" value={profile.location_en} onChange={up('location_en')} />
                <Field label="الموقع (عربي)" value={profile.location_ar} onChange={up('location_ar')} />
                <Field label="Availability (EN)" value={profile.available_en} onChange={up('available_en')} />
                <Field label="حالة التوفر (عربي)" value={profile.available_ar} onChange={up('available_ar')} />
                <Field label="Years in footer" value={profile.years_label} onChange={up('years_label')} />
                <Field label="Email" value={profile.email} onChange={up('email')} />
                <Field label="Phone" value={profile.phone} onChange={up('phone')} />
                <Field label="GitHub URL" value={profile.github} onChange={up('github')} />
                <Field label="LinkedIn URL" value={profile.linkedin} onChange={up('linkedin')} />
              </div>
            </section>
          )}

          {tab === 'projects' && (
            <CollectionEditor<Project>
              title="Projects / المشاريع"
              rows={projects}
              makeNew={() => ({
                name: '', year: '2026', category: 'fullstack', headline_en: '', headline_ar: '',
                summary_en: '', summary_ar: '', tags: ['React', 'TypeScript'], demo_url: '', code_url: '', image_url: '', sort_order: projects.length + 1,
              })}
              onSave={(r) => saveRow('projects', r as unknown as Record<string, unknown>)}
              onDelete={(id) => deleteRow('projects', id)}
              render={(row, set) => (
                <div className="af-grid">
                  <Field label="Name" value={row.name} onChange={set('name')} />
                  <Field label="Year" value={row.year} onChange={set('year')} />
                  <label className="af">
                    <span>Category</span>
                    <select value={row.category} onChange={(e) => set('category')(e.target.value)}>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name_en} / {c.name_ar}</option>
                      ))}
                    </select>
                  </label>
                  <Field label="Headline (EN)" value={row.headline_en} onChange={set('headline_en')} />
                  <Field label="العنوان التسويقي (عربي)" value={row.headline_ar} onChange={set('headline_ar')} />
                  <Field label="Summary (EN)" value={row.summary_en} onChange={set('summary_en')} textarea />
                  <Field label="الوصف الكامل (عربي)" value={row.summary_ar} onChange={set('summary_ar')} textarea />
                  <Field label="Tags / Technologies (comma separated)" value={row.tags.join(', ')} onChange={set('tags')} />
                  <Field label="Live demo URL" value={row.demo_url} onChange={set('demo_url')} />
                  <Field label="Code repository URL" value={row.code_url} onChange={set('code_url')} />
                  <ImagePicker value={row.image_url} folder="projects" onChange={set('image_url')} />
                  <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
                </div>
              )}
              afterSave={(rows) => setProjects(rows)}
              table="projects"
            />
          )}

          {tab === 'categories' && (
            <CollectionEditor<ProjectCategoryOption>
              title="Project Categories"
              rows={categories}
              makeNew={() => ({ slug: '', name_en: '', name_ar: '', sort_order: categories.length + 1 })}
              onSave={(row) => saveRow('project_categories', row as unknown as Record<string, unknown>)}
              onDelete={(id) => deleteRow('project_categories', id)}
              render={(row, set) => (
                <div className="af-grid">
                  <Field label="Category key / slug" value={row.slug} onChange={set('slug')} />
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
                    <span>Icon Status</span>
                    <strong>Detected automatically from official tech libraries</strong>
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
              title="Certificates & Credentials (PHASE 6)"
              rows={certificates}
              makeNew={() => ({
                title: '', issuer: '', issue_date: '2026', image_url: '', verification_url: '',
                is_published: true, sort_order: certificates.length + 1,
              })}
              onSave={(row) => saveRow('certificates', row as unknown as Record<string, unknown>)}
              onDelete={(id) => deleteRow('certificates', id)}
              render={(row, set) => (
                <div className="af-grid">
                  <Field label="Title" value={row.title} onChange={set('title')} />
                  <Field label="Issuer" value={row.issuer} onChange={set('issuer')} />
                  <Field label="Issue Date / Year" value={row.issue_date} onChange={set('issue_date')} />
                  <ImagePicker value={row.image_url} folder="certificates" onChange={set('image_url')} />
                  <Field label="Verification URL" value={row.verification_url} onChange={set('verification_url')} />
                  <label className="af af-checkbox">
                    <input type="checkbox" checked={row.is_published} onChange={(e) => set('is_published')(String(e.target.checked))} />
                    <span>Published publicly in marquee</span>
                  </label>
                  <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
                </div>
              )}
              afterSave={setCertificates}
              table="certificates"
            />
          )}

          {tab === 'testimonials' && (
            <section className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h3>Client Feedback & Moderation (PHASE 3)</h3>
                  <span className="admin-panel-sub">Review visitor feedback, approve, or reject submissions</span>
                </div>
                <div className="visibility-toggle-box">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={siteSettings.testimonials_button_visible ?? true}
                      onChange={(e) => toggleSetting('testimonials_button_visible', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span>"Share Feedback" Button: <strong>{siteSettings.testimonials_button_visible !== false ? 'Visible' : 'Hidden'}</strong></span>
                </div>
              </div>

              <div className="testimonials-admin-list">
                {testimonials.map((item) => (
                  <div key={item.id} className={`testimonial-admin-card status-${item.status}`}>
                    <div className="testimonial-admin-top">
                      <div className="testimonial-admin-client">
                        <h4>{item.client_name}</h4>
                        <span className="testimonial-client-meta">
                          {[item.client_role, item.client_company].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                      <div className="testimonial-admin-badges">
                        <span className="rating-pill">{'★'.repeat(item.rating || 5)}</span>
                        <span className={`status-badge badge-${item.status}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="testimonial-admin-body">“{item.content}”</p>

                    <div className="testimonial-admin-actions">
                      {item.status !== 'approved' && (
                        <button
                          className="primary-action btn-sm btn-approve"
                          onClick={() => setTestimonialStatus(item.id!, 'approved')}
                        >
                          Approve ✓
                        </button>
                      )}
                      {item.status !== 'rejected' && (
                        <button
                          className="text-action btn-sm btn-reject"
                          onClick={() => setTestimonialStatus(item.id!, 'rejected')}
                        >
                          Reject ✕
                        </button>
                      )}
                      <button
                        className="text-action btn-sm btn-danger"
                        onClick={() => deleteRow('testimonials', item.id!)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {testimonials.length === 0 && (
                  <div className="admin-empty-state">
                    <p>No testimonials received yet. When visitors submit reviews, they will appear here pending moderation.</p>
                  </div>
                )}
              </div>
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
                  <Field label="Dates (EN)" value={row.date_en} onChange={set('date_en')} />
                  <Field label="التواريخ (عربي)" value={row.date_ar} onChange={set('date_ar')} />
                  <Field label="Company (EN)" value={row.company_en} onChange={set('company_en')} />
                  <Field label="الشركة أو الجهة (عربي)" value={row.company_ar} onChange={set('company_ar')} />
                  <Field label="Role (EN)" value={row.role_en} onChange={set('role_en')} />
                  <Field label="المسمى (عربي)" value={row.role_ar} onChange={set('role_ar')} />
                  <Field label="Description (EN)" value={row.body_en} onChange={set('body_en')} textarea />
                  <Field label="الوصف (عربي)" value={row.body_ar} onChange={set('body_ar')} textarea />
                  <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
                </div>
              )}
              afterSave={(rows) => setExperiences(rows)}
              table="experiences"
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

          {tab === 'settings' && (
            <section className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h3>Global Portfolio Settings</h3>
                  <span className="admin-panel-sub">Manage live portfolio visibility and interactive section toggles</span>
                </div>
              </div>
              <div className="settings-card">
                <div className="setting-row">
                  <div>
                    <h4>Visitor "Share Feedback" Button</h4>
                    <p className="setting-description">Show or hide the public button allowing clients and visitors to open the testimonial submission modal.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={siteSettings.testimonials_button_visible !== false}
                      onChange={(e) => toggleSetting('testimonials_button_visible', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="setting-divider" />

                <div className="setting-row">
                  <div>
                    <h4>Selected Work / Projects Section</h4>
                    <p className="setting-description">Controls visibility of the interactive projects catalog on the live portfolio.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={siteSettings.section_work_visible !== false}
                      onChange={(e) => toggleSetting('section_work_visible', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <h4>About & Skills Section</h4>
                    <p className="setting-description">Controls visibility of the statement, skills breakdown, and technical profile.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={siteSettings.section_about_visible !== false}
                      onChange={(e) => toggleSetting('section_about_visible', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <h4>Career Experience Section</h4>
                    <p className="setting-description">Controls visibility of the chronological career timeline and roles.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={siteSettings.section_experience_visible !== false}
                      onChange={(e) => toggleSetting('section_experience_visible', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <h4>Certificates Continuous Marquee Section</h4>
                    <p className="setting-description">Controls visibility of the automated right-to-left credentials carousel.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={siteSettings.section_certificates_visible !== false}
                      onChange={(e) => toggleSetting('section_certificates_visible', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <h4>Client Testimonials Section</h4>
                    <p className="setting-description">Controls visibility of the entire client reviews section on the live portfolio.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={siteSettings.section_testimonials_visible !== false}
                      onChange={(e) => toggleSetting('section_testimonials_visible', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- Generic Collection Editor ---------- */

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
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>{props.title}</h3>
        {props.allowAdd !== false && (
          <button className="primary-action btn-sm" onClick={startNew}>
            + Add New Record
          </button>
        )}
      </div>

      {editing && (
        <div className="admin-editor-drawer">
          <div className="editor-drawer-head">
            <h4>{isNew ? 'Create New Entry' : 'Edit Entry'}</h4>
            <button className="text-action btn-sm" onClick={() => setEditing(null)}>Close ✕</button>
          </div>
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
              {isNew ? 'Create Record' : 'Save Changes'} <span aria-hidden="true">✓</span>
            </button>
            <button className="text-action" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <ul className="admin-row-list">
        {props.rows.map((row) => {
          const label =
            (row as unknown as { name?: string }).name ||
            (row as unknown as { company_en?: string }).company_en ||
            (row as unknown as { title?: string }).title ||
            (row as unknown as { title_en?: string }).title_en ||
            '#' + row.id;
          return (
            <li key={row.id} className="admin-row-item">
              <span className="admin-row-title">{label}</span>
              <div className="admin-row-actions">
                <button className="text-action btn-sm" onClick={() => startEdit(row)}>Edit</button>
                {row.id != null && (
                  <button className="text-action btn-sm btn-danger" onClick={() => props.onDelete(row.id!)}>
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
        {props.rows.length === 0 && <li className="admin-row-empty">No records yet — click “+ Add New Record”.</li>}
      </ul>
    </section>
  );
}
