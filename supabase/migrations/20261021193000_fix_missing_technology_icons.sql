update public.technologies
set icon = 'css'
where slug = 'css3';

update public.technologies
set icon = ''
where slug = 'codex' and icon = 'openai';
