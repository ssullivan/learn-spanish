# Unit 2 · Greetings · Saludos

Hola; buenos días / buenas tardes / buenas noches; adiós, hasta luego, hasta mañana, nos vemos; ¿cómo estás? and ¿cómo está usted?, the answers and ¿y tú? / ¿y usted?; ¿qué tal? and the Mexican ¿qué onda?; por favor, gracias, de nada; perdón vs con permiso vs lo siento, with no pasa nada and adelante; mucho gusto and igualmente. Grammar point: **tú or usted**, seen in estás / está (verbs are taught later; here they are set phrases).

## Pages
- `learn.html`, `lessons.js` (`u2-learn`): two gated quizzes, a picture quiz on the times of day (and adiós, gracias) and a phrase quiz on every entry.
- `reply.html` (`u2-reply`): Reply Match (`shared/reply.js`): hear a phrase and pick its meaning, answer back, or pick what to say in a situation. The situations carry the tú / usted contrast (your cousin vs your friend's grandmother) and the perdón / con permiso / lo siento one.
- `stress.html` (`u2-stress`): Stress Detective on single words, then one word inside a phrase (`Stress.questionsIn`).

## Words
Groups: `hello` (with unit 1's `hola`), `goodbye`, `howAreYou`, `polite`, `sorry`, `meeting`. Reply Match reads `reply` (ids of good answers) and `when` (situations; the picture shows the first). Every entry that could answer a situation must have a `when`, and no two entries may fit the same one, since entries with `when` are the wrong answers.

Mexican usage: hasta luego is the everyday goodbye; adiós in passing is also a hello; ¿qué onda? is slang among friends.

## Drawings
Unit 2's section of `words/art.mjs` draws when each phrase is said: the times of day on `sky()` with a small `clockFace()` (8, 3 and 9 o'clock), a waving hand for adiós, a present for gracias. The rest have `img: false`.

## Used by later units
Nothing yet. Good candidates: `por-favor` and `gracias` (units 6–8: shopping and ordering), `perdon` (unit 11: asking the way), `mucho-gusto` (unit 3: names), `como-estas` / `como-esta-usted` (unit 17: feelings).
