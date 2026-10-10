#!/usr/bin/env node
/*
 * draw.mjs — write <home>/img/<id>.svg from <home>/art.mjs, for the
 * dictionary (words/) and every unit.
 *
 *   node tools/draw.mjs
 *
 * art.mjs default-exports { id: svgString } built with tools/svg.mjs.
 * Edit art.mjs (or svg.mjs), never the generated .svg files;
 * tools/check.mjs fails if they are out of date. An .svg no longer in
 * art.mjs (a renamed or removed drawing) is deleted.
 */
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, homes, loadArt } from './site.mjs';

let written = 0, deleted = 0;
for (const home of homes()) {
  const art = await loadArt(home);
  if (!art) continue;
  const imageDir = join(ROOT, home, 'img');
  mkdirSync(imageDir, { recursive: true });
  for (const [id, svg] of Object.entries(art)) {
    writeFileSync(join(imageDir, `${id}.svg`), svg);
    written++;
  }
  for (const file of readdirSync(imageDir)) {
    if (file.endsWith('.svg') && !(file.slice(0, -4) in art)) { rmSync(join(imageDir, file)); deleted++; }
  }
}
console.log(`Wrote ${written} SVG file(s).${deleted ? ` Deleted ${deleted} no longer drawn.` : ''}`);
