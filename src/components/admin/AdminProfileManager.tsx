import React, { useEffect, useState } from 'react';
import {
  User,
  Sparkles,
  BookOpen,
  Share2,
  Mail,
  Phone,
  MapPin,
  Code2,
  Link2,
  Save,
  Check,
  Upload,
  Globe,
} from 'lucide-react';
import type { Locale, Profile } from '../../types';
import { adminI18n } from '../../adminI18n';

interface AdminProfileManagerProps {
  locale: Locale;
  profile: Profile;
  saving: boolean;
  onSave: () => Promise<void> | void;
  onChangeField: (key: keyof Profile) => (value: string) => void;
  renderImagePicker: (value: string, folder: string, onChange: (url: string) => void) => React.ReactNode;
}

export const AdminProfileManager: React.FC<AdminProfileManagerProps> = ({
  locale,
  profile,
  saving,
  onSave,
  onChangeField,
  renderImagePicker,
}) => {
  const [langTab, setLangTab] = useState<'both' | 'en' | 'ar'>('both');
  const [isDirty, setIsDirty] = useState(false);
  const t = adminI18n[locale];

  // Shortcut for Ctrl+S / Cmd+S to save profile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
        setIsDirty(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  const handleChange = (key: keyof Profile) => (val: string) => {
    setIsDirty(true);
    onChangeField(key)(val);
  };

  return (
    <div className="admin-profile-bento-section">
      {/* Profile Header Bar */}
      <div className="profile-bento-head">
        <div className="profile-head-title-wrap">
          <div className="profile-icon-box">
            <User size={22} className="profile-head-icon" />
          </div>
          <div>
            <h3 className="profile-head-title">
              {locale === 'ar' ? 'البيانات الشخصية والسيرة الذاتية' : 'Bio & Professional Identity'}
            </h3>
            <span className="profile-head-sub">
              {locale === 'ar'
                ? 'تخصيص البيانات الثنائية اللغة (العربية والإنجليزية)، وسائل التواصل، والصورة الشخصية'
                : 'Manage bilingual identity details, introduction copy, social links, and avatar image.'}
            </span>
          </div>
        </div>

        {/* Language View Switcher */}
        <div className="profile-lang-chips">
          <button
            type="button"
            className={`chip-btn ${langTab === 'both' ? 'is-active' : ''}`}
            onClick={() => setLangTab('both')}
          >
            <Globe size={13} />
            <span>{locale === 'ar' ? 'اللغتين معاً' : 'Both Languages'}</span>
          </button>
          <button
            type="button"
            className={`chip-btn ${langTab === 'en' ? 'is-active' : ''}`}
            onClick={() => setLangTab('en')}
          >
            <span>English (EN)</span>
          </button>
          <button
            type="button"
            className={`chip-btn ${langTab === 'ar' ? 'is-active' : ''}`}
            onClick={() => setLangTab('ar')}
          >
            <span>العربية (AR)</span>
          </button>
        </div>
      </div>

      {/* Cluster 1: Identity & Avatar Card */}
      <div className="profile-bento-card identity-cluster-card">
        <div className="card-cluster-title-line">
          <Sparkles size={16} className="cluster-icon-accent" />
          <h4>{locale === 'ar' ? 'الهوية والصورة الرمزية' : 'Core Identity & Avatar'}</h4>
        </div>

        <div className="identity-card-grid">
          {/* Avatar Column */}
          <div className="avatar-uploader-column">
            <div className="avatar-preview-wrapper">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="Profile Avatar" className="avatar-preview-img" />
              ) : (
                <div className="avatar-preview-fallback">
                  <User size={38} className="avatar-fallback-icon" />
                </div>
              )}
              <span className="avatar-status-badge">
                <span className="status-dot-pulse" />
                <span>{profile.available_en || 'Available'}</span>
              </span>
            </div>

            <div className="avatar-picker-dock">
              {renderImagePicker(profile.photo_url, 'avatar', handleChange('photo_url'))}
            </div>
            <span className="avatar-help-hint">
              {locale === 'ar' ? 'يتم ضغط الصورة تلقائياً لـ WebP' : 'Optimized automatically to WebP'}
            </span>
          </div>

          {/* Identity Fields Grid */}
          <div className="identity-fields-column">
            <div className="fields-row-2">
              {(langTab === 'both' || langTab === 'en') && (
                <label className="bento-field-box">
                  <span className="field-label">Full Name (English)</span>
                  <input
                    type="text"
                    className="bento-text-input"
                    value={profile.name_en || ''}
                    onChange={(e) => handleChange('name_en')(e.target.value)}
                    placeholder="e.g. Taha Ahmed"
                  />
                </label>
              )}

              {(langTab === 'both' || langTab === 'ar') && (
                <label className="bento-field-box" dir="rtl">
                  <span className="field-label">الاسم بالكامل (عربي)</span>
                  <input
                    type="text"
                    className="bento-text-input"
                    value={profile.name_ar || ''}
                    onChange={(e) => handleChange('name_ar')(e.target.value)}
                    placeholder="مثال: طه أحمد هدهد"
                  />
                </label>
              )}
            </div>

            <div className="fields-row-2">
              {(langTab === 'both' || langTab === 'en') && (
                <label className="bento-field-box">
                  <span className="field-label">Professional Role / Title (English)</span>
                  <input
                    type="text"
                    className="bento-text-input"
                    value={profile.role_en || ''}
                    onChange={(e) => handleChange('role_en')(e.target.value)}
                    placeholder="e.g. Full-Stack Developer & AI Specialist"
                  />
                </label>
              )}

              {(langTab === 'both' || langTab === 'ar') && (
                <label className="bento-field-box" dir="rtl">
                  <span className="field-label">المسمى الوظيفي والمهني (عربي)</span>
                  <input
                    type="text"
                    className="bento-text-input"
                    value={profile.role_ar || ''}
                    onChange={(e) => handleChange('role_ar')(e.target.value)}
                    placeholder="مثال: مهندس برمجيات ومطور واجهات متقدمة"
                  />
                </label>
              )}
            </div>

            <div className="fields-row-3">
              <label className="bento-field-box">
                <span className="field-label">
                  {locale === 'ar' ? 'سنة التأسيس / الفوتر' : 'Footer Years Label'}
                </span>
                <input
                  type="text"
                  className="bento-text-input"
                  value={profile.years_label || ''}
                  onChange={(e) => handleChange('years_label')(e.target.value)}
                  placeholder="2026"
                />
              </label>

              {(langTab === 'both' || langTab === 'en') && (
                <label className="bento-field-box">
                  <span className="field-label">Availability Status (EN)</span>
                  <input
                    type="text"
                    className="bento-text-input"
                    value={profile.available_en || ''}
                    onChange={(e) => handleChange('available_en')(e.target.value)}
                    placeholder="Available for hire"
                  />
                </label>
              )}

              {(langTab === 'both' || langTab === 'ar') && (
                <label className="bento-field-box" dir="rtl">
                  <span className="field-label">حالة التوفر للعمل (عربي)</span>
                  <input
                    type="text"
                    className="bento-text-input"
                    value={profile.available_ar || ''}
                    onChange={(e) => handleChange('available_ar')(e.target.value)}
                    placeholder="متاح للمشاريع الجديدة"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cluster 2: Narrative & Copywriting Storytelling */}
      <div className="profile-bento-card narrative-cluster-card">
        <div className="card-cluster-title-line">
          <BookOpen size={16} className="cluster-icon-accent" />
          <h4>{locale === 'ar' ? 'السرد والنصوص التعريفية' : 'Narrative & Bio Storytelling'}</h4>
        </div>

        {/* Punchy Statement */}
        <div className="fields-row-2">
          {(langTab === 'both' || langTab === 'en') && (
            <label className="bento-field-box">
              <div className="field-label-meta">
                <span className="field-label">Statement (English — Two lines)</span>
                <span className="field-counter">{(profile.statement_en || '').length} chars</span>
              </div>
              <textarea
                rows={2}
                className="bento-textarea"
                value={profile.statement_en || ''}
                onChange={(e) => handleChange('statement_en')(e.target.value)}
                placeholder="Punchy high-impact headline displayed on hero banner..."
              />
            </label>
          )}

          {(langTab === 'both' || langTab === 'ar') && (
            <label className="bento-field-box" dir="rtl">
              <div className="field-label-meta">
                <span className="field-label">الجملة التسويقية الرئيسية (عربي — سطرين)</span>
                <span className="field-counter">{(profile.statement_ar || '').length} حرف</span>
              </div>
              <textarea
                rows={2}
                className="bento-textarea"
                value={profile.statement_ar || ''}
                onChange={(e) => handleChange('statement_ar')(e.target.value)}
                placeholder="جملة قوية ومختصرة تظهر في صدارة البورتفوليو..."
              />
            </label>
          )}
        </div>

        {/* Short Intro */}
        <div className="fields-row-2">
          {(langTab === 'both' || langTab === 'en') && (
            <label className="bento-field-box">
              <span className="field-label">Quick Intro Summary (English)</span>
              <textarea
                rows={3}
                className="bento-textarea"
                value={profile.intro_en || ''}
                onChange={(e) => handleChange('intro_en')(e.target.value)}
                placeholder="Short elevator pitch about your engineering philosophy..."
              />
            </label>
          )}

          {(langTab === 'both' || langTab === 'ar') && (
            <label className="bento-field-box" dir="rtl">
              <span className="field-label">النبذة التقديمية السريعة (عربي)</span>
              <textarea
                rows={3}
                className="bento-textarea"
                value={profile.intro_ar || ''}
                onChange={(e) => handleChange('intro_ar')(e.target.value)}
                placeholder="نبذة مركزة وسريعة تلخص خبرتك التقنية..."
              />
            </label>
          )}
        </div>

        {/* Full About Me Story */}
        <div className="fields-row-2">
          {(langTab === 'both' || langTab === 'en') && (
            <label className="bento-field-box">
              <span className="field-label">Full About Me Story (English)</span>
              <textarea
                rows={5}
                className="bento-textarea"
                value={profile.about_en || ''}
                onChange={(e) => handleChange('about_en')(e.target.value)}
                placeholder="In-depth background, specializations, and career journey..."
              />
            </label>
          )}

          {(langTab === 'both' || langTab === 'ar') && (
            <label className="bento-field-box" dir="rtl">
              <span className="field-label">القصة الكاملة عن مسيرتك (عربي)</span>
              <textarea
                rows={5}
                className="bento-textarea"
                value={profile.about_ar || ''}
                onChange={(e) => handleChange('about_ar')(e.target.value)}
                placeholder="تفاصيل رحلتك المهنية، تخصصاتك، وشغفك بالبرمجة..."
              />
            </label>
          )}
        </div>
      </div>

      {/* Cluster 3: Connectivity & Social Presence */}
      <div className="profile-bento-card social-cluster-card">
        <div className="card-cluster-title-line">
          <Share2 size={16} className="cluster-icon-accent" />
          <h4>{locale === 'ar' ? 'التواصل والروابط المهنية' : 'Contact & Social Presence'}</h4>
        </div>

        <div className="social-fields-grid">
          <label className="bento-field-box">
            <div className="field-icon-label">
              <Mail size={14} className="field-inline-icon" />
              <span className="field-label">Email Address</span>
            </div>
            <input
              type="email"
              className="bento-text-input"
              value={profile.email || ''}
              onChange={(e) => handleChange('email')(e.target.value)}
              placeholder="e.g. contact@domain.com"
            />
          </label>

          <label className="bento-field-box">
            <div className="field-icon-label">
              <Phone size={14} className="field-inline-icon" />
              <span className="field-label">Phone Number</span>
            </div>
            <input
              type="tel"
              className="bento-text-input"
              value={profile.phone || ''}
              onChange={(e) => handleChange('phone')(e.target.value)}
              placeholder="+20 100 000 0000"
            />
          </label>

          {(langTab === 'both' || langTab === 'en') && (
            <label className="bento-field-box">
              <div className="field-icon-label">
                <MapPin size={14} className="field-inline-icon" />
                <span className="field-label">Location (EN)</span>
              </div>
              <input
                type="text"
                className="bento-text-input"
                value={profile.location_en || ''}
                onChange={(e) => handleChange('location_en')(e.target.value)}
                placeholder="Cairo, Egypt"
              />
            </label>
          )}

          {(langTab === 'both' || langTab === 'ar') && (
            <label className="bento-field-box" dir="rtl">
              <div className="field-icon-label">
                <MapPin size={14} className="field-inline-icon" />
                <span className="field-label">الموقع الجغرافي (عربي)</span>
              </div>
              <input
                type="text"
                className="bento-text-input"
                value={profile.location_ar || ''}
                onChange={(e) => handleChange('location_ar')(e.target.value)}
                placeholder="القاهرة، مصر"
              />
            </label>
          )}

          <label className="bento-field-box">
            <div className="field-icon-label">
              <Code2 size={14} className="field-inline-icon" />
              <span className="field-label">GitHub Profile URL</span>
            </div>
            <input
              type="url"
              className="bento-text-input"
              value={profile.github || ''}
              onChange={(e) => handleChange('github')(e.target.value)}
              placeholder="https://github.com/username"
            />
          </label>

          <label className="bento-field-box">
            <div className="field-icon-label">
              <Link2 size={14} className="field-inline-icon" />
              <span className="field-label">LinkedIn Profile URL</span>
            </div>
            <input
              type="url"
              className="bento-text-input"
              value={profile.linkedin || ''}
              onChange={(e) => handleChange('linkedin')(e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </label>
        </div>
      </div>

      {/* Floating / Sticky Save Toolbar */}
      <div className="profile-sticky-save-bar">
        <div className="save-bar-hint">
          <span className="kbd-shortcut-hint">
            {navigator.platform.toUpperCase().includes('MAC') ? '⌘S' : 'Ctrl+S'}
          </span>
          <span className="save-hint-text">
            {locale === 'ar' ? 'للحفظ السريع في أي وقت' : 'to save changes anytime'}
          </span>
        </div>

        <button
          type="button"
          className="hero-primary-btn profile-save-btn"
          disabled={saving}
          onClick={() => {
            onSave();
            setIsDirty(false);
          }}
        >
          {saving ? (
            <span>{t.saving}</span>
          ) : (
            <>
              <Save size={16} />
              <span>{t.save}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
