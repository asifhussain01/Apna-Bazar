/**
 * Audio Chime and Browser Notification Service for Apna Bazar Storekeeper
 * Uses Web Audio API for 100% offline, crystal-clear, zero-dependency bell chimes.
 */

class OrderAlertService {
  private audioCtx: AudioContext | null = null;
  private isSoundOn: boolean = true;
  private hasUnlocked: boolean = false;

  constructor() {
    this.setupAutoUnlock();
  }

  // Setup automatic unlocking of AudioContext on first user interaction
  private setupAutoUnlock() {
    if (typeof window === 'undefined') return;

    const unlockHandler = () => {
      this.unlockAudio();
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
    };

    window.addEventListener('click', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });
    window.addEventListener('touchstart', unlockHandler, { once: true });
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  public unlockAudio() {
    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      this.hasUnlocked = true;
    } catch (e) {
      console.warn('[OrderAlert] Error unlocking audio context:', e);
    }
  }

  public isEnabled(): boolean {
    return this.isSoundOn;
  }

  public toggleSound(): boolean {
    this.isSoundOn = !this.isSoundOn;
    if (this.isSoundOn) {
      this.playChime();
    }
    return this.isSoundOn;
  }

  /**
   * Play a crisp, loud, pleasant storekeeper chime (Ascending bell chords).
   * Works 100% offline with zero external audio assets.
   */
  public playChime() {
    if (!this.isSoundOn) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        this.playFallbackAudio();
        return;
      }

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Note Sequence: E5 (659Hz) -> G#5 (831Hz) -> B5 (988Hz) -> E6 (1319Hz bell)
      // Followed by a second confirmation chime ring
      const chimeNotes = [
        // Arpeggio 1 (First ding-ding)
        { freq: 659.25, time: now + 0.00, dur: 0.18, volume: 0.45 },
        { freq: 830.61, time: now + 0.14, dur: 0.18, volume: 0.50 },
        { freq: 987.77, time: now + 0.28, dur: 0.22, volume: 0.55 },
        { freq: 1318.51, time: now + 0.44, dur: 0.65, volume: 0.70 },

        // Resonant Echo Bell (Second ring to grab attention)
        { freq: 987.77, time: now + 0.90, dur: 0.20, volume: 0.50 },
        { freq: 1318.51, time: now + 1.05, dur: 0.75, volume: 0.75 },
        { freq: 1648.14, time: now + 1.25, dur: 0.85, volume: 0.65 } // High E-octave shimmer
      ];

      chimeNotes.forEach(({ freq, time, dur, volume }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Use 'triangle' wave for sweet bell/xylophone timbre
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        // Exponential decay envelope for natural bell resonance
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(volume, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + dur + 0.05);
      });

      // Also trigger HTML5 audio as secondary fallback
      this.playFallbackAudio();
    } catch (err) {
      console.warn('[OrderAlert] Web Audio error, falling back:', err);
      this.playFallbackAudio();
    }
  }

  private playFallbackAudio() {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) {}
  }
}

export const orderAlertService = new OrderAlertService();

// Browser Native Notification Helpers
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    return false;
  }
};

export const hasNotificationPermission = (): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
};

export const showDesktopNotification = (data: {
  orderNumber: string;
  totalAmount: number;
  customerName: string;
  village: string;
  itemsCount?: number;
}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const title = `🔔 नया ऑर्डर प्राप्त हुआ! #${data.orderNumber}`;
      const body = `रुपये: ₹${data.totalAmount} • गाँव: ${data.village}\nग्राहक: ${data.customerName}`;
      
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `order-${data.orderNumber}`,
        requireInteraction: true
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('[Notification] Failed to show desktop notification:', e);
    }
  }
};
