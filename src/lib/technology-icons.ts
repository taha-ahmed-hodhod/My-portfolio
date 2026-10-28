function normalize(value: string): string {
  return value.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function technologySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[+#]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isSameTechnology(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  if (nameA.toLowerCase().trim() === nameB.toLowerCase().trim()) return true;
  const slugA = technologySlug(nameA);
  const slugB = technologySlug(nameB);
  if (slugA && slugB && slugA === slugB) return true;
  const alphaA = nameA.toLowerCase().replace(/[^a-z0-9]/g, '');
  const alphaB = nameB.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (alphaA && alphaB && alphaA === alphaB) return true;
  return false;
}


export const POPULAR_ICON_PRESETS: { label: string; icon: string }[] = [
  // Frontend
  { label: 'React', icon: 'devicon:react' },
  { label: 'Next.js', icon: 'devicon:nextjs' },
  { label: 'Vue.js', icon: 'devicon:vuejs' },
  { label: 'Nuxt.js', icon: 'devicon:nuxtjs' },
  { label: 'Angular', icon: 'devicon:angular' },
  { label: 'Svelte', icon: 'devicon:svelte' },
  { label: 'TypeScript', icon: 'devicon:typescript' },
  { label: 'JavaScript', icon: 'devicon:javascript' },
  { label: 'HTML5', icon: 'devicon:html5' },
  { label: 'CSS3', icon: 'devicon:css3' },
  { label: 'Tailwind CSS', icon: 'devicon:tailwindcss' },
  { label: 'Bootstrap', icon: 'devicon:bootstrap' },
  { label: 'Sass', icon: 'devicon:sass' },
  { label: 'Redux Toolkit', icon: 'devicon:redux' },
  { label: 'Framer Motion', icon: 'logos:framer' },
  { label: 'Three.js', icon: 'devicon:threejs' },
  { label: 'Astro', icon: 'logos:astro-icon' },

  // Backend
  { label: 'Node.js', icon: 'devicon:nodejs' },
  { label: 'Express.js', icon: 'devicon:express' },
  { label: 'NestJS', icon: 'devicon:nestjs' },
  { label: 'Python', icon: 'devicon:python' },
  { label: 'Django', icon: 'devicon:django' },
  { label: 'FastAPI', icon: 'devicon:fastapi' },
  { label: 'Flask', icon: 'devicon:flask' },
  { label: 'PHP', icon: 'devicon:php' },
  { label: 'Laravel', icon: 'devicon:laravel' },
  { label: 'Go', icon: 'devicon:go' },
  { label: 'Rust', icon: 'devicon:rust' },
  { label: 'Java', icon: 'devicon:java' },
  { label: 'Spring Boot', icon: 'devicon:spring' },
  { label: 'C#', icon: 'devicon:csharp' },
  { label: 'C++', icon: 'devicon:cplusplus' },
  { label: 'GraphQL', icon: 'devicon:graphql' },

  // Databases & Cloud
  { label: 'MongoDB', icon: 'devicon:mongodb' },
  { label: 'Mongoose', icon: 'devicon:mongoose' },
  { label: 'PostgreSQL', icon: 'devicon:postgresql' },
  { label: 'MySQL', icon: 'devicon:mysql' },
  { label: 'SQLite', icon: 'devicon:sqlite' },
  { label: 'Redis', icon: 'devicon:redis' },
  { label: 'Supabase', icon: 'devicon:supabase' },
  { label: 'Firebase', icon: 'devicon:firebase' },
  { label: 'Prisma', icon: 'devicon:prisma' },
  { label: 'Docker', icon: 'devicon:docker' },
  { label: 'Kubernetes', icon: 'devicon:kubernetes' },
  { label: 'AWS', icon: 'devicon:amazonwebservices-wordmark' },
  { label: 'Google Cloud', icon: 'devicon:googlecloud' },
  { label: 'Vercel', icon: 'devicon:vercel' },

  // Tools & Testing
  { label: 'Git', icon: 'devicon:git' },
  { label: 'GitHub', icon: 'devicon:github' },
  { label: 'GitHub Actions', icon: 'devicon:githubactions' },
  { label: 'Linux', icon: 'devicon:linux' },
  { label: 'Ubuntu', icon: 'devicon:ubuntu' },
  { label: 'Postman', icon: 'devicon:postman' },
  { label: 'Vite', icon: 'devicon:vitejs' },
  { label: 'Webpack', icon: 'devicon:webpack' },
  { label: 'Vitest', icon: 'logos:vitest' },
  { label: 'Jest', icon: 'devicon:jest' },
  { label: 'Cypress', icon: 'devicon:cypressio' },
  { label: 'Figma', icon: 'devicon:figma' },

  // AI & Assistants
  { label: 'OpenAI', icon: 'logos:openai-icon' },
  { label: 'Claude', icon: 'logos:claude-icon' },
  { label: 'GitHub Copilot', icon: 'devicon:githubcopilot' },
  { label: 'Google Gemini', icon: 'logos:google-gemini' },
];

const ICONIFY_BY_NAME: Record<string, string> = {
  // Web & Languages
  html: 'devicon:html5',
  html5: 'devicon:html5',
  css: 'devicon:css3',
  css3: 'devicon:css3',
  javascript: 'devicon:javascript',
  js: 'devicon:javascript',
  typescript: 'devicon:typescript',
  ts: 'devicon:typescript',
  python: 'devicon:python',
  py: 'devicon:python',
  java: 'devicon:java',
  c: 'devicon:c',
  cpp: 'devicon:cplusplus',
  'c++': 'devicon:cplusplus',
  csharp: 'devicon:csharp',
  'c#': 'devicon:csharp',
  php: 'devicon:php',
  ruby: 'devicon:ruby',
  go: 'devicon:go',
  golang: 'devicon:go',
  rust: 'devicon:rust',
  kotlin: 'devicon:kotlin',
  swift: 'devicon:swift',
  dart: 'devicon:dart',

  // Frontend frameworks & libs
  react: 'devicon:react',
  'react js': 'devicon:react',
  'react.js': 'devicon:react',
  'react native': 'devicon:react',
  next: 'devicon:nextjs',
  'next js': 'devicon:nextjs',
  'next.js': 'devicon:nextjs',
  'next js 14': 'devicon:nextjs',
  'next.js 14': 'devicon:nextjs',
  vue: 'devicon:vuejs',
  'vue js': 'devicon:vuejs',
  'vue.js': 'devicon:vuejs',
  nuxt: 'devicon:nuxtjs',
  'nuxt js': 'devicon:nuxtjs',
  'nuxt.js': 'devicon:nuxtjs',
  angular: 'devicon:angular',
  'angular js': 'devicon:angular',
  'angular.js': 'devicon:angular',
  svelte: 'devicon:svelte',
  sveltekit: 'devicon:svelte',
  astro: 'logos:astro-icon',
  solid: 'logos:solidjs-icon',
  'solid js': 'logos:solidjs-icon',
  jquery: 'devicon:jquery',

  // Styling & UI
  tailwind: 'devicon:tailwindcss',
  'tailwind css': 'devicon:tailwindcss',
  tailwindcss: 'devicon:tailwindcss',
  bootstrap: 'devicon:bootstrap',
  sass: 'devicon:sass',
  scss: 'devicon:sass',
  less: 'devicon:less',
  'material ui': 'devicon:materialui',
  mui: 'devicon:materialui',
  'chakra ui': 'logos:chakraui',
  shadcn: 'simple-icons:shadcnui',
  'shadcn ui': 'simple-icons:shadcnui',
  'framer motion': 'logos:framer',
  'animate css': 'devicon:css3',
  threejs: 'devicon:threejs',
  'three js': 'devicon:threejs',
  'three.js': 'devicon:threejs',

  // Backend & APIs
  node: 'devicon:nodejs',
  'node js': 'devicon:nodejs',
  'node.js': 'devicon:nodejs',
  express: 'devicon:express',
  'express js': 'devicon:express',
  'express.js': 'devicon:express',
  nest: 'devicon:nestjs',
  nestjs: 'devicon:nestjs',
  'nest js': 'devicon:nestjs',
  'nest.js': 'devicon:nestjs',
  fastapi: 'devicon:fastapi',
  django: 'devicon:django',
  flask: 'devicon:flask',
  spring: 'devicon:spring',
  'spring boot': 'devicon:spring',
  laravel: 'devicon:laravel',
  graphql: 'devicon:graphql',
  apollo: 'logos:apollo',
  trpc: 'logos:trpc',
  'socket io': 'devicon:socketio',
  'socket.io': 'devicon:socketio',
  websockets: 'devicon:socketio',
  rest: 'carbon:api',
  'rest api': 'carbon:api',

  // State management
  redux: 'devicon:redux',
  'redux toolkit': 'devicon:redux',
  zustand: 'logos:react',
  mobx: 'logos:mobx',
  'react query': 'logos:react-query-icon',
  'tanstack query': 'logos:react-query-icon',
  pinia: 'logos:pinia',

  // Databases & ORMs
  mongodb: 'devicon:mongodb',
  mongoose: 'devicon:mongoose',
  postgresql: 'devicon:postgresql',
  postgres: 'devicon:postgresql',
  mysql: 'devicon:mysql',
  sqlite: 'devicon:sqlite',
  mariadb: 'devicon:mariadb',
  redis: 'devicon:redis',
  supabase: 'devicon:supabase',
  firebase: 'devicon:firebase',
  prisma: 'devicon:prisma',
  drizzle: 'simple-icons:drizzle',
  elasticsearch: 'devicon:elasticsearch',

  // DevOps & Cloud
  git: 'devicon:git',
  github: 'devicon:github',
  gitlab: 'devicon:gitlab',
  bitbucket: 'devicon:bitbucket',
  docker: 'devicon:docker',
  kubernetes: 'devicon:kubernetes',
  k8s: 'devicon:kubernetes',
  aws: 'devicon:amazonwebservices-wordmark',
  azure: 'devicon:azure',
  gcp: 'devicon:googlecloud',
  'google cloud': 'devicon:googlecloud',
  vercel: 'devicon:vercel',
  netlify: 'devicon:netlify',
  cloudflare: 'devicon:cloudflare',
  nginx: 'devicon:nginx',
  apache: 'devicon:apache',
  linux: 'devicon:linux',
  ubuntu: 'devicon:ubuntu',
  'github actions': 'devicon:githubactions',
  githubactions: 'devicon:githubactions',
  'github-actions': 'devicon:githubactions',
  'github copilot': 'devicon:githubcopilot',
  githubcopilot: 'devicon:githubcopilot',
  'github-copilot': 'devicon:githubcopilot',

  // Testing & Build tools
  vite: 'devicon:vitejs',
  vitejs: 'devicon:vitejs',
  webpack: 'devicon:webpack',
  babel: 'devicon:babel',
  npm: 'devicon:npm',
  yarn: 'devicon:yarn',
  pnpm: 'devicon:pnpm',
  postman: 'devicon:postman',
  jest: 'devicon:jest',
  vitest: 'logos:vitest',
  cypress: 'devicon:cypressio',
  playwright: 'logos:playwright',

  // Design & AI
  figma: 'devicon:figma',
  photoshop: 'devicon:photoshop',
  illustrator: 'devicon:illustrator',
  openai: 'logos:openai-icon',
  chatgpt: 'logos:openai-icon',
  claude: 'logos:claude-icon',
  'claude code': 'logos:claude-icon',
  gemini: 'logos:google-gemini',
  'google gemini': 'logos:google-gemini',
  codex: 'logos:openai-icon',
  antigravity: 'logos:google-gemini',
  opencode: 'logos:opencode',
  openrouter: 'logos:openai-icon',
};

export function curatedIcon(name: string): string | null {
  const norm = normalize(name);
  if (ICONIFY_BY_NAME[norm]) return ICONIFY_BY_NAME[norm];
  const withoutVersion = norm.replace(/\s*\d+(\.\d+)*$/, '').trim();
  if (ICONIFY_BY_NAME[withoutVersion]) return ICONIFY_BY_NAME[withoutVersion];
  const alpha = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (ICONIFY_BY_NAME[alpha]) return ICONIFY_BY_NAME[alpha];
  return null;
}

export function savedTechnologyIconUrl(icon: string): string | null {
  if (!icon) return null;
  const trimmed = icon.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.includes(':')) {
    const [prefix, name] = trimmed.split(':', 2);
    const isMonochrome = ['jam', 'simple-icons', 'mdi', 'uil', 'tabler', 'octicon', 'lucide', 'feather', 'bi', 'ri'].includes(prefix) || name.toLowerCase().includes('github');
    const colorParam = isMonochrome ? '?color=white' : '';
    return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg${colorParam}`;
  }
  const curated = curatedIcon(trimmed);
  if (curated) {
    const [prefix, name] = curated.split(':', 2);
    const isMonochrome = ['jam', 'simple-icons', 'mdi', 'uil', 'tabler', 'octicon', 'lucide', 'feather', 'bi', 'ri'].includes(prefix) || name.toLowerCase().includes('github');
    const colorParam = isMonochrome ? '?color=white' : '';
    return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg${colorParam}`;
  }
  return `https://api.iconify.design/logos/${encodeURIComponent(trimmed.toLowerCase())}.svg`;
}

