/*
 * Unit 2 vocabulary, for its pages, tools/tts.mjs and tools/check.mjs: the
 * words it uses, from the dictionary (words/words.js; the ones it teaches
 * are under unit 2 there, with their audio and pictures in words/), with
 * the fields this unit adds.
 *
 * Fields this unit adds, for Reply Match (shared/reply.js):
 *   reply   ids of good answers when someone says this to you
 *   when    situations where you'd say it; its picture shows the first.
 *           No two entries may fit one situation: Reply Match offers the
 *           other entries with `when` as wrong answers
 */
Units.add(2, {
  voice: 'es-MX-DaliaNeural',

  hello: [
    { ...Words.get('hola'), reply: ['hola'] },
    { ...Words.get('buenos-dias'), reply: ['buenos-dias'], when: ['You walk into a bakery at 8 in the morning.'] },
    { ...Words.get('buenas-tardes'), reply: ['buenas-tardes'], when: ['You arrive at a friend\'s house for lunch at 3.'] },
    { ...Words.get('buenas-noches'), reply: ['buenas-noches'], when: ['Your family is going to bed.', 'You walk into a restaurant at 9 at night.'] },
  ],

  goodbye: [
    { ...Words.get('adios'), reply: ['adios', 'hasta-luego'] },
    { ...Words.get('hasta-luego'), reply: ['hasta-luego', 'adios', 'nos-vemos'], when: ['You leave a shop after buying bread.'] },
    { ...Words.get('hasta-manyana'), reply: ['hasta-manyana'], when: ['You leave work; you\'ll see your colleagues tomorrow.'] },
    { ...Words.get('nos-vemos'), reply: ['nos-vemos', 'hasta-luego'] },
  ],

  // Tú or usted? Tú for friends, family, children and people your age;
  // usted for older people, strangers, and anyone you'd call señor or señora.
  howAreYou: [
    { ...Words.get('como-estas'), reply: ['bien-gracias', 'muy-bien-gracias', 'mas-o-menos'],
      when: ['You meet your best friend at the park.', 'Your little cousin runs up to you.'] },
    { ...Words.get('como-esta-usted'), reply: ['bien-gracias', 'muy-bien-gracias', 'mas-o-menos'],
      when: ['You meet your friend\'s grandmother.', 'Your new boss says hello.'] },
    { ...Words.get('que-tal'), reply: ['bien-gracias', 'mas-o-menos'] },
    Words.get('que-onda'),
    ...Words.list('bien-gracias muy-bien-gracias mas-o-menos'),
    { ...Words.get('y-tu'), when: ['You\'ve answered a friend\'s ¿Cómo estás? Now ask back.'] },
    { ...Words.get('y-usted'), when: ['You\'ve answered your teacher\'s ¿Cómo está usted? Now ask back.'] },
  ],

  polite: [
    { ...Words.get('por-favor'), when: ['You ask the waiter for the bill.'] },
    { ...Words.get('gracias'), reply: ['de-nada'], when: ['A friend gives you a birthday present.'] },
    { ...Words.get('muchas-gracias'), reply: ['de-nada'] },
    { ...Words.get('de-nada'), when: ['Someone thanks you for holding the door.'] },
  ],

  // Perdón, con permiso or lo siento?
  sorry: [
    { ...Words.get('perdon'), reply: ['no-pasa-nada'], when: ['You need to ask a stranger the way.', 'You bump into someone.'] },
    { ...Words.get('con-permiso'), reply: ['adelante'], when: ['You need to squeeze past someone on a crowded bus.', 'You get up from the table to take a call.'] },
    { ...Words.get('lo-siento'), reply: ['no-pasa-nada'], when: ['A friend tells you their dog is sick.', 'You forgot your friend\'s birthday.'] },
    ...Words.list('no-pasa-nada adelante'),
  ],

  meeting: [
    { ...Words.get('mucho-gusto'), reply: ['igualmente', 'mucho-gusto'], when: ['A friend introduces you to their sister.'] },
    Words.get('igualmente'),
  ],
});
