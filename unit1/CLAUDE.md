# Unit 1 · Sounds & Spelling · Sonidos

The five pure vowels; the letters English speakers misread (silent h, j, g before e/i, gu/qu, ll and y, ñ, rr, c/z as s, b = v); tapped r against trilled rr; n against ñ; and the stress rule with accent marks. Grammar point: none. It is the reading key for the rest of the course.

## Pages
- `learn.html`, `lessons.js` (`u1-learn`): **the template** for learn pages. Three gated quizzes (vowels; r/rr and n/ñ; accent marks), each offering only the heard word's sound-alike family as answers.
- `match.html`, `match.js` (`u1-match`): Sound Match: hear a word, pick its spelling from its family. **The template** for games.
- `stress.html` (`u1-stress`): the shared Stress Detective over every word of two or more syllables. Its last level hides spellings and accent marks.

## Words
Groups: `vowels` (one word per vowel, with `letter`), `letters` (with `letter` and a `note` on the sound), `soundAlikes` (families built with `soundAlikes(contrast, 'ids')`, named after their first word), `stressPractice` (cognates whose stress differs from English), `praise` (¡Excelente!, said by every game after a perfect level, and ¡Muy bien!).

A sound-alike has `contrast` ('vowel', 'r-rr', 'n-ny', 'stress') and `family`; `mesa`, `sol` and `perro` sit in `vowels` / `letters` but belong to families too (masa, sal, pero). `vocab.withContrast(contrast)` and `vocab.familyOf(entry)` are derived at the bottom of `vocab.js`. tools/units.test.mjs checks every family has two or more words, all differing in the same way.

Mexican Spanish: c, z and s all sound alike (seseo), so casa/caza and similar pairs are homophones here and are never quizzed.

## Audio
The sound-alike pairs are the clips most worth a listen: pero/perro and caro/carro (the voice must tap one and trill the other), una/uña, and the stress pairs (papa/papá, hablo/habló, sabana/sábana, esta/está).

## Drawings
16 words in `words/art.mjs`'s unit 1 section, mostly on `svg`, `OUTLINE`, `COLOUR`, `shadow` and `glass` (jugo and vaso share `glass()`).

## Used by later units
Nothing yet. Good candidates: `hola` (unit 2), `una` (unit 4), `casa`, `mesa`, `libro`, `gato`, `perro` (unit 5's articles), `cafe` (unit 8), `reloj` (unit 9), `papa-tilde` (unit 10), `carro` (unit 11), `zapato` (unit 12), `sol` (unit 13).
