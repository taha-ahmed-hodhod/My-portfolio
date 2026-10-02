export type Locale = 'en' | 'ar';
export type ProjectCategory = 'fullstack' | 'frontend' | 'backend' | 'other';

export interface Profile {
  id?: number;
  name_en: string; name_ar: string;
  role_en: string; role_ar: string;
  statement_en: string; statement_ar: string;
  intro_en: string; intro_ar: string;
  about_en: string; about_ar: string;
  location_en: string; location_ar: string;
  available_en: string; available_ar: string;
  email: string; phone: string;
  github: string; linkedin: string;
  photo_url: string;
  years_label: string;
}

export interface Experience {
  id?: number;
  date_en: string; date_ar: string;
  company_en: string; company_ar: string;
  role_en: string; role_ar: string;
  body_en: string; body_ar: string;
  sort_order: number;
}

export interface Project {
  id?: number;
  name: string;
  year: string;
  category: ProjectCategory;
  headline_en: string; headline_ar: string;
  summary_en: string; summary_ar: string;
  tags: string[];
  demo_url: string; code_url: string;
  image_url: string;
  sort_order: number;
}

export interface SkillGroup {
  id?: number;
  title_en: string; title_ar: string;
  items_en: string; items_ar: string;
  sort_order: number;
}

export interface Education {
  id?: number;
  kind: 'degree' | 'course';
  title_en: string; title_ar: string;
  org_en: string; org_ar: string;
  date_en: string; date_ar: string;
  details_en: string; details_ar: string;
  sort_order: number;
}

export interface PortfolioData {
  profile: Profile;
  experiences: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  education: Education[];
  source: 'remote' | 'local';
}
