import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { Certificate, Locale, PortfolioData, Project, ProjectCategory } from '../types';
import { ui } from '../i18n';
import { Sculpture } from '../Sculpture';
import { DigitalTwinChat } from '../components/DigitalTwinChat';
import { findTechnologyIcons, isSameTechnology, savedTechnologyIconUrl } from '../lib/technology-icons';
import { supabase } from '../lib/supabase';

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '↘'}</span>;
}

function technologySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[+#]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function TechnologyIcon({ technology }: { technology: { name: string; icon: string } }) {
  const [candidates, setCandidates] = useState<string[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    setCandidateIndex(0);

    const savedIcon = savedTechnologyIconUrl(technology.icon);
    if (savedIcon) {
      setSearching(false);
      setCandidates([savedIcon]);
      return;
    }

    setSearching(true);
    setCandidates([]);
    void findTechnologyIcons(technology.name, technology.icon).then((resolved) => {
      if (active) {
        setCandidates(resolved);
        setSearching(false);
      }
    });
    return () => { active = false; };
  }, [technology.name, technology.icon]);

  const iconUrl = candidates[candidateIndex];

  if (searching) return <span className="technology-icon-loading" aria-hidden="true" />;

  if (!iconUrl || failed) {
    return (
      <span className="technology-icon-fallback" aria-hidden="true" title={technology.name}>
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </span>
    );
  }

  return (
    <img
      src={iconUrl}
      alt=""
      loading="lazy"
      onError={() => {
        if (candidateIndex + 1 < candidates.length) setCandidateIndex((index) => index + 1);
        else setFailed(true);
      }}
    />
  );
}

function findTechnology(name: string, technologies: PortfolioData['technologies']) {
  if (!name) return undefined;
  const normalized = name.toLowerCase().replace(/\s+/g, ' ').trim();
  return technologies.find((item) => {
    if (isSameTechnology(item.name, name) || isSameTechnology(item.slug, name)) {
      return true;
    }
    const catalogName = item.name.toLowerCase().trim();
    return catalogName === normalized
      || normalized.startsWith(catalogName + ' ')
      || catalogName.startsWith(normalized + ' ');
  });
}

function SkeletonImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="skeleton-image-wrapper">
      {!loaded && <div className="skeleton-image-placeholder skeleton-shimmer" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`${className} ${loaded ? 'img-fade-in' : 'img-hidden'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function Cover({ p, index }: { p: Project; index: number }) {
  if (p.image_url) {
    return (
      <div className="project-visual cover-img">
        <SkeletonImage src={p.image_url} alt={p.name} loading="lazy" />
      </div>
    );
  }
  const initials = p.name.split(/[\s—-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
  return (
    <div className={'project-visual cover-gen cover-' + (index % 4)} aria-hidden="true">
      <span className="cover-num">/{String(index + 1).padStart(2, '0')}</span>
      <span className="cover-mono">{initials}</span>
      <span className="cover-line" />
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 6) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function Portfolio({ data, locale, setLocale }: { data: PortfolioData; locale: Locale; setLocale: (l: Locale) => void }) {
  const PROJECTS_PER_PAGE = 5;
  const t = ui[locale];
  const p = data.profile;
  const [category, setCategory] = useState<ProjectCategory | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const handleCategoryChange = (nextCategory: ProjectCategory | 'all') => {
    if (category === nextCategory) return;
    setIsFiltering(true);
    setCategory(nextCategory);
    setCurrentPage(1);
    setTimeout(() => setIsFiltering(false), 220);
  };

  // Testimonial submission form state
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackRole, setFeedbackRole] = useState('');
  const [feedbackCompany, setFeedbackCompany] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const dialog = useRef<HTMLDialogElement>(null);
  const certDialog = useRef<HTMLDialogElement>(null);
  const feedbackDialog = useRef<HTMLDialogElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const certOffsetRef = useRef(0);
  const isCertModalOpenRef = useRef(false);

  const testimonialTrackRef = useRef<HTMLDivElement>(null);
  const isTestimonialHoveredRef = useRef(false);
  const testimonialOffsetRef = useRef(0);

  const cvPdfUrl = `${import.meta.env.BASE_URL}Taha_Ahmed_Hodhod_CV.pdf`;

  const L = (en: string, ar: string) => (locale === 'ar' ? ar : en);
  const name = L(p.name_en, p.name_ar);
  const role = L(p.role_en, p.role_ar);
  const items = category === 'all' ? data.projects : data.projects.filter((x) => x.category === category);
  const totalPages = Math.max(1, Math.ceil(items.length / PROJECTS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedItems = items.slice((safePage - 1) * PROJECTS_PER_PAGE, safePage * PROJECTS_PER_PAGE);

  const goToPage = (pageNumber: number) => {
    const next = Math.min(Math.max(1, pageNumber), totalPages);
    setCurrentPage(next);
    const workSection = document.getElementById('work');
    if (workSection) {
      workSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const categories = data.categories;
  const project = data.projects.find((x) => x.id === selected) ?? null;
  const degrees = data.education.filter((e) => e.kind === 'degree');
  const courses = data.education.filter((e) => e.kind === 'course');

  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant' }));
  }, []);

  // Project dialog effect
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (selected && !d.open) { d.showModal(); d.scrollTop = 0; }
    if (!selected && d.open) d.close();
    if (selected) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [selected]);

  // Certificate dialog effect
  useEffect(() => {
    const d = certDialog.current;
    if (!d) return;
    if (selectedCertificate && !d.open) { d.showModal(); d.scrollTop = 0; }
    if (!selectedCertificate && d.open) d.close();
    if (selectedCertificate) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [selectedCertificate]);

  // Feedback dialog effect
  useEffect(() => {
    const d = feedbackDialog.current;
    if (!d) return;
    if (feedbackOpen && !d.open) { d.showModal(); d.scrollTop = 0; }
    if (!feedbackOpen && d.open) d.close();
    if (feedbackOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [feedbackOpen]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Keep isCertModalOpenRef in sync with selectedCertificate
  useEffect(() => {
    isCertModalOpenRef.current = !!selectedCertificate;
  }, [selectedCertificate]);

  // Continuous infinite marquee animation loop for certificates (preserves position across modal open/close)
  useEffect(() => {
    const el = marqueeTrackRef.current;
    if (!el || data.certificates.length === 0) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isCertModalOpenRef.current) {
        const speed = isHoveredRef.current ? 20 : 50;
        certOffsetRef.current += delta * speed;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && certOffsetRef.current >= halfWidth) {
          certOffsetRef.current = certOffsetRef.current % halfWidth;
        }
        el.style.transform = `translate3d(-${certOffsetRef.current}px, 0, 0)`;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [data.certificates]);

  // Continuous infinite marquee animation loop for testimonials
  useEffect(() => {
    const el = testimonialTrackRef.current;
    if (!el || data.testimonials.length === 0) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!feedbackOpen) {
        const speed = isTestimonialHoveredRef.current ? 15 : 40;
        testimonialOffsetRef.current += delta * speed;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && testimonialOffsetRef.current >= halfWidth) {
          testimonialOffsetRef.current = testimonialOffsetRef.current % halfWidth;
        }
        el.style.transform = `translate3d(-${testimonialOffsetRef.current}px, 0, 0)`;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [data.testimonials, feedbackOpen]);

  async function copyEmail() {
    try { await navigator.clipboard.writeText(p.email); setNotice(t.copied); }
    catch { setNotice(t.copyFailed); }
  }

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackContent.trim()) {
      setFeedbackStatus({ type: 'error', message: locale === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill in required fields.' });
      return;
    }
    if (!supabase) {
      setFeedbackStatus({ type: 'error', message: locale === 'ar' ? 'الاتصال بقاعدة البيانات غير متوفر حاليًا' : 'Database connection not configured.' });
      return;
    }
    setSubmittingFeedback(true);
    setFeedbackStatus(null);
    try {
      const { error } = await supabase.from('testimonials').insert([{
        client_name: feedbackName.trim(),
        client_role: feedbackRole.trim(),
        client_company: feedbackCompany.trim(),
        content: feedbackContent.trim(),
        rating: feedbackRating,
        status: 'pending',
      }]);
      if (error) throw error;
      setFeedbackStatus({ type: 'success', message: t.testimonialSuccess });
      setTimeout(() => {
        setFeedbackOpen(false);
        setFeedbackStatus(null);
        setFeedbackName('');
        setFeedbackRole('');
        setFeedbackCompany('');
        setFeedbackContent('');
        setFeedbackRating(5);
      }, 2500);
    } catch (err) {
      setFeedbackStatus({ type: 'error', message: err instanceof Error ? err.message : t.testimonialError });
    } finally {
      setSubmittingFeedback(false);
    }
  }

  const statement = L(p.statement_en, p.statement_ar).split('\n');

  const s = data.settings || {
    testimonials_button_visible: true,
    section_work_visible: true,
    section_about_visible: true,
    section_experience_visible: true,
    section_certificates_visible: true,
    section_testimonials_visible: true,
  };

  // Compute navigation links dynamically
  const navSections = [
    ...(s.section_work_visible !== false ? [{ id: 'work', label: t.nav[0] }] : []),
    ...(s.section_experience_visible !== false ? [{ id: 'experience', label: t.nav[1] }] : []),
    ...(s.section_certificates_visible !== false && data.certificates.length > 0 ? [{ id: 'certificates', label: t.nav[2] }] : []),
    ...(s.section_testimonials_visible !== false ? [{ id: 'testimonials', label: t.nav[3] }] : []),
    { id: 'contact', label: t.nav[4] },
  ];

  return (
    <>
      <a className="skip-link" href="#work">{t.skip}</a>
      <div className="screen-content">
        <DigitalTwinChat locale={locale} />
        <header className="site-header">
          <a href="#top" className="wordmark" aria-label={name}>
            <span className="logo-mark" aria-hidden="true">✳</span>
            <span>{name.toUpperCase()}<small>{t.resumeLabel}</small></span>
          </a>
          <nav aria-label="Main navigation">
            {navSections.map((sec, i) => (
              <a key={sec.id} href={'#' + sec.id}>{sec.label}<span>0{i + 1}</span></a>
            ))}
          </nav>
          <button className="locale-button" aria-label={t.language} onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}>
            <span className={locale === 'ar' ? 'locale-active' : ''}>ع</span><i>/</i><span className={locale === 'en' ? 'locale-active' : ''}>EN</span>
          </button>
          <Link className="admin-link" to="/admin">{t.admin}</Link>
        </header>

        <main>
          <section className="hero section-shell" id="top">
            <div className="hero-intro">
              <div className="availability"><span /> {L(p.available_en, p.available_ar)}</div>
              <p className="hero-role">{role}<span> / {p.years_label}</span></p>
              <h1 id="hero-title" className="english-name">{name}<span className="name-stop">.</span></h1>
              <p className="hero-statement">{statement[0]}<br />{statement[1] ?? ''}</p>
              <p className="hero-description">{L(p.intro_en, p.intro_ar)}</p>
              <div className="hero-actions">
                <a className="primary-action" href="#work">{t.viewWork}<Arrow /></a>
                <a className="text-action" href={cvPdfUrl} download="Taha_Ahmed_Hodhod_CV.pdf" onClick={() => setNotice(t.downloaded)}>{t.download}<span aria-hidden="true">↓</span></a>
              </div>
              {data.source === 'local' && <p className="fiction-notice"><span aria-hidden="true">◌</span> {t.localNotice}</p>}
            </div>
            <div className="hero-photo">
              <div className="photo-frame">
                {p.photo_url
                  ? <img src={p.photo_url} alt={name} />
                  : <div className="photo-placeholder" aria-hidden="true"><span>{name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span></div>}
                <span className="photo-tick" aria-hidden="true">+</span>
              </div>
              <div className="specimen-meta"><span>{L('PORTRAIT', 'صورة شخصية')}</span><span>{L('AVAILABLE FOR WORK', 'متاح للعمل')}</span></div>
            </div>
            <div className="hero-baseline">
              <span>{L(p.location_en, p.location_ar)}</span>
              <span>DESIGN × CODE × SHIPPING</span>
              <a href="#work" aria-label={t.viewWork}>↓</a>
            </div>
          </section>

          {s.section_work_visible !== false && (
            <section className="work-section section-shell" id="work" aria-labelledby="work-title">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">01 / SELECTED WORK</p>
                  <h2 id="work-title">{t.selected}<span className="tiny-sup">{String(data.projects.length).padStart(2, '0')}</span></h2>
                </div>
                <p>{t.selectedSub}<br /><span>{t.projectHint}</span></p>
              </div>
              <div className="filter-row">
                <div role="group" aria-label="Project categories">
                  {(['all', ...categories.map((item) => item.slug)] as const).map((k) => {
                    const option = categories.find((item) => item.slug === k);
                    const label = k === 'all' ? t.all : (locale === 'ar' ? option?.name_ar : option?.name_en) || k;
                    return (
                      <button key={k} onClick={() => handleCategoryChange(k)} aria-pressed={category === k}>
                        {label}{k === 'all' && <span>{String(data.projects.length).padStart(2, '0')}</span>}
                      </button>
                    );
                  })}
                </div>
                <span role="status" aria-live="polite">
                  {totalPages > 1
                    ? (locale === 'ar'
                        ? `${t.pageOf} ${safePage} من ${totalPages} · ${items.length} ${t.resultCount}`
                        : `${t.pageOf} ${safePage} of ${totalPages} · ${items.length} ${t.resultCount}`)
                    : `${items.length} ${t.resultCount}`}
                </span>
              </div>
              <div className={'project-grid projects-container-transition ' + (isFiltering ? 'is-changing ' : '') + (paginatedItems.length === 1 ? 'single-result' : '')}>
                {paginatedItems.map((proj, i) => {
                  const globalIndex = (safePage - 1) * PROJECTS_PER_PAGE + i;
                  return (
                    <article key={proj.id ?? proj.name} className="project-card">
                      <button className="project-open" onClick={() => setSelected(proj.id ?? null)} aria-label={proj.name}>
                        <Cover p={proj} index={globalIndex} />
                        <div className="project-caption">
                          <div>
                            <span className="project-number">/{String(globalIndex + 1).padStart(2, '0')}</span>
                            <h3>{proj.name}</h3>
                            <span className="project-year">{proj.year}</span>
                          </div>
                          <span className="project-arrow"><Arrow diagonal /></span>
                        </div>
                        <p className="project-headline">{L(proj.headline_en, proj.headline_ar)}</p>
                        <div className="project-tags">{proj.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                      </button>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <nav className="projects-pagination" aria-label={locale === 'ar' ? 'التنقل بين صفحات المشاريع' : 'Projects pagination'}>
                  <button
                    type="button"
                    className="pagination-btn pagination-prev"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                    aria-label={t.previousPage}
                  >
                    <span className="pagination-arrow" aria-hidden="true">{locale === 'ar' ? '→' : '←'}</span>
                    <span>{t.previousPage}</span>
                  </button>

                  <div className="pagination-pages" role="group" aria-label={locale === 'ar' ? 'أرقام الصفحات' : 'Page numbers'}>
                    {getPageNumbers(safePage, totalPages).map((pageNum, idx) => {
                      if (pageNum === '...') {
                        return <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">…</span>;
                      }
                      const isCurrent = pageNum === safePage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          className={`pagination-pill ${isCurrent ? 'active' : ''}`}
                          onClick={() => goToPage(Number(pageNum))}
                          aria-current={isCurrent ? 'page' : undefined}
                          aria-label={`${t.pageOf} ${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="pagination-btn pagination-next"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    aria-label={t.nextPage}
                  >
                    <span>{t.nextPage}</span>
                    <span className="pagination-arrow" aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
                  </button>
                </nav>
              )}
            </section>
          )}

          {s.section_about_visible !== false && (
            <section className="about-section section-shell" aria-labelledby="about-title">
              <div className="about-left">
                <p className="section-kicker">02 / {t.aboutLabel.toUpperCase()}</p>
                <h2 id="about-title">{t.aboutTitle[0]}<br /><span>{t.aboutTitle[1]}</span></h2>
                <p className="about-body">{L(p.about_en, p.about_ar)}</p>
                <div className="about-stamp" aria-hidden="true"><span>THINK</span><b>✳</b><span>MAKE</span></div>
              </div>
              <Sculpture labels={{
                sculpture: t.sculpture, hint: t.sculptureHint, pause: t.pause, play: t.play,
                paused: t.pause, running: t.play, reduced: t.pause, reset: '↺', specimen: 'FORM STUDY 001',
              }} />
            </section>
          )}

          {s.section_experience_visible !== false && (
            <section className="experience-section section-shell" id="experience" aria-labelledby="experience-title">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">03 / THE JOURNEY</p>
                  <h2 id="experience-title">{t.experience}</h2>
                </div>
                <p>{t.experienceNote}</p>
              </div>
              <div className="experience-list">
                {data.experiences.map((h, i) => (
                  <article key={h.id ?? i}>
                    <div className="experience-date"><span>{L(h.date_en, h.date_ar)}</span>{i === 0 && <i />}</div>
                    <div><h3>{L(h.company_en, h.company_ar)}</h3><p className="experience-role">{L(h.role_en, h.role_ar)}</p></div>
                    <p>{L(h.body_en, h.body_ar)}</p>
                  </article>
                ))}
              </div>
              <div className="toolkit">
                <div><h3>{t.toolkit}</h3><p>{t.toolNote}</p></div>
                <div className="skill-list">
                  {data.skills.map((g) => {
                    const enItems = g.items_en.split(/[·,]/).map((item) => item.trim()).filter(Boolean);
                    const arItems = g.items_ar.split(/[·,]/).map((item) => item.trim()).filter(Boolean);
                    return (
                      <div key={g.id ?? g.title_en}>
                        <h4>{L(g.title_en, g.title_ar)}</h4>
                        <div className="technology-list">
                          {enItems.map((enTech, idx) => {
                            const arTech = arItems[idx] || enTech;
                            const displayName = locale === 'ar' ? arTech : enTech;
                            const technology = findTechnology(enTech, data.technologies)
                              || findTechnology(displayName, data.technologies)
                              || { name: enTech, icon: '', slug: technologySlug(enTech) };
                            return (
                              <span className="technology-chip" key={enTech}>
                                <TechnologyIcon technology={technology} />
                                <span>{displayName}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="education">
                <h3>{t.education}</h3>
                <div className="education-grid">
                  {degrees.length > 0 && (
                    <div>
                      <h4>{t.degrees}</h4>
                      {degrees.map((e) => (
                        <p key={e.id ?? e.title_en}><b>{L(e.title_en, e.title_ar)}</b> — {L(e.org_en, e.org_ar)}<br /><span>{L(e.date_en, e.date_ar)} · {L(e.details_en, e.details_ar)}</span></p>
                      ))}
                    </div>
                  )}
                  {courses.length > 0 && (
                    <div>
                      <h4>{t.courses}</h4>
                      {courses.map((e) => (
                        <p key={e.id ?? e.title_en}><b>{L(e.title_en, e.title_ar)}</b> — {L(e.org_en, e.org_ar)}<br /><span>{L(e.date_en, e.date_ar)} · {L(e.details_en, e.details_ar)}</span></p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {s.section_certificates_visible !== false && data.certificates.length > 0 && (
            <section className="certificates-section section-shell" id="certificates" aria-labelledby="certificates-title">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">04 / CREDENTIALS</p>
                  <h2 id="certificates-title">{t.certificatesTitle}<span className="tiny-sup">{String(data.certificates.length).padStart(2, '0')}</span></h2>
                </div>
                <p>{t.certificatesSub}</p>
              </div>
              <div
                className="marquee-shell"
                onMouseEnter={() => { isHoveredRef.current = true; }}
                onMouseLeave={() => { isHoveredRef.current = false; }}
              >
                <div ref={marqueeTrackRef} className="marquee-js-track">
                  <div className="marquee-group">
                    {[...data.certificates, ...data.certificates, ...data.certificates, ...data.certificates].map((cert, idx) => (
                      <button
                        key={`g1-${cert.id ?? cert.title}-${idx}`}
                        className="certificate-card"
                        onClick={() => setSelectedCertificate(cert)}
                        aria-label={`${cert.title} - ${cert.issuer}`}
                      >
                        <div className="cert-card-img">
                          {cert.image_url ? (
                            <SkeletonImage src={cert.image_url} alt={cert.title} loading="lazy" />
                          ) : (
                            <div className="cert-card-placeholder">
                              <span>🎓</span>
                            </div>
                          )}
                        </div>
                        <div className="cert-card-info">
                          <span className="cert-issuer">{cert.issuer}</span>
                          <h3 className="cert-title">{cert.title}</h3>
                          {cert.issue_date && <span className="cert-date">{cert.issue_date}</span>}
                        </div>
                        <span className="cert-open-hint">{t.viewCertificate} ↗</span>
                      </button>
                    ))}
                  </div>
                  <div className="marquee-group" aria-hidden="true">
                    {[...data.certificates, ...data.certificates, ...data.certificates, ...data.certificates].map((cert, idx) => (
                      <button
                        key={`g2-${cert.id ?? cert.title}-${idx}`}
                        className="certificate-card"
                        onClick={() => setSelectedCertificate(cert)}
                        tabIndex={-1}
                      >
                        <div className="cert-card-img">
                          {cert.image_url ? (
                            <SkeletonImage src={cert.image_url} alt="" loading="lazy" />
                          ) : (
                            <div className="cert-card-placeholder">
                              <span>🎓</span>
                            </div>
                          )}
                        </div>
                        <div className="cert-card-info">
                          <span className="cert-issuer">{cert.issuer}</span>
                          <h3 className="cert-title">{cert.title}</h3>
                          {cert.issue_date && <span className="cert-date">{cert.issue_date}</span>}
                        </div>
                        <span className="cert-open-hint">{t.viewCertificate} ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {s.section_testimonials_visible !== false && (
            <section className="testimonials-section section-shell" id="testimonials" aria-labelledby="testimonials-title">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">05 / CLIENT FEEDBACK</p>
                  <h2 id="testimonials-title">{t.testimonialsTitle}<span className="tiny-sup">{String(data.testimonials.length).padStart(2, '0')}</span></h2>
                </div>
                <div className="testimonials-heading-action">
                  <p>{t.testimonialsSub}</p>
                  {s.testimonials_button_visible !== false && (
                    <button className="primary-action share-btn" onClick={() => setFeedbackOpen(true)}>
                      <span aria-hidden="true">✳</span> {t.shareFeedback}
                    </button>
                  )}
                </div>
              </div>
              {data.testimonials.length > 0 ? (
                <div
                  className="marquee-shell testimonials-marquee-shell"
                  onMouseEnter={() => { isTestimonialHoveredRef.current = true; }}
                  onMouseLeave={() => { isTestimonialHoveredRef.current = false; }}
                >
                  <div ref={testimonialTrackRef} className="marquee-js-track">
                    <div className="marquee-group">
                      {(data.testimonials.length < 4
                        ? [...data.testimonials, ...data.testimonials, ...data.testimonials, ...data.testimonials]
                        : [...data.testimonials, ...data.testimonials]
                      ).map((item, idx) => (
                        <article key={`t1-${item.id ?? item.client_name}-${idx}`} className="testimonial-card">
                          <div className="testimonial-stars" aria-label={`${item.rating || 5} out of 5 stars`}>
                            {Array.from({ length: item.rating || 5 }).map((_, i) => (
                              <span key={i} className="star-icon" aria-hidden="true">★</span>
                            ))}
                          </div>
                          <p className="testimonial-content">“{item.content}”</p>
                          <div className="testimonial-author">
                            <div className="testimonial-avatar" aria-hidden="true">
                              {item.avatar_url ? (
                                <SkeletonImage src={item.avatar_url} alt="" loading="lazy" />
                              ) : (
                                <span>{item.client_name.slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="testimonial-meta">
                              <h3 className="testimonial-name">{item.client_name}</h3>
                              {(item.client_role || item.client_company) && (
                                <p className="testimonial-role">
                                  {[item.client_role, item.client_company].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="marquee-group" aria-hidden="true">
                      {(data.testimonials.length < 4
                        ? [...data.testimonials, ...data.testimonials, ...data.testimonials, ...data.testimonials]
                        : [...data.testimonials, ...data.testimonials]
                      ).map((item, idx) => (
                        <article key={`t2-${item.id ?? item.client_name}-${idx}`} className="testimonial-card" tabIndex={-1}>
                          <div className="testimonial-stars" aria-label={`${item.rating || 5} out of 5 stars`}>
                            {Array.from({ length: item.rating || 5 }).map((_, i) => (
                              <span key={i} className="star-icon" aria-hidden="true">★</span>
                            ))}
                          </div>
                          <p className="testimonial-content">“{item.content}”</p>
                          <div className="testimonial-author">
                            <div className="testimonial-avatar" aria-hidden="true">
                              {item.avatar_url ? (
                                <SkeletonImage src={item.avatar_url} alt="" loading="lazy" />
                              ) : (
                                <span>{item.client_name.slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="testimonial-meta">
                              <h3 className="testimonial-name">{item.client_name}</h3>
                              {(item.client_role || item.client_company) && (
                                <p className="testimonial-role">
                                  {[item.client_role, item.client_company].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="testimonials-empty">
                  <p>{t.noTestimonials}</p>
                  {s.testimonials_button_visible !== false && (
                    <button className="text-action" onClick={() => setFeedbackOpen(true)}>
                      {t.shareFeedback} ↗
                    </button>
                  )}
                </div>
              )}
            </section>
          )}


          <section className="contact-section section-shell" id="contact" aria-labelledby="contact-title">
            <p className="section-kicker">{s.section_testimonials_visible !== false ? '06' : '05'} / WHAT'S NEXT?</p>
            <div className="contact-layout">
              <div>
                <h2 id="contact-title">{t.contactTitle[0]}<br /><span>{t.contactTitle[1]}</span><span className="contact-star" aria-hidden="true">✳</span></h2>
                <p>{t.contactBody}</p>
              </div>
              <div className="contact-details">
                <span className="contact-email">{p.email}</span>
                <div className="contact-buttons">
                  <button className="primary-action" onClick={copyEmail}>{t.copyEmail}<span aria-hidden="true">↗</span></button>
                  <a className="text-action" href={'tel:' + p.phone.replace(/\s/g, '')}>{t.callMe} · {p.phone}</a>
                </div>
                <div className="contact-social">
                  {p.github && <a href={p.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
                  {p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
                </div>
                <div className="resume-actions">
                  <a href={cvPdfUrl} download="Taha_Ahmed_Hodhod_CV.pdf" onClick={() => setNotice(t.downloaded)}>{t.download} ↓</a>
                  <a href={cvPdfUrl} target="_blank" rel="noreferrer">{t.print} ↗</a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <a href="#top">✳ {name.toUpperCase()}</a>
          <span>{t.footer}</span>
          <span>© 2026</span>
        </footer>
      </div>

      <section className="print-resume" aria-label="Printable resume">
        <h1>{name}</h1>
        <h2>{role}</h2>
        <p>{L(p.location_en, p.location_ar)} · {p.email} · {p.phone}</p>
        <p>{L(p.intro_en, p.intro_ar)}</p>
        <h2>{t.selected}</h2>
        {data.projects.map((x) => (
          <article key={x.id ?? x.name}>
            <h3>{x.name} — {L(x.headline_en, x.headline_ar)}</h3>
            <p>{L(x.summary_en, x.summary_ar)}</p>
          </article>
        ))}
        <h2>{t.experience}</h2>
        {data.experiences.map((h, i) => (
          <article key={i}>
            <h3>{L(h.company_en, h.company_ar)} · {L(h.role_en, h.role_ar)}</h3>
            <p>{L(h.date_en, h.date_ar)}</p>
            <p>{L(h.body_en, h.body_ar)}</p>
          </article>
        ))}
        <h2>{t.toolkit}</h2>
        {data.skills.map((g, i) => <p key={i}>{L(g.title_en, g.title_ar)}: {L(g.items_en, g.items_ar)}</p>)}
        <h2>{t.education}</h2>
        {data.education.map((e, i) => <p key={i}>{L(e.title_en, e.title_ar)} — {L(e.org_en, e.org_ar)} ({L(e.date_en, e.date_ar)})</p>)}
      </section>

      {/* Project Details Dialog — Main Image FIRST */}
      <dialog
        ref={dialog}
        className="case-dialog"
        onCancel={() => setSelected(null)}
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) setSelected(null);
          }
        }}
      >
        {project && (
          <>
            <div className="dialog-top">
              <span>{project.year} · {(locale === 'ar' ? data.categories.find((item) => item.slug === project.category)?.name_ar : data.categories.find((item) => item.slug === project.category)?.name_en) || project.category}</span>
              <button autoFocus aria-label={t.close} onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="dialog-content">
              {/* 1. Main Project Image FIRST */}
              {project.image_url ? (
                <div className="dialog-hero-frame">
                  <SkeletonImage className="dialog-image" src={project.image_url} alt={project.name} loading="eager" />
                </div>
              ) : (
                <div className="dialog-hero-frame dialog-fallback-frame">
                  <span className="dialog-fallback-title">{project.name}</span>
                </div>
              )}

              {/* 2. Project Title and Concise Overview */}
              <div className="dialog-meta-heading">
                <p className="section-kicker">{project.name}</p>
                <h2>{L(project.headline_en, project.headline_ar)}</h2>
              </div>

              {/* 3. Description and Summary */}
              <p className="case-context">{L(project.summary_en, project.summary_ar)}</p>

              {/* 4. Technologies and Technology Icons */}
              {project.tags.length > 0 && (
                <div className="dialog-tech-section">
                  <span className="dialog-sublabel">{locale === 'ar' ? 'التقنيات المستخدمة:' : 'Technologies:'}</span>
                  <div className="technology-list">
                    {project.tags.map((tag) => {
                      const tech = findTechnology(tag, data.technologies)
                        || { name: tag, icon: '', slug: technologySlug(tag) };
                      return (
                        <span className="technology-chip" key={tag}>
                          <TechnologyIcon technology={tech} />
                          <span>{tag}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Live Demo and Code Links */}
              <div className="dialog-links">
                {project.demo_url && (
                  <a className="primary-action" href={project.demo_url} target="_blank" rel="noreferrer">
                    {t.viewDemo}<span aria-hidden="true">↗</span>
                  </a>
                )}
                {project.code_url && (
                  <a className="text-action" href={project.code_url} target="_blank" rel="noreferrer">
                    {t.viewCode} ↗
                  </a>
                )}
                <button className="text-action dialog-close-btn" onClick={() => setSelected(null)}>
                  {t.close} ↙
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>

      {/* Certificate Details Dialog */}
      <dialog
        ref={certDialog}
        className="case-dialog cert-dialog"
        onCancel={() => setSelectedCertificate(null)}
        onClose={() => setSelectedCertificate(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) setSelectedCertificate(null);
          }
        }}
      >
        {selectedCertificate && (
          <>
            <div className="dialog-top">
              <span>{selectedCertificate.issuer} · {selectedCertificate.issue_date || 'Certified'}</span>
              <button autoFocus aria-label={t.close} onClick={() => setSelectedCertificate(null)}>×</button>
            </div>
            <div className="dialog-content">
              {selectedCertificate.image_url ? (
                <div className="dialog-hero-frame cert-hero-frame">
                  <SkeletonImage className="dialog-image" src={selectedCertificate.image_url} alt={selectedCertificate.title} loading="eager" />
                </div>
              ) : (
                <div className="dialog-hero-frame cert-fallback-frame">
                  <span className="cert-emoji">🎓</span>
                </div>
              )}
              <div className="dialog-meta-heading">
                <p className="section-kicker">{selectedCertificate.issuer}</p>
                <h2>{selectedCertificate.title}</h2>
                {selectedCertificate.issue_date && (
                  <p className="cert-date-line">{t.issueDate}: <strong>{selectedCertificate.issue_date}</strong></p>
                )}
              </div>
              <div className="dialog-links">
                {selectedCertificate.verification_url ? (
                  <a className="primary-action" href={selectedCertificate.verification_url} target="_blank" rel="noreferrer">
                    {t.verifyCredential} <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
                <button className="text-action" onClick={() => setSelectedCertificate(null)}>
                  {t.close} ↙
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>

      {/* Testimonial Feedback Modal */}
      <dialog
        ref={feedbackDialog}
        className="case-dialog feedback-dialog"
        onCancel={() => setFeedbackOpen(false)}
        onClose={() => setFeedbackOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) setFeedbackOpen(false);
          }
        }}
      >
        <div className="dialog-top">
          <span>{t.testimonialsTitle}</span>
          <button autoFocus aria-label={t.close} onClick={() => setFeedbackOpen(false)}>×</button>
        </div>
        <div className="dialog-content">
          <div className="dialog-meta-heading">
            <h2>{t.testimonialFormTitle}</h2>
            <p className="case-context">{t.testimonialFormDesc}</p>
          </div>

          {feedbackStatus && (
            <div className={`feedback-alert ${feedbackStatus.type === 'success' ? 'alert-success' : 'alert-error'}`} role="alert">
              {feedbackStatus.message}
            </div>
          )}

          <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
            <label className="af">
              <span>{t.nameField}</span>
              <input
                required
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: محمد علي' : 'e.g. Alex Morgan'}
              />
            </label>
            <div className="form-duo">
              <label className="af">
                <span>{t.roleField}</span>
                <input
                  value={feedbackRole}
                  onChange={(e) => setFeedbackRole(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: مدير تقني' : 'e.g. Engineering Lead'}
                />
              </label>
              <label className="af">
                <span>{t.companyField}</span>
                <input
                  value={feedbackCompany}
                  onChange={(e) => setFeedbackCompany(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: شركة التقنية' : 'e.g. TechCorp'}
                />
              </label>
            </div>
            <label className="af">
              <span>{t.ratingField}</span>
              <div className="rating-selector" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-select-btn ${star <= feedbackRating ? 'is-selected' : ''}`}
                    onClick={() => setFeedbackRating(star)}
                    aria-label={`${star} Stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </label>
            <label className="af">
              <span>{t.feedbackField}</span>
              <textarea
                required
                rows={4}
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder={locale === 'ar' ? 'اكتب رأيك وتجربتك في العمل مع طه...' : 'Write your honest feedback about collaborating with Taha...'}
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-action" disabled={submittingFeedback}>
                {submittingFeedback ? t.submittingFeedback : t.submitFeedback} <span aria-hidden="true">↗</span>
              </button>
              <button type="button" className="text-action" onClick={() => setFeedbackOpen(false)}>
                {t.close}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <div className={'toast ' + (notice ? 'is-visible' : '')} role="status" aria-live="polite">{notice}</div>
    </>
  );
}
