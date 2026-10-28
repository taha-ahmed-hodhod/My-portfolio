import React from 'react';
import { Link } from 'react-router';
import {
  LayoutDashboard,
  Briefcase,
  Tag,
  Award,
  MessageSquareQuote,
  Clock,
  Sparkles,
  GraduationCap,
  User,
  Settings,
  LogOut,
  ChevronRight,
  ArrowLeft,
  X,
} from 'lucide-react';
import type { Locale } from '../../types';
import { adminI18n } from '../../adminI18n';
import { AdminInstallButton } from './AdminInstallButton';

export type AdminTab =
  | 'overview'
  | 'profile'
  | 'projects'
  | 'categories'
  | 'certificates'
  | 'testimonials'
  | 'experiences'
  | 'skills'
  | 'education'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  counts: {
    projects: number;
    categories: number;
    certificates: number;
    testimonialsPending: number;
    testimonialsTotal: number;
    experiences: number;
    skills: number;
    education: number;
  };
  adminEmail: string;
  onSignOut: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  locale,
  counts,
  adminEmail,
  onSignOut,
}) => {
  const t = adminI18n[locale];

  const navGroups: {
    label: string;
    items: {
      key: AdminTab;
      title: string;
      icon: React.ComponentType<{ className?: string; size?: number }>;
      count?: number;
      isPendingBadge?: boolean;
    }[];
  }[] = [
    {
      label: t.navSectionMain,
      items: [
        { key: 'overview', title: t.tabOverview, icon: LayoutDashboard },
      ],
    },
    {
      label: t.navSectionContent,
      items: [
        { key: 'projects', title: t.tabProjects, icon: Briefcase, count: counts.projects },
        { key: 'categories', title: t.tabCategories, icon: Tag, count: counts.categories },
        { key: 'certificates', title: t.tabCertificates, icon: Award, count: counts.certificates },
        {
          key: 'testimonials',
          title: t.tabTestimonials,
          icon: MessageSquareQuote,
          count: counts.testimonialsPending > 0 ? counts.testimonialsPending : counts.testimonialsTotal,
          isPendingBadge: counts.testimonialsPending > 0,
        },
        { key: 'experiences', title: t.tabExperience, icon: Clock, count: counts.experiences },
        { key: 'skills', title: t.tabSkills, icon: Sparkles, count: counts.skills },
        { key: 'education', title: t.tabEducation, icon: GraduationCap, count: counts.education },
      ],
    },
    {
      label: t.navSectionSystem,
      items: [
        { key: 'profile', title: t.tabProfile, icon: User },
        { key: 'settings', title: t.tabSettings, icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-bento-sidebar ${isOpen ? 'is-open' : ''}`}>
        {/* Brand Header */}
        <div className="admin-bento-sidebar-header">
          <div className="admin-brand-pill">
            <span className="admin-brand-dot" aria-hidden="true" />
            <div className="admin-brand-meta">
              <span className="admin-brand-title">Taha Hodhod</span>
              <span className="admin-brand-sub">{t.adminRole}</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={onClose}
            aria-label={t.close}
          >
            <X size={18} />
          </button>
        </div>

        {/* Back to Live Portfolio Action */}
        <div className="admin-sidebar-return-wrap">
          <Link
            to="/"
            className="admin-sidebar-return-btn"
            title={t.viewLiveSite}
            aria-label={t.viewLiveSite}
          >
            <ArrowLeft size={16} className="sidebar-return-icon rtl-flip" />
            <span className="sidebar-return-text">{t.viewLiveSite}</span>
          </Link>
        </div>

        {/* Navigation Groups */}
        <nav className="admin-bento-nav" aria-label="Dashboard Navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="admin-nav-cluster">
              <span className="admin-cluster-label">{group.label}</span>
              <div className="admin-cluster-items">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`admin-bento-nav-btn ${isActive ? 'is-active' : ''}`}
                      onClick={() => {
                        onSelectTab(item.key);
                        onClose();
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="nav-btn-icon-box">
                        <Icon size={18} />
                      </span>
                      <span className="nav-btn-title">{item.title}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`nav-btn-badge ${
                            item.isPendingBadge ? 'badge-pending' : ''
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                      <ChevronRight size={14} className="nav-btn-arrow rtl-flip" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pinned User Profile Block & Install Option */}
        <div className="admin-bento-sidebar-footer">
          <AdminInstallButton locale={locale} variant="sidebar" />
          <div className="admin-user-card" title={adminEmail}>
            <div className="admin-user-avatar">TA</div>
            <div className="admin-user-info">
              <span className="admin-user-name">Taha Ahmed</span>
              <span className="admin-user-email">{adminEmail}</span>
            </div>
            <button
              type="button"
              className="admin-logout-icon-btn"
              onClick={onSignOut}
              title={t.signOut}
              aria-label={t.signOut}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
