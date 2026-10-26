import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  Menu,
  Search,
  Bell,
  Languages,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import type { Locale } from '../../types';
import { adminI18n } from '../../adminI18n';

interface AdminTopBarProps {
  onToggleSidebar: () => void;
  locale: Locale;
  onToggleLocale: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingReviewsCount: number;
  onNavigateToReviews: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  onToggleSidebar,
  locale,
  onToggleLocale,
  searchQuery,
  onSearchChange,
  pendingReviewsCount,
  onNavigateToReviews,
}) => {
  const t = adminI18n[locale];
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // OS detection for shortcut hint (⌘K for macOS/iOS, Ctrl+K for Windows/Linux)
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

  // Keyboard shortcut listener to focus search on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for notifications popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <header className="admin-bento-topbar">
      {/* Mobile Drawer Trigger */}
      <button
        type="button"
        className="admin-topbar-menu-btn"
        onClick={onToggleSidebar}
        aria-label="Open sidebar menu"
      >
        <Menu size={20} />
      </button>

      {/* Rounded Search Input */}
      <div className="admin-topbar-search-box">
        <Search size={16} className="search-icon" aria-hidden="true" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="admin-search-input"
          aria-label={t.searchPlaceholder}
        />
        {searchQuery ? (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="search-kbd-hint">{shortcutLabel}</kbd>
        )}
      </div>

      {/* Right Utility Group */}
      <div className="admin-topbar-actions">
        {/* Notifications Popover (Strictly pending testimonials) */}
        <div className="admin-notif-wrapper" ref={notifRef}>
          <button
            type="button"
            className={`admin-topbar-btn ${showNotifications ? 'is-active' : ''}`}
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label={t.notificationsTitle}
            aria-expanded={showNotifications}
          >
            <Bell size={18} />
            {pendingReviewsCount > 0 && (
              <span className="admin-notif-badge">{pendingReviewsCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="admin-notif-popover" role="dialog" aria-label={t.notificationsTitle}>
              <div className="notif-popover-header">
                <span className="notif-popover-title">{t.notificationsTitle}</span>
                <div className="notif-popover-header-actions">
                  {pendingReviewsCount > 0 && (
                    <span className="notif-popover-count">
                      {pendingReviewsCount}
                    </span>
                  )}
                  <button
                    type="button"
                    className="notif-popover-close-btn"
                    onClick={() => setShowNotifications(false)}
                    aria-label={t.close}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="notif-popover-body">
                {pendingReviewsCount > 0 ? (
                  <div className="notif-item-pending">
                    <div className="notif-icon-circle">
                      <AlertCircle size={16} />
                    </div>
                    <div className="notif-item-content">
                      <p className="notif-item-text">
                        <strong>{pendingReviewsCount}</strong> {t.pendingReviewsCount}
                      </p>
                      <button
                        type="button"
                        className="notif-action-btn"
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigateToReviews();
                        }}
                      >
                        {t.reviewAction} →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="notif-item-empty">
                    <CheckCircle2 size={20} className="notif-empty-icon" />
                    <p>{t.noPendingTestimonials}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Runtime Language Switcher (AR / EN) */}
        <button
          type="button"
          className="admin-topbar-btn admin-lang-btn"
          onClick={onToggleLocale}
          title={t.languageToggle}
          aria-label={t.languageToggle}
        >
          <Languages size={18} />
          <span className="lang-label">{t.languageToggle}</span>
        </button>

        {/* View Live Portfolio Link */}
        <Link
          to="/"
          className="admin-topbar-btn admin-live-link"
          target="_blank"
          rel="noopener noreferrer"
          title={t.viewLiveSite}
        >
          <ExternalLink size={16} />
          <span className="live-link-label">{t.viewLiveSite}</span>
        </Link>
      </div>
    </header>
  );
};
