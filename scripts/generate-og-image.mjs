/**
 * scripts/generate-og-image.mjs
 * Generates staging preview for og-image.jpg (1200x630) and apple-touch-icon.png (180x180)
 * Uses opentype.js to render all text as vector SVG paths (zero system font reliance, zero emojis).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load isolated dependencies from scratch runner (outside the repo)
const SCRATCH_RUNNER = 'C:/Users/Admin/.gemini/antigravity-ide/brain/b2b8b5af-0300-48b2-8222-1c5207dcfa51/scratch/runner';
const require = createRequire(path.join(SCRATCH_RUNNER, 'package.json'));
const sharp = require('sharp');
const opentype = require('opentype.js');

/* BASE_URL_CONFIG: Update when custom domain is set */
const SITE_URL = 'https://my-portfolio-two-gamma-xa2fur93st.vercel.app';
const DISPLAY_DOMAIN = 'my-portfolio-two-gamma-xa2fur93st.vercel.app';

// Output to external staging directory outside repo for user review
const STAGING_DIR = 'C:/Users/Admin/.gemini/antigravity-ide/brain/b2b8b5af-0300-48b2-8222-1c5207dcfa51/scratch/staging-preview';

async function main() {
  if (!fs.existsSync(STAGING_DIR)) {
    fs.mkdirSync(STAGING_DIR, { recursive: true });
  }

  const photoPath = path.resolve(ROOT, 'public', 'taha.webp');
  if (!fs.existsSync(photoPath)) {
    throw new Error(`Profile photo not found at ${photoPath}`);
  }

  // 1. Load local TrueType fonts (Inter v20 from scripts/fonts/)
  console.log('Loading local fonts from scripts/fonts/...');
  const regFontPath = path.resolve(ROOT, 'scripts', 'fonts', 'Inter-Regular.ttf');
  const semiFontPath = path.resolve(ROOT, 'scripts', 'fonts', 'Inter-SemiBold.ttf');
  const boldFontPath = path.resolve(ROOT, 'scripts', 'fonts', 'Inter-Bold.ttf');

  const regBuf = fs.readFileSync(regFontPath);
  const semiBuf = fs.readFileSync(semiFontPath);
  const boldBuf = fs.readFileSync(boldFontPath);

  const regFont = opentype.parse(regBuf.buffer.slice(regBuf.byteOffset, regBuf.byteOffset + regBuf.byteLength));
  const semiFont = opentype.parse(semiBuf.buffer.slice(semiBuf.byteOffset, semiBuf.byteOffset + semiBuf.byteLength));
  const boldFont = opentype.parse(boldBuf.buffer.slice(boldBuf.byteOffset, boldBuf.byteOffset + boldBuf.byteLength));

  // Helper to accurately measure text advance width using font glyph metrics
  const measureTextWidth = (font, text, size) => {
    let width = 0;
    const scale = size / font.unitsPerEm;
    for (let i = 0; i < text.length; i++) {
      const glyph = font.charToGlyph(text[i]);
      let advance = (glyph.advanceWidth || 0) * scale;
      if (i < text.length - 1 && font.getKerningValue) {
        const nextGlyph = font.charToGlyph(text[i + 1]);
        const kerning = font.getKerningValue(glyph, nextGlyph);
        if (kerning) advance += kerning * scale;
      }
      width += advance;
    }
    return width;
  };

  // Helper to convert text into raw SVG vector path data (bypassing bidi/gsub bugs)
  const textToPath = (font, text, x, y, size, fill) => {
    const combinedPath = new opentype.Path();
    let curX = x;
    const scale = size / font.unitsPerEm;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const glyph = font.charToGlyph(char);
      const glyphPath = glyph.getPath(curX, y, size);
      combinedPath.commands.push(...glyphPath.commands);
      let advance = (glyph.advanceWidth || 0) * scale;
      if (i < text.length - 1 && font.getKerningValue) {
        const nextGlyph = font.charToGlyph(text[i + 1]);
        const kerning = font.getKerningValue(glyph, nextGlyph);
        if (kerning) advance += kerning * scale;
      }
      curX += advance;
    }
    combinedPath.fill = fill;
    return combinedPath.toSVG(2);
  };

  // 2. Prepare Profile Image (Circular crop 360x360)
  const PHOTO_SIZE = 360;
  const croppedPhoto = await sharp(photoPath)
    .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: 'cover', position: 'top' })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${PHOTO_SIZE}" height="${PHOTO_SIZE}"><circle cx="${PHOTO_SIZE / 2}" cy="${PHOTO_SIZE / 2}" r="${PHOTO_SIZE / 2}" fill="black"/></svg>`
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  // 3. Content and Dynamic Pill Dimensions
  const nameText = 'Taha Ahmed Hodhod';
  const roleText = 'Full-Stack Developer';
  const transitionText = 'MERN Stack & Scalable Web Applications';
  const stackText = 'React  •  TypeScript  •  Node.js  •  Supabase';
  const langText = 'English & Arabic Portfolio';
  const domainText = DISPLAY_DOMAIN;

  // Compute exact pill widths dynamically via font glyph advance metrics + padding
  const roleFontSize = 22;
  const roleTextWidth = measureTextWidth(semiFont, roleText, roleFontSize);
  const rolePadding = 48; // padding left & right including dot space
  const roleBadgeWidth = Math.round(roleTextWidth + rolePadding);

  const langFontSize = 18;
  const langTextWidth = measureTextWidth(semiFont, langText, langFontSize);
  const langPadding = 44;
  const langBadgeWidth = Math.round(langTextWidth + langPadding);

  // Generate vector paths
  const namePath = textToPath(boldFont, nameText, 90, 205, 52, '#f1f5f9');
  const rolePath = textToPath(semiFont, roleText, 122, 275, roleFontSize, '#2dd4bf');
  const transitionPath = textToPath(regFont, transitionText, 90, 345, 24, '#cbd5e1');
  const stackPath = textToPath(regFont, stackText, 90, 395, 20, '#94a3b8');
  const langPath = textToPath(semiFont, langText, 120, 475, langFontSize, '#14b8a6');
  const domainPath = textToPath(regFont, domainText, 90, 560, 18, '#64748b');

  // 4. Construct Master SVG Template with Radial Gradients (No CSS filters/blur)
  const svgOverlay = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a171d"/>
        <stop offset="50%" stop-color="#080d11"/>
        <stop offset="100%" stop-color="#05080b"/>
      </linearGradient>

      <!-- Radial gradient glow orbs (native SVG 1.1, zero CSS blur filter reliance) -->
      <radialGradient id="orbTeal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.22"/>
        <stop offset="45%" stop-color="#14b8a6" stop-opacity="0.09"/>
        <stop offset="85%" stop-color="#14b8a6" stop-opacity="0.01"/>
        <stop offset="100%" stop-color="#14b8a6" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="orbDark" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0d9488" stop-opacity="0.16"/>
        <stop offset="50%" stop-color="#0d9488" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="#0d9488" stop-opacity="0"/>
      </radialGradient>

      <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.02"/>
      </linearGradient>
      <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#14b8a6"/>
        <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0.2"/>
      </linearGradient>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2dd4bf"/>
        <stop offset="50%" stop-color="#14b8a6"/>
        <stop offset="100%" stop-color="#0f766e"/>
      </linearGradient>
    </defs>

    <!-- Deep Luxury Canvas Background -->
    <rect width="1200" height="630" fill="url(#bgGlow)"/>

    <!-- Ambient Glow Orbs via Native Radial Gradients -->
    <circle cx="940" cy="315" r="340" fill="url(#orbTeal)"/>
    <circle cx="160" cy="160" r="240" fill="url(#orbDark)"/>

    <!-- Main Bento Card Frame -->
    <rect x="40" y="40" width="1120" height="550" rx="28" fill="#0c151d" fill-opacity="0.75" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="40" y="40" width="1120" height="550" rx="28" fill="url(#cardGlow)"/>

    <!-- Accent Top Ribbon Line -->
    <rect x="90" y="85" width="120" height="4" rx="2" fill="url(#accentLine)"/>

    <!-- Role Pill Badge (Front-End Developer) - Dynamically Sized -->
    <rect x="90" y="247" width="${roleBadgeWidth}" height="40" rx="20" fill="#0d2324" stroke="#14b8a6" stroke-width="1.5"/>
    <circle cx="107" cy="267" r="4" fill="#2dd4bf"/>

    <!-- Vector Text Paths -->
    ${namePath}
    ${rolePath}
    ${transitionPath}
    ${stackPath}

    <!-- Language Pill Badge (English & Arabic Portfolio) - Dynamically Sized -->
    <rect x="90" y="451" width="${langBadgeWidth}" height="36" rx="18" fill="#081e22" stroke="#14b8a6" stroke-width="1" stroke-opacity="0.5"/>
    <circle cx="105" cy="469" r="3" fill="#14b8a6"/>
    ${langPath}

    <!-- Domain Marker Line & Text -->
    <line x1="90" y1="525" x2="520" y2="525" stroke="#1e293b" stroke-width="1"/>
    ${domainPath}

    <!-- Right Photo Ring Enclosure -->
    <circle cx="940" cy="315" r="195" fill="none" stroke="url(#ringGrad)" stroke-width="4"/>
    <circle cx="940" cy="315" r="186" fill="#080d11" stroke="#1e293b" stroke-width="2"/>
  </svg>
  `;

  // 5. Composite Final OG Image (1200x630 JPEG, target <250KB)
  console.log('Rendering 1200x630 OG image to staging...');
  const ogImageStaging = path.resolve(STAGING_DIR, 'og-image.jpg');
  await sharp(Buffer.from(svgOverlay))
    .composite([
      {
        input: croppedPhoto,
        top: 315 - PHOTO_SIZE / 2,
        left: 940 - PHOTO_SIZE / 2,
      },
    ])
    .jpeg({ quality: 86, progressive: true })
    .toFile(ogImageStaging);

  const ogStats = fs.statSync(ogImageStaging);
  const ogPublic = path.resolve(ROOT, 'public', 'og-image.jpg');
  fs.copyFileSync(ogImageStaging, ogPublic);
  console.log(`✓ Updated public/og-image.jpg`);
  console.log(`  Dimensions: 1200 x 630 px`);
  console.log(`  Size: ${(ogStats.size / 1024).toFixed(1)} KB (${ogStats.size} bytes)`);

  // 6. Generate Apple Touch Icon (180x180 PNG)
  console.log('Rendering 180x180 Apple Touch Icon to staging...');
  const appleIconStaging = path.resolve(STAGING_DIR, 'apple-touch-icon.png');
  const appleSvg = `
  <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="180" height="180" rx="36" fill="#080d11"/>
    <rect x="2" y="2" width="176" height="176" rx="34" fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-opacity="0.8"/>
  </svg>
  `;
  const iconPhoto = await sharp(photoPath)
    .resize(150, 150, { fit: 'cover', position: 'top' })
    .composite([
      {
        input: Buffer.from('<svg width="150" height="150"><circle cx="75" cy="75" r="75" fill="black"/></svg>'),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  await sharp(Buffer.from(appleSvg))
    .composite([
      {
        input: iconPhoto,
        top: 15,
        left: 15,
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(appleIconStaging);

  const appleStats = fs.statSync(appleIconStaging);
  console.log(`✓ Staged Apple Icon: ${appleIconStaging}`);
  console.log(`  Dimensions: 180 x 180 px`);
  console.log(`  Size: ${(appleStats.size / 1024).toFixed(1)} KB (${appleStats.size} bytes)`);
}

main().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
