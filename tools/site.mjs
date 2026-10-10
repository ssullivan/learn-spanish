/*
 * site.mjs — helpers shared by the tools/ scripts.
 *
 *   ROOT              repo root
 *   unitDirs()        ["unit1", ...] in number order
 *   homes()           where entries' files live: "words" (the dictionary,
 *                     words/words.js) and every unit, in that order
 *   borrowsFrom(unit) the earlier units whose vocab.js a unit's pages load:
 *                     those its vocab.js and page scripts name in
 *                     Units.word(n, ...), and the ones those borrow from
 *   loadShared(...files)
 *                     a fresh sandbox (as `window`) with those shared/ files
 *                     run in it, for Node scripts and tests
 *   loadVocab(home)   unit<N>/vocab.js's vocab, or null if none. Runs
 *                     shared/units.js, words/words.js and the vocab.js of
 *                     the units it borrows from first, as a page does, so
 *                     Units.word() and Words.get() work. loadVocab("words")
 *                     is the dictionary as a vocab: { voice, unit<n>: [words] }
 *   entries(vocab)    every entry from every list, in file order
 *   homeOf(entry, here)
 *                     where the entry's audio and picture are: "words" for
 *                     a dictionary word, its unit for one borrowed with
 *                     Units.word, else `here` (the vocab it is in)
 *   isOwn(entry, home) whether they are in that home
 *   loadArt(home)     <home>/art.mjs's { id: svg }, or null if none
 *   CONFIG_FILE       ~/.config/learning-spanish/config.env, where keys live
 *   secrets()         { azureKey, azureRegion }, undefined when not set,
 *                     without exiting (check.mjs, to make sure no file holds
 *                     a key)
 *   azureConfig()     { key, region } for Azure Speech, from the environment
 *                     or CONFIG_FILE; exits if missing (tts.mjs)
 *   shouldRetryAzure(error, failures)
 *                     whether to retry a failed Azure request: busy (429) or
 *                     failing (5xx) up to 5 more times, and 401, which Azure
 *                     sometimes answers to a burst of requests with a good
 *                     key, 2 more (so a wrong key still fails in seconds)
 *   retrying(attempt, shouldRetry, sleepFor?)
 *                     runs attempt() until it returns, waiting 2 s, 4 s,
 *                     8 s... after each error while shouldRetry(error,
 *                     failures so far) says to try once more; sleepFor(ms)
 *                     can be replaced in tests
 *   clipMoves(manifest, wanted)
 *                     what to do with an audio dir's clips when its ids
 *                     change (tts.mjs): manifest is { id: hash } as saved,
 *                     wanted { id: hash } for the entries it should now hold.
 *                     Returns { moves: [[from, to]], dropped: [ids] }: a
 *                     wanted id without its clip takes the clip of an id no
 *                     longer wanted that has the same hash (a renamed word
 *                     keeps its audio), and the other ids no longer wanted
 *                     are dropped
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const unitDirs = () => readdirSync(ROOT)
  .filter(name => /^unit\d+$/.test(name))
  .sort((a, b) => a.slice(4) - b.slice(4));

const DICTIONARY_FILE = join(ROOT, 'words', 'words.js');

export const homes = () => [...(existsSync(DICTIONARY_FILE) ? ['words'] : []), ...unitDirs()];

const BORROWED_UNIT = /Units\.word\((\d+)/g;

export function borrowsFrom(unit) {
  const unitsNamedIn = files => files.flatMap(file => [...readFileSync(file, 'utf8').matchAll(BORROWED_UNIT)].map(match => `unit${match[1]}`));
  const needed = new Set();
  const visit = (borrower, files) => {
    for (const lender of unitsNamedIn(files)) {
      if (lender === borrower || needed.has(lender)) continue;
      needed.add(lender);
      visit(lender, [join(ROOT, lender, 'vocab.js')]);
    }
  };
  const dir = join(ROOT, unit);
  visit(unit, readdirSync(dir).filter(name => /\.(js|html)$/.test(name)).map(name => join(dir, name)));
  return unitDirs().filter(name => needed.has(name));
}

export function loadShared(...files) {
  const sandbox = vm.createContext({});
  sandbox.window = sandbox;
  for (const file of files) vm.runInContext(readFileSync(join(ROOT, file), 'utf8'), sandbox, { filename: file });
  return sandbox;
}

export function loadVocab(home) {
  const vocabPath = unit => join(ROOT, unit, 'vocab.js');
  if (home === 'words' ? !existsSync(DICTIONARY_FILE) : !existsSync(vocabPath(home))) return null;
  const sandbox = loadShared('shared/units.js');
  const run = path => vm.runInContext(readFileSync(path, 'utf8'), sandbox, { filename: path });
  run(DICTIONARY_FILE);
  if (home === 'words') return { voice: sandbox.Words.voice, ...sandbox.WORDS };
  for (const lender of borrowsFrom(home)) run(vocabPath(lender));
  run(vocabPath(home));
  return sandbox.UNITS[+home.slice(4)];
}

export const entries = vocab => Object.values(vocab).filter(Array.isArray).flat();

export const homeOf = (entry, here) => entry.taught ? 'words' : entry.unit ? `unit${entry.unit}` : here;

export const isOwn = (entry, home) => homeOf(entry, home) === home;

export async function loadArt(home) {
  const path = join(ROOT, home, 'art.mjs');
  return existsSync(path) ? (await import(pathToFileURL(path))).default : null;
}

export const CONFIG_FILE = join(homedir(), '.config/learning-spanish/config.env');

// Keys from the environment, or from CONFIG_FILE (never from the repo), or
// undefined when not set.
export function secrets() {
  if (existsSync(CONFIG_FILE)) {
    for (const line of readFileSync(CONFIG_FILE, 'utf8').split('\n')) {
      const setting = line.match(/^\s*(?:export\s+)?([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (setting && !process.env[setting[1]]) process.env[setting[1]] = setting[2];
    }
  }
  return { azureKey: process.env.AZURE_SPEECH_KEY, azureRegion: process.env.AZURE_SPEECH_REGION };
}

export function azureConfig() {
  const { azureKey: key, azureRegion: region } = secrets();
  if (!key || !region) {
    console.error(`Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (env or ${CONFIG_FILE}).`);
    process.exit(1);
  }
  return { key, region };
}

export const shouldRetryAzure = (error, failures) =>
  error.status === 401 ? failures < 2 : (error.status === 429 || error.status >= 500) && failures < 5;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function retrying(attempt, shouldRetry, sleepFor = sleep) {
  for (let failures = 0; ; failures++) {
    try {
      return await attempt();
    } catch (error) {
      if (!shouldRetry(error, failures)) throw error;
      await sleepFor(2000 * 2 ** failures);
    }
  }
}

export function clipMoves(manifest, wanted) {
  const stale = Object.keys(manifest).filter(id => !(id in wanted));
  const moves = [];
  for (const [id, hash] of Object.entries(wanted)) {
    if (manifest[id] === hash) continue;
    const from = stale.find(oldId => manifest[oldId] === hash && !moves.some(([taken]) => taken === oldId));
    if (from) moves.push([from, id]);
  }
  return { moves, dropped: stale.filter(id => !moves.some(([from]) => from === id)) };
}
