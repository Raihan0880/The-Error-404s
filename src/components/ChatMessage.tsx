import React from 'react';
import { Bot, User, Leaf, CheckCircle, AlertCircle, Thermometer, Droplets, Wind } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.isUser;
  
  const renderMessageContent = () => {
    if (message.type === 'image' && message.metadata?.imageFile) {
      const imageUrl = URL.createObjectURL(message.metadata.imageFile);
      return (
        <div className="space-y-2">
          <img 
            src={imageUrl} 
            alt="Uploaded plant" 
            className="max-w-48 h-32 object-cover rounded-lg"
          />
          <p className="text-sm">{message.text}</p>
        </div>
      );
    }
    
    if (message.type === 'plant' && message.metadata?.plantResult) {
      const plant = message.metadata.plantResult;
      const getHealthIcon = () => {
        if (plant.health.toLowerCase().includes('healthy')) return <CheckCircle className="text-green-500" size={16} />;
        return <AlertCircle className="text-yellow-500" size={16} />;
      };
      
      return (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">{message.text}</p>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center space-x-2">
              <Leaf size={16} className="text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-300">{plant.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getHealthIcon()}
              <span className="text-sm text-green-600 dark:text-green-400">{plant.health}</span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Confidence: {(plant.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      );
    }
    
    if (message.type === 'weather' && message.metadata?.weatherData) {
      const weather = message.metadata.weatherData;
      
      return (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">{message.text}</p>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700 dark:text-blue-300">{weather.location}</span>
              <span className="text-sm text-blue-600 dark:text-blue-400">{weather.conditions}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <Thermometer size={12} className="text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">{weather.temperature}°C</span>
              </div>
              <div className="flex items-center space-x-1">
                <Droplets size={12} className="text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">{weather.humidity}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Wind size={12} className="text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">12 km/h</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return <p className="text-sm leading-relaxed">{message.text}</p>;
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-green-500 ml-2' : 'bg-gray-200 mr-2'
        }`}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-gray-600 dark:text-gray-400" />
          )}
        </div>
        
        {/* Message bubble */}
        <div className={`px-4 py-2 rounded-2xl ${
          isUser 
            ? 'bg-green-500 text-white rounded-br-md' 
            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-bl-md'
        } shadow-sm`}>
          {renderMessageContent()}
          <p className={`text-xs mt-1 ${
            isUser ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};