-- ============================================================
-- Taha Hodhod Portfolio — Supabase setup
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query
-- Then: Authentication → Users → Add user (email + password) for the admin
-- ============================================================

-- 1) PROFILE (single row, id = 1)
create table if not exists public.profile (
  id int primary key default 1,
  name_en text not null default '',
  name_ar text not null default '',
  role_en text not null default '',
  role_ar text not null default '',
  statement_en text not null default '',
  statement_ar text not null default '',
  intro_en text not null default '',
  intro_ar text not null default '',
  about_en text not null default '',
  about_ar text not null default '',
  location_en text not null default '',
  location_ar text not null default '',
  available_en text not null default '',
  available_ar text not null default '',
  email text not null default '',
  phone text not null default '',
  github text not null default '',
  linkedin text not null default '',
  photo_url text not null default '',
  years_label text not null default ''
);

-- 2) EXPERIENCES
create table if not exists public.experiences (
  id bigint generated always as identity primary key,
  date_en text not null default '',
  date_ar text not null default '',
  company_en text not null default '',
  company_ar text not null default '',
  role_en text not null default '',
  role_ar text not null default '',
  body_en text not null default '',
  body_ar text not null default '',
  sort_order int not null default 0
);

-- 3) PROJECTS
create table if not exists public.projects (
  id bigint generated always as identity primary key,
  name text not null default '',
  year text not null default '',
  category text not null default 'fullstack',
  headline_en text not null default '',
  headline_ar text not null default '',
  summary_en text not null default '',
  summary_ar text not null default '',
  tags text[] not null default '{}',
  demo_url text not null default '',
  code_url text not null default '',
  image_url text not null default '',
  sort_order int not null default 0
);

-- 4) SKILL GROUPS
create table if not exists public.skill_groups (
  id bigint generated always as identity primary key,
  title_en text not null default '',
  title_ar text not null default '',
  items_en text not null default '',
  items_ar text not null default '',
  sort_order int not null default 0
);

-- 5) EDUCATION & COURSES
create table if not exists public.education (
  id bigint generated always as identity primary key,
  kind text not null default 'course', -- 'degree' | 'course'
  title_en text not null default '',
  title_ar text not null default '',
  org_en text not null default '',
  org_ar text not null default '',
  date_en text not null default '',
  date_ar text not null default '',
  details_en text not null default '',
  details_ar text not null default '',
  sort_order int not null default 0
);

-- 6) ROW LEVEL SECURITY: everyone can read, only logged-in admin can write
alter table public.profile enable row level security;
alter table public.experiences enable row level security;
alter table public.projects enable row level security;
alter table public.skill_groups enable row level security;
alter table public.education enable row level security;

create policy "public read profile" on public.profile for select using (true);
create policy "admin write profile" on public.profile for all to authenticated using (true) with check (true);

create policy "public read experiences" on public.experiences for select using (true);
create policy "admin write experiences" on public.experiences for all to authenticated using (true) with check (true);

create policy "public read projects" on public.projects for select using (true);
create policy "admin write projects" on public.projects for all to authenticated using (true) with check (true);

create policy "public read skill_groups" on public.skill_groups for select using (true);
create policy "admin write skill_groups" on public.skill_groups for all to authenticated using (true) with check (true);

create policy "public read education" on public.education for select using (true);
create policy "admin write education" on public.education for all to authenticated using (true) with check (true);

-- 7) STORAGE bucket for photos (avatar + project covers)
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "public read portfolio files" on storage.objects
  for select using (bucket_id = 'portfolio');
create policy "admin upload portfolio files" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio');
create policy "admin update portfolio files" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio');
create policy "admin delete portfolio files" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio');

