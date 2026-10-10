/*
 * tiles.js — a game.js round where you build a sentence from word tiles.
 * Any unit can use it. Needs core.js, audio.js, game.js, units.js.
 * Styles: game.css (.tile-line, .tile-bank, .tile).
 *
 *   Tiles.round({ pool, vocab, decoys?, extra? })   a round for Game.init
 *     pool     sentences to build: entries with `words`, the ids of the
 *              vocab entries they are made of, in order (Units.sentences)
 *     vocab    the unit's vocab, to look the word ids up in
 *     decoys   ids of words to add as wrong tiles (those already in the
 *              sentence are skipped); extra: how many, default 2
 *
 * The round shows the English; tap tiles to put them in order (tap a
 * placed tile to take it back), then Check. Tiles show words as the
 * dictionary spells them, lower case: capitals and ¿ ? are the sentence's.
 * The same word twice (No, no soy...) makes two interchangeable tiles. Any
 * sentence in the pool with the same English counts as right (¿Eres
 * estudiante? or ¿Tú eres estudiante? for "Are you a student?"). The
 * sentence plays afterwards.
 */
(function () {
  const { el, esc, es, shuffle, pick } = Core;

  function round({ pool, vocab, decoys = [], extra = 2 }) {
    const entryById = Units.byId(vocab);
    const wordIdsOf = sentence => sentence.words.join(' ');

    return (stage, ctx) => {
      const sentence = ctx.draw(pool);
      const wrongTiles = pick(decoys.filter(id => !sentence.words.includes(id)), extra);

      const line = el('div', 'tile-line');
      line.dataset.empty = 'Tap the words in order';
      const bank = el('div', 'tile-bank');
      const check = el('button', 'btn primary', 'Check');
      check.type = 'button';
      check.disabled = true;

      for (const id of shuffle([...sentence.words, ...wrongTiles])) {
        const tile = el('button', 'tile', es(entryById[id].spanish));
        tile.type = 'button';
        tile.dataset.id = id;
        tile.addEventListener('click', () => {
          (tile.parentNode === bank ? line : bank).append(tile);
          check.disabled = !line.children.length;
        });
        bank.append(tile);
      }

      const built = () => [...line.children].map(tile => tile.dataset.id).join(' ');
      check.addEventListener('click', () => {
        const isRight = pool.some(other => other.english === sentence.english && wordIdsOf(other) === built());
        line.classList.add(isRight ? 'right' : 'wrong');
        ctx.done(isRight);
      });

      ctx.answer = `${es(sentence.spanish)}: ${esc(sentence.english)}${sentence.note ? ' ' + esc(sentence.note) : ''}`;
      ctx.reveal = () => { check.disabled = true; ctx.play(sentence); };
      stage.replaceChildren(Core.speech('Tú', `How do you say:<br><strong>${esc(sentence.english)}</strong>`), line, bank, check);
    };
  }

  window.Tiles = { round };
})();
