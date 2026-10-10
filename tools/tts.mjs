#!/usr/bin/env node
/*
 * tts.mjs — generate <home>/audio/<id>.mp3 for every entry, with Azure
 * Speech (es-MX neural voices).
 *
 *   node tools/tts.mjs [words | unit1 ...] [--force] [--only id,id]
 *
 * With none given, the dictionary (words/) and every unit<N>/vocab.js are
 * processed. A clip is only regenerated when its voice or text changes
 * (tracked in audio/manifest.json), unless --force. A run without --only
 * also tidies every audio dir: an entry renamed or moved (from a unit to
 * the dictionary) takes its old clip with the same text and voice, and
 * clips of entries that are gone are deleted (site.mjs clipMoves).
 *
 * Afterwards it rewrites AUDIO-REVIEW.md (tools/review.mjs).
 *
 * Credentials: AZURE_SPEECH_KEY and AZURE_SPEECH_REGION from the
 * environment, or from ~/.config/learning-spanish/config.env (site.mjs).
 * Never commit a key.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, homes, loadVocab, entries, isOwn, clipMoves, azureConfig, retrying, shouldRetryAzure } from './site.mjs';

const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const PAUSE_BETWEEN_REQUESTS_MS = 300;

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyFlagIndex = args.indexOf('--only');
const onlyIds = onlyFlagIndex >= 0 ? new Set(args[onlyFlagIndex + 1].split(',')) : null;
const isOnlyIdsArgument = index => onlyFlagIndex >= 0 && index === onlyFlagIndex + 1;
const namedHomes = args.filter((arg, index) => !arg.startsWith('--') && !isOnlyIdsArgument(index));
const unknownHomes = namedHomes.filter(home => !homes().includes(home));
if (unknownHomes.length) {
  console.error(`No such home: ${unknownHomes.join(' ')} (words, or unit1 to ${homes().at(-1)})`);
  process.exit(1);
}
const homesToVoice = namedHomes.length ? namedHomes : homes().filter(loadVocab);

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const escapeXml = text => text.replace(/[&<>"']/g, character => XML_ESCAPES[character]);

const ssmlFor = (entry, voice) => `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX"><voice name="${voice}">${entry.ssml ?? escapeXml(entry.say ?? entry.spanish)}</voice></speak>`;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function synthesize({ key, region }, ssml) {
  return retrying(async () => {
    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
        'User-Agent': 'learn-spanish-tts',
      },
      body: ssml,
    });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    throw Object.assign(new Error(`Azure TTS ${response.status}: ${await response.text()}`), { status: response.status });
  }, shouldRetryAzure);
}

const readJson = path => existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
const writeSortedJson = (path, value) => writeFileSync(path, JSON.stringify(Object.fromEntries(Object.entries(value).sort()), null, 2) + '\n');

// Each home's clips: the entries whose audio is there, the SSML for each,
// and its hash; with the manifest of the clips it has. Every home, so a
// clip moving between homes is found whichever is named.
const runs = homes().filter(loadVocab).map(home => {
  const vocab = loadVocab(home);
  const audioDir = join(ROOT, home, 'audio');
  mkdirSync(audioDir, { recursive: true });
  const manifestPath = join(audioDir, 'manifest.json');
  const clips = entries(vocab).filter(entry => isOwn(entry, home)).map(entry => {
    const ssml = ssmlFor(entry, entry.voice ?? vocab.voice);
    return { entry, ssml, hash: createHash('sha1').update(ssml + OUTPUT_FORMAT).digest('hex').slice(0, 12) };
  });
  const manifest = readJson(manifestPath) ?? {};
  // Saved after every clip, so a run that fails partway keeps what it made.
  return { home, audioDir, clips, manifest, save: () => writeSortedJson(manifestPath, manifest) };
});

// Renamed or moved entries take their old clips, and gone entries lose
// theirs. Clips are named "<home>/<id>" here, so one can move between homes.
function tidy() {
  const runByHome = Object.fromEntries(runs.map(run => [run.home, run]));
  const mp3Path = clipName => { const [home, id] = clipName.split('/'); return join(runByHome[home].audioDir, `${id}.mp3`); };
  const saved = {}, wanted = {};
  for (const { home, manifest, clips } of runs) {
    for (const [id, hash] of Object.entries(manifest)) {
      if (existsSync(mp3Path(`${home}/${id}`))) saved[`${home}/${id}`] = hash;
      else delete manifest[id];
    }
    for (const { entry, hash } of clips) wanted[`${home}/${entry.id}`] = hash;
  }
  const forget = clipName => { const [home, id] = clipName.split('/'); delete runByHome[home].manifest[id]; };
  const shown = clipName => `${clipName.replace('/', '/audio/')}.mp3`;
  const { moves, dropped } = clipMoves(saved, wanted);
  for (const clipName of dropped) {
    rmSync(mp3Path(clipName));
    forget(clipName);
    console.log(`${shown(clipName)}  deleted (no entry)`);
  }
  // Through temporary names, so a clip can move to a name another is leaving.
  for (const [from] of moves) renameSync(mp3Path(from), `${mp3Path(from)}.moving`);
  for (const [from, to] of moves) {
    renameSync(`${mp3Path(from)}.moving`, mp3Path(to));
    forget(from);
    const [home, id] = to.split('/');
    runByHome[home].manifest[id] = saved[from];
    console.log(`${shown(from)} → ${shown(to)}`);
  }
  for (const run of runs) run.save();
}

const azure = azureConfig();
let generated = 0, unchanged = 0;

if (!onlyIds) tidy();

for (const { home, audioDir, clips, manifest, save } of runs.filter(run => homesToVoice.includes(run.home))) {
  for (const { entry, ssml, hash } of clips) {
    if (onlyIds && !onlyIds.has(entry.id)) continue;
    const file = join(audioDir, `${entry.id}.mp3`);
    if (!force && manifest[entry.id] === hash && existsSync(file)) { unchanged++; continue; }
    writeFileSync(file, await synthesize(azure, ssml));
    manifest[entry.id] = hash;
    save();
    generated++;
    console.log(`${home}/audio/${entry.id}.mp3  ${entry.spanish}`);
    await sleep(PAUSE_BETWEEN_REQUESTS_MS);
  }
  save();
}

console.log(`${generated} generated, ${unchanged} unchanged.`);

// Keep the review table in step with the vocab.
const { reviewMarkdown, REVIEW_FILE } = await import('./review.mjs');
writeFileSync(REVIEW_FILE, reviewMarkdown());
