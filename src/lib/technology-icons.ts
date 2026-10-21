function normalize(value: string): string {
  return value.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function iconSlug(value: string): string {
  return normalize(value).replace(/\s+/g, '-');
}

const ICONIFY_BY_NAME: Record<string, string> = {
  html: 'devicon:html5',
  html5: 'devicon:html5',
  css: 'devicon:css3',
  css3: 'devicon:css3',
  javascript: 'devicon:javascript',
  typescript: 'devicon:typescript',
  react: 'devicon:react',
  'react js': 'devicon:react',
  'next js': 'devicon:nextjs',
  'tailwind css': 'devicon:tailwindcss',
  bootstrap: 'devicon:bootstrap',
  sass: 'devicon:sass',
  'node js': 'devicon:nodejs',
  express: 'devicon:express',
  'express js': 'devicon:express',
  mongodb: 'devicon:mongodb',
  mongoose: 'devicon:mongoose',
  supabase: 'devicon:supabase',
  redux: 'devicon:redux',
  'redux toolkit': 'devicon:redux',
  git: 'devicon:git',
  github: 'devicon:github',
  docker: 'devicon:docker',
  'github actions': 'devicon:githubactions',
  'claude code': 'devicon:claudecode',
  codex: 'devicon:codex',
  antigravity: 'devicon:antigravity',
  'github copilot': 'devicon:githubcopilot',
  opencode: 'logos:opencode',
};

function curatedIcon(name: string): string | null {
  return ICONIFY_BY_NAME[normalize(name)] || null;
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
  const cached = iconCache.get(query);
  if (cached !== undefined) return cached;

  const candidates: string[] = [];
  const curated = curatedIcon(name);
  if (curated) {
    const [prefix, iconName] = curated.split(':', 2);
    const curatedCandidates = [
      `https://api.iconify.design/${prefix}/${iconName}.svg`,
      `https://api.iconify.design/logos/${iconName}.svg`,
    ];
    iconCache.set(query, curatedCandidates);
    return curatedCandidates;
  }

  const savedSlug = normalize(savedIcon).replace(/\s+/g, '-');
  if (savedSlug) {
    candidates.push(`https://api.iconify.design/logos/${encodeURIComponent(savedSlug)}.svg`);
    candidates.push(`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${encodeURIComponent(savedSlug)}/${encodeURIComponent(savedSlug)}-original.svg`);
    candidates.push(`https://api.iconify.design/simple-icons/${encodeURIComponent(savedSlug)}.svg`);
  }
  try {
    const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=20`);
    if (!response.ok) throw new Error(`Icon search failed with status ${response.status}`);
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
  } catch {
    // The Devicon fallback below still works if Iconify search is unavailable.
  }

  const slug = iconSlug(name);
  const compactSlug = slug.replace(/-/g, '');
  const deviconSlugs = [...new Set([
    slug,
    compactSlug,
    slug.replace(/-js$/, ''),
    slug.replace(/-css$/, ''),
  ])];
  for (const deviconSlug of deviconSlugs) {
    candidates.push(`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconSlug}/${deviconSlug}-original.svg`);
    candidates.push(`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconSlug}/${deviconSlug}-plain.svg`);
  }

  const uniqueCandidates = [...new Set(candidates)];
  iconCache.set(query, uniqueCandidates);
  return uniqueCandidates;
}

export function savedTechnologyIconUrl(icon: string): string | null {
  if (!icon || !icon.includes(':')) return null;
  const [prefix, name] = icon.split(':', 2);
  return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg`;
}
