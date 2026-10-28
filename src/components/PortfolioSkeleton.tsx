import type { Locale } from '../types';

interface PortfolioSkeletonProps {
  locale?: Locale;
}

export function PortfolioSkeleton({ locale = 'en' }: PortfolioSkeletonProps) {
  const isAr = locale === 'ar';

  return (
    <div
      className={`skeleton-portfolio-root ${isAr ? 'is-rtl' : 'is-ltr'}`}
      role="status"
      aria-busy="true"
      aria-label={isAr ? 'جارٍ تحميل محتوى الموقع...' : 'Loading portfolio content...'}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top continuous pulsing loading indicator line */}
      <div className="skeleton-top-loader-line" aria-hidden="true">
        <div className="skeleton-top-loader-glow" />
      </div>

      <div className="screen-content">
        {/* Header Skeleton */}
        <header className="site-header skeleton-header-shell" aria-hidden="true">
          <div className="skeleton-brand-cluster">
            <div className="skeleton-box skeleton-logo-badge skeleton-shimmer" />
            <div className="skeleton-box skeleton-logo-text skeleton-shimmer" />
          </div>

          <nav className="skeleton-nav-shell">
            <div className="skeleton-box skeleton-nav-pill skeleton-shimmer" />
            <div className="skeleton-box skeleton-nav-pill skeleton-shimmer" />
            <div className="skeleton-box skeleton-nav-pill skeleton-shimmer" />
            <div className="skeleton-box skeleton-nav-pill skeleton-shimmer" />
            <div className="skeleton-box skeleton-nav-pill skeleton-shimmer" />
          </nav>

          <div className="skeleton-actions-cluster">
            <div className="skeleton-box skeleton-lang-btn skeleton-shimmer" />
            <div className="skeleton-box skeleton-cv-btn skeleton-shimmer" />
          </div>
        </header>

        {/* Hero Section Skeleton */}
        <section className="hero-section section-shell skeleton-hero-shell" aria-hidden="true">
          <div className="hero-main skeleton-hero-main">
            <div className="skeleton-box skeleton-status-badge skeleton-shimmer" />

            <div className="skeleton-hero-titles">
              <div className="skeleton-box skeleton-title-line-1 skeleton-shimmer" />
              <div className="skeleton-box skeleton-title-line-2 skeleton-shimmer" />
            </div>

            <div className="skeleton-hero-paragraph">
              <div className="skeleton-box skeleton-text-line line-100 skeleton-shimmer" />
              <div className="skeleton-box skeleton-text-line line-85 skeleton-shimmer" />
              <div className="skeleton-box skeleton-text-line line-65 skeleton-shimmer" />
            </div>

            <div className="skeleton-hero-actions-row">
              <div className="skeleton-box skeleton-action-btn-primary skeleton-shimmer" />
              <div className="skeleton-box skeleton-action-btn-secondary skeleton-shimmer" />
            </div>
          </div>

          <div className="skeleton-hero-sculpture-col">
            <div className="skeleton-square-visual skeleton-shimmer">
              <div className="skeleton-square-inner" />
            </div>
          </div>
        </section>

        {/* Projects / Work Section Skeleton */}
        <section className="work-section section-shell skeleton-section-shell" aria-hidden="true">
          <div className="section-heading skeleton-section-heading">
            <div className="skeleton-heading-left">
              <div className="skeleton-box skeleton-section-kicker skeleton-shimmer" />
              <div className="skeleton-box skeleton-section-title skeleton-shimmer" />
            </div>
            <div className="skeleton-categories-track">
              <div className="skeleton-box skeleton-cat-pill active skeleton-shimmer" />
              <div className="skeleton-box skeleton-cat-pill skeleton-shimmer" />
              <div className="skeleton-box skeleton-cat-pill skeleton-shimmer" />
              <div className="skeleton-box skeleton-cat-pill skeleton-shimmer" />
            </div>
          </div>

          <div className="skeleton-projects-grid">
            {/* Featured Project Skeleton */}
            <div className="skeleton-project-card featured">
              <div className="skeleton-project-cover skeleton-shimmer" />
              <div className="skeleton-project-info">
                <div className="skeleton-box skeleton-project-idx skeleton-shimmer" />
                <div className="skeleton-box skeleton-project-title skeleton-shimmer" />
                <div className="skeleton-box skeleton-text-line line-90 skeleton-shimmer" />
                <div className="skeleton-chips-row">
                  <div className="skeleton-box skeleton-chip skeleton-shimmer" />
                  <div className="skeleton-box skeleton-chip skeleton-shimmer" />
                  <div className="skeleton-box skeleton-chip skeleton-shimmer" />
                  <div className="skeleton-box skeleton-chip skeleton-shimmer" />
                </div>
              </div>
            </div>

            {/* Standard Project Skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-project-card">
                <div className="skeleton-project-cover skeleton-shimmer" />
                <div className="skeleton-project-info">
                  <div className="skeleton-box skeleton-project-idx skeleton-shimmer" />
                  <div className="skeleton-box skeleton-project-title skeleton-shimmer" />
                  <div className="skeleton-chips-row">
                    <div className="skeleton-box skeleton-chip skeleton-shimmer" />
                    <div className="skeleton-box skeleton-chip skeleton-shimmer" />
                    <div className="skeleton-box skeleton-chip skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Toolkit / Skills Skeleton */}
        <section className="skills-section section-shell skeleton-section-shell" aria-hidden="true">
          <div className="section-heading skeleton-section-heading">
            <div className="skeleton-heading-left">
              <div className="skeleton-box skeleton-section-kicker skeleton-shimmer" />
              <div className="skeleton-box skeleton-section-title skeleton-shimmer" />
            </div>
          </div>

          <div className="skeleton-skills-bento-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-skill-bento-card">
                <div className="skeleton-box skeleton-skill-group-title skeleton-shimmer" />
                <div className="skeleton-chips-row">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="skeleton-box skeleton-chip skeleton-shimmer" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Timeline Skeleton */}
        <section className="experience-section section-shell skeleton-section-shell" aria-hidden="true">
          <div className="section-heading skeleton-section-heading">
            <div className="skeleton-heading-left">
              <div className="skeleton-box skeleton-section-kicker skeleton-shimmer" />
              <div className="skeleton-box skeleton-section-title skeleton-shimmer" />
            </div>
          </div>

          <div className="skeleton-timeline-container">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-timeline-row">
                <div className="skeleton-timeline-dot skeleton-shimmer" />
                <div className="skeleton-timeline-card">
                  <div className="skeleton-box skeleton-timeline-date skeleton-shimmer" />
                  <div className="skeleton-box skeleton-timeline-role skeleton-shimmer" />
                  <div className="skeleton-box skeleton-text-line line-100 skeleton-shimmer" />
                  <div className="skeleton-box skeleton-text-line line-75 skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certificates Ribbon Skeleton */}
        <section className="certificates-section section-shell skeleton-section-shell" aria-hidden="true">
          <div className="section-heading skeleton-section-heading">
            <div className="skeleton-heading-left">
              <div className="skeleton-box skeleton-section-kicker skeleton-shimmer" />
              <div className="skeleton-box skeleton-section-title skeleton-shimmer" />
            </div>
          </div>

          <div className="skeleton-marquee-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-cert-card">
                <div className="skeleton-cert-thumb skeleton-shimmer" />
                <div className="skeleton-cert-meta">
                  <div className="skeleton-box skeleton-cert-issuer skeleton-shimmer" />
                  <div className="skeleton-box skeleton-cert-title skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Skeleton */}
        <section className="testimonials-section section-shell skeleton-section-shell" aria-hidden="true">
          <div className="section-heading skeleton-section-heading">
            <div className="skeleton-heading-left">
              <div className="skeleton-box skeleton-section-kicker skeleton-shimmer" />
              <div className="skeleton-box skeleton-section-title skeleton-shimmer" />
            </div>
          </div>

          <div className="skeleton-marquee-row">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-testimonial-card">
                <div className="skeleton-stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="skeleton-box skeleton-star skeleton-shimmer" />
                  ))}
                </div>
                <div className="skeleton-box skeleton-text-line line-100 skeleton-shimmer" />
                <div className="skeleton-box skeleton-text-line line-85 skeleton-shimmer" />
                <div className="skeleton-testimonial-author">
                  <div className="skeleton-avatar skeleton-shimmer" />
                  <div className="skeleton-author-info">
                    <div className="skeleton-box skeleton-author-name skeleton-shimmer" />
                    <div className="skeleton-box skeleton-author-role skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
