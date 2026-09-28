// Web Audio API engine for real-time sound effects without external audio dependencies

class SoundManager {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Coin collect sound (+5 coins)
  playCoin() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

      osc2.frequency.setValueAtTime(1975.53, now); // B6
      osc2.frequency.exponentialRampToValueAtTime(2637.02, now + 0.08); // E7

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // 2. Mistake / Oops sound
  playMistake() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Mistake audio error', e);
    }
  }

  // 3. Streak bonus / Level up / Ice Cream reward
  playStreakBonus() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.18, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } catch (e) {
      console.warn('Streak audio error', e);
    }
  }

  // 4. Applause sound (👏 تصفيق) using procedural noise bursts
  playApplause() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2.2; // 2.2 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate pink/filtered noise with rhythmic claps
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Rhythm envelope modulation for clapping sound
        const t = i / this.ctx.sampleRate;
        const clapMod = Math.sin(t * 35) * Math.sin(t * 19);
        data[i] = white * (0.6 + 0.4 * clapMod);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.25, now + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 2.2);
    } catch (e) {
      console.warn('Applause audio error', e);
    }
  }

  // 5. Takbeerat / Fanfare (🎺 تكبيرات - نغمة النصر والفرح)
  playTakbeerFanfare() {
    try {
      this.initContext();
      if (!this.ctx) return;

      // Regal joyful fanfare: C - G - C - E - G - C(high)
      const melody = [
        { f: 523.25, d: 0.18 }, // C5
        { f: 523.25, d: 0.18 }, // C5
        { f: 659.25, d: 0.22 }, // E5
        { f: 783.99, d: 0.35 }, // G5
        { f: 659.25, d: 0.2 },  // E5
        { f: 1046.50, d: 0.6 }  // C6
      ];

      let startTime = this.ctx.currentTime;

      melody.forEach(item => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, startTime);

        gain.gain.setValueAtTime(0.22, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + item.d * 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + item.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + item.d);

        startTime += item.d + 0.05;
      });
    } catch (e) {
      console.warn('Fanfare audio error', e);
    }
  }

  // 6. Encouraging speech / Cheer (✨ كلمة "ممتاز" بصوت مشجع)
  playMumtazCheer(studentName?: string) {
    try {
      // Play a lovely bright chime first
      this.playStreakBonus();

      if ('speechSynthesis' in window) {
        // Cancel any pending speech
        window.speechSynthesis.cancel();

        const phrases = [
          `ما شاء الله! ممتاز يا ${studentName || 'بطل'}! بارك الله فيك!`,
          `أحسنت يا ${studentName || 'بطل'}! قراءة رائعة ومتقنة!`,
          `ممتاز! زادك الله علماً ونوراً بالقرآن!`,
          `رائع جداً! بارك الله في جهودك يا حفظك الله!`
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

        const utterance = new SpeechSynthesisUtterance(randomPhrase);
        utterance.lang = 'ar-SA';
        utterance.rate = 1.0;
        utterance.pitch = 1.25; // friendly, child-encouraging pitch

        // Select Arabic voice if available
        const voices = window.speechSynthesis.getVoices();
        const arVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arVoice) {
          utterance.voice = arVoice;
        }

        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 150);
      }
    } catch (e) {
      console.warn('Speech error', e);
    }
  }

  // 7. Grand Finale celebration sounds (Fireworks & Fanfare)
  playGrandCelebration() {
    this.playTakbeerFanfare();
    setTimeout(() => {
      this.playApplause();
    }, 600);
    setTimeout(() => {
      this.playCoin();
    }, 1200);
    setTimeout(() => {
      this.playStreakBonus();
    }, 1800);
  }
}

export const soundManager = new SoundManager();
