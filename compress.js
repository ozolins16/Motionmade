/**
 * MotionMade — Image Compression Script
 * Converts PNG/JPG → WebP (lossless-ish quality 85) and resizes to max 2400px wide.
 * Originals are untouched. Compressed files are saved alongside the originals.
 *
 * Run: node compress.js
 */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

// ── Config ────────────────────────────────────────────────────────────────────
const MAX_WIDTH   = 2400;   // px — enough for full-bleed retina; anything larger is waste
const WEBP_QUALITY = 85;    // 80-85 = excellent visual quality, ~70-80% smaller than PNG
const JPEG_QUALITY = 82;    // for files that stay JPEG (avatars)
// ─────────────────────────────────────────────────────────────────────────────

const imagesDir = path.join(__dirname, 'images');

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip node_modules if somehow nested
      if (e.name === 'node_modules') continue;
      files.push(...walkDir(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function compressImage(filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath, path.extname(filePath));
  const dir  = path.dirname(filePath);

  // Skip already-compressed WebP files
  if (ext === '.webp') return null;
  // Skip videos
  if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) return null;

  const isJpeg = ['.jpg', '.jpeg'].includes(ext);

  let outName, format, options;
  if (isJpeg) {
    // Avatars / JPEGs stay JPEG but get stripped and resized
    outName = base + '-opt.jpg';
    format  = 'jpeg';
    options = { quality: JPEG_QUALITY, mozjpeg: true };
  } else {
    // PNGs → WebP
    outName = base + '.webp';
    format  = 'webp';
    options = { quality: WEBP_QUALITY, effort: 6 };
  }

  const outPath = path.join(dir, outName);

  // Don't reprocess if output already exists and is newer than source
  if (fs.existsSync(outPath)) {
    const srcMtime = fs.statSync(filePath).mtimeMs;
    const outMtime = fs.statSync(outPath).mtimeMs;
    if (outMtime >= srcMtime) {
      return { skipped: true, file: path.relative(imagesDir, filePath) };
    }
  }

  const image = sharp(filePath);
  const meta  = await image.metadata();

  // Only downscale; never upscale
  const resizeOpts = meta.width > MAX_WIDTH
    ? { width: MAX_WIDTH, withoutEnlargement: true }
    : { withoutEnlargement: true };

  await image
    .rotate()                   // auto-rotate from EXIF
    .resize(resizeOpts)
    [format](options)
    .toFile(outPath);

  const srcSize = fs.statSync(filePath).size;
  const outSize = fs.statSync(outPath).size;
  const saving  = ((1 - outSize / srcSize) * 100).toFixed(1);

  return {
    skipped: false,
    file:    path.relative(imagesDir, filePath),
    out:     path.relative(imagesDir, outPath),
    before:  (srcSize / 1024 / 1024).toFixed(2) + ' MB',
    after:   (outSize / 1024 / 1024).toFixed(2) + ' MB',
    saving:  saving + '%'
  };
}

async function main() {
  const files = walkDir(imagesDir);
  console.log(`\nFound ${files.length} files in images/\n`);

  let totalBefore = 0, totalAfter = 0, count = 0, skipped = 0;

  for (const f of files) {
    try {
      const result = await compressImage(f);
      if (!result) continue; // video or non-image
      if (result.skipped) {
        skipped++;
        console.log(`  SKIP  ${result.file}`);
        continue;
      }
      count++;
      const srcSize = fs.statSync(f).size;
      const outPath = path.join(path.dirname(f), path.basename(result.out));
      const outSize = fs.statSync(path.join(imagesDir, result.out)).size;
      totalBefore += srcSize;
      totalAfter  += outSize;
      console.log(`  ✓  ${result.file}`);
      console.log(`     → ${result.out}  |  ${result.before} → ${result.after}  (saved ${result.saving})`);
    } catch (err) {
      console.error(`  ✗  ${f}\n     ${err.message}`);
    }
  }

  console.log('\n─────────────────────────────────────────────────');
  console.log(`  Processed : ${count} files   (${skipped} already up to date)`);
  if (count > 0) {
    const totalSaving = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
    console.log(`  Total before : ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
    console.log(`  Total after  : ${(totalAfter  / 1024 / 1024).toFixed(1)} MB`);
    console.log(`  Total saved  : ${totalSaving}%`);
  }
  console.log('─────────────────────────────────────────────────\n');
  console.log('Next step: update HTML to use the .webp versions.');
  console.log('See the update-html-webp.js script for that.\n');
}

main();
