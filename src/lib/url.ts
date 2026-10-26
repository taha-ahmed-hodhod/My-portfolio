/**
 * Universal safe URL validator ensuring only legitimate web protocols are rendered.
 * Prevents javascript: and data: URI injection attacks.
 */
export function safeUrl(url: string | null | undefined, fallback = '#'): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Allow standard web protocols, mailto, tel, and local anchor links
  if (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(trimmed)) {
    return trimmed;
  }

  // If protocol was omitted but starts with domain-like pattern (e.g. www. or github.com)
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return fallback;
}
