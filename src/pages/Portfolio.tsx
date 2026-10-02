import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { Locale, PortfolioData, Project, ProjectCategory } from '../types';
import { ui, buildResumeText } from '../i18n';
import { Sculpture } from '../Sculpture';

const CATEGORIES: ProjectCategory[] = ['fullstack', 'frontend', 'backend', 'other'];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '↘'}</span>;
}

function Cover({ p, index }: { p: Project; index: number }) {
  if (p.image_url) {
    return (
      <div className="project-visual cover-img">
        <img src={p.image_url} alt={p.name} loading="lazy" />
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

export function Portfolio({ data, locale, setLocale }: { data: PortfolioData; locale: Locale; setLocale: (l: Locale) => void }) {
  const t = ui[locale];
  const p = data.profile;
  const [category, setCategory] = useState<ProjectCategory | 'all'>('all');
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);

  const L = (en: string, ar: string) => (locale === 'ar' ? ar : en);
  const name = L(p.name_en, p.name_ar);
  const role = L(p.role_en, p.role_ar);
  const items = category === 'all' ? data.projects : data.projects.filter((x) => x.category === category);
  const project = data.projects.find((x) => x.id === selected) ?? null;
  const degrees = data.education.filter((e) => e.kind === 'degree');
  const courses = data.education.filter((e) => e.kind === 'course');

  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  function download() {
    const text = buildResumeText(locale, {
      name, role,
      location: L(p.location_en, p.location_ar),
      email: p.email, phone: p.phone,
      intro: L(p.intro_en, p.intro_ar),
      projects: data.projects.map((x) => ({ name: x.name, headline: L(x.headline_en, x.headline_ar), summary: L(x.summary_en, x.summary_ar) })),
      experiences: data.experiences.map((x) => ({ date: L(x.date_en, x.date_ar), company: L(x.company_en, x.company_ar), role: L(x.role_en, x.role_ar), body: L(x.body_en, x.body_ar) })),
      skills: data.skills.map((x) => ({ title: L(x.title_en, x.title_ar), items: L(x.items_en, x.items_ar) })),
      education: data.education.map((x) => ({ title: L(x.title_en, x.title_ar), org: L(x.org_en, x.org_ar), date: L(x.date_en, x.date_ar), details: L(x.details_en, x.details_ar) })),
    });
    const blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taha-hodhod-resume-' + locale + '.txt';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(t.downloaded);
  }

  async function copyEmail() {
    try { await navigator.clipboard.writeText(p.email); setNotice(t.copied); }
    catch { setNotice(t.copyFailed); }
  }

  const statement = L(p.statement_en, p.statement_ar).split('\n');

  return (
    <>
      <a className="skip-link" href="#work">{t.skip}</a>
      <div className="screen-content">
        <header className="site-header">
          <a href="#top" className="wordmark" aria-label={name}>
            <span className="logo-mark" aria-hidden="true">✳</span>
            <span>{name.toUpperCase()}<small>{t.resumeLabel}</small></span>
          </a>
          <nav aria-label="Main navigation">
            {['work', 'experience', 'contact'].map((id, i) => (
              <a key={id} href={'#' + id}>{t.nav[i]}<span>0{i + 1}</span></a>
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
                <button className="text-action" onClick={download}>{t.download}<span aria-hidden="true">↓</span></button>
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
                {(['all', ...CATEGORIES] as const).map((k) => (
                  <button key={k} onClick={() => setCategory(k)} aria-pressed={category === k}>
                    {t[k]}{k === 'all' && <span>{String(data.projects.length).padStart(2, '0')}</span>}
                  </button>
                ))}
              </div>
              <span role="status" aria-live="polite">{items.length} {t.resultCount}</span>
            </div>
            <div className={'project-grid ' + (items.length === 1 ? 'single-result' : '')}>
              {items.map((proj, i) => (
                <article key={proj.id ?? proj.name} className="project-card">
                  <button className="project-open" onClick={() => setSelected(proj.id ?? null)} aria-label={proj.name}>
                    <Cover p={proj} index={i} />
                    <div className="project-caption">
                      <div>
                        <span className="project-number">/{String(i + 1).padStart(2, '0')}</span>
                        <h3>{proj.name}</h3>
                        <span className="project-year">{proj.year}</span>
                      </div>
                      <span className="project-arrow"><Arrow diagonal /></span>
                    </div>
                    <p className="project-headline">{L(proj.headline_en, proj.headline_ar)}</p>
                    <div className="project-tags">{proj.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  </button>
                </article>
              ))}
            </div>
          </section>

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
                {data.skills.map((g) => (
                  <div key={g.id ?? g.title_en}><h4>{L(g.title_en, g.title_ar)}</h4><p>{L(g.items_en, g.items_ar)}</p></div>
                ))}
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

          <section className="contact-section section-shell" id="contact" aria-labelledby="contact-title">
            <p className="section-kicker">04 / WHAT'S NEXT?</p>
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
                  <button onClick={download}>{t.download} ↓</button>
                  <button onClick={() => window.print()}>{t.print} ↗</button>
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
              <span>{project.year} · {t[project.category]}</span>
              <button autoFocus aria-label={t.close} onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="dialog-content">
              <p className="section-kicker">{project.name}</p>
              <h2>{L(project.headline_en, project.headline_ar)}</h2>
              <p className="case-context">{L(project.summary_en, project.summary_ar)}</p>
              <div className="project-tags dialog-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="dialog-links">
                {project.demo_url && <a className="primary-action" href={project.demo_url} target="_blank" rel="noreferrer">{t.viewDemo}<span aria-hidden="true">↗</span></a>}
                {project.code_url && <a className="text-action" href={project.code_url} target="_blank" rel="noreferrer">{t.viewCode} ↗</a>}
              </div>
              {project.image_url && <img className="dialog-image" src={project.image_url} alt={project.name} />}
              <button className="text-action" onClick={() => setSelected(null)}>{t.close} ↙</button>
            </div>
          </>
        )}
      </dialog>

      <div className={'toast ' + (notice ? 'is-visible' : '')} role="status" aria-live="polite">{notice}</div>
    </>
  );
}
