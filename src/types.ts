export type Locale = 'en' | 'ar';
export type ProjectCategory = string;

export interface ProjectCategoryOption {
  id?: number;
  slug: string;
  name_en: string;
  name_ar: string;
  sort_order: number;
}

export interface Technology {
  id?: number;
  slug: string;
  name: string;
  icon: string;
  sort_order: number;
}

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
  created_at?: string;
}

export interface SkillGroup {
  id?: number;
  title_en: string; title_ar: string;
  items_en: string; items_ar: string;
  sort_order: number;
  created_at?: string;
}

export interface Education {
  id?: number;
  kind: 'degree' | 'course';
  title_en: string; title_ar: string;
  org_en: string; org_ar: string;
  date_en: string; date_ar: string;
  details_en: string; details_ar: string;
  sort_order: number;
  created_at?: string;
}

export interface Certificate {
  id?: number;
  title: string;
  issuer: string;
  issue_date: string;
  image_url: string;
  verification_url: string;
  is_published: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Testimonial {
  id?: number;
  client_name: string;
  client_role: string;
  client_company: string;
  content: string;
  rating: number;
  avatar_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface SiteSettings {
  testimonials_button_visible: boolean;
  section_work_visible: boolean;
  section_about_visible: boolean;
  section_experience_visible: boolean;
  section_certificates_visible: boolean;
  section_testimonials_visible: boolean;
}

export interface PortfolioData {
  profile: Profile;
  experiences: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  education: Education[];
  categories: ProjectCategoryOption[];
  technologies: Technology[];
  certificates: Certificate[];
  testimonials: Testimonial[];
  testimonialsVisible: boolean;
  settings: SiteSettings;
  source: 'remote' | 'local';
}