-- 8) SEED DATA (Taha's CV)
insert into public.profile (id, name_en, name_ar, role_en, role_ar, statement_en, statement_ar, intro_en, intro_ar, about_en, about_ar, location_en, location_ar, available_en, available_ar, email, phone, github, linkedin, photo_url, years_label)
values (1,
  'Taha Ahmed Hodhod', 'طه أحمد هدهد',
  'Full Stack Developer — MEARN Stack', 'مطور Full Stack — MEARN Stack',
  E'Clean code.\nBuilt to scale.', E'كود نظيف.\nومعمارية قابلة للتوسع.',
  'Full Stack Developer skilled in React.js, Next.js, TypeScript, Node.js, and MongoDB. Graduate of the intensive MEARN stack program at ITI, building real-world projects including a hospital management system and an e-commerce platform. Passionate about clean code, scalable architecture, and continuous learning.',
  'مطور Full Stack متمكّن في React.js وNext.js وTypeScript وNode.js وMongoDB. خريج برنامج MEARN المكثّف من معهد تكنولوجيا المعلومات (ITI)، بنيت مشاريع حقيقية تشمل نظام إدارة مستشفيات ومنصة تجارة إلكترونية. شغوف بالكود النظيف والمعمارية القابلة للتوسع والتعلم المستمر.',
  'I care about products that work end to end: a clean interface, a sensible API, and a database schema that will not fight you later. From the first wireframe to deployment, I like owning the whole flow — and I learn fast whatever the project needs next.',
  'أهتم بالمنتجات المتكاملة من البداية للنهاية: واجهة نظيفة، وواجهة برمجية منطقية، وقاعدة بيانات لا تسبب مشاكل لاحقًا. من أول رسمة للواجهة حتى النشر، أحب أن أمتلك الرحلة كاملة — وأتعلم بسرعة أي تقنية يحتاجها المشروع.',
  'Damietta, Egypt · Open to opportunities', 'دمياط، مصر · متاح لفرص العمل',
  'Open to the right opportunity', 'متاح للفرصة المناسبة',
  'tahahodhod650@gmail.com', '010 332 70707',
  'https://github.com/', 'https://www.linkedin.com/',
  '', '2024 — 2026')
on conflict (id) do nothing;

insert into public.experiences (date_en, date_ar, company_en, company_ar, role_en, role_ar, body_en, body_ar, sort_order) values
('Jun 2026 — Jul 2026', 'يونيو 2026 — يوليو 2026', 'Information Technology Institute (ITI) — Port Said', 'معهد تكنولوجيا المعلومات (ITI) — بورسعيد', 'Intensive Training Program — Full Stack Development (MEARN)', 'البرنامج التدريبي المكثف — تطوير Full Stack (MEARN)', 'Developed real-world projects covering the full MEARN stack: MongoDB, Express.js, Angular, React, and Node.js. Projects include a hospital management system (CareHub), an e-commerce platform, and an examination system.', 'تطوير مشاريع حقيقية تغطي حزمة MEARN كاملة: MongoDB وExpress.js وAngular وReact وNode.js. تشمل المشاريع نظام إدارة مستشفيات (CareHub) ومنصة تجارة إلكترونية ونظام اختبارات.', 1),
('Jan 2025 — Aug 2025', 'يناير 2025 — أغسطس 2025', 'SEF Academy', 'أكاديمية SEF', 'Frontend Development Training', 'تدريب تطوير واجهات Frontend', 'HTML, CSS, JavaScript, React.js, Bootstrap, Git & GitHub.', 'HTML وCSS وJavaScript وReact.js وBootstrap وGit وGitHub.', 2),
('May 2024 — Dec 2024', 'مايو 2024 — ديسمبر 2024', 'Self-directed', 'تعلم ذاتي', 'Frontend Web Development — Self Study', 'تطوير واجهات الويب — تعلم ذاتي', 'HTML, CSS, JavaScript, Bootstrap, Git & GitHub.', 'HTML وCSS وJavaScript وBootstrap وGit وGitHub.', 3);

insert into public.projects (name, year, category, headline_en, headline_ar, summary_en, summary_ar, tags, demo_url, code_url, image_url, sort_order) values
('CareHub — Hospital Management System', '2026', 'fullstack', 'A full-stack hospital system, from patient records to prescriptions', 'نظام مستشفيات متكامل، من سجلات المرضى إلى الروشتات', 'Built with Next.js, Node.js, Nest.js, MongoDB, Mongoose and Express.js. Features patient records, prescription management, medical history tracking, and role-based access.', 'مبني بـ Next.js وNode.js وNest.js وMongoDB وMongoose وExpress.js. يشمل سجلات المرضى وإدارة الروشتات وتتبع التاريخ الطبي وصلاحيات حسب الدور.', array['NEXT.JS','NEST.JS','MONGODB','EXPRESS'], '', '', '', 1),
('Next E-Commerce Platform', '2026', 'fullstack', 'A store with real cart state, toasts and motion', 'متجر إلكتروني بسلة حقيقية وتنبيهات وأنيميشن', 'Next.js 14 (App Router) with Tailwind CSS for a fully responsive UI, Redux Toolkit for cart and global state, MongoDB with Mongoose for products and orders, plus Framer Motion animations and React Hot Toast notifications.', 'Next.js 14 (App Router) مع Tailwind CSS لواجهة متجاوبة بالكامل، وRedux Toolkit للسلة والحالة العامة، وMongoDB مع Mongoose للمنتجات والطلبات، وأنيميشن Framer Motion وتنبيهات React Hot Toast.', array['NEXT.JS 14','REDUX','TAILWIND','MONGODB'], '', '', '', 2),
('Angular Blog System', '2026', 'fullstack', 'A blogging platform with auth and full CRUD', 'منصة تدوين بتسجيل دخول وعمليات CRUD كاملة', 'Full-stack blogging platform built with Angular, Node.js, and MongoDB. Features user authentication, full CRUD for posts, and a clean responsive UI.', 'منصة تدوين متكاملة مبنية بـ Angular وNode.js وMongoDB. تشمل تسجيل دخول المستخدمين وعمليات CRUD كاملة للمقالات وواجهة متجاوبة نظيفة.', array['ANGULAR','NODE.JS','MONGODB'], '', '', '', 3),
('Examination System', '2026', 'frontend', 'Timed quizzes with instant results', 'اختبارات بمؤقت ونتائج فورية', 'Interactive front-end examination system built with HTML, CSS, JavaScript, and Animate.css. Supports timed quizzes, dynamic question rendering, and instant result calculation.', 'نظام اختبارات تفاعلي مبني بـ HTML وCSS وJavaScript وAnimate.css. يدعم الاختبارات المؤقتة وعرض الأسئلة ديناميكيًا وحساب النتيجة فوريًا.', array['JAVASCRIPT','HTML','CSS'], '', '', '', 4);

insert into public.skill_groups (title_en, title_ar, items_en, items_ar, sort_order) values
('Frontend', 'الواجهات الأمامية', 'HTML5 · CSS3 · JavaScript (ES6+) · TypeScript · React.js · Next.js', 'HTML5 · CSS3 · JavaScript (ES6+) · TypeScript · React.js · Next.js', 1),
('Styling', 'التنسيق', 'Tailwind CSS · Bootstrap', 'Tailwind CSS · Bootstrap', 2),
('Backend', 'الواجهات الخلفية', 'Node.js · Express.js', 'Node.js · Express.js', 3),
('Databases', 'قواعد البيانات', 'MongoDB · Mongoose', 'MongoDB · Mongoose', 4),
('State & Tools', 'الحالة والأدوات', 'Redux Toolkit · Git · GitHub', 'Redux Toolkit · Git · GitHub', 5);

insert into public.education (kind, title_en, title_ar, org_en, org_ar, date_en, date_ar, details_en, details_ar, sort_order) values
('degree', 'Bachelor of Islamic Studies', 'ليسانس الدراسات الإسلامية', 'Al-Azhar University, Egypt', 'جامعة الأزهر، مصر', 'Jul 2019 — Jun 2023', 'يوليو 2019 — يونيو 2023', 'Grade: Good', 'التقدير: جيد', 1),
('course', 'Full-Stack MEARN — ICC Certification', 'Full-Stack MEARN — شهادة ICC', 'Information Technology Institute (ITI), Port Said', 'معهد تكنولوجيا المعلومات (ITI)، بورسعيد', 'Jan 2026 — Jul 2026', 'يناير 2026 — يوليو 2026', 'Hands-on training in Node.js, React, Express, Angular, and MongoDB.', 'تدريب عملي على Node.js وReact وExpress وAngular وMongoDB.', 2);
