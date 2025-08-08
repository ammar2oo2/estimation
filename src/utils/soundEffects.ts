// Sound Effects Utility using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      // Create audio context when user interacts with the page
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Audio context not supported:', error);
    }
  }

  private ensureAudioContext() {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }
    // Resume audio context if suspended (required by browsers)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      this.ensureAudioContext();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.log('Sound play failed:', error);
    }
  }

  private playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      this.ensureAudioContext();

      frequencies.forEach(frequency => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume / frequencies.length, this.audioContext!.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + duration);

        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + duration);
      });
    } catch (error) {
      console.log('Sound play failed:', error);
    }
  }

  public playButtonClick() {
    this.playTone(800, 0.1, 'sine', 0.1);
  }

  public playSuccess() {
    this.playChord([523, 659, 784], 0.3, 'sine', 0.15); // C major chord
  }

  public playGameStart() {
    this.playChord([261, 329, 392, 523], 0.5, 'sine', 0.2); // C major 7th
  }

  public playRoundComplete() {
    this.playChord([392, 493, 587], 0.4, 'sine', 0.15); // G major chord
  }

  public playWinner() {
    // Play a victory fanfare
    setTimeout(() => this.playTone(523, 0.2, 'sine', 0.15), 0);    // C
    setTimeout(() => this.playTone(659, 0.2, 'sine', 0.15), 100);  // E
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.15), 200);  // G
    setTimeout(() => this.playTone(1047, 0.4, 'sine', 0.2), 300);  // C (high)
  }

  public playError() {
    this.playTone(200, 0.3, 'sawtooth', 0.1);
  }

  public playPredictionResult() {
    this.playTone(600, 0.15, 'sine', 0.1);
  }

  public playChampagnePop() {
    // Create a champagne pop sound using multiple tones
    this.playTone(800, 0.1, 'sine', 0.2);
    setTimeout(() => this.playTone(1000, 0.1, 'sine', 0.15), 50);
    setTimeout(() => this.playTone(1200, 0.1, 'sine', 0.1), 100);
    setTimeout(() => this.playTone(600, 0.2, 'sine', 0.1), 150);
  }

  public playApplause() {
    // Create applause sound using multiple tones
    const applauseTones = [523, 587, 659, 698, 784, 880, 987, 1047];
    applauseTones.forEach((tone, index) => {
      setTimeout(() => {
        this.playTone(tone, 0.3, 'sine', 0.05);
      }, index * 100);
    });
    
    // Continue applause in background
    setTimeout(() => {
      if (this.isEnabled) {
        this.playApplause();
      }
    }, 2000);
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
  }

  public toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  public isSoundEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create a singleton instance
export const soundManager = new SoundManager();

// Export sound effect functions
export const playButtonClick = () => soundManager.playButtonClick();
export const playSuccess = () => soundManager.playSuccess();
export const playGameStart = () => soundManager.playGameStart();
export const playRoundComplete = () => soundManager.playRoundComplete();
export const playWinner = () => soundManager.playWinner();
export const playError = () => soundManager.playError();
export const playPredictionResult = () => soundManager.playPredictionResult();
export const playChampagnePop = () => soundManager.playChampagnePop();
export const playApplause = () => soundManager.playApplause();

// Export the sound manager for advanced usage
export default soundManager; 
