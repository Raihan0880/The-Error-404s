// Add global type for SpeechRecognition if not present
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
  var SpeechRecognition: any;
}

const ELEVENLABS_API_KEY = 'sk_759bd50f70e243c2996a4534e6f5fbda10475e92c11029a6';
const elevenLabsLangMap: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  ta: 'ta',
  te: 'te',
  bn: 'bn',
  kn: 'kn',
  ml: 'ml',
  mr: 'mr',
  gu: 'gu',
  pa: 'pa',
  ur: 'ur',
};

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  async startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, language: string = 'en-US'): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      // Try ElevenLabs TTS first for supported languages
      const langCode = Object.keys(elevenLabsLangMap).find(l => language.startsWith(l)) || 'en';
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/voice-generation', {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.7 },
            // You can specify a voice_id for a specific voice if desired
            // voice_id: '...',
            language_id: elevenLabsLangMap[langCode] || 'en',
          })
        });
        if (response.ok) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audio.onended = () => resolve();
          audio.onerror = (e) => reject(new Error('Audio playback error'));
          audio.play();
          return;
        }
      } catch (err) {
        // Fallback to browser TTS below
      }

      // Fallback: browser TTS
      // Map app language code to BCP-47 locale
      const langMap: Record<string, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        pa: 'pa-IN',
        ur: 'ur-IN',
      };
      const synthLang = langMap[language] || 'en-US';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = synthLang;
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      utterance.voice =
        voices.find(v => v.lang === synthLang) ||
        voices.find(v => v.lang.startsWith(synthLang.split('-')[0])) ||
        voices.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('english')) ||
        voices[0];
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  setLanguage(language: string): void {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }
}

export const voiceService = new VoiceService();