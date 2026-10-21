-- Keep the technology catalog scoped to the public Technical Toolkit.
delete from public.technologies
where lower(name) not in (
  'html5',
  'css3',
  'javascript (es6+)',
  'typescript',
  'react.js',
  'next.js',
  'tailwind css',
  'bootstrap',
  'saas',
  'node.js',
  'express.js',
  'mongodb',
  'mongoose',
  'supabase',
  'redux toolkit',
  'git',
  'github',
  'claude code',
  'codex',
  'antigravity',
  'github copilot',
  'opencode'
);

insert into public.technologies (slug, name, icon, sort_order)
values
  ('html5', 'HTML5', 'html5', 1),
  ('css3', 'CSS3', 'css3', 2),
  ('javascript-es6', 'JavaScript (ES6+)', 'javascript', 3),
  ('typescript', 'TypeScript', 'typescript', 4),
  ('react-js', 'React.js', 'react', 5),
  ('next-js', 'Next.js', 'nextdotjs', 6),
  ('tailwind-css', 'Tailwind CSS', 'tailwindcss', 7),
  ('bootstrap', 'Bootstrap', 'bootstrap', 8),
  ('saas', 'SaaS', '', 9),
  ('node-js', 'Node.js', 'nodedotjs', 10),
  ('express-js', 'Express.js', 'express', 11),
  ('mongodb', 'MongoDB', 'mongodb', 12),
  ('mongoose', 'Mongoose', 'mongoose', 13),
  ('supabase', 'Supabase', 'supabase', 14),
  ('redux-toolkit', 'Redux Toolkit', 'redux', 15),
  ('git', 'Git', 'git', 16),
  ('github', 'GitHub', 'github', 17),
  ('claude-code', 'Claude Code', 'anthropic', 18),
  ('codex', 'Codex', 'openai', 19),
  ('antigravity', 'Antigravity', '', 20),
  ('github-copilot', 'GitHub Copilot', 'githubcopilot', 21),
  ('opencode', 'OpenCode', '', 22)
on conflict (slug) do update
set name = excluded.name,
    icon = excluded.icon,
    sort_order = excluded.sort_order;
