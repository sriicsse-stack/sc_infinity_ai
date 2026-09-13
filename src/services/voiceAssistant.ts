/**
 * SC INFINITY IDE - Bilingual Voice Assistant (Tamil & English)
 * Real-time Speech-to-Text (STT) & Text-to-Speech (TTS) Engine
 */

export type VoiceLanguage = 'ta-IN' | 'en-US' | 'en-IN' | 'auto';

export interface VoiceRecognitionOptions {
  language?: VoiceLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  onResult: (transcript: string, isFinal: boolean, detectedLanguage?: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class VoiceAssistantService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: VoiceLanguage = 'ta-IN';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && (
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    );
  }

  public startListening(options: VoiceRecognitionOptions): boolean {
    if (this.isListening) {
      this.stopListening();
    }

    const lang = options.language || this.currentLanguage;
    this.currentLanguage = lang;

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      if (options.onError) {
        options.onError('Speech Recognition is not supported on this browser. Chrome or Edge is recommended.');
      }
      return false;
    }

    try {
      this.recognition.lang = lang === 'auto' ? 'ta-IN' : lang;
      this.recognition.continuous = options.continuous !== false;
      this.recognition.interimResults = options.interimResults !== false;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (options.onStart) options.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          options.onResult(text, !!finalTranscript, lang);
        }
      };

      this.recognition.onerror = (event: any) => {
        const errorMsg = event.error || 'Speech recognition error';
        if (options.onError) {
          options.onError(errorMsg);
        }
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (options.onEnd) options.onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e: any) {
      console.warn('Voice recognition start error:', e);
      if (options.onError) options.onError(e.message || 'Failed to start microphone');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Speak text in Tamil or English using Web SpeechSynthesis
   */
  public speak(text: string, lang: 'ta-IN' | 'en-US' = 'en-US', onEnd?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // stop any ongoing speech

    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block generated.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~>]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Detect available voices
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceAssistant = new VoiceAssistantService();
