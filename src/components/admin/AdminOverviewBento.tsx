import React from 'react';
import {
  Briefcase,
  Sparkles,
  Award,
  MessageSquareQuote,
  Plus,
  ExternalLink,
  Layers,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import type {
  Locale,
  Project,
  SkillGroup,
  Certificate,
  Testimonial,
  Experience,
  Technology,
} from '../../types';
import { adminI18n } from '../../adminI18n';
import { AdminStatCard } from './AdminStatCard';
import { AdminGrowthChart } from './AdminGrowthChart';
import type { AdminTab } from './AdminSidebar';

interface AdminOverviewBentoProps {
  locale: Locale;
  onNavigateTab: (tab: AdminTab) => void;
  projects: Project[];
  skills: SkillGroup[];
  technologies: Technology[];
  certificates: Certificate[];
  testimonials: Testimonial[];
  experiences: Experience[];
  siteSettings: Record<string, boolean>;
}

export const AdminOverviewBento: React.FC<AdminOverviewBentoProps> = ({
  locale,
  onNavigateTab,
  projects,
  skills,
  technologies,
  certificates,
  testimonials,
  experiences,
  siteSettings,
}) => {
  const t = adminI18n[locale];

  // Dynamic time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t.heroGreetingMorning
      : hour < 17
      ? t.heroGreetingAfternoon
      : t.heroGreetingEvening;

  const pendingTestimonialsCount = testimonials.filter(
    (item) => item.status === 'pending'
  ).length;

  // Real 3 recent projects
  const recentProjects = [...projects]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 3);

  return (
    <div className="admin-bento-grid">
      {/* 1. Hero Bento Card (Spans full width) */}
      <section className="bento-card bento-hero-card">
        <div className="hero-card-mesh-bg" aria-hidden="true" />
        <div className="hero-card-content">
          <div className="hero-badge-pill">
            <span className="hero-pulse-dot" />
            <span>{t.realtimeActive}</span>
          </div>

          <h1 className="hero-card-greeting">{greeting}</h1>
          <p className="hero-card-subtitle">{t.heroSubtitle}</p>

          <div className="hero-card-actions">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={() => onNavigateTab('projects')}
            >
              <Plus size={16} />
              <span>{t.quickAddProject}</span>
            </button>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => onNavigateTab('settings')}
            >
              <span>{t.tabSettings}</span>
              <ArrowRight size={14} className="rtl-flip" />
            </button>
          </div>
        </div>

        <div className="hero-card-telemetry">
          <div className="telemetry-item">
            <Database size={16} className="telemetry-icon" />
            <div>
              <span className="telemetry-val">Supabase</span>
              <span className="telemetry-sub">Cloud Synced</span>
            </div>
          </div>
          <div className="telemetry-item">
            <CheckCircle2 size={16} className="telemetry-icon text-accent" />
            <div>
              <span className="telemetry-val">
                {Object.values(siteSettings).filter(Boolean).length}/6
              </span>
              <span className="telemetry-sub">{t.statActiveSections}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bento Stat Cards Grid */}
      <div className="bento-stat-cluster">
        <AdminStatCard
          title={t.statTotalProjects}
          value={projects.length}
          subtitle={`${projects.filter((p) => p.demo_url).length} live demos`}
          icon={Briefcase}
          accentColor="var(--accent-light)"
          badge={t.statVerified}
          onClick={() => onNavigateTab('projects')}
        />

        <AdminStatCard
          title={t.statTechStack}
          value={technologies.length || skills.length}
          subtitle={`${skills.length} organized groups`}
          icon={Sparkles}
          accentColor="#38bdf8"
          badge={t.statVerified}
          onClick={() => onNavigateTab('skills')}
        />

        <AdminStatCard
          title={t.statCertificates}
          value={certificates.length}
          subtitle={`${certificates.filter((c) => c.verification_url).length} with links`}
          icon={Award}
          accentColor="#a78bfa"
          badge={t.statVerified}
          onClick={() => onNavigateTab('certificates')}
        />

        <AdminStatCard
          title={t.statPendingReviews}
          value={pendingTestimonialsCount}
          subtitle={`${testimonials.length} total client reviews`}
          icon={MessageSquareQuote}
          accentColor={pendingTestimonialsCount > 0 ? '#eab308' : 'var(--accent-light)'}
          badge={pendingTestimonialsCount > 0 ? t.statPendingAction : t.statVerified}
          isWarning={pendingTestimonialsCount > 0}
          onClick={() => onNavigateTab('testimonials')}
        />
      </div>

      {/* 3. Monthly Activity Visualizer (Real Data) */}
      <section className="bento-card bento-chart-section">
        <AdminGrowthChart
          locale={locale}
          projects={projects}
          certificates={certificates}
          testimonials={testimonials}
        />
      </section>

      {/* 4. Recent Projects Showcase */}
      <section className="bento-card bento-recent-card">
        <div className="recent-card-head">
          <div>
            <h2 className="recent-card-title">{t.recentProjectsTitle}</h2>
            <span className="recent-card-sub">{t.recentProjectsSub}</span>
          </div>
          <button
            type="button"
            className="recent-view-all-btn"
            onClick={() => onNavigateTab('projects')}
          >
            <span>{t.viewAll}</span>
            <ArrowRight size={14} className="rtl-flip" />
          </button>
        </div>

        <div className="recent-projects-list">
          {recentProjects.length > 0 ? (
            recentProjects.map((p) => (
              <div key={p.id || p.name} className="recent-project-row">
                <div className="project-row-thumb">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="thumb-img" />
                  ) : (
                    <Layers size={18} className="thumb-fallback" />
                  )}
                </div>

                <div className="project-row-meta">
                  <span className="project-row-title">{p.name}</span>
                  <span className="project-row-category">
                    {locale === 'ar' && p.headline_ar ? p.headline_ar : p.headline_en || p.category}
                  </span>
                </div>

                {p.demo_url && (
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="project-row-link"
                    title={p.demo_url}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="recent-empty-state">
              <p>{t.noRecentProjects}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
