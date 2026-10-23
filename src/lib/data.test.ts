import { describe, it, expect } from 'vitest';
import { defaultData } from '../default-content';
import { buildResumeText, ui } from '../i18n';

describe('Portfolio Data Model & Defaults', () => {
  it('should include all required sections in defaultData', () => {
    expect(defaultData.profile).toBeDefined();
    expect(defaultData.projects).toBeInstanceOf(Array);
    expect(defaultData.experiences).toBeInstanceOf(Array);
    expect(defaultData.skills).toBeInstanceOf(Array);
    expect(defaultData.education).toBeInstanceOf(Array);
    expect(defaultData.categories).toBeInstanceOf(Array);
    expect(defaultData.technologies).toBeInstanceOf(Array);
    expect(defaultData.certificates).toBeInstanceOf(Array);
    expect(defaultData.testimonials).toBeInstanceOf(Array);
    expect(typeof defaultData.testimonialsVisible).toBe('boolean');
  });

  it('should have consistent translations in both en and ar', () => {
    expect(ui.en.selected).toBeTruthy();
    expect(ui.ar.selected).toBeTruthy();
    expect(ui.en.certificatesTitle).toBeTruthy();
    expect(ui.ar.certificatesTitle).toBeTruthy();
    expect(ui.en.testimonialsTitle).toBeTruthy();
    expect(ui.ar.testimonialsTitle).toBeTruthy();
    expect(ui.en.shareFeedback).toBeTruthy();
    expect(ui.ar.shareFeedback).toBeTruthy();
  });

  it('should construct resume text properly', () => {
    const text = buildResumeText('en', {
      name: defaultData.profile.name_en,
      role: defaultData.profile.role_en,
      location: defaultData.profile.location_en,
      email: defaultData.profile.email,
      phone: defaultData.profile.phone,
      intro: defaultData.profile.intro_en,
      projects: defaultData.projects.map((p) => ({ name: p.name, headline: p.headline_en, summary: p.summary_en })),
      experiences: defaultData.experiences.map((e) => ({ date: e.date_en, company: e.company_en, role: e.role_en, body: e.body_en })),
      skills: defaultData.skills.map((s) => ({ title: s.title_en, items: s.items_en })),
      education: defaultData.education.map((e) => ({ title: e.title_en, org: e.org_en, date: e.date_en, details: e.details_en })),
    });

    expect(text).toContain(defaultData.profile.name_en);
    expect(text).toContain(defaultData.profile.email);
  });
});
