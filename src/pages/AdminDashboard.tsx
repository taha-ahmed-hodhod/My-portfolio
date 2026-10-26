import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase, isSupabaseConfigured, STORAGE_BUCKET, isAdminEmail } from '../lib/supabase';
import { defaultData } from '../default-content';
import { curatedIcon, isSameTechnology, savedTechnologyIconUrl, technologySlug } from '../lib/technology-icons';
import { TechnologyIconPicker } from '../components/TechnologyIconPicker';
import type { Profile, Experience, Project, SkillGroup, Education, ProjectCategoryOption, Technology, Certificate, Testimonial, Locale } from '../types';
import { AdminSidebar, type AdminTab } from '../components/admin/AdminSidebar';
import { AdminTopBar } from '../components/admin/AdminTopBar';
import { AdminOverviewBento } from '../components/admin/AdminOverviewBento';
import { AdminProfileManager } from '../components/admin/AdminProfileManager';
import { AdminTestimonialsManager } from '../components/admin/AdminTestimonialsManager';
import { AdminSiteSettingsManager } from '../components/admin/AdminSiteSettingsManager';
import { AdminDashboardSkeleton } from '../components/admin/AdminDashboardSkeleton';
import { adminI18n } from '../adminI18n';
import { Plus, Pencil, Trash2, Save, X, SearchX, Check, Upload, Tag } from 'lucide-react';

type Tab = AdminTab;

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

/* ---------- Form Helpers ---------- */

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

