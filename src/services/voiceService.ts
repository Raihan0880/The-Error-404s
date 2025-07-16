// Add global type for SpeechRecognition if not present
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
  var SpeechRecognition: any;
}

// Enhanced language mapping for Indian regional languages
const speechRecognitionLangMap: Record<string, string> = {
  en: 'en-IN', // Indian English
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  ur: 'ur-PK',
};

const speechSynthesisLangMap: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  ur: 'ur-PK',
};

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private currentLanguage = 'en';

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
      this.recognition.lang = 'en-IN'; // Default to Indian English
      this.recognition.maxAlternatives = 3;
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
        let transcript = '';
        
        // Get the best result from alternatives
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript = event.results[i][0].transcript;
            break;
          }
        }
        
        this.isListening = false;
        resolve(transcript.trim());
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

  speak(text: string, language: string = 'en'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const synthLang = speechSynthesisLangMap[language] || 'en-IN';
      
      utterance.lang = synthLang;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0; // Natural pitch
      utterance.volume = 1;

      // Wait for voices to load
      const setVoice = () => {
        const voices = this.synthesis.getVoices();
        
        // Priority order for voice selection
        let selectedVoice = null;
        
        // 1. Try to find exact language match with Indian accent
        selectedVoice = voices.find(voice => 
          voice.lang === synthLang && 
          (voice.name.toLowerCase().includes('indian') || 
           voice.name.toLowerCase().includes('india') ||
           voice.localService === true)
        );
        
        // 2. Try to find exact language match
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang === synthLang);
        }
        
        // 3. Try to find language family match (e.g., 'hi' for 'hi-IN')
        if (!selectedVoice) {
          const langCode = synthLang.split('-')[0];
          selectedVoice = voices.find(voice => voice.lang.startsWith(langCode));
        }
        
        // 4. For English, prefer Indian English or natural sounding voices
        if (!selectedVoice && language === 'en') {
          selectedVoice = voices.find(voice => 
            voice.lang.includes('en') && 
            (voice.name.toLowerCase().includes('indian') ||
             voice.name.toLowerCase().includes('natural') ||
             voice.name.toLowerCase().includes('female'))
          );
        }
        
        // 5. Fallback to any English voice
        if (!selectedVoice && language === 'en') {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        // 6. Final fallback
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      };

      // Set voice immediately if voices are already loaded
      if (this.synthesis.getVoices().length > 0) {
        setVoice();
      } else {
        // Wait for voices to load
        this.synthesis.onvoiceschanged = setVoice;
      }

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
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = speechRecognitionLangMap[language] || 'en-IN';
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Get voices for a specific language
  getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
    const voices = this.getAvailableVoices();
    const synthLang = speechSynthesisLangMap[language] || 'en-IN';
    const langCode = synthLang.split('-')[0];
    
    return voices.filter(voice => 
      voice.lang === synthLang || voice.lang.startsWith(langCode)
    );
  }
}

export const voiceService = new VoiceService();