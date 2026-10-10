/*
 * testing.mjs — the tiny test runner every tools/*.test.mjs uses.
 *
 *   const { ok, finish } = tester(name)
 *   ok(description, passed, detail?)   record one check; with --quiet (as
 *                                      tools/check.mjs runs tests) only
 *                                      failures print
 *   finish()                           exit 1 if any check failed
 */
export function tester(name) {
  const quiet = process.argv.includes('--quiet');
  let failures = 0;
  const ok = (description, passed, detail = '') => {
    if (!passed) failures++;
    if (!passed || !quiet) console.log(`${passed ? 'PASS' : 'FAIL'} ${description}${detail ? `  ${detail}` : ''}`);
  };
  const finish = () => {
    if (failures) {
      console.log(`${name}: ${failures} failed`);
      process.exit(1);
    }
    if (!quiet) console.log(`${name}: all passed`);
  };
  return { ok, finish };
}
