/*
 * learn.js — engine for step-by-step learn pages. Needs core.js, audio.js,
 * units.js. Styles: learn.css.
 *
 *   Learn.init({
 *     root,          element to render into
 *     key,           localStorage key, unique across the site (e.g. "u1-learn")
 *     vocab,         the unit's vocab (window.VOCAB)
 *     steps: [{
 *       id, title,
 *       gate,        true: Next stays locked until the step calls ctx.complete()
 *       render(element, ctx)
 *     }],
 *   })
 *
 * ctx passed to render():
 *   ctx.vocab                  the vocab object
 *   ctx.entry(id)              look up any entry by id
 *   ctx.card(entry)            <button> word card; tap plays the audio
 *   ctx.grid(entries)          grid of word cards (wider columns if none has a picture)
 *   ctx.words(...ids)          ctx.grid of the entries with those ids
 *   ctx.play(entry)            play an entry's clip
 *   ctx.complete()             mark this step done (unlocks Next if gated)
 *   ctx.listenQuiz(element, { pool, rounds, choices, show, labels, rivals })
 *                              hear a word, pick it from `choices` answers;
 *                              completes the step when the last round is
 *                              answered. show: 'picture' (default; entries
 *                              need one) or 'text' (the Spanish, for words
 *                              that sound alike). labels: the Spanish under
 *                              the pictures ('none' or 'spanish'), shown once
 *                              answered. rivals(entry): the wrong answers to
 *                              offer (default: random others from the pool)
 *
 * Helpers for step content:
 *   Learn.p(html)              <p> element
 *   Learn.tip(html)            callout box element
 *
 * Progress ({ step, done: [ids] }) is saved under `key`.
 */
