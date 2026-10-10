/* Unit 1 learn page: the steps shown by shared/learn.js. Words come from vocab.js. */
(function () {
  const V = window.VOCAB;
  const { p, tip } = Learn;
  const { el, es } = Core;
  const { marked } = Stress;

  // A listening quiz over sound-alikes: the wrong answers are always the
  // heard word's own family, so the ear has to do the work.
  const soundAlikeQuiz = (ctx, pool, rounds) => {
    const quiz = el('div');
    ctx.listenQuiz(quiz, { pool, rounds, show: 'text', rivals: entry => V.familyOf(entry).filter(other => other.id !== entry.id) });
    return quiz;
  };

  const ruleRow = (rule, words) => `<tr><td>${rule}</td><td>${words.map(marked).join(', ')}</td></tr>`;

  Learn.init({
    root: document.getElementById('learn'),
    key: 'u1-learn',
    vocab: V,
    steps: [
      {
        id: 'intro',
        title: 'Spelled the way it sounds',
        render(element, ctx) {
          element.append(
            p('Good news: Spanish is spelled almost exactly the way it sounds. Once you know what each letter says, you can read any word aloud, and write down most words you hear.'),
            p('This unit teaches the sounds of the Spanish spoken in Mexico.'),
            ctx.words('hola'),
            tip('<strong>How to use this page:</strong> tap any card to hear it. Listen a few times and say it out loud.'),
          );
        },
      },
      {
        id: 'vowels',
        title: 'Five vowels',
        render(element, ctx) {
          element.append(
            p(`Spanish has just five vowel sounds, and each letter always says the same one: ${['a', 'e', 'i', 'o', 'u'].map(es).join(', ')}, as in <em>father</em>, <em>bet</em>, <em>machine</em>, <em>note</em> and <em>rule</em>.`),
            ctx.grid(V.vowels),
            tip('<strong>Keep them short and pure.</strong> English slides one vowel into another: <em>day</em> is really "deh-ee" and <em>go</em> is "goh-oo". Spanish vowels hold still.'),
          );
        },
      },
      {
        id: 'vowel-quiz',
        title: 'Which vowel?',
        gate: true,
        render(element, ctx) {
          element.append(
            p(`These words differ only in a vowel. Listen, then tap the one you hear: ${es('peso')} or ${es('piso')}?`),
            soundAlikeQuiz(ctx, V.withContrast('vowel'), 8),
          );
        },
      },
      {
        id: 'letters',
        title: 'Letters that surprise',
        render(element, ctx) {
          element.append(
            p('Most consonants sound as an English speaker expects. These are the ones that don\'t.'),
            ctx.grid(V.letters),
          );
        },
      },
      {
        id: 'r-and-n',
        title: 'R or rr, n or ñ',
        render(element, ctx) {
          element.append(
            p(`A single ${es('r')} between vowels is one quick tap of the tongue, like the <em>tt</em> in American <em>butter</em>. A double ${es('rr')} (and an ${es('r')} at the start of a word) is a trill. Swap them and you get another word.`),
            ctx.grid(V.withContrast('r-rr')),
            p(`${es('ñ')} is its own letter, with its own sound: <em>ny</em> as in <em>canyon</em>.`),
            ctx.grid(V.withContrast('n-ny')),
          );
        },
      },
      {
        id: 'r-and-n-quiz',
        title: 'Which one?',
        gate: true,
        render(element, ctx) {
          element.append(
            p('Listen, then tap the word you hear.'),
            soundAlikeQuiz(ctx, [...V.withContrast('r-rr'), ...V.withContrast('n-ny')], 8),
          );
        },
      },
      {
        id: 'stress',
        title: 'Which syllable?',
        render(element, ctx) {
          const rules = el('table', 'rule-table', `<thead><tr><th>The word…</th><th>is stressed on</th></tr></thead><tbody>
            ${ruleRow('ends in a vowel, <em>n</em> or <em>s</em>: the second to last syllable', ['casa', 'examen', 'zapatos'])}
            ${ruleRow('ends in any other letter: the last syllable', ['reloj', 'ciudad', 'doctor'])}
            ${ruleRow('has an accent mark: that syllable, whatever it ends in', ['café', 'árbol', 'teléfono'])}
            </tbody>`);
          element.append(
            p('Every Spanish word has one syllable said louder and longer than the rest. Two rules and one exception tell you which, from the spelling alone.'),
            rules,
            ctx.grid(V.stressPractice),
            tip('<strong>Many of these look like English words</strong>, but the stress often falls somewhere else: hos·pi·<strong>tal</strong>, a·ni·<strong>mal</strong>, cho·co·<strong>la</strong>·te.'),
          );
        },
      },
      {
        id: 'accent-marks',
        title: 'Accent marks change words',
        render(element, ctx) {
          element.append(
            p(`Moving the stress can make another word. The accent mark shows it: ${marked('papa')} is a potato, ${marked('papá')} is your dad.`),
            ctx.grid(V.withContrast('stress')),
          );
        },
      },
      {
        id: 'accent-quiz',
        title: 'Potato or dad?',
        gate: true,
        render(element, ctx) {
          element.append(
            p('Listen for the loud syllable, then tap the word you hear.'),
            soundAlikeQuiz(ctx, V.withContrast('stress'), 8),
          );
        },
      },
      {
        id: 'done',
        title: '¡Excelente! Well done',
        render(element, ctx) {
          element.append(
            p('You know the sounds of Spanish. Now train your ear with <a href="match.html">Sound Match</a> and <a href="stress.html">Stress Detective</a>. Get a whole level right and you\'ll hear this:'),
            ctx.grid(V.praise),
            p('Use the numbered steps above to review any section, or <a href="./">go back to Unit 1</a>.'),
          );
        },
      },
    ],
  });
})();
