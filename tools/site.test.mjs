#!/usr/bin/env node
/*
 * site.test.mjs — tests tools/site.mjs's retrying, with shouldRetryAzure
 * (when tts.mjs retries Azure), on made-up failures without waiting, and
 * clipMoves (how tts.mjs keeps a renamed word's audio). Run by
 * tools/check.mjs; exits 1 on failure.
 */
import { retrying, shouldRetryAzure, clipMoves } from './site.mjs';
import { tester } from './testing.mjs';

const { ok, finish } = tester('site');

// A request that fails with these statuses in turn, then succeeds.
async function requestFailingWith(statuses) {
  let calls = 0;
  const waits = [];
  const attempt = async () => {
    const status = statuses[calls++];
    if (status === undefined) return 'audio';
    throw Object.assign(new Error(`HTTP ${status}`), { status });
  };
  try {
    return { result: await retrying(attempt, shouldRetryAzure, async ms => { waits.push(ms); }), calls, waits };
  } catch (error) {
    return { error: error.message, calls, waits };
  }
}

{
  const run = await requestFailingWith([]);
  ok('a request that works is made once', run.result === 'audio' && run.calls === 1 && !run.waits.length);
}
{
  const run = await requestFailingWith([401, 401]);
  ok('401 from a burst is retried', run.result === 'audio' && run.calls === 3, JSON.stringify(run));
  ok('waits double each time', run.waits.join() === '2000,4000', run.waits.join());
}
{
  const run = await requestFailingWith([401, 401, 401, 401]);
  ok('a wrong key (401 every time) fails after 3 tries', run.error === 'HTTP 401' && run.calls === 3, JSON.stringify(run));
}
{
  const run = await requestFailingWith([429, 503, 500, 429, 502]);
  ok('busy or failing is retried up to 5 times', run.result === 'audio' && run.calls === 6, JSON.stringify(run));
  const givenUp = await requestFailingWith([500, 500, 500, 500, 500, 500, 500]);
  ok('and then fails', givenUp.error === 'HTTP 500' && givenUp.calls === 6, JSON.stringify(givenUp));
}
{
  const run = await requestFailingWith([400]);
  ok('a bad request (400) is not retried', run.error === 'HTTP 400' && run.calls === 1);
  const networkError = await retrying(async () => { throw new TypeError('fetch failed'); }, shouldRetryAzure, async () => {}).catch(error => error.message);
  ok('a network error (no status) is not retried', networkError === 'fetch failed');
}

{
  const plan = clipMoves({ papa: 'h1', hablo: 'h2', gone: 'h4', same: 'h5' },
    { 'papa-tilde': 'h1', 'hablo-tilde': 'h2', same: 'h5', fresh: 'h6' });
  ok('a renamed id takes its old clip', JSON.stringify(plan.moves) === JSON.stringify([['papa', 'papa-tilde'], ['hablo', 'hablo-tilde']]), JSON.stringify(plan.moves));
  ok('an id no longer wanted is dropped', plan.dropped.join() === 'gone', plan.dropped.join());
  const oneForTwo = clipMoves({ a: 'h' }, { b: 'h', c: 'h' });
  ok('one old clip moves to one new id only', oneForTwo.moves.length === 1 && !oneForTwo.dropped.length, JSON.stringify(oneForTwo));
  const changed = clipMoves({ a: 'h1' }, { a: 'h2' });
  ok('a changed clip neither moves nor drops', !changed.moves.length && !changed.dropped.length, JSON.stringify(changed));
}

finish();
