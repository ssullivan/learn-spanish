/* Unit 2 learn page: the steps shown by shared/learn.js. Words come from vocab.js. */
(function () {
  const V = window.VOCAB;
  const { p, tip } = Learn;
  const { el, es } = Core;
  const pictured = Core.entries(V).filter(entry => entry.img !== false);

  Learn.init({
    root: document.getElementById('learn'),
    key: 'u2-learn',
    vocab: V,
    steps: [
      {
        id: 'hello',
        title: 'Hello',
        render(element, ctx) {
          element.append(
            p(`${es('Hola')} works any time, with anyone. To be a little more polite, greet people by the time of day.`),
            ctx.grid(V.hello),
            tip(`<strong>In Mexico</strong>, people greet everyone when they walk into a small shop, a waiting room or a lift: a quick ${es('Buenos días')} to the room.`),
          );
        },
      },
      {
        id: 'goodbye',
        title: 'Goodbye',
        render(element, ctx) {
          element.append(
            p(`${es('Adiós')} is goodbye, but most goodbyes in Mexico are ${es('Hasta luego')}, even when you won't see the person later.`),
            ctx.grid(V.goodbye),
            tip(`<strong>Passing in the street?</strong> A quick ${es('Adiós')} is also a friendly hello to someone you won't stop to talk to.`),
          );
        },
      },
      {
        id: 'time-quiz',
        title: 'What time of day?',
        gate: true,
        render(element, ctx) {
          const quiz = el('div');
          element.append(p('Listen, then tap the picture that goes with it.'), quiz);
          ctx.listenQuiz(quiz, { pool: pictured, rounds: 6, choices: 4 });
        },
      },
      {
        id: 'tu-usted',
        title: 'Tú or usted?',
        render(element, ctx) {
          const table = el('table', 'rule-table', `<thead><tr><th>Say</th><th>to</th></tr></thead><tbody>
            <tr><td>${es('tú')}</td><td>friends, family, children, people your age</td></tr>
            <tr><td>${es('usted')}</td><td>older people, strangers, shopkeepers, your boss, anyone you'd call señor or señora</td></tr>
            </tbody>`);
          element.append(
            p(`Spanish has two words for <em>you</em>. ${es('Tú')} is friendly; ${es('usted')} is respectful. The verb changes with it: ${es('estás')} for tú, ${es('está')} for usted.`),
            table,
            ctx.words('como-estas', 'como-esta-usted', 'y-tu', 'y-usted'),
            tip(`<strong>Not sure?</strong> Use ${es('usted')}. Mexicans use it more than people in Spain do, and if they'd rather you said ${es('tú')}, they'll tell you.`),
          );
        },
      },
      {
        id: 'how-are-you',
        title: 'How are you?',
        render(element, ctx) {
          element.append(
            p(`Answer with how you are, say thanks, and ask back with ${es('¿Y tú?')} or ${es('¿Y usted?')}.`),
            ctx.words('bien-gracias', 'muy-bien-gracias', 'mas-o-menos', 'que-tal', 'que-onda'),
          );
        },
      },
      {
        id: 'polite',
        title: 'Please and thank you',
        render(element, ctx) {
          element.append(
            p(`Put ${es('por favor')} at the end of a request. When someone thanks you, say ${es('De nada')}.`),
            ctx.grid(V.polite),
          );
        },
      },
      {
        id: 'sorry',
        title: 'Perdón, con permiso or lo siento?',
        render(element, ctx) {
          element.append(
            p(`English says <em>excuse me</em> and <em>sorry</em> for all sorts of things. Spanish splits them up: ${es('Perdón')} to get attention or for a small slip,
              ${es('Con permiso')} before you squeeze past or leave, and ${es('Lo siento')} when you really regret something, or feel for someone.`),
            ctx.grid(V.sorry),
          );
        },
      },
      {
        id: 'meeting',
        title: 'Nice to meet you',
        render(element, ctx) {
          element.append(
            p(`When you're introduced, say ${es('Mucho gusto')}. The answer is ${es('Igualmente')}, or ${es('Mucho gusto')} right back.`),
            ctx.grid(V.meeting),
          );
        },
      },
      {
        id: 'phrase-quiz',
        title: 'Which phrase?',
        gate: true,
        render(element, ctx) {
          const quiz = el('div');
          element.append(p('Listen, then tap the phrase you hear.'), quiz);
          ctx.listenQuiz(quiz, { pool: Core.entries(V), rounds: 10, choices: 4, show: 'text' });
        },
      },
      {
        id: 'done',
        title: '¡Muy bien! Well done',
        render(element) {
          element.append(
            p('You can greet anyone, politely. Now practise answering with <a href="reply.html">Reply Match</a>, and check your stress with <a href="stress.html">Stress Detective</a>.'),
            p('Use the numbered steps above to review any section, or <a href="./">go back to Unit 2</a>.'),
          );
        },
      },
    ],
  });
})();
