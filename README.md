# learn-spanish

Spanish lessons and games with native-sounding audio, served at https://ssullivan.github.io/learn-spanish/. The Spanish is Mexico's.

The course is planned as 20 units, each building on the ones before (the roadmap is in CLAUDE.md). Every unit has a learn page with a listening quiz and at least one game, plus *Stress Detective* (hear a word or phrase and tap the stressed syllable).

### Foundations
- **Unit 1 · Sonidos · Sounds & Spelling**: the five vowels, the letters that surprise English speakers (h, j, ll, ñ, rr...), and the rule for which syllable to stress.
  - *Sound Match*: pero or perro? Una or uña? Papa or papá? Hear a word and pick how it's spelled.
  - *Stress Detective*: hear a word and tap its loudest syllable, ending with a level by ear alone.
- **Unit 2 · Saludos · Greetings**: hello and goodbye by the time of day, ¿cómo estás? or ¿cómo está usted?, please and thank you, and perdón, con permiso or lo siento.
  - *Reply Match*: hear a phrase and answer back, or pick what to say in a situation (tú or usted?).

**Reviewing the audio:** native speakers can listen to every recording in [AUDIO-REVIEW.md](AUDIO-REVIEW.md).

## Working on it

```sh
node tools/draw.mjs          # words/art.mjs, unit<N>/art.mjs → img/*.svg
node tools/tts.mjs           # words/words.js and unit<N>/vocab.js → audio/*.mp3 (needs an Azure Speech key)
node tools/check.mjs --fix   # check links, assets, spelling and tests; update cache stamps
git config core.hooksPath .githooks   # run check.mjs before every commit (once per clone)
python3 -m http.server       # preview at http://localhost:8000
```

See [CLAUDE.md](CLAUDE.md) for conventions.

## License

Copyright © 2026 Stephen Sullivan. All rights reserved. You may use the site for your own learning; see [LICENSE](LICENSE).
