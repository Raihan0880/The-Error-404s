import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Image, Paperclip, Camera, Thermometer } from 'lucide-react';
import { Message, UserPreferences } from '../types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { aiService } from '../services/aiService';
import { voiceService } from '../services/voiceService';
import { plantService } from '../services/plantService';
import { weatherService } from '../services/weatherService';

interface ChatInterfaceProps {
  userPreferences: UserPreferences;
  isVoiceActive: boolean;
  onVoiceToggle: (active: boolean) => void;
  isDarkMode: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userPreferences,
  isVoiceActive,
  onVoiceToggle,
  isDarkMode
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${userPreferences.name}! I'm your AI farming assistant. I can help you with plant identification, weather advice, and general farming questions. What would you like to know?`,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle voice command from voice assistant
  const handleVoiceCommand = (command: string, response: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: command,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
  };

  // Handle weather requests in chat
  const handleWeatherRequest = async () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: 'What\'s the current weather?',
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const weatherData = await weatherService.getCurrentWeather(userPreferences.region);
      const weatherResponse = `Current weather in ${weatherData.location}: ${weatherData.temperature}°C, ${weatherData.conditions}, ${weatherData.humidity}% humidity. ${weatherData.advice[0] || 'Have a great day farming!'}`;
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: weatherResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'weather',
        metadata: { weatherData }
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Weather request error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I couldn't fetch the current weather. Please try again or check the weather tab for detailed information.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  const handleVoiceInput = async () => {
    if (!voiceService.isSupported()) {
      alert('Voice input is not supported in this browser');
      return;
    }

    try {
      setIsListening(true);
      const transcript = await voiceService.startListening();
      setInputText(transcript);
      setIsListening(false);
    } catch (error) {
      console.error('Voice input error:', error);
      setIsListening(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Add user message with image
    const userMessage: Message = {
      id: Date.now().toString(),
      text: 'I uploaded an image for plant identification',
      isUser: true,
      timestamp: new Date(),
      type: 'image',
      metadata: { imageFile: file }
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Analyze the plant
      const plantResult = await plantService.analyzeImageFile(file);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I've identified this as a ${plantResult.name} with ${(plantResult.confidence * 100).toFixed(0)}% confidence. Health status: ${plantResult.health}. Here are my care recommendations: ${plantResult.recommendations.slice(0, 3).join(', ')}.`,
        isUser: false,
        timestamp: new Date(),
        type: 'plant',
        metadata: { plantResult }
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Plant identification error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I couldn't identify the plant in your image. Please try again with a clearer photo showing the plant's distinctive features.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setShowImageUpload(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create a simple camera interface
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      // You could implement a modal here for camera capture
      // For now, we'll just trigger the file input as fallback
      stream.getTracks().forEach(track => track.stop());
      fileInputRef.current?.click();
    } catch (error) {
      console.error('Camera access error:', error);
      // Fallback to file input
      fileInputRef.current?.click();
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
      const aiResponse = await aiService.generateResponse(text, userPreferences);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment.",
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

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Farm Assistant Chat</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Ask me anything about farming, plants, or weather</p>
          </div>
          <div className="flex items-center space-x-2">
            {voiceService.isSupported() && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Voice enabled</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your farming question..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleWeatherRequest}
                className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                title="Get current weather"
              >
                <Thermometer size={18} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 dark:text-gray-500 hover:text-green-500 transition-colors"
                title="Upload image for plant identification"
              >
                <Image size={18} />
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="text-gray-400 dark:text-gray-500 hover:text-green-500 transition-colors"
                title="Take photo for plant identification"
              >
                <Camera size={18} />
              </button>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isListening}
            className={`p-3 rounded-xl transition-all duration-300 ${
              isListening
                ? 'bg-green-500 text-white animate-pulse'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-400 hover:text-green-600'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button
            type="button"
            onClick={() => onVoiceToggle(!isVoiceActive)}
            className={`p-3 rounded-xl transition-all duration-300 ${
              isVoiceActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-400 hover:text-green-600'
            }`}
          >
            {isVoiceActive ? '🎤' : '🤖'}
          </button>
          
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white p-3 rounded-xl transition-all duration-300"
          >
            <Send size={20} />
          </button>
        </form>
        
        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};