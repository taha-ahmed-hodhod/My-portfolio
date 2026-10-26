import type { Locale } from '../../types';

interface AdminDashboardSkeletonProps {
  adminLocale?: Locale;
}

export function AdminDashboardSkeleton({ adminLocale = 'en' }: AdminDashboardSkeletonProps) {
  const isAr = adminLocale === 'ar';

  return (
    <div
      className={`admin-shell skeleton-admin-shell ${isAr ? 'admin-rtl' : 'admin-ltr'}`}
      dir={isAr ? 'rtl' : 'ltr'}
      role="status"
      aria-busy="true"
      aria-label={isAr ? 'جارٍ تحميل لوحة التحكم...' : 'Loading admin workspace...'}
    >
      {/* Top indeterminate progress bar */}
      <div className="skeleton-top-loader-line" aria-hidden="true">
        <div className="skeleton-top-loader-glow" />
      </div>

      {/* Sidebar Skeleton */}
      <aside className="admin-sidebar skeleton-admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="skeleton-box skeleton-admin-logo skeleton-shimmer" />
          <div className="skeleton-box skeleton-admin-badge skeleton-shimmer" />
        </div>

        <div className="skeleton-admin-nav-groups">
          <div className="skeleton-admin-nav-cluster">
            <div className="skeleton-box skeleton-nav-heading skeleton-shimmer" />
            <div className="skeleton-box skeleton-nav-button active skeleton-shimmer" />
          </div>

          <div className="skeleton-admin-nav-cluster">
            <div className="skeleton-box skeleton-nav-heading skeleton-shimmer" />
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="skeleton-box skeleton-nav-button skeleton-shimmer" />
            ))}
          </div>

          <div className="skeleton-admin-nav-cluster">
            <div className="skeleton-box skeleton-nav-heading skeleton-shimmer" />
            <div className="skeleton-box skeleton-nav-button skeleton-shimmer" />
          </div>
        </div>

        <div className="admin-sidebar-user skeleton-admin-user">
          <div className="skeleton-avatar skeleton-shimmer" />
          <div className="skeleton-admin-user-text">
            <div className="skeleton-box skeleton-text-line line-75 skeleton-shimmer" />
            <div className="skeleton-box skeleton-text-line line-50 skeleton-shimmer" />
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="admin-main skeleton-admin-main">
        {/* Topbar Skeleton */}
        <header className="admin-topbar skeleton-admin-topbar">
          <div className="skeleton-admin-topbar-left">
            <div className="skeleton-box skeleton-crumb skeleton-shimmer" />
          </div>
          <div className="skeleton-admin-search skeleton-shimmer" />
          <div className="skeleton-admin-topbar-actions">
            <div className="skeleton-box skeleton-topbar-btn skeleton-shimmer" />
            <div className="skeleton-box skeleton-topbar-btn skeleton-shimmer" />
            <div className="skeleton-box skeleton-topbar-btn skeleton-shimmer" />
          </div>
        </header>

        {/* Bento Content Area Skeleton */}
        <div className="admin-content-flow skeleton-admin-content">
          {/* Greeting Hub Skeleton */}
          <div className="skeleton-admin-hero-card skeleton-shimmer">
            <div className="skeleton-box skeleton-title-md skeleton-shimmer" />
            <div className="skeleton-box skeleton-text-line line-60 skeleton-shimmer" />
          </div>

          {/* Stat Cards Grid Skeleton */}
          <div className="skeleton-admin-stats-grid">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-admin-stat-card">
                <div className="skeleton-admin-stat-top">
                  <div className="skeleton-box skeleton-stat-icon skeleton-shimmer" />
                  <div className="skeleton-box skeleton-stat-badge skeleton-shimmer" />
                </div>
                <div className="skeleton-box skeleton-stat-num skeleton-shimmer" />
                <div className="skeleton-box skeleton-stat-label skeleton-shimmer" />
              </div>
            ))}
          </div>

          {/* Activity Chart Area Skeleton */}
          <div className="skeleton-admin-chart-card skeleton-shimmer">
            <div className="skeleton-chart-header">
              <div className="skeleton-box skeleton-chart-title skeleton-shimmer" />
              <div className="skeleton-box skeleton-chart-pills skeleton-shimmer" />
            </div>
            <div className="skeleton-chart-mock">
              <div className="skeleton-chart-wave skeleton-shimmer" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
