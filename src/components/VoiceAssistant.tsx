import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, X, EyeOff, Volume2, VolumeX } from 'lucide-react';
import { UserPreferences, VoiceState } from '../types';
import { voiceService } from '../services/voiceService';
import { aiService } from '../services/aiService';
import { useTranslation } from '../hooks/useTranslation';

interface VoiceAssistantProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  userPreferences: UserPreferences;
  isDarkMode: boolean;
  onVoiceCommand?: (command: string, response: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  isActive,
  onToggle,
  userPreferences,
  isDarkMode,
  onVoiceCommand
}) => {
  const { t } = useTranslation(userPreferences);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false
  });

  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleVoiceInteraction = useCallback(async () => {
    if (!voiceService.isSupported()) {
      setTranscript('Voice features are not supported in this browser');
      return;
    }

    try {
      setVoiceState(prev => ({ ...prev, isListening: true }));
      setTranscript('Listening...');
      
      const userSpeech = await voiceService.startListening();
      setTranscript(`You said: "${userSpeech}"`);
      
      setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: true }));
      
      const aiResponse = await aiService.generateVoiceResponse(userSpeech, userPreferences);
      setLastResponse(aiResponse);
      
      setVoiceState(prev => ({ ...prev, isProcessing: false, isSpeaking: true }));
      setTranscript(aiResponse);
      
      // Notify parent component about voice interaction
      if (onVoiceCommand) {
        onVoiceCommand(userSpeech, aiResponse);
      }
      
      await voiceService.speak(aiResponse);
      
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      
      // Auto-restart listening after a brief pause
      setTimeout(() => {
        if (isActive) {
          handleVoiceInteraction();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Voice interaction error:', error);
      setVoiceState({ isListening: false, isProcessing: false, isSpeaking: false });
      setTranscript('Voice interaction failed. Please try again.');
    }
  }, [isActive, userPreferences, onVoiceCommand]);

  useEffect(() => {
    if (isActive) {
      // Set language based on user preferences
      voiceService.setLanguage(userPreferences.language === 'es' ? 'es-ES' : 'en-US');
      handleVoiceInteraction();
    } else {
      setVoiceState({ isListening: false, isProcessing: false, isSpeaking: false });
      setTranscript('');
      voiceService.stopListening();
      voiceService.stopSpeaking();
    }
  }, [isActive, handleVoiceInteraction, userPreferences.language]);

  // Mute logic: stop speaking and set muted state
  const handleMute = () => {
    voiceService.stopSpeaking();
    setIsMuted(true);
  };
  const handleUnmute = () => {
    setIsMuted(false);
  };

  if (!isActive) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-20 h-20' : 'w-[28rem] max-w-full'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-green-400">
        {isMinimized ? (
          // Minimized view
          <div className="p-4 flex flex-col items-center justify-center">
            <button
              onClick={() => setIsMinimized(false)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                voiceState.isListening 
                  ? 'bg-green-500 animate-pulse' 
                  : voiceState.isProcessing 
                    ? 'bg-blue-500 animate-spin' 
                    : voiceState.isSpeaking 
                      ? 'bg-purple-500 animate-bounce' 
                      : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <Mic size={28} className="text-white" />
            </button>
          </div>
        ) : (
          // Full view
          <div className="p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('voice_assistant')}</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Hide"
                >
                  <EyeOff size={22} />
                </button>
                <button
                  onClick={() => onToggle(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                  title="Close"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Voice Visualization */}
            <div className="flex items-center justify-center mb-4">
              <div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${
                voiceState.isListening 
                  ? 'bg-green-500 animate-pulse' 
                  : voiceState.isProcessing 
                    ? 'bg-blue-500' 
                    : voiceState.isSpeaking 
                      ? 'bg-purple-500 animate-bounce' 
                      : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <Mic size={64} className="text-white" />
                
                {/* Ripple effect for listening */}
                {voiceState.isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-green-500 opacity-30 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  </>
                )}

                {/* Processing animation */}
                {voiceState.isProcessing && (
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {voiceState.isListening && `🎤 ${t('listening')}`}
                {voiceState.isProcessing && `🧠 ${t('processing')}`}
                {voiceState.isSpeaking && `🔊 ${t('speaking')}`}
                {!voiceState.isListening && !voiceState.isProcessing && !voiceState.isSpeaking && `✨ ${t('ready_to_help')}`}
              </p>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700 dark:text-gray-300">{transcript}</p>
              </div>
            )}

            {/* Voice Commands Help */}
            <div className="mb-4">
              <details className="group">
                <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  Voice Commands
                </summary>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p>• "What's the weather like?"</p>
                  <p>• "How do I water tomatoes?"</p>
                  <p>• "Identify this plant"</p>
                  <p>• "Show me the dashboard"</p>
                  <p>• "Stop listening"</p>
                </div>
              </details>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => onToggle(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 text-base font-semibold"
              >
                <MicOff size={18} />
                <span>{t('stop')}</span>
              </button>
              {isMuted ? (
                <button
                  onClick={handleUnmute}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 text-base font-semibold"
                >
                  <VolumeX size={18} />
                  <span>{t('unmute')}</span>
                </button>
              ) : (
                <button
                  onClick={handleMute}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 text-base font-semibold"
                >
                  <Volume2 size={18} />
                  <span>{t('mute')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};