function skillTechnologyNames(groups: Array<{ items_en?: string; items_ar?: string }>): string[] {
  return [...new Set(groups
    .flatMap((group) => (group.items_en || '').split(/[·•,،;\n|/]+/))
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

/* ---------- Image Upload & Optimization Pipeline ---------- */

async function optimizeImage(file: File): Promise<{ blob: Blob; originalSize: number; optimizedSize: number }> {
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

/* ---------- ImagePicker: Clean UI with no alert/confirm ---------- */

function ImagePicker({
  value,
  folder,
  onChange,
  hidePreview,
  buttonLabel,
}: {
  value: string;
  folder: string;
  onChange: (url: string) => void;
  hidePreview?: boolean;
  buttonLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [uploadError, setUploadError] = useState('');

  const displayName = value
    ? value.split('/').pop()?.split('?')[0] || 'Optimized asset'
    : '';

  if (hidePreview) {
    return (
      <div className="avatar-upload-control">
        <label className="hero-secondary-btn avatar-upload-btn">
          <Upload size={14} />
          <span>
            {busy
              ? statusText || 'Processing…'
              : buttonLabel || (value ? 'Replace image' : 'Choose image')}
          </span>
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
        {uploadError && (
          <span className="avatar-upload-error" role="alert">
            {uploadError}
          </span>
        )}
      </div>
    );
  }

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
                onClick={() => onChange('')}
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

/* ---------- Interactive Technology List & Icon Editor ---------- */

function TechnologyListEditor({
  label,
  technologies,
  selectedNames,
  onChange,
  onUpsertTechnology,
}: {
  label: string;
  technologies: Technology[];
  selectedNames: string[];
  onChange: (names: string[]) => void;
  onUpsertTechnology: (tech: { name: string; icon: string; originalName?: string }) => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [iconInput, setIconInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const startAddNew = () => {
    setNameInput('');
    setIconInput('');
    setEditingIndex(null);
    setShowAdd(true);
  };

  const startEdit = (name: string, index: number) => {
    const matched = technologies.find(
      (t) => isSameTechnology(t.name, name) || isSameTechnology(t.slug, name)
    );
    setNameInput(name);
    setIconInput(matched?.icon || curatedIcon(name) || '');
    setEditingIndex(index);
    setShowAdd(true);
  };

  const handleRemove = (nameToRemove: string) => {
    onChange(selectedNames.filter((n) => !isSameTechnology(n, nameToRemove)));
  };

  const handleSaveTech = async () => {
    const cleanName = nameInput.trim();
    if (!cleanName) return;

    const originalName = editingIndex !== null ? selectedNames[editingIndex] : undefined;

    if (editingIndex !== null) {
      const updated = [...selectedNames];
      updated[editingIndex] = cleanName;
      onChange(updated);
    } else {
      if (!selectedNames.some((n) => isSameTechnology(n, cleanName))) {
        onChange([...selectedNames, cleanName]);
      }
    }

    await onUpsertTechnology({ name: cleanName, icon: iconInput, originalName });
    setShowAdd(false);
    setNameInput('');
    setIconInput('');
    setEditingIndex(null);
  };

  return (
    <div className="af tech-list-editor-field">
      <div className="tech-list-editor-header">
        <span>{label}</span>
        <button
          type="button"
          className="primary-action btn-sm add-tech-trigger-btn"
          onClick={startAddNew}
        >
          + Add Technology
        </button>
      </div>

      <div className="tech-chips-tray">
        {selectedNames.map((name, idx) => {
          const matched = technologies.find(
            (t) => isSameTechnology(t.name, name) || isSameTechnology(t.slug, name)
          );
          const iconVal = matched?.icon || curatedIcon(name);
          const iconUrl = iconVal ? savedTechnologyIconUrl(iconVal) : null;

          return (
            <span key={`${name}-${idx}`} className="tech-chip-item">
              <button
                type="button"
                className="tech-chip-content-btn"
                onClick={() => startEdit(name, idx)}
                title={`Click to edit ${name}`}
              >
                {iconUrl ? (
                  <img src={iconUrl} alt="" className="tech-chip-icon" />
                ) : (
                  <span className="tech-chip-fallback">⚡</span>
                )}
                <span className="tech-chip-text">{name}</span>
              </button>
              <button
                type="button"
                className="tech-chip-remove-btn"
                onClick={() => handleRemove(name)}
                title={`Remove ${name}`}
                aria-label={`Remove ${name}`}
              >
                ✕
              </button>
            </span>
          );
        })}

        {selectedNames.length === 0 && (
          <span className="tech-chips-empty">
            No technologies added yet. Click “+ Add Technology” to add your tools.
          </span>
        )}
      </div>

      {showAdd && (
        <div className="tech-mini-editor-card">
          <div className="tech-mini-head">
            <h5>{editingIndex !== null ? 'Edit Technology & Icon' : 'Add New Technology'}</h5>
            <button
              type="button"
              className="text-action btn-sm"
              onClick={() => setShowAdd(false)}
            >
              ✕
            </button>
          </div>

          <div className="af-grid" style={{ marginBottom: '12px' }}>
            <label className="af">
              <span>Technology Name</span>
              <input
                type="text"
                placeholder="e.g. React, Next.js, Docker, Python"
                value={nameInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setNameInput(val);
                  if (!iconInput || iconInput === curatedIcon(nameInput)) {
                    const matched = technologies.find(
                      (t) => isSameTechnology(t.name, val) || isSameTechnology(t.slug, val)
                    );
                    if (matched?.icon) {
                      setIconInput(matched.icon);
                    } else {
                      const auto = curatedIcon(val);
                      if (auto) setIconInput(auto);
                    }
                  }
                }}
              />
            </label>

            <TechnologyIconPicker
              value={iconInput}
              technologyName={nameInput}
              onChange={(newIcon) => {
                setIconInput(newIcon);
                if (editingIndex !== null) {
                  const originalName = selectedNames[editingIndex];
                  const cleanName = nameInput.trim() || originalName;
                  void onUpsertTechnology({ name: cleanName, icon: newIcon, originalName });
                }
              }}
            />
          </div>

          <div className="tech-mini-actions">
            <button
              type="button"
              className="primary-action btn-sm"
              disabled={!nameInput.trim()}
              onClick={handleSaveTech}
            >
              {editingIndex !== null ? 'Update Technology' : 'Add to List'} ✓
            </button>
            <button
              type="button"
              className="text-action btn-sm"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Main Admin Dashboard with Persistent Sidebar ---------- */

export function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUserEmail, setAdminUserEmail] = useState('');

  // Locale state persisted in localStorage
  const [adminLocale, setAdminLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('admin_locale');
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  });

  const toggleAdminLocale = () => {
    const next = adminLocale === 'en' ? 'ar' : 'en';
    setAdminLocale(next);
    localStorage.setItem('admin_locale', next);
  };

  const [searchFilter, setSearchFilter] = useState('');

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

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

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const requestConfirm = (title: string, message: string, onConfirm: () => void, confirmLabel = 'Delete Permanently') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmLabel,
      onConfirm: () => {
        setConfirmDialog(null);
        onConfirm();
      },
    });
  };

  useEffect(() => {
    if (!confirmDialog?.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConfirmDialog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog]);

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
    setCertificates((ce.data ?? []).map((certificate) => ({ ...certificate, issue_date: certificate.issue_date ?? '' })));
    setTestimonials(tm.data ?? []);

    // Auto-detect any technologies in skills that are not yet in the technologies table
    const existingTech = te.data ?? [];
    const skillNames = skillTechnologyNames(sk.data ?? []);
    const existingSlugs = new Set(existingTech.map((t) => t.slug));
    const existingNames = new Set(existingTech.map((t) => t.name.toLowerCase().trim()));
    const missing = skillNames.filter((name) => {
      const slug = technologySlug(name);
      return !existingSlugs.has(slug) && !existingNames.has(name.toLowerCase().trim());
    });

    if (missing.length > 0) {
      const toInsert = missing.map((name, i) => ({
        slug: technologySlug(name),
        name,
        icon: curatedIcon(name) || '',
        sort_order: existingTech.length + i + 1,
      }));
      const { data: inserted } = await client.from('technologies').insert(toInsert).select('*');
      setTechnologies([...existingTech, ...(inserted ?? [])]);
    } else {
      setTechnologies(existingTech);
    }

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
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Profile saved successfully ✓', 'success');
    }
  }

  async function upsertTechnology(tech: { name: string; icon: string; originalName?: string }): Promise<void> {
    if (!supabase) return;
    const name = tech.name.trim();
    if (!name) return;
    const slug = technologySlug(name);

    // Flexible technology lookup matching originalName, current name, or slug
    const existing = technologies.find(
      (t) =>
        (tech.originalName && (isSameTechnology(t.name, tech.originalName) || isSameTechnology(t.slug, tech.originalName))) ||
        isSameTechnology(t.name, name) ||
        isSameTechnology(t.slug, slug)
    );

    if (existing) {
      const shouldUpdateIcon = tech.icon && existing.icon !== tech.icon;
      const shouldUpdateName = existing.name !== name;

      if (shouldUpdateIcon || shouldUpdateName) {
        const updatedIcon = tech.icon || existing.icon;
        const { error } = await supabase
          .from('technologies')
          .update({ icon: updatedIcon, name })
          .eq('id', existing.id);
        if (error) {
          showToast(`Could not update technology: ${error.message}`, 'error');
        } else {
          showToast(`Updated ${name} icon ✓`, 'success');
          setTechnologies((prev) =>
            prev.map((t) => (t.id === existing.id ? { ...t, icon: updatedIcon, name } : t))
          );
        }
      }
    } else {
      const nextOrder = technologies.length + 1;
      const { data, error } = await supabase
        .from('technologies')
        .insert({
          slug,
          name,
          icon: tech.icon || curatedIcon(name) || '',
          sort_order: nextOrder,
        })
        .select('*')
        .maybeSingle();

      if (error) {
        showToast(`Could not save technology: ${error.message}`, 'error');
      } else if (data) {
        showToast(`Added ${name} to technologies ✓`, 'success');
        setTechnologies((prev) => [...prev, data]);
      }
    }
  }

  async function saveRow(table: string, row: Record<string, unknown>) {
    if (!supabase) return;
    setSaving(true);
    try {
      const { id, ...values } = row;
      if (table === 'skill_groups') {
        values.items_ar = values.items_ar || values.items_en;
      }
      const query = id == null
        ? supabase.from(table).insert(values)
        : supabase.from(table).update(values).eq('id', id);
      const { error } = await query;
      if (error) throw error;

      if (table === 'skill_groups') {
        await syncTechnologies();
      }
      showToast('Saved successfully ✓', 'success');
      await refreshTable(table);
      if (table === 'skill_groups') {
        await refreshTable('technologies');
      }
    } catch (saveError) {
      showToast(errorMessage(saveError), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function syncTechnologies() {
    if (!supabase) return;
    const [groupsResult, existingResult] = await Promise.all([
      supabase.from('skill_groups').select('items_en,items_ar').order('sort_order'),
      supabase.from('technologies').select('id,slug,name,icon,sort_order'),
    ]);
    if (groupsResult.error) throw new Error(`Could not read skills: ${errorMessage(groupsResult.error)}`);
    if (existingResult.error) throw new Error(`Could not read technologies: ${errorMessage(existingResult.error)}`);

    const names = skillTechnologyNames(groupsResult.data ?? []);
    const existing = existingResult.data ?? [];

    const existingSlugs = new Set((existing ?? []).map((t) => t.slug));
    const existingNames = new Set((existing ?? []).map((t) => t.name.toLowerCase().trim()));

    const missingNames = names.filter((name) => {
      const slug = technologySlug(name);
      return !existingSlugs.has(slug) && !existingNames.has(name.toLowerCase().trim());
    });

    if (missingNames.length > 0) {
      const recordsToInsert = missingNames.map((name, index) => ({
        slug: technologySlug(name),
        name,
        icon: curatedIcon(name) || '',
        sort_order: (existing?.length ?? 0) + index + 1,
      }));

      const { error } = await supabase
        .from('technologies')
        .insert(recordsToInsert);
      if (error) throw new Error(`Could not synchronize technologies: ${errorMessage(error)}`);
    }
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
    if (!supabase) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Deleted permanently ✓', 'success');
      if (table === 'skill_groups') {
        await syncTechnologies();
        await refreshTable('technologies');
      }
      load();
    }
  }

  const handleDeleteClick = (table: string, id: number, label?: string) => {
    requestConfirm(
      'Confirm Deletion',
      `Are you sure you want to permanently delete ${label ? `"${label}"` : 'this record'}? This action cannot be undone.`,
      () => deleteRow(table, id),
      'Delete Permanently'
    );
  };

  /* Testimonials moderation controls */
  async function setTestimonialStatus(id: number, status: 'approved' | 'rejected' | 'pending') {
    if (!supabase) return;
    const { error } = await supabase.from('testimonials').update({ status }).eq('id', id);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(`Testimonial ${status} ✓`, 'success');
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
      showToast(`Could not save setting: ${error.message}`, 'error');
      setSiteSettings((prev) => ({ ...prev, [key]: !value }));
    } else {
      showToast('Setting updated ✓', 'success');
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
  if (!ready) return <AdminDashboardSkeleton adminLocale={adminLocale} />;

  const up = (key: keyof Profile) => (v: string) => setProfile((s) => ({ ...s, [key]: v }));

  const counts = {
    projects: projects.length,
    categories: categories.length,
    certificates: certificates.length,
    testimonialsPending: testimonials.filter((t) => t.status === 'pending').length,
    testimonialsTotal: testimonials.length,
    experiences: experiences.length,
    skills: skills.length,
    education: education.length,
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    navigate('/admin');
  };

  const getTabTitle = (currentTab: AdminTab) => {
    const dict = adminI18n[adminLocale];
    switch (currentTab) {
      case 'overview': return dict.tabOverview;
      case 'profile': return dict.tabProfile;
      case 'projects': return dict.tabProjects;
      case 'categories': return dict.tabCategories;
      case 'certificates': return dict.tabCertificates;
      case 'testimonials': return dict.tabTestimonials;
      case 'experiences': return dict.tabExperience;
      case 'skills': return dict.tabSkills;
      case 'education': return dict.tabEducation;
      case 'settings': return dict.tabSettings;
      default: return currentTab;
    }
  };

  return (
    <div className="admin-shell" dir={adminLocale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Refactored Slim Bento Sidebar */}
      <AdminSidebar
        currentTab={tab}
        onSelectTab={(selected) => setTab(selected)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        locale={adminLocale}
        counts={counts}
        adminEmail={adminUserEmail}
        onSignOut={handleSignOut}
      />

      {/* Main App Stage with Bento Frame & Topbar */}
      <div className="admin-bento-frame">
        <AdminTopBar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          locale={adminLocale}
          onToggleLocale={toggleAdminLocale}
          searchQuery={searchFilter}
          onSearchChange={setSearchFilter}
          pendingReviewsCount={counts.testimonialsPending}
          onNavigateToReviews={() => setTab('testimonials')}
        />

        <main className="admin-main-stage">
          <header className="admin-stage-header">
            <div>
              <h2 className="admin-stage-title">{getTabTitle(tab)}</h2>
              <span className="admin-stage-sub">{adminI18n[adminLocale].systemLiveStatus}</span>
            </div>
          </header>

        {loadError && (
          <div className="admin-error-banner" role="alert">
            <span>Could not load data: {loadError}</span>
            <button className="link-btn" onClick={() => void load()}>Retry</button>
          </div>
        )}

        <div className="admin-stage-body">
          {tab === 'overview' && (
            <AdminOverviewBento
              locale={adminLocale}
              onNavigateTab={(targetTab) => setTab(targetTab)}
              projects={projects}
              skills={skills}
              technologies={technologies}
              certificates={certificates}
              testimonials={testimonials}
              experiences={experiences}
              siteSettings={siteSettings}
            />
          )}

          {tab === 'profile' && (
            <AdminProfileManager
              locale={adminLocale}
              profile={profile}
              saving={saving}
              onSave={saveProfile}
              onChangeField={up}
              renderImagePicker={(value, folder, onChange) => (
                <ImagePicker
                  value={value}
                  folder={folder}
                  onChange={onChange}
                  hidePreview={true}
                  buttonLabel={adminLocale === 'ar' ? 'تغيير الصورة الشخصية' : 'Change Profile Photo'}
                />
              )}
            />
          )}

          {tab === 'projects' && (
            <CollectionEditor<Project>
              title={adminLocale === 'ar' ? 'المشاريع' : 'Projects'}
              rows={projects}
              searchFilter={searchFilter}
              locale={adminLocale}
              makeNew={() => ({
                name: '', year: '2026', category: 'fullstack', headline_en: '', headline_ar: '',
                summary_en: '', summary_ar: '', tags: ['React', 'TypeScript'], demo_url: '', code_url: '', image_url: '', sort_order: projects.length + 1,
              })}
              onSave={(r) => saveRow('projects', r as unknown as Record<string, unknown>)}
              onRequestDelete={(row) => handleDeleteClick('projects', row.id!, row.name)}
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

                  {/* Interactive Technology Selector with Icon Picker */}
                  <TechnologyListEditor
                    label="Technologies & Stack / التقنيات المستخدمة"
                    technologies={technologies}
                    selectedNames={row.tags || []}
                    onChange={(newTags) => set('tags')(newTags)}
                    onUpsertTechnology={upsertTechnology}
                  />

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
              title={adminLocale === 'ar' ? 'تصنيفات المشاريع' : 'Project Categories'}
              rows={categories}
              searchFilter={searchFilter}
              locale={adminLocale}
              makeNew={() => ({ slug: '', name_en: '', name_ar: '', sort_order: categories.length + 1 })}
              onSave={(row) => saveRow('project_categories', row as unknown as Record<string, unknown>)}
              onRequestDelete={(row) => handleDeleteClick('project_categories', row.id!, row.name_en)}
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

          {tab === 'certificates' && (
            <CollectionEditor<Certificate>
              title={adminLocale === 'ar' ? 'الشهادات والاعتمادات' : 'Certificates & Credentials'}
              rows={certificates}
              searchFilter={searchFilter}
              locale={adminLocale}
              makeNew={() => ({
                title: '', issuer: '', issue_date: '2026', image_url: '', verification_url: '',
                is_published: true, sort_order: certificates.length + 1,
              })}
              onSave={(row) => saveRow('certificates', row as unknown as Record<string, unknown>)}
              onRequestDelete={(row) => handleDeleteClick('certificates', row.id!, row.title)}
              render={(row, set) => (
                <div className="af-grid">
                  <Field label="Title" value={row.title} onChange={set('title')} />
                  <Field label="Issuer" value={row.issuer} onChange={set('issuer')} />
                  <Field label="Issue Date / Year" value={row.issue_date} onChange={set('issue_date')} />
                  <ImagePicker value={row.image_url} folder="certificates" onChange={set('image_url')} />
                  <Field label="Verification URL" value={row.verification_url} onChange={set('verification_url')} />
                  <label className="af af-checkbox">
                    <input type="checkbox" checked={row.is_published} onChange={(e) => set('is_published')(e.target.checked)} />
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
            <AdminTestimonialsManager
              locale={adminLocale}
              testimonials={testimonials}
              searchFilter={searchFilter}
              onSetStatus={setTestimonialStatus}
              onRequestDelete={(item) => handleDeleteClick('testimonials', item.id!, item.client_name)}
              testimonialsButtonVisible={siteSettings.testimonials_button_visible ?? true}
              onToggleTestimonialsButton={(visible) => toggleSetting('testimonials_button_visible', visible)}
            />
          )}

          {tab === 'experiences' && (
            <CollectionEditor<Experience>
              title={adminLocale === 'ar' ? 'الخبرات المهنية' : 'Experience & Roles'}
              rows={experiences}
              searchFilter={searchFilter}
              locale={adminLocale}
              makeNew={() => ({ date_en: '', date_ar: '', company_en: '', company_ar: '', role_en: '', role_ar: '', body_en: '', body_ar: '', sort_order: experiences.length + 1 })}
              onSave={(r) => saveRow('experiences', r as unknown as Record<string, unknown>)}
              onRequestDelete={(row) => handleDeleteClick('experiences', row.id!, row.company_en)}
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
              title={adminLocale === 'ar' ? 'مجموعات المهارات' : 'Skill Groups'}
              rows={skills}
              searchFilter={searchFilter}
              locale={adminLocale}
              makeNew={() => ({ title_en: '', title_ar: '', items_en: '', items_ar: '', sort_order: skills.length + 1 })}
              onSave={(r) => saveRow('skill_groups', r as unknown as Record<string, unknown>)}
              onRequestDelete={(row) => handleDeleteClick('skill_groups', row.id!, row.title_en)}
              render={(row, set) => {
                const names = (row.items_en || '')
                  .split(/[·•,،;\n|/]+/)
                  .map((s) => s.trim())
                  .filter(Boolean);
                return (
                  <div className="af-grid">
                    <Field label="Skill Group Title (EN)" value={row.title_en} onChange={set('title_en')} placeholder="e.g. Frontend Development" />
                    <Field label="عنوان مجموعة المهارات (عربي)" value={row.title_ar} onChange={set('title_ar')} placeholder="مثال: تطوير الواجهات الأمامية" />

                    {/* Interactive Technology Selector with Icon Picker */}
                    <TechnologyListEditor
                      label="Technologies & Tools / التقنيات والأدوات"
                      technologies={technologies}
                      selectedNames={names}
                      onChange={(newNames) => {
                        const joined = newNames.join(' · ');
                        set('items_en')(joined);
                        set('items_ar')(joined);
                      }}
                      onUpsertTechnology={upsertTechnology}
                    />

                    <Field label="Sort order" value={String(row.sort_order)} onChange={(v) => set('sort_order')(String(Number(v) || 0))} />
                  </div>
                );
              }}
              afterSave={(rows) => setSkills(rows)}
              table="skill_groups"
            />
          )}

          {tab === 'education' && (
            <CollectionEditor<Education>
              title={adminLocale === 'ar' ? 'المؤهلات والشهادات الدراسية' : 'Education & Credentials'}
              rows={education}
              searchFilter={searchFilter}
              locale={adminLocale}
              makeNew={() => ({ kind: 'course', title_en: '', title_ar: '', org_en: '', org_ar: '', date_en: '', date_ar: '', details_en: '', details_ar: '', sort_order: education.length + 1 })}
              onSave={(r) => saveRow('education', r as unknown as Record<string, unknown>)}
              onRequestDelete={(row) => handleDeleteClick('education', row.id!, row.title_en)}
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
            <AdminSiteSettingsManager
              locale={adminLocale}
              siteSettings={siteSettings}
              onToggleSetting={toggleSetting}
            />
          )}
        </div>
      </main>
      </div> {/* .admin-bento-frame */}

      {/* Modern Toast Notification Container */}
      <div className="admin-toast-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`admin-toast-item toast-${t.type}`}>
            <span className="toast-icon" aria-hidden="true">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : 'ℹ'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* In-App Confirmation Modal (Replaces browser confirm) */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="admin-modal-backdrop" onClick={() => setConfirmDialog(null)}>
          <div
            className="admin-confirm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-icon">⚠️</div>
            <h3 className="confirm-modal-title">{confirmDialog.title}</h3>
            <p className="confirm-modal-message">{confirmDialog.message}</p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="text-action"
                onClick={() => setConfirmDialog(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-action btn-danger-action"
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Generic Collection Editor (Now with Centered Pop-up Modal) ---------- */

function CollectionEditor<T extends { id?: number; sort_order: number }>(props: {
  title: string;
  rows: T[];
  table: string;
  makeNew: () => T;
  onSave: (row: T) => Promise<void>;
  onRequestDelete: (row: T) => void;
  render: (row: T, set: (key: keyof T) => (v: unknown) => void) => React.ReactNode;
  afterSave: (rows: T[]) => void;
  allowAdd?: boolean;
  searchFilter?: string;
  locale?: Locale;
}) {
  const [editing, setEditing] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [savingRow, setSavingRow] = useState(false);

  const loc = props.locale || 'en';
  const t = adminI18n[loc];

  useEffect(() => {
    if (!editing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditing(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editing]);

  const startEdit = (row: T) => { setEditing({ ...row }); setIsNew(false); };
  const startNew = () => { setEditing(props.makeNew()); setIsNew(true); };

  const setField = (key: keyof T) => (v: unknown) => {
    let value: unknown = v;
    if (key === 'sort_order') value = Number(v) || 0;
    if (key === 'is_published') value = v === 'true' || v === true;
    if (key === 'tags' && typeof v === 'string') {
      value = v.split(',').map((s) => s.trim()).filter(Boolean);
    }
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // Real-time search filter
  const query = (props.searchFilter || '').toLowerCase().trim();
  const filteredRows = props.rows.filter((row) => {
    if (!query) return true;
    const stringified = JSON.stringify(row).toLowerCase();
    return stringified.includes(query);
  });

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div className="admin-panel-title-wrap">
          <h3>{props.title}</h3>
          <span className="admin-panel-count-pill">{props.rows.length}</span>
        </div>
        {props.allowAdd !== false && (
          <button className="hero-primary-btn btn-sm" onClick={startNew}>
            <Plus size={15} />
            <span>{t.add}</span>
          </button>
        )}
      </div>

      {/* Pop-up Centered Modal for Create / Edit */}
      {editing && (
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-head">
              <h4>{isNew ? `${t.createTitle} (${props.title})` : `${t.editTitle} (${props.title})`}</h4>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditing(null)}
                aria-label={t.close}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              {props.render(editing, setField)}
            </div>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="hero-primary-btn"
                disabled={savingRow}
                onClick={async () => {
                  setSavingRow(true);
                  try {
                    await props.onSave(editing);
                    setEditing(null);
                  } finally {
                    setSavingRow(false);
                  }
                }}
              >
                <Save size={15} />
                <span>{savingRow ? t.saving : isNew ? t.add : t.save}</span>
              </button>
              <button
                type="button"
                className="hero-secondary-btn"
                onClick={() => setEditing(null)}
              >
                <span>{t.cancel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bento Table / Row List */}
      <ul className="admin-row-list">
        {filteredRows.map((row) => {
          const r = row as unknown as {
            name?: string;
            name_en?: string;
            name_ar?: string;
            slug?: string;
            company_en?: string;
            company_ar?: string;
            role_en?: string;
            role_ar?: string;
            title?: string;
            title_en?: string;
            title_ar?: string;
            headline_en?: string;
            headline_ar?: string;
            category?: string;
            issuer?: string;
            icon?: string;
            status?: string;
            org_en?: string;
          };

          // Smart label extraction supporting categories (name_en/name_ar), projects, experiences, etc.
          const label =
            (loc === 'ar'
              ? (r.name_ar || r.name || r.name_en)
              : (r.name_en || r.name || r.name_ar)) ||
            (loc === 'ar'
              ? (r.role_ar || r.role_en || r.company_ar)
              : (r.role_en || r.role_ar || r.company_en)) ||
            (loc === 'ar'
              ? (r.title_ar || r.title_en || r.title)
              : (r.title_en || r.title_ar || r.title)) ||
            r.slug ||
            '#' + row.id;

          const subLabel =
            props.table === 'project_categories'
              ? (r.slug ? `slug: ${r.slug}${r.name_en && r.name_ar ? ` · ${loc === 'ar' ? r.name_en : r.name_ar}` : ''}` : '')
              : (loc === 'ar' ? (r.company_ar || r.company_en) : (r.company_en || r.company_ar)) ||
                (loc === 'ar' ? (r.headline_ar || r.headline_en) : (r.headline_en || r.headline_ar)) ||
                r.category ||
                r.issuer ||
                r.org_en ||
                '';

          const iconValue = r.icon;
          const rowIconUrl = iconValue ? savedTechnologyIconUrl(iconValue) : null;

          return (
            <li key={row.id} className="admin-bento-row">
              <div className="row-main-meta">
                <div className="row-icon-bubble">
                  {rowIconUrl ? (
                    <img src={rowIconUrl} className="row-icon-img" alt="" />
                  ) : props.table === 'project_categories' ? (
                    <Tag size={15} className="row-icon-teal" />
                  ) : (
                    <span>#{row.sort_order}</span>
                  )}
                </div>
                <div className="row-text-block">
                  <span className="row-primary-label">{label}</span>
                  {subLabel && <span className="row-sub-label">{subLabel}</span>}
                </div>
              </div>

              <div className="row-actions-cluster">
                <button
                  type="button"
                  className="row-action-btn"
                  onClick={() => startEdit(row)}
                  aria-label={t.edit}
                >
                  <Pencil size={14} />
                  <span>{t.edit}</span>
                </button>
                {row.id != null && (
                  <button
                    type="button"
                    className="row-action-btn btn-danger"
                    onClick={() => props.onRequestDelete(row)}
                    aria-label={t.delete}
                  >
                    <Trash2 size={14} />
                    <span>{t.delete}</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}

        {filteredRows.length === 0 && (
          <li className="admin-row-empty">
            <SearchX size={28} />
            <span>{query ? t.searchEmpty : 'No records yet'}</span>
          </li>
        )}
      </ul>
    </section>
  );
}
