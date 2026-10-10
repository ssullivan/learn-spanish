/*
 * reply.js — Reply Match: pick what to say. Any unit can use it.
 * Needs core.js, audio.js, game.js, units.js. Reads two optional entry fields:
 *   reply: [ids]   good answers when someone says this entry to you
 *   when: [text]   situations where you'd say it; the entry's picture
 *                  (if any) shows the first one
 *
 *   Reply.init({
 *     root, key,     as for Game.init
 *     vocab,         the unit's vocab (reply ids are looked up in it)
 *     levels: [{ id, name, blurb, modes, pool, choices?, rounds?, time? }]
 *                    modes: one or more of
 *                      'meaning'  hear an entry, pick its English
 *                      'reply'    hear an entry with `reply`, pick an answer
 *                      'when'     read a situation, pick the entry for it
 *                    Each round uses one of the modes at random.
 *                    pool: entries to ask about (and wrong answers come
 *                    from); choices: 2–6, default 4
 *   })
 *
 * Wrong answers for 'when' come only from entries that have `when`, so an
 * entry without situations never shows up as a wrong answer it would
 * really fit. Give `when` to every entry that could answer one.
 */
(function () {
  const { el, esc, es, shuffle, pick, imgSrc } = Core;

  // Answer buttons for `right` plus wrong ones from `others`, wired to ctx.
  function answerGrid(ctx, right, others, count, label) {
    const grid = el('div', 'choice-grid');
    const wrongOnes = pick(others.filter(other => other.id !== right.id), count - 1);
    for (const option of shuffle([right, ...wrongOnes])) {
      const choice = el('button', 'choice', label(option));
      choice.type = 'button';
      choice.dataset.id = option.id;
      choice.addEventListener('click', () => {
        if (option.id !== right.id) choice.classList.add('wrong');
        ctx.done(option.id === right.id);
      });
      grid.append(choice);
    }
    ctx.reveal = () => grid.querySelector(`[data-id="${right.id}"]`).classList.add('right');
    return grid;
  }

  const spanishOf = entry => es(entry.spanish);
  const fullAnswer = entry => `${es(entry.spanish)}: ${esc(entry.english)}`;

  const modes = {
    meaning(stage, ctx, { pool, choices }) {
      const heard = ctx.draw(pool);
      const sayIt = () => ctx.play(heard);
      const bubble = Core.speech('▶', 'What does this mean?', sayIt);
      // Wrong answers must not share the right one's English.
      const others = pool.filter(other => other.english !== heard.english);
      stage.replaceChildren(bubble, answerGrid(ctx, heard, others, choices, option => esc(option.english)));
      ctx.answer = fullAnswer(heard);
      return sayIt();
    },

    reply(stage, ctx, { pool, choices }, entryById) {
      // Wrong answers come from the whole unit, since replies are often outside the pool.
      const heard = ctx.draw(pool.filter(entry => entry.reply));
      const goodReplies = heard.reply.map(id => entryById[id]);
      const [right] = pick(goodReplies, 1);
      const sayIt = () => ctx.play(heard);
      const bubble = Core.speech('▶', `${spanishOf(heard)}<br>What do you say back?`, sayIt);
      const others = Object.values(entryById).filter(entry => !heard.reply.includes(entry.id));
      stage.replaceChildren(bubble, answerGrid(ctx, right, others, choices, spanishOf));
      ctx.answer = goodReplies.map(fullAnswer).join(', or ');
      Game.playOnReveal(ctx, right);
      return sayIt();
    },

    when(stage, ctx, { pool, choices }) {
      const fitting = ctx.draw(pool.filter(entry => entry.when));
      const [situation] = pick(fitting.when, 1);
      const parts = [];
      if (fitting.img !== false && situation === fitting.when[0]) {
        const picture = el('img', 'prompt-pic');
        picture.src = imgSrc(fitting);
        picture.alt = '';
        parts.push(picture);
      }
      parts.push(Core.speech('Tú', `${esc(situation)}<br>What do you say?`));
      const others = pool.filter(entry => entry.when && !entry.when.includes(situation));
      stage.replaceChildren(...parts, answerGrid(ctx, fitting, others, choices, spanishOf));
      ctx.answer = fullAnswer(fitting);
      Game.playOnReveal(ctx, fitting);
    },
  };

  function init({ root, key, vocab, levels }) {
    const entryById = Units.byId(vocab);
    Game.init({
      root,
      key,
      intro: `<strong>How to play:</strong> listen, or read the situation, and pick what fits.
        After each answer you hear the right phrase: say it along with the speaker.`,
      levels: levels.map(level => ({
        rounds: 8, time: 0, choices: 4, ...level,
        round: (stage, ctx) => modes[pick(level.modes, 1)[0]](stage, ctx, { choices: 4, ...level }, entryById),
      })),
    });
  }

  window.Reply = { init };
})();
