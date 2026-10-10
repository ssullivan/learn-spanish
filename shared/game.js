/*
 * game.js — engine for level-based games. Needs core.js, audio.js.
 * Styles: game.css.
 *
 *   Game.init({
 *     root,        element to render into
 *     key,         localStorage key, unique across the site (e.g. "u1-match")
 *     intro,       HTML for the "How to play" box on the level menu
 *     levels: [{
 *       id, name, blurb,
 *       rounds,    rounds per play
 *       time,      seconds per round (0 = untimed)
 *       labels,    'none' (default) or 'spanish': the Spanish under picture
 *                  answers (Core.picButton), as ctx.labels; levels can drop
 *                  them as they get harder
 *       round(stage, ctx, roundIndex)
 *                  render one round into `stage`. Set ctx.answer (HTML
 *                  naming the right answer, shown after the round) and call
 *                  ctx.done(isRight) once. Optionally set ctx.reveal() to
 *                  highlight the right answer; it runs however the round
 *                  ends (time-outs too). May return a Promise (e.g. from
 *                  ctx.play); the timer starts when it resolves.
 *     }],
 *   })
 *
 * ctx: { level, labels, done(isRight), answer, reveal, play(entries), draw(pool) }
 *   ctx.draw(pool) picks the round's word (or question) from `pool`: every
 *   item comes up once before any repeats, and never twice in a row, over
 *   a whole play of the level (Core.deck). Use it, not Core.pick, for
 *   what the round asks about; pick is fine for wrong answers.
 *
 * Helpers for rounds:
 *   Game.choose(ctx, answer, options, label, gridClass = 'choice-grid')
 *                a grid of .choice buttons, one per option (entries with an
 *                id), showing label(option) HTML. Tapping one ends the round
 *                (right if it is `answer`); sets ctx.reveal, keeping one set
 *                before it (Game.playOnReveal)
 *   Game.pic(entry, className?)
 *                HTML for the entry's picture, its English as alt text
 *   Game.playOnReveal(ctx, entry)
 *                say the entry when the round's answer is shown, besides
 *                what ctx.reveal does; before or after Game.choose
 *   Game.answerText(entry)
 *                HTML for ctx.answer: "perro is dog." plus the entry's note
 *   Game.celebrate(kind)
 *                'fireworks' or 'confetti' (papel picado colours) over the
 *                page for a few seconds, on a canvas (.celebrate) that
 *                ignores taps; nothing if the reader prefers reduced
 *                motion. Returns a stop function
 *
 * A round's timer stands still while the page is hidden.
 *
 * Scoring: a right answer is worth 100, plus up to 50 for speed on timed
 * levels, plus 10 per answer in the current streak (max +50).
 * Stars: 1 at 50% right, 2 at 80%, 3 for all right. A level unlocks when
 * the one before it has a star. Best score and stars per level are saved.
 * A perfect level celebrates (fireworks the first time, confetti after)
 * and says ¡Excelente! (CHEER, the dictionary word unit 1 teaches).
 */
