#!/usr/bin/env node
/*
 * check.mjs — sanity checks for the whole site. Exits 1 on any problem.
 *
 *   node tools/check.mjs          report problems
 *   node tools/check.mjs --fix    also rewrite ?v=<hash> cache stamps and
 *                                 pages' vocab scripts
 *
 * Checks:
 *   - pages load vocab only between the vocab markers, where --fix writes
 *     shared/spanish.js, shared/units.js, the dictionary, the vocab.js of every unit the
 *     page's unit borrows from (site.mjs borrowsFrom) and its own
 *   - every href/src in every .html is relative and points at a file
 *   - local .css/.js links carry ?v=<first 8 of sha1(file)>
 *   - every page links the favicon (favicon.svg, a cempasúchil)
 *   - every page links back: a unit's learn pages and games to its unit
 *     page (./), unit pages to all units (../)
 *   - no file git would commit (tracked, or untracked and not ignored,
 *     dotfiles included) holds the Azure Speech key (when set on this
 *     machine): keys must never be committed
 *   - every .js file compiles
 *   - no site script copies a shared helper (Units.byId, ctx.words,
 *     Game.pic, Game.playOnReveal) instead of using it
 *   - every vocab entry has only the fields in tools/vocab-fields.mjs, each
 *     holding its kind of value, and the ids it names are entries
 *   - Spanish spelling: `spanish` is in composed Unicode (é, not e +  ́),
 *     uses only Spanish letters, and opens a question with ¿ and an
 *     exclamation with ¡; an entry's id starts with its plain spelling
 *     (Spanish.plainId: "¡Buenos días!" → buenos-dias...)
 *   - each home (words/ and every unit): unique ids, audio/<id>.mp3 for
 *     every entry, a drawing in art.mjs for every entry without img:
 *     false, and no orphan .mp3 files or drawings; img/*.svg match art.mjs
 *     exactly (else run node tools/draw.mjs)
 *   - each word (an entry defined in its home) is defined once on the
 *     site: no other home has a word with its id, or with its spelling
 *     and voice (borrow it instead)
 *   - each dictionary word is in the vocab of the unit that teaches it,
 *     and no unit uses one taught after it
 *   - every vocab group and entry id a unit's page scripts name (V.pairs,
 *     ctx.words('casa'), Units.word(1, 'perro')...; see tools/page-refs.mjs)
 *     is in the vocab the page loads
 *   - AUDIO-REVIEW.md matches the vocab (else run node tools/review.mjs)
 *   - every tools/*.test.mjs passes
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, extname } from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { ROOT, unitDirs, homes, homeOf, borrowsFrom, loadShared, loadVocab, entries, isOwn, loadArt, secrets } from './site.mjs';
import { inlineScripts, pageReferences } from './page-refs.mjs';
import { entryProblems } from './vocab-fields.mjs';

const shouldFix = process.argv.includes('--fix');
const problems = [];
const report = (file, message) => problems.push(`${relative(ROOT, file)}: ${message}`);
const { Spanish } = loadShared('shared/spanish.js');

function walk(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const path = join(dir, name);
    statSync(path).isDirectory() ? walk(path, found) : found.push(path);
  }
  return found;
}

const files = walk(ROOT);
const pages = files.filter(file => file.endsWith('.html'));
const stamp = file => createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8);

// Vocab scripts: written, not typed. A page that loads vocab has them
// between VOCAB_START and VOCAB_END: shared/spanish.js and shared/units.js,
// the dictionary, then
// the vocab.js of each unit its unit borrows from and its own, as
// loadVocab loads them in Node.
const VOCAB_START = '<!-- vocab: written by node tools/check.mjs --fix -->';
const VOCAB_END = '<!-- /vocab -->';
const DICTIONARY = 'words/words.js';

function vocabScripts(page) {
  const pageUnit = relative(ROOT, page).match(/^(unit\d+)\//)?.[1];
  const units = pageUnit ? [...borrowsFrom(pageUnit), pageUnit] : [];
  const script = path => `<script src="${relative(dirname(page), join(ROOT, path))}?v=${stamp(join(ROOT, path))}"></script>`;
  return [VOCAB_START, script('shared/spanish.js'), script('shared/units.js'), script(DICTIONARY), ...units.map(unit => script(`${unit}/vocab.js`)), VOCAB_END].join('\n');
}

let vocabBlocksWritten = 0;
for (const page of pages) {
  const source = readFileSync(page, 'utf8');
  const start = source.indexOf(VOCAB_START), end = source.indexOf(VOCAB_END);
  const outside = start < 0 ? source : source.slice(0, start) + source.slice(end + VOCAB_END.length);
  if (/<script src="[^"]*(vocab|units|words|spanish)\.js/.test(outside) && /<script src="[^"]*vocab\.js/.test(source)) report(page, `load vocab only between ${VOCAB_START} and ${VOCAB_END} (see unit1/learn.html)`);
  if (start < 0) continue;
  if (end < start) { report(page, `${VOCAB_START} needs a ${VOCAB_END} after it`); continue; }
  const wanted = vocabScripts(page);
  if (source.slice(start, end + VOCAB_END.length) === wanted) continue;
  if (shouldFix) { writeFileSync(page, source.slice(0, start) + wanted + source.slice(end + VOCAB_END.length)); vocabBlocksWritten++; }
  else report(page, 'vocab scripts out of date (run node tools/check.mjs --fix)');
}

// Links, the favicon, back links and cache stamps
let stampsFixed = 0;
for (const page of pages) {
  const source = readFileSync(page, 'utf8');
  const icon = relative(dirname(page), join(ROOT, 'favicon.svg'));
  if (!source.includes(`<link rel="icon" href="${icon}" type="image/svg+xml">`)) report(page, `link the favicon: <link rel="icon" href="${icon}" type="image/svg+xml">`);
  const pagePath = relative(ROOT, page), unitPage = pagePath.match(/^unit(\d+)\/(?!index\.html$)/);
  const backLink = unitPage ? `<a class="back" href="./">← Unit ${unitPage[1]}</a>` : `<a class="back" href="../">← All units</a>`;
  if (pagePath !== 'index.html' && !source.includes(backLink)) report(page, `link back with ${backLink}`);
  const stamped = source.replace(/\b(href|src)="([^"]*)"/g, (whole, attribute, url) => {
    if (/^(https?:|mailto:|data:|#)/.test(url)) return whole;
    if (url.startsWith('/')) { report(page, `absolute link ${url} (use a relative link)`); return whole; }
    const [path, query = ''] = url.split('#')[0].split('?');
    let target = join(dirname(page), path || '.');
    if (url.endsWith('/') || path === '' || (existsSync(target) && statSync(target).isDirectory())) target = join(target, 'index.html');
    if (!existsSync(target)) { report(page, `broken link ${url}`); return whole; }
    if (!['.css', '.js'].includes(extname(target))) return whole;
    const wantedStamp = stamp(target);
    if (query === `v=${wantedStamp}`) return whole;
    if (shouldFix) { stampsFixed++; return `${attribute}="${path}?v=${wantedStamp}"`; }
    report(page, `stale cache stamp on ${url} (want ?v=${wantedStamp}; run with --fix)`);
    return whole;
  });
  if (stamped !== source) writeFileSync(page, stamped);
}

// API keys must never be in the repo. Checked against the key on this
// machine, never printed, in every file git would commit: tracked, or
// untracked and not ignored (dotfiles too: a copied .env, which walk()
// skips).
const { azureKey } = secrets();
if (azureKey) {
  const listing = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' });
  const committable = listing.status !== 0 ? files
    : listing.stdout.split('\0').filter(Boolean).map(file => join(ROOT, file)).filter(file => existsSync(file) && statSync(file).isFile());
  for (const file of committable) {
    if (readFileSync(file).includes(azureKey)) report(file, 'contains the Azure Speech key: remove it, never commit it');
  }
}

// JavaScript compiles
for (const script of files.filter(file => file.endsWith('.js'))) {
  try { new vm.Script(readFileSync(script, 'utf8'), { filename: script }); }
  catch (error) { report(script, `syntax error: ${error.message}`); }
}

// Shared helpers, not copies of them, in the site's scripts (each defined
// once, in the file named).
const HELPER_COPIES = [
  [/Object\.fromEntries\([^;]*?\.map\(\s*(\w+)\s*=>\s*\[\s*\1\.id\s*,\s*\1\s*\]\s*\)\s*\)/, 'Units.byId(vocab)', 'shared/units.js'],
  [/ctx\.grid\(\s*\w+\.map\(\s*ctx\.entry\s*\)\s*\)/, 'ctx.words(...ids)', 'shared/learn.js'],
  [/<img src="\$\{(?:Core\.)?imgSrc\((\w+)\)\}" alt="\$\{(?:Core\.)?esc\(\1\.english\)\}">/, 'Game.pic(entry)', 'shared/game.js'],
  [/ctx\.reveal = \(\) => \{\s*\w+\??\.?\(\);\s*ctx\.play\(\w+\);\s*\}/, 'Game.playOnReveal(ctx, entry)', 'shared/game.js'],
];
for (const script of files.filter(file => file.endsWith('.js') && !file.startsWith(join(ROOT, 'tools') + '/'))) {
  const source = readFileSync(script, 'utf8');
  for (const [pattern, helper, definedIn] of HELPER_COPIES) {
    if (join(ROOT, definedIn) !== script && pattern.test(source)) report(script, `use ${helper} (${definedIn}) instead of a copy of it`);
  }
}

// Spanish spelling of one entry: [problems]
const SPANISH_TEXT = /^[¡¿]?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ ,.'-]*[.!?]?$/;
function spellingProblems(entry) {
  const text = entry.spanish ?? '';
  const found = [];
  if (text !== text.normalize('NFC')) found.push(`${entry.id}: "${text}" has a separate accent mark; type é, not e + ́`);
  else if (!SPANISH_TEXT.test(text)) found.push(`${entry.id}: "${text}" has a character Spanish doesn't use here`);
  if (text.endsWith('?') !== text.startsWith('¿')) found.push(`${entry.id}: "${text}" needs ¿ … ? around a question`);
  if (text.endsWith('!') !== text.startsWith('¡')) found.push(`${entry.id}: "${text}" needs ¡ … ! around an exclamation`);
  const plainId = Spanish.plainId(text);
  if (entry.id && entry.id !== plainId && !entry.id.startsWith(`${plainId}-`)) {
    found.push(`${entry.id}: its id should be ${plainId}, or ${plainId}-<something> when that is taken (papa-tilde)`);
  }
  return found;
}

// Each home's vocab and assets
const homeIdSets = {};
const idsIn = home => homeIdSets[home] ??= new Set(entries(loadVocab(home) ?? {}).map(entry => entry.id));
const wordHome = {}, soundHome = {};  // a word's id, and its spelling and voice: where defined
const dictionaryWordsListedBy = {};   // unit<n>: ids of the dictionary words its vocab has
for (const home of homes()) {
  const dir = join(ROOT, home);
  const isDictionary = home === 'words';
  const vocabFile = isDictionary ? join(ROOT, DICTIONARY) : join(dir, 'vocab.js');
  let vocab, art;
  try { vocab = loadVocab(home); } catch (error) { report(vocabFile, error.message); continue; }
  try { art = (await loadArt(home)) ?? {}; } catch (error) { report(join(dir, 'art.mjs'), error.message); continue; }
  if (!vocab) continue;
  const all = entries(vocab);
  const ids = new Set();
  for (const entry of all) {
    if (ids.has(entry.id)) report(vocabFile, `duplicate id ${entry.id}`);
    ids.add(entry.id);
  }
  for (const entry of all) {
    // A borrowed entry's ids may be its home's.
    const isId = id => ids.has(id) || idsIn(homeOf(entry, home)).has(id) || idsIn('words').has(id);
    for (const problem of [...entryProblems(entry, isId), ...spellingProblems(entry)]) report(vocabFile, problem);
    if (entry.taught && !isDictionary) {
      if (entry.taught > +home.slice(4)) report(vocabFile, `${entry.id} is taught in unit ${entry.taught}, after this one`);
      (dictionaryWordsListedBy[home] ??= new Set()).add(entry.id);
    }
    if (!isOwn(entry, home)) continue;
    const sound = `${entry.spanish} ${entry.voice ?? vocab.voice}`;
    if (wordHome[entry.id]) report(vocabFile, `${entry.id}: ${wordHome[entry.id]} has an entry with this id (borrow it with Units.word, or give one a suffix)`);
    else if (soundHome[sound]) report(vocabFile, `${entry.id}: "${entry.spanish}" is ${soundHome[sound]} (borrow it with Units.word)`);
    wordHome[entry.id] ??= home;
    soundHome[sound] ??= `${home}'s ${entry.id}`;
    if (!existsSync(join(dir, 'audio', `${entry.id}.mp3`))) report(vocabFile, `${entry.id} has no audio (run node tools/tts.mjs ${home})`);
    if (entry.img !== false && !art[entry.id]) report(vocabFile, `${entry.id} has no drawing in ${relative(ROOT, join(dir, 'art.mjs'))}`);
  }
  const ownPictured = new Set(all.filter(entry => entry.img !== false && isOwn(entry, home)).map(entry => entry.id));
  for (const id of Object.keys(art)) {
    if (!ownPictured.has(id)) report(join(dir, 'art.mjs'), `${id} has no vocab entry with a picture`);
    const svg = join(dir, 'img', `${id}.svg`);
    if (!existsSync(svg) || readFileSync(svg, 'utf8') !== art[id]) report(svg, 'out of date (run node tools/draw.mjs)');
  }
  const filesIn = subdir => existsSync(join(dir, subdir)) ? readdirSync(join(dir, subdir)) : [];
  for (const file of filesIn('audio')) if (file.endsWith('.mp3') && !ids.has(file.slice(0, -4))) report(join(dir, 'audio', file), 'orphan (no vocab entry)');
  for (const file of filesIn('img')) if (file.endsWith('.svg') && !art[file.slice(0, -4)]) report(join(dir, 'img', file), 'orphan (not in art.mjs)');
}
// Each dictionary word is in the vocab of the unit that teaches it.
for (const word of entries(loadVocab('words') ?? {})) {
  if (!dictionaryWordsListedBy[`unit${word.taught}`]?.has(word.id)) {
    report(join(ROOT, DICTIONARY), `${word.id}: taught in unit ${word.taught}, but unit${word.taught}/vocab.js doesn't list it (Words.get('${word.id}'))`);
  }
}

// Names page scripts take from the vocab: a misspelt group or id is
// undefined in the browser, and fails only on the step or level using it.
{
  const loaded = {};
  const vocabOf = unit => loaded[unit] ??= (() => {
    try { const vocab = loadVocab(unit); return vocab && { vocab, ids: new Set(entries(vocab).map(entry => entry.id)) }; } catch { return null; }
  })();
  const dictionary = entries(loadVocab('words') ?? {});
  for (const unit of unitDirs()) {
    const own = vocabOf(unit);
    if (!own) continue;
    const unitNumber = +unit.slice(4);
    for (const name of readdirSync(join(ROOT, unit))) {
      const file = join(ROOT, unit, name);
      const scripts = name.endsWith('.js') && name !== 'vocab.js' ? [{ source: readFileSync(file, 'utf8'), line: 1 }]
        : name.endsWith('.html') ? inlineScripts(readFileSync(file, 'utf8')) : [];
      for (const script of scripts) {
        for (const reference of pageReferences(script.source)) {
          const at = `line ${script.line + reference.line - 1}`;
          if (reference.kind === 'group' && !(reference.name in own.vocab)) report(file, `${at}: V.${reference.name} is not in ${unit}/vocab.js`);
          if (reference.kind === 'id' && !own.ids.has(reference.name)) report(file, `${at}: no entry ${reference.name} in ${unit}'s vocab`);
          if (reference.kind === 'dictionary') {
            const word = dictionary.find(candidate => candidate.id === reference.name);
            if (!word) report(file, `${at}: the dictionary has no word ${reference.name}`);
            else if (word.taught > unitNumber) report(file, `${at}: ${reference.name} is taught in unit ${word.taught}, after this one`);
          }
          if (reference.kind === 'word') {
            if (reference.unit > unitNumber) report(file, `${at}: Units.word(${reference.unit}, ...) borrows from a later unit`);
            else if (!vocabOf(`unit${reference.unit}`)?.ids.has(reference.name)) report(file, `${at}: unit ${reference.unit} has no word ${reference.name}`);
          }
        }
      }
    }
  }
}

// The review table (a vocab that fails to load is reported above)
{
  const { reviewMarkdown, REVIEW_FILE } = await import('./review.mjs');
  let markdown = null;
  try { markdown = reviewMarkdown(); } catch { /* reported with its vocab */ }
  if (markdown !== null && (!existsSync(REVIEW_FILE) || readFileSync(REVIEW_FILE, 'utf8') !== markdown)) report(REVIEW_FILE, 'out of date (run node tools/review.mjs)');
}

// Tests
for (const test of readdirSync(join(ROOT, 'tools')).filter(name => name.endsWith('.test.mjs'))) {
  const run = spawnSync(process.execPath, [join(ROOT, 'tools', test), '--quiet'], { encoding: 'utf8' });
  if (run.status !== 0) report(join(ROOT, 'tools', test), `failed:\n${run.stdout}${run.stderr}`);
}

if (vocabBlocksWritten) console.log(`Wrote the vocab scripts of ${vocabBlocksWritten} page(s).`);
if (stampsFixed) console.log(`Updated ${stampsFixed} cache stamp(s).`);
if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log('All checks passed.');
