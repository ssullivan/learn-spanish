#!/usr/bin/env node
/*
 * review.mjs — AUDIO-REVIEW.md: every clip on the site in a table (unit,
 * Spanish, English, a link that plays it), for a native speaker to listen
 * through. A dictionary word is listed in the unit that teaches it.
 * Generated from the vocab: never edit it by hand. tools/tts.mjs rewrites
 * it after every run, and tools/check.mjs fails if it is out of date.
 *
 *   node tools/review.mjs          rewrite AUDIO-REVIEW.md
 *
 *   reviewMarkdown()   the file's contents
 *   REVIEW_FILE        its path
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, unitDirs, loadVocab, entries, homeOf } from './site.mjs';

const SITE = 'https://ssullivan.github.io/learn-spanish/';
export const REVIEW_FILE = join(ROOT, 'AUDIO-REVIEW.md');

const voiceName = (entry, vocab) => (entry.voice ?? vocab.voice) === vocab.voice ? '' : entry.voice.replace(/^es-MX-|Neural$/g, '');

const tableCell = text => String(text).replace(/\|/g, '\\|');

// A unit's clips: its own phrases and the dictionary words it teaches, in
// file order.
const clipsTaughtIn = (vocab, unit) => entries(vocab).filter(entry => entry.taught ? `unit${entry.taught}` === unit : homeOf(entry, unit) === unit);

export function reviewMarkdown() {
  const units = unitDirs().map(unit => [unit, loadVocab(unit)]).filter(([, vocab]) => vocab);
  const clipCount = units.reduce((count, [unit, vocab]) => count + clipsTaughtIn(vocab, unit).length, 0);
  const lines = [
    '# Audio review',
    '',
    `Every clip on the site (${clipCount}), unit by unit. Each link plays one clip.`,
    '',
    'Generated from each unit\'s `vocab.js` by `tools/review.mjs`: don\'t edit this file by hand.',
    '',
  ];
  for (const [unit, vocab] of units) {
    lines.push(`## Unit ${unit.slice(4)}`, '', '| # | Spanish | English | Audio |', '|---|---|---|---|');
    clipsTaughtIn(vocab, unit).forEach((entry, index) => {
      const voice = voiceName(entry, vocab);
      lines.push(`| ${index + 1} | ${tableCell(entry.spanish)} | ${tableCell(entry.english)}${voice ? ` _(${voice} voice)_` : ''} | [▶ play](${SITE}${homeOf(entry, unit)}/audio/${entry.id}.mp3) |`);
    });
    lines.push('');
  }
  return lines.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync(REVIEW_FILE, reviewMarkdown());
  console.log('Wrote AUDIO-REVIEW.md');
}
