export interface UserPreferences {
  language: string;
  region: string;
  name: string;
  isFirstTime: boolean;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'image' | 'weather' | 'plant';
  metadata?: any;
}

export interface PlantIdentification {
  name: string;
  confidence: number;
  health: string;
  recommendations: string[];
  image?: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  conditions: string;
  advice: string[];
  forecast: {
    day: string;
    temp: number;
    condition: string;
  }[];
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}