function iconSearchScore(icon: string, query: string): number {
  const [, name = ''] = icon.split(':', 2);
  const normalizedName = name.replace(/[-_]/g, ' ').toLowerCase();
  if (normalizedName === query) return 0;
  if (normalizedName.startsWith(query)) return 1;
  if (normalizedName.includes(query)) return 2;
  return 3;
}

const iconCache = new Map<string, string[]>();

export async function findTechnologyIcons(name: string, savedIcon = ''): Promise<string[]> {
  const query = normalize(name);
  if (!query) return [];
  const cacheKey = `${query}::${savedIcon}`;
  const cached = iconCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const candidates: string[] = [];

  // 1. If explicit savedIcon provided
  if (savedIcon) {
    const explicitUrl = savedTechnologyIconUrl(savedIcon);
    if (explicitUrl) candidates.push(explicitUrl);
  }

  // 2. Curated dictionary (zero runtime search needed)
  const curated = curatedIcon(name);
  if (curated) {
    const [prefix, iconName] = curated.split(':', 2);
    candidates.push(`https://api.iconify.design/${prefix}/${iconName}.svg`);
    candidates.push(`https://api.iconify.design/logos/${iconName}.svg`);
  }

  // 3. Fallbacks from Devicon CDN
  const slug = technologySlug(name);
  const compactSlug = slug.replace(/-/g, '');
  const deviconSlugs = [...new Set([slug, compactSlug, slug.replace(/-js$/, ''), slug.replace(/-css$/, '')])];
  for (const deviconSlug of deviconSlugs) {
    candidates.push(`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconSlug}/${deviconSlug}-original.svg`);
    candidates.push(`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconSlug}/${deviconSlug}-plain.svg`);
  }

  // 4. Runtime search in Iconify as fallback
  try {
    const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=12`);
    if (response.ok) {
      const result = await response.json() as { icons?: string[] };
      const matchingIcons = (result.icons || [])
        .filter((icon) => {
          const [prefix] = icon.split(':', 2);
          return prefix === 'logos' || prefix === 'devicon' || prefix === 'simple-icons';
        })
        .sort((a, b) => {
          const [aPrefix] = a.split(':', 2);
          const [bPrefix] = b.split(':', 2);
          const collectionPriority = (prefix: string) => prefix === 'logos' ? 0 : prefix === 'devicon' ? 1 : 2;
          return collectionPriority(aPrefix) - collectionPriority(bPrefix)
            || iconSearchScore(a, query) - iconSearchScore(b, query);
        });
      for (const icon of matchingIcons) {
        const [prefix, iconName] = icon.split(':', 2);
        candidates.push(`https://api.iconify.design/${prefix}/${iconName}.svg`);
      }
    }
  } catch {
    // CDN and curated fallbacks are already present in candidates
  }

  const uniqueCandidates = [...new Set(candidates)];
  iconCache.set(cacheKey, uniqueCandidates);
  return uniqueCandidates;
}