(function () {
  const { el, esc, es, shuffle, imgSrc, play, picButton, showLabels } = Core;

  const p = html => el('p', null, html);
  const tip = html => el('div', 'tip', html);

  function button(html, className, onClick) {
    const element = el('button', className, html);
    element.type = 'button';
    if (onClick) element.addEventListener('click', onClick);
    return element;
  }

  function init({ root, key, vocab, steps }) {
    const entryById = Units.byId(vocab);

    const store = Core.store(key, { step: 0, done: [] });
    const progress = store.get();
    if (!Array.isArray(progress.done)) progress.done = [];
    progress.step = Math.min(Math.max(0, progress.step | 0), steps.length - 1);

    function card(entry) {
      const hasPicture = entry.img !== false;
      const wordCard = button('', 'word' + (hasPicture ? '' : ' no-img'));
      wordCard.setAttribute('aria-label', `Play ${entry.spanish}, ${entry.english}`);
      if (hasPicture) {
        const image = el('img');
        image.src = imgSrc(entry);
        image.alt = '';
        image.width = image.height = 128;
        wordCard.append(image);
      }
      wordCard.insertAdjacentHTML('beforeend', es(entry.spanish));
      wordCard.append(el('span', 'en', esc(entry.english)));
      if (entry.note) wordCard.append(el('span', 'note', esc(entry.note)));
      wordCard.append(el('span', 'play', '▶'));
      wordCard.addEventListener('click', () => {
        play(entry);
        wordCard.classList.remove('pulse');
        void wordCard.offsetWidth;  // restart the animation
        wordCard.classList.add('pulse');
      });
      return wordCard;
    }

    function grid(entries) {
      const cardGrid = el('div', 'word-grid' + (entries.every(entry => entry.img === false) ? ' wide' : ''));
      entries.forEach(entry => cardGrid.append(card(entry)));
      return cardGrid;
    }

    const isDone = index => progress.done.includes(steps[index].id);
    // A step is reachable once every gated step before it is done.
    const isReachable = index => steps.slice(0, index).every((step, earlier) => !step.gate || isDone(earlier));

    const nav = el('nav', 'steps');
    nav.setAttribute('aria-label', 'Lesson steps');
    const body = el('section', 'step-body');
    body.tabIndex = -1;
    const title = el('h2', 'step-title');
    const content = el('div', 'step-content');
    body.append(title, content);
    const footer = el('div', 'step-foot');
    const backButton = button('← Back', 'btn', () => go(progress.step - 1));
    const nextButton = button('Next →', 'btn primary', () => {
      if (!steps[progress.step].gate) markDone(progress.step);
      go(progress.step + 1);
    });
    footer.append(backButton, nextButton);
    root.replaceChildren(nav, body, footer);

    function markDone(index) {
      if (!isDone(index)) progress.done.push(steps[index].id);
      store.set(progress);
      paintNav();
      paintFooter();
    }

    function paintNav() {
      nav.replaceChildren(...steps.map((step, index) => {
        const dot = button(String(index + 1), 'dot', () => go(index));
        dot.title = step.title;
        dot.setAttribute('aria-label', `Step ${index + 1}: ${step.title}`);
        if (index === progress.step) dot.setAttribute('aria-current', 'step');
        if (isDone(index)) dot.classList.add('done');
        dot.disabled = !isReachable(index);
        return dot;
      }));
    }

    function paintFooter() {
      const index = progress.step;
      backButton.disabled = index === 0;
      nextButton.hidden = index === steps.length - 1;
      nextButton.disabled = !!steps[index].gate && !isDone(index);
    }

    function go(index) {
      Speak.stop();
      progress.step = index;
      store.set(progress);
      const step = steps[index];
      title.textContent = step.title;
      content.replaceChildren();
      const ctx = {
        vocab,
        entry: id => entryById[id],
        card, grid, play,
        words: (...ids) => grid(ids.map(id => entryById[id])),
        complete: () => markDone(index),
        listenQuiz: (element, options) => listenQuiz(element, options, ctx),
      };
      step.render(content, ctx);
      if (!step.gate && index === steps.length - 1) markDone(index);
      paintNav();
      paintFooter();
      body.focus({ preventScroll: true });
      root.scrollIntoView({ block: 'start' });
    }

    if (!isReachable(progress.step)) progress.step = 0;
    go(progress.step);
  }

  const randomRivals = pool => (entry, count) => shuffle(pool.filter(other => other.id !== entry.id)).slice(0, count);

  function listenQuiz(element, { pool, rounds = 8, choices = 4, show = 'picture', labels = 'none', rivals }, ctx) {
    const wrongAnswersFor = rivals ? (entry, count) => shuffle(rivals(entry)).slice(0, count) : randomRivals(pool);
    let order, roundIndex, score, isAnswered;

    function start() {
      order = shuffle(pool).slice(0, Math.min(rounds, pool.length));
      roundIndex = 0;
      score = 0;
      showRound();
    }

    function showRound() {
      isAnswered = false;
      const answer = order[roundIndex];
      const options = shuffle([answer, ...wrongAnswersFor(answer, choices - 1)]);

      const header = el('div', 'quiz-top');
      header.append(el('span', 'pill', `${roundIndex + 1} / ${order.length}`), el('span', 'pill', `Score ${score}`));
      const listenAgain = button('▶ Listen again', 'btn primary listen', () => play(answer));
      const answerGrid = el('div', show === 'text' ? 'choice-grid' : 'pic-grid');
      const feedback = el('div', 'quiz-feedback');
      feedback.setAttribute('aria-live', 'polite');

      for (const option of options) {
        const optionButton = show === 'picture' ? picButton(option, labels) : textButton(option);
        optionButton.addEventListener('click', () => choose(option, optionButton, answerGrid, feedback, answer));
        answerGrid.append(optionButton);
      }
      element.replaceChildren(header, listenAgain, answerGrid, feedback);
      play(answer);
    }

    function choose(option, optionButton, answerGrid, feedback, answer) {
      if (isAnswered) return;
      isAnswered = true;
      const isRight = option.id === answer.id;
      if (isRight) score++;
      [...answerGrid.children].forEach(child => { child.disabled = true; });
      optionButton.classList.add(isRight ? 'right' : 'wrong');
      if (!isRight) answerGrid.querySelector(`[data-id="${answer.id}"]`).classList.add('right');
      showLabels(answerGrid);
      feedback.className = 'quiz-feedback feedback ' + (isRight ? 'good' : 'bad');
      feedback.innerHTML = (isRight ? '¡Correcto! ' : 'Not quite. That was ') + `${es(answer.spanish)}: ${esc(answer.english)}`;
      const isLast = roundIndex + 1 >= order.length;
      const onward = button(isLast ? 'See score' : 'Next word →', 'btn primary', () => { roundIndex++; isLast ? finish() : showRound(); });
      feedback.append(document.createElement('br'), onward);
      onward.focus();
    }

    function finish() {
      const summary = el('div', 'quiz-done');
      const message = score === order.length ? '¡Perfecto! Perfect!' : score >= order.length * 0.75 ? '¡Muy bien! Great job!' : 'Keep practising!';
      summary.append(el('p', 'quiz-score', `${score} / ${order.length}`), el('p', null, message), button('Play again', 'btn', start));
      element.replaceChildren(summary);
      ctx.complete();
    }

    start();
  }

  function textButton(entry) {
    const choice = el('button', 'choice', es(entry.spanish));
    choice.type = 'button';
    choice.dataset.id = entry.id;
    return choice;
  }

  window.Learn = { init, p, tip };
})();