(function () {
  const { el, esc, es } = Core;
  const AUTO_NEXT_MS = 1200;
  // Said after a perfect level: unit 1's excelente (tools/units.test.mjs
  // checks it matches). Its Spanish is spoken if the clip can't play.
  const CHEER = { id: 'excelente', taught: 1, spanish: '¡Excelente!' };
  let stopCelebration = null;
  // The round's timer stands still while the page is hidden (another app,
  // another tab): its start moves on by the time spent away.
  let runningTimer = null, hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = performance.now();
    else if (runningTimer && hiddenAt) runningTimer.startedAt += performance.now() - Math.max(hiddenAt, runningTimer.startedAt);
  });

  const starsFor = (rightCount, total) => rightCount === total ? 3 : rightCount >= total * 0.8 ? 2 : rightCount >= total * 0.5 ? 1 : 0;
  const starText = count => '★'.repeat(count) + '☆'.repeat(3 - count);

  function button(label, className, onClick) {
    const element = el('button', 'btn' + (className ? ' ' + className : ''), label);
    element.type = 'button';
    element.addEventListener('click', onClick);
    return element;
  }

  function init({ root, key, intro, levels }) {
    const store = Core.store(key, { best: {} });
    const saved = store.get();
    if (!saved.best) saved.best = {};

    const isUnlocked = index => index === 0 || (saved.best[levels[index - 1].id]?.stars ?? 0) > 0;

    function menu() {
      Speak.stop();
      stopCelebration?.();
      const levelList = el('div', 'level-list');
      levels.forEach((level, index) => {
        const best = saved.best[level.id];
        const isOpen = isUnlocked(index);
        const levelButton = el('button', 'level');
        levelButton.type = 'button';
        levelButton.disabled = !isOpen;
        levelButton.innerHTML = `<span class="level-num">${index + 1}</span>
          <span class="level-text"><strong>${esc(level.name)}</strong><span>${esc(level.blurb)}</span></span>
          <span class="level-best">${isOpen
            ? (best ? `<span class="stars">${starText(best.stars)}</span>${best.score}` : 'New')
            : 'Locked'}</span>`;
        levelButton.addEventListener('click', () => play(index));
        levelList.append(levelButton);
      });
      root.replaceChildren(el('div', 'tip', intro), levelList);
    }

    function play(levelIndex) {
      stopCelebration?.();
      const level = levels[levelIndex];
      let roundIndex = 0, score = 0, rightCount = 0, streak = 0;
      let timer = null;
      let isPlaying = true;
      const draw = Core.deck();

      const hud = el('div', 'hud');
      const pills = el('div', 'hud-pills');
      const quit = button('✕ Levels', 'small', () => { isPlaying = false; stopTimer(); menu(); });
      hud.append(pills, quit);
      const timerBar = el('div', 'timer');
      const timerFill = el('div', 'timer-fill');
      timerBar.append(timerFill);
      timerBar.hidden = !level.time;
      const stage = el('div', 'stage');
      const feedback = el('div', 'game-feedback');
      feedback.setAttribute('aria-live', 'polite');
      root.replaceChildren(hud, timerBar, stage, feedback);
      root.scrollIntoView({ block: 'start' });

      const paintHud = () => {
        pills.innerHTML = `<span class="pill">${esc(level.name)}</span>
          <span class="pill">${roundIndex + 1} / ${level.rounds}</span>
          <span class="pill">Score ${score}</span>
          ${streak > 1 ? `<span class="pill streak">Streak ${streak}</span>` : ''}`;
      };

      function stopTimer() {
        if (timer) cancelAnimationFrame(timer.frame);
        timer = runningTimer = null;
      }

      const timeLeft = () => timer ? Math.max(0, 1 - (performance.now() - timer.startedAt) / timer.durationMs) : 0;

      function startTimer(ctx) {
        if (!level.time || ctx.isFinished || !isPlaying) return;
        timer = runningTimer = { startedAt: performance.now(), durationMs: level.time * 1000, frame: 0 };
        const tick = () => {
          if (!timer) return;
          if (!document.hidden) {
            const fractionLeft = timeLeft();
            timerFill.style.transform = `scaleX(${fractionLeft})`;
            timerFill.classList.toggle('low', fractionLeft < 0.3);
            if (fractionLeft <= 0) return ctx.done(false, true);
          }
          timer.frame = requestAnimationFrame(tick);
        };
        timer.frame = requestAnimationFrame(tick);
      }

      function nextRound() {
        if (roundIndex >= level.rounds) return showResult();
        paintHud();
        feedback.replaceChildren();
        feedback.className = 'game-feedback';
        stage.classList.remove('locked');
        timerFill.style.transform = 'scaleX(1)';
        timerFill.classList.remove('low');

        const ctx = {
          level,
          labels: level.labels ?? 'none',
          answer: '',
          reveal: null,
          isFinished: false,
          play: Core.play,
          draw,
          done(isRight, timedOut = false) {
            if (ctx.isFinished) return;
            ctx.isFinished = true;
            const fractionLeft = timeLeft();
            stopTimer();
            stage.classList.add('locked');
            ctx.reveal?.();
            let gained = 0;
            if (isRight) {
              rightCount++;
              streak++;
              gained = 100 + Math.round(50 * fractionLeft) + 10 * Math.min(streak - 1, 5);
              score += gained;
            } else {
              streak = 0;
            }
            roundIndex++;
            paintHud();
            feedback.className = 'game-feedback feedback ' + (isRight ? 'good' : 'bad');
            feedback.innerHTML = `<strong>${isRight ? `¡Bien! +${gained}` : timedOut ? 'Too slow!' : 'Not quite.'}</strong> ${ctx.answer}`;
            const onward = button(roundIndex < level.rounds ? 'Next →' : 'See score', 'primary', nextRound);
            feedback.append(onward);
            if (isRight) {
              const autoNext = setTimeout(nextRound, AUTO_NEXT_MS);
              onward.addEventListener('click', () => clearTimeout(autoNext), { once: true });
              quit.addEventListener('click', () => clearTimeout(autoNext), { once: true });
            } else {
              onward.focus();
            }
          },
        };
        Promise.resolve(level.round(stage, ctx, roundIndex)).then(() => startTimer(ctx));
      }

      function showResult() {
        Speak.stop();
        const stars = starsFor(rightCount, level.rounds);
        const previous = saved.best[level.id];
        const isBest = !previous || score > previous.score;
        if (isBest || stars > (previous?.stars ?? 0)) {
          saved.best[level.id] = { score: Math.max(score, previous?.score ?? 0), stars: Math.max(stars, previous?.stars ?? 0) };
          store.set(saved);
        }
        const result = el('div', 'game-end' + (stars === 3 ? ' perfect' : ''));
        result.innerHTML = `<p class="stars big">${[...starText(stars)].map((star, index) => `<span style="--i: ${index}">${star}</span>`).join('')}</p>
          <p class="end-score">${score}</p>
          <p>${rightCount} of ${level.rounds} right${isBest && score > 0 ? ' · <strong>New best!</strong>' : ''}</p>
          <p>${stars === 3 ? `${es('¡Excelente!')} Perfect!` : stars ? `${es('¡Muy bien!')} Well done!` : 'Get half right to earn a star and unlock the next level.'}</p>`;
        const actions = el('div', 'end-actions');
        actions.append(button('Play again', '', () => play(levelIndex)));
        if (levelIndex + 1 < levels.length && isUnlocked(levelIndex + 1)) actions.append(button('Next level →', 'primary', () => play(levelIndex + 1)));
        actions.append(button('All levels', '', menu));
        result.append(actions);
        root.replaceChildren(result);
        if (stars === 3) {
          stopCelebration = celebrate(previous?.stars === 3 ? 'confetti' : 'fireworks');
          Core.play(CHEER);
        }
      }

      nextRound();
    }

    menu();
  }

  // Celebrations are drawn frame by frame: each kind is (context, width,
  // height, colours) → drawFrame(seconds), which returns false when done.
  const between = (low, high) => low + Math.random() * (high - low);

  // Shells rise from the bottom and burst into streaks that slow, fall and
  // fade.
  function fireworks(context, width, height, colours) {
    const RISE_SECONDS = 0.6, BURST_SECONDS = 1.4, DRAG = 2.2;
    const shells = Array.from({ length: 7 }, (_, shellIndex) => ({
      launchAt: shellIndex * 0.32, x: between(0.15, 0.85) * width, top: between(0.12, 0.42) * height, colour: colours[shellIndex % colours.length],
      sparks: Array.from({ length: 72 }, (_, sparkIndex) => {
        const angle = (sparkIndex / 36) * Math.PI + between(-0.08, 0.08);
        const speed = (sparkIndex % 2 ? between(0.35, 0.5) : between(0.75, 1)) * Math.min(width, height) * 0.5;
        return { velocityX: Math.cos(angle) * speed, velocityY: Math.sin(angle) * speed };
      }),
    }));
    const sparkAt = (shell, spark, elapsed) => {
      const distance = (1 - Math.exp(-DRAG * elapsed)) / DRAG;
      return [shell.x + spark.velocityX * distance, shell.top + spark.velocityY * distance + 70 * elapsed * elapsed];
    };
    context.lineCap = 'round';
    return seconds => {
      let isBusy = false;
      for (const shell of shells) {
        const sinceLaunch = seconds - shell.launchAt;
        if (sinceLaunch > RISE_SECONDS + BURST_SECONDS) continue;
        isBusy = true;
        if (sinceLaunch < 0) continue;
        context.strokeStyle = shell.colour;
        if (sinceLaunch < RISE_SECONDS) {
          const y = height - (height - shell.top) * (1 - (1 - sinceLaunch / RISE_SECONDS) ** 2);
          context.globalAlpha = 1;
          context.lineWidth = 3;
          context.beginPath(); context.moveTo(shell.x, y); context.lineTo(shell.x, y + 16); context.stroke();
          continue;
        }
        const sinceBurst = sinceLaunch - RISE_SECONDS;
        if (sinceBurst < 0.15) {
          context.globalAlpha = 1 - sinceBurst / 0.15;
          context.fillStyle = '#fff6d8';
          context.beginPath(); context.arc(shell.x, shell.top, 6 + 60 * sinceBurst, 0, 2 * Math.PI); context.fill();
        }
        context.globalAlpha = 1 - (sinceBurst / BURST_SECONDS) ** 2;
        context.lineWidth = 3.5 - 2 * sinceBurst / BURST_SECONDS;
        context.beginPath();
        for (const spark of shell.sparks) {
          context.moveTo(...sparkAt(shell, spark, Math.max(0, sinceBurst - 0.09)));
          context.lineTo(...sparkAt(shell, spark, sinceBurst));
        }
        context.stroke();
      }
      return isBusy;
    };
  }

  // Squares of tissue paper, in papel picado colours, flutter down.
  function confetti(context, width, height) {
    const PAPEL_PICADO = ['#e4007c', '#ff8c00', '#ffd200', '#00a651', '#00aeef', '#7b2cbf'];
    const END_SECONDS = 5, FADE_SECONDS = 0.8;
    const pieces = Array.from({ length: Math.round(Math.min(90, 30 + width / 15)) }, () => ({
      x: between(0, width), y: between(-0.6 * height, -20), fallSpeed: between(0.22, 0.4) * height,
      sway: between(10, 40), swayRate: between(1.2, 2.6), phase: between(0, 7),
      turn: between(0, 7), spin: between(-3, 3), size: between(6, 12), colour: PAPEL_PICADO[Math.floor(between(0, PAPEL_PICADO.length))],
    }));
    return seconds => {
      if (seconds > END_SECONDS) return false;
      context.globalAlpha = Math.min(1, (END_SECONDS - seconds) / FADE_SECONDS);
      for (const piece of pieces) {
        const y = piece.y + piece.fallSpeed * seconds;
        if (y > height + 20) continue;
        context.save();
        context.translate(piece.x + piece.sway * Math.sin(piece.swayRate * seconds + piece.phase), y);
        context.rotate(piece.turn + piece.spin * seconds);
        context.scale(1, Math.abs(Math.cos(piece.swayRate * seconds + piece.phase)));
        context.fillStyle = piece.colour;
        context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
        context.restore();
      }
      return true;
    };
  }

  function celebrate(kind) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
    const canvas = el('canvas', 'celebrate');
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);
    const width = innerWidth, height = innerHeight, pixelRatio = devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const context = canvas.getContext('2d');
    context.scale(pixelRatio, pixelRatio);
    const style = getComputedStyle(document.documentElement);
    const colours = ['--accent', '--gold', '--teal'].map(token => style.getPropertyValue(token).trim());
    const drawFrame = (kind === 'confetti' ? confetti : fireworks)(context, width, height, colours);
    const startedAt = performance.now();
    let frame = 0;
    const stop = () => { cancelAnimationFrame(frame); canvas.remove(); };
    const paint = now => {
      context.clearRect(0, 0, width, height);
      if (drawFrame((now - startedAt) / 1000)) frame = requestAnimationFrame(paint);
      else stop();
    };
    frame = requestAnimationFrame(paint);
    return stop;
  }

  function choose(ctx, answer, options, label, gridClass = 'choice-grid') {
    const answerGrid = el('div', gridClass);
    for (const option of options) {
      const choice = el('button', 'choice', label(option));
      choice.type = 'button';
      choice.dataset.id = option.id;
      choice.addEventListener('click', () => {
        if (option !== answer) choice.classList.add('wrong');
        ctx.done(option === answer);
      });
      answerGrid.append(choice);
    }
    // Keep a reveal set before (Game.playOnReveal), whichever came first.
    const revealBefore = ctx.reveal;
    ctx.reveal = () => {
      answerGrid.querySelector(`[data-id="${answer.id}"]`).classList.add('right');
      revealBefore?.();
    };
    return answerGrid;
  }

  // className only if a string: .map(pic) passes an index.
  const pic = (entry, className) => `<img${typeof className === 'string' && className ? ` class="${esc(className)}"` : ''} src="${Core.imgSrc(entry)}" alt="${esc(entry.english)}">`;

  function playOnReveal(ctx, entry) {
    const revealBefore = ctx.reveal;
    ctx.reveal = () => { revealBefore?.(); ctx.play(entry); };
  }

  const answerText = entry => `${es(entry.spanish)} is ${esc(entry.english)}.${entry.note ? ' ' + esc(entry.note) : ''}`;

  window.Game = { init, choose, pic, playOnReveal, answerText, celebrate };
})();
