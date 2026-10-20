import { Platform, Vibration } from 'react-native';

class MobileSoundService {
  private audioCtx: any = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      } catch (e) {}
    }
  }

  public playNewOrderSound() {
    // 1. Phone Vibration Alert
    try {
      Vibration.vibrate([0, 600, 200, 600, 200, 800]);
    } catch (e) {}

    // 2. Audible Sound Chime (Web Audio API on Web/browser)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        if (!this.audioCtx) {
          this.initAudioContext();
        }
        if (this.audioCtx) {
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }

          const now = this.audioCtx.currentTime;
          const notes = [
            { freq: 659.25, time: now + 0.00, dur: 0.18, volume: 0.5 },
            { freq: 830.61, time: now + 0.14, dur: 0.18, volume: 0.55 },
            { freq: 987.77, time: now + 0.28, dur: 0.22, volume: 0.6 },
            { freq: 1318.51, time: now + 0.44, dur: 0.65, volume: 0.75 },
            { freq: 987.77, time: now + 0.90, dur: 0.20, volume: 0.55 },
            { freq: 1318.51, time: now + 1.05, dur: 0.75, volume: 0.8 }
          ];

          notes.forEach(({ freq, time, dur, volume }) => {
            if (!this.audioCtx) return;
            const osc = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            gainNode.gain.setValueAtTime(0.0001, time);
            gainNode.gain.exponentialRampToValueAtTime(volume, time + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, time + dur);

            osc.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            osc.start(time);
            osc.stop(time + dur + 0.05);
          });
        }
      } catch (e) {
        console.warn('[MobileSound] Web audio error:', e);
      }
    }
  }
}

export const mobileSoundService = new MobileSoundService();
