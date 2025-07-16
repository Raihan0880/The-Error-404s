import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, Zap, Sparkles, Brain } from 'lucide-react';
import { Message, UserPreferences } from '../types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { aiService } from '../services/aiService';
import { voiceService } from '../services/voiceService';
import { useTranslation } from '../hooks/useTranslation';

interface AIAssistantProps {
  userPreferences: UserPreferences;
  isDarkMode: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  userPreferences,
  isDarkMode
}) => {
  const { t } = useTranslation(userPreferences);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `${t('welcome')} ${userPreferences.name}! I'm your advanced AI farming assistant. I can provide detailed agricultural insights, crop recommendations, pest management strategies, and personalized farming advice for ${userPreferences.region}. How can I help you today?`,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceInput = async () => {
    if (!voiceService.isSupported()) {
      alert('Voice input is not supported in this browser');
      return;
    }

    try {
      setIsListening(true);
      voiceService.setLanguage(userPreferences.language);
      const transcript = await voiceService.startListening();
      setInputText(transcript);
      setIsListening(false);
    } catch (error) {
      console.error('Voice input error:', error);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await aiService.generateResponse(
        text, 
        userPreferences,
        `You are an advanced AI farming assistant. Provide detailed, expert-level agricultural advice. Be comprehensive but clear. Include specific recommendations when possible. Always respond in ${userPreferences.language} language.`
      );
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response if voice is supported
      if (voiceService.isSupported()) {
        try {
          await voiceService.speak(aiResponse, userPreferences.language);
        } catch (voiceError) {
          console.error('Voice synthesis error:', voiceError);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing some technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const quickPrompts = [
    'What crops grow best in my region?',
    'How do I improve soil quality?',
    'Pest control strategies',
    'Seasonal farming calendar',
    'Organic farming tips',
    'Water management techniques'
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain size={24} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <span>{t('ai_assistant')}</span>
                <Sparkles size={20} className="text-purple-500" />
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced agricultural intelligence for {userPreferences.region}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                AI Online
              </span>
            </div>
            {voiceService.isSupported() && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Mic size={12} className="text-blue-500" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  {t('voice_enabled')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
              <Zap size={20} className="text-yellow-500" />
              <span>Quick Start Questions</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Bot size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {prompt}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('ai_thinking')}</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('ask_ai')}
              className="w-full px-6 py-4 pr-16 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Brain size={20} className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          
          {voiceService.isSupported() && (
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isListening}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600'
              }`}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
          )}
          
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <Send size={24} />
          </button>
        </form>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by advanced AI • Optimized for {userPreferences.region} agriculture
          </p>
        </div>
      </div>
    </div>
  );
};