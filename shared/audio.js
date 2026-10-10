/*
 * audio.js — play Spanish audio clips.
 *
 *   Speak.play(src, text)   Play the MP3 at `src`, or an array of MP3s one
 *                           after another. If a clip is missing or fails,
 *                           speak `text` with the browser's Spanish voice
 *                           instead (Mexican if the device has one). With an
 *                           array of texts, one per clip, only the failed
 *                           clip's text is spoken and the rest still play;
 *                           with one text, it is spoken and playing ends.
 *                           Returns a Promise that resolves when playback
 *                           finishes or is stopped; it never rejects.
 *   Speak.stop()            Stop whatever is playing.
 *
 * Only one clip plays at a time; starting a new one stops the last.
 * Clips come from tools/tts.mjs, which writes <home>/audio/<id>.mp3.
 */
(function () {
  const GAP_BETWEEN_CLIPS_MS = 180;
  let playbackToken = 0;
  let currentAudio = null;
  let resolveCurrent = null;

  function stop() {
    playbackToken++;
    if (currentAudio) currentAudio.pause();
    currentAudio = null;
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (resolveCurrent) resolveCurrent();
    resolveCurrent = null;
  }

  const spanishVoice = () => {
    const voices = speechSynthesis.getVoices();
    return voices.find(voice => /^es[-_]MX/i.test(voice.lang)) ?? voices.find(voice => /^es[-_](US|419)/i.test(voice.lang)) ?? voices.find(voice => /^es\b/i.test(voice.lang));
  };

  function speakInstead(text, whenDone) {
    if (!text || !window.speechSynthesis) return whenDone();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    const voice = spanishVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = utterance.onerror = whenDone;
    speechSynthesis.speak(utterance);
  }

  function play(src, text) {
    stop();
    const myToken = playbackToken;
    const sources = [].concat(src);
    return new Promise(resolve => {
      resolveCurrent = resolve;
      const isMine = () => myToken === playbackToken;
      const finished = () => { if (isMine()) { resolveCurrent = null; currentAudio = null; resolve(); } };
      const playClip = index => {
        if (!isMine()) return;
        if (index >= sources.length) return finished();
        const audio = new Audio(sources[index]);
        currentAudio = audio;
        let hasFailed = false;
        const fail = () => {
          if (hasFailed || !isMine()) return;
          hasFailed = true;
          if (Array.isArray(text)) speakInstead(text[index], () => playClip(index + 1));
          else speakInstead(text, finished);
        };
        audio.addEventListener('ended', () => setTimeout(() => playClip(index + 1), GAP_BETWEEN_CLIPS_MS));
        audio.addEventListener('error', fail);
        audio.play()?.catch(error => { if (error.name !== 'AbortError') fail(); });
      };
      playClip(0);
    });
  }

  window.Speak = { play, stop };
})();
