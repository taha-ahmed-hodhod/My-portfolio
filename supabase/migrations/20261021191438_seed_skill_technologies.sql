-- Keep the technology catalog focused on the technologies used in the public toolkit.
insert into public.technologies (slug, name, icon, sort_order)
values
  ('html5', 'HTML5', 'html5', 1),
  ('css3', 'CSS3', 'css3', 2),
  ('javascript', 'JavaScript', 'javascript', 3),
  ('typescript', 'TypeScript', 'typescript', 4),
  ('react-js', 'React.js', 'react', 5),
  ('nextjs', 'Next.js', 'nextdotjs', 6),
  ('tailwind-css', 'Tailwind CSS', 'tailwindcss', 7),
  ('bootstrap', 'Bootstrap', 'bootstrap', 8),
  ('node-js', 'Node.js', 'nodedotjs', 9),
  ('express-js', 'Express.js', 'express', 10),
  ('mongodb', 'MongoDB', 'mongodb', 11),
  ('mongoose', 'Mongoose', 'mongoose', 12),
  ('redux-toolkit', 'Redux Toolkit', 'redux', 13),
  ('git', 'Git', 'git', 14),
  ('github', 'GitHub', 'github', 15),
  ('supabase', 'Supabase', 'supabase', 16)
on conflict (slug) do update
set name = excluded.name,
    icon = excluded.icon,
    sort_order = excluded.sort_order;
