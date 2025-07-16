import React, { useState } from 'react';
import { Sprout, Globe, User, ArrowRight } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { UserPreferences } from '../types';

interface WelcomeScreenProps {
  onComplete: (name: string, region: string) => void;
  preferences: UserPreferences;
  onPreferencesChange: (updates: Partial<UserPreferences>) => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onComplete,
  preferences,
  onPreferencesChange,
  isDarkMode,
  onDarkModeToggle
}) => {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && region) {
      onComplete(name, region);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Dark mode toggle */}
          <div className="absolute top-4 right-4 z-10">
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={onDarkModeToggle} />
          </div>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
            <div className="flex items-center justify-center mb-4">
              <Sprout size={48} className="animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold mb-2">FarmAI Assistant</h1>
            <p className="text-green-100">Your intelligent farming companion</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Choose Your Language</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => onPreferencesChange({ language: lang.code })}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          preferences.language === lang.code
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Globe size={20} className="mx-auto mb-2" />
                        <span className="text-sm font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Tell us about yourself</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User size={16} className="inline mr-2" />
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Globe size={16} className="inline mr-2" />
                        Your Region
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="e.g., California, USA"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 rounded-xl transition-all duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Start Farming</span>
                    <Sprout size={20} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};