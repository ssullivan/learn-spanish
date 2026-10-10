# Unit 3 · Me & You · Yo y tú

Subject pronouns (yo, tú, usted, él, ella, nosotros, ustedes, ellos); ser (soy, eres, es, somos, son) for who someone is and where they're from; leaving the pronoun out; -o / -a for men and women (maestro, maestra; estudiante stays); no before the verb; yes/no questions by intonation; quién, cómo, de dónde; me llamo / ¿cómo te llamas? / ¿cómo se llama usted?. Grammar point: **ser, and agreement**.

## Pages
- `learn.html`, `lessons.js` (`u3-learn`): a picture quiz on the pronouns and a sentence quiz. The ser table pairs each pronoun with the ser form of the same `person`, so it is derived, not typed.
- `builder.html`, `builder.js` (`u3-builder`): Question Builder: word tiles (`shared/tiles.js`) for statements, no, questions and question words; then Answer Back (a picture of a woman at work, `¿Ella es maestra?`, answer `Sí, es maestra.` or `No, es doctora.`); then a timed rush.
- `stress.html` (`u3-stress`): Stress Detective on single words, then one word inside a sentence.

## Words
Groups: `pronouns` (with pictures), `ser`, `people`, `places`, `names`, `asking`, `more`, and the derived `statements`, `negatives`, `questions`, `questionWords`, `answers`, and Answer Back's `jobQuestions`, `jobYes`, `jobNo` (each with `job`, built from one list of jobs).

Words with an unaccented twin a later unit will teach got `-tilde` ids now: `el-tilde` (él; el is unit 5's article), `tu-tilde`, `si-tilde`, `que-tilde`, `como-tilde`, `donde-tilde`.

`yo` moved here from unit 1, which now shows the letter y with `playa`. Pronouns and verb forms carry `person`; pronouns and people nouns carry `gender` (unit 1's `doctor` too). `tools/grammar.test.mjs` checks every sentence agrees.

## Audio
The unit's voice is Dalia (a woman). Sentences a man says (`Yo soy maestro.`, `Me llamo Luis.`) have `voice: 'es-MX-JorgeNeural'`. Questions should rise at the end: the clips most worth a listen are the statement / question pairs (`Él es mexicano.` / `¿Él es mexicano?`). Speech-to-text hears `¿Usted es de México?` as "Ustedes de México": in natural speech usted es runs together, which is right but can confuse a learner.

## Drawings
Unit 3's section of `words/art.mjs`: the pronouns share one scene (`pronounScene`): the speaker in red with a speech bubble points at whoever is meant, drawn in colour in a gold ring; the others are grey. Él / ella differ by hair, tú / usted by age (white hair). Jobs are one woman drawn large (`person(..., { face: true })`) with a book, a blackboard or a stethoscope. People parts are in `tools/svg.mjs`.

## Used by later units
Nearly every later unit will use the pronouns, ser, `no`, `si-tilde` and the question words.
