/*
 * core.js — helpers shared by learn.js, game.js and unit scripts.
 * Load first. Needs audio.js for play().
 *
 *   Core.el(tag, className?, html?)
 *                                create an element
 *   Core.esc(text)               HTML-escape
 *   Core.es(text)                HTML: Spanish text in <span class="es"
 *                                lang="es-MX">, so screen readers say it
 *                                in Spanish
 *   Core.shuffle(list)           shuffled copy
 *   Core.pick(list, count)       `count` random items
 *   Core.deck()                  draw(pool): one random item of `pool`, each
 *                                drawn once before any comes again, and never
 *                                the same twice in a row (unless it is all the
 *                                pool has). Items are told apart by id (by
 *                                themselves if they have none), so a pool
 *                                filtered afresh each time still works, and
 *                                one deck can serve several pools
 *   Core.imgSrc(entry)           "img/<id>.svg"
 *   Core.audioSrc(entry)         "audio/<id>.mp3"; both use ../words/ for a
 *                                dictionary word (Words.get), and ../unit<n>/
 *                                for an entry borrowed from unit n (Units.word)
 *   Core.play(entries)           play one entry's clip, or several in a row;
 *                                resolves when done (see Speak.play)
 *   Core.entries(vocab)          every entry from every list in a vocab object
 *   Core.picButton(entry, label = 'none')
 *                                picture answer <button data-id> (.pic-btn),
 *                                with the entry's Spanish under it
 *                                (.pic-label): label 'none' hides it,
 *                                'spanish' shows it
 *   Core.showLabels(element)     show every .pic-btn label in `element`,
 *                                once answered
 *   Core.speech(who, html, onReplay?)
 *                                speech bubble (.speech, game.css): a round
 *                                badge with a short `who` (▶, Tú...), the
 *                                text, and a "▶ Again" button
 *   Core.store(key, blank)       { get(), set(value) } over localStorage;
 *                                get() returns a copy of `blank` if nothing
 *                                is saved
 */
(function () {
  function el(tag, className, html) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (html != null) element.innerHTML = html;
    return element;
  }

  const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = text => String(text).replace(/[&<>"']/g, character => HTML_ESCAPES[character]);

  const es = text => `<span class="es" lang="es-MX">${esc(text)}</span>`;

  function shuffle(list) {
    const shuffled = list.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const pick = (list, count) => shuffle(list).slice(0, count);

  function deck() {
    const drawn = new Set();
    let lastKey;
    const keyOf = item => item?.id ?? item;
    return pool => {
      let fresh = pool.filter(item => !drawn.has(keyOf(item)));
      if (!fresh.length) {
        pool.forEach(item => drawn.delete(keyOf(item)));
        fresh = pool;
      }
      const notLast = fresh.filter(item => keyOf(item) !== lastKey);
      const [item] = pick(notLast.length ? notLast : fresh, 1);
      drawn.add(lastKey = keyOf(item));
      return item;
    };
  }

  const homeDir = entry => entry.taught ? '../words/' : entry.unit ? `../unit${entry.unit}/` : '';
  const imgSrc = entry => `${homeDir(entry)}img/${entry.id}.svg`;
  const audioSrc = entry => `${homeDir(entry)}audio/${entry.id}.mp3`;

  function play(entryOrEntries) {
    const list = [].concat(entryOrEntries);
    return Speak.play(list.map(audioSrc), list.map(entry => entry.say ?? entry.spanish));
  }

  function picButton(entry, label = 'none') {
    const button = el('button', 'pic-btn');
    button.type = 'button';
    button.dataset.id = entry.id;
    button.dataset.label = label;
    button.setAttribute('aria-label', entry.english);
    const image = el('img');
    image.src = imgSrc(entry);
    image.alt = '';
    button.append(image, el('span', 'pic-label', es(entry.spanish)));
    return button;
  }

  const showLabels = element => element.querySelectorAll('.pic-btn').forEach(button => { button.dataset.label = 'spanish'; });

  function speech(who, html, onReplay) {
    const bubble = el('div', 'speech');
    bubble.append(el('span', 'who', esc(who)), el('p', null, html));
    if (onReplay) {
      const again = el('button', 'btn small', '▶ Again');
      again.type = 'button';
      again.addEventListener('click', onReplay);
      bubble.append(again);
    }
    return bubble;
  }

  const entries = vocab => Object.values(vocab).filter(Array.isArray).flat();

  function store(key, blank) {
    return {
      get() {
        try {
          const saved = JSON.parse(localStorage.getItem(key));
          if (saved && typeof saved === 'object') return saved;
        } catch { /* storage unavailable */ }
        return structuredClone(blank);
      },
      set(value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
      },
    };
  }

  window.Core = { el, esc, es, shuffle, pick, deck, imgSrc, audioSrc, play, picButton, showLabels, speech, entries, store };
})();
