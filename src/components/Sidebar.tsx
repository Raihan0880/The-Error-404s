import React from 'react';
import { MessageSquare, Camera, CloudRain, BarChart3, Bot, Settings, Mic } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { UserPreferences } from '../types';
import { useTranslation } from '../hooks/useTranslation';

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: 'chat' | 'plant' | 'weather' | 'dashboard' | 'ai-assistant') => void;
  userPreferences: UserPreferences;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  isVoiceActive: boolean;
  onVoiceToggle: (active: boolean) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  userPreferences,
  isDarkMode, 
  onDarkModeToggle,
  open = true,
  setOpen
}) => {
  const { t } = useTranslation(userPreferences);
  const menuItems = [
    { id: 'chat', icon: MessageSquare, label: t('chat') },
    { id: 'ai-assistant', icon: Bot, label: t('ai_assistant') },
    { id: 'plant', icon: Camera, label: t('plant_id') },
    { id: 'weather', icon: CloudRain, label: t('weather') },
    { id: 'dashboard', icon: BarChart3, label: t('dashboard') },
  ];

  const handleClose = () => {
    if (setOpen) setOpen(false);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={handleClose}
      />
      
      <div
        className={`fixed md:static top-0 left-0 z-50 md:z-0 h-full w-72 md:w-80 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ maxWidth: '90vw' }}
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-full md:hidden"
          onClick={handleClose}
          aria-label={t('close_sidebar')}
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            FarmAI Assistant
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('smart_assistant')}
          </p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-6 overflow-y-auto">
          <ul className="space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id as any)}
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 text-left text-lg font-semibold tracking-tight shadow-sm border border-transparent hover:scale-105 ${
                      isActive
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={28} className={isActive ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userPreferences.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {userPreferences.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {userPreferences.region}
              </p>
            </div>
          </div>

          {/* Dark mode toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('theme')}
            </span>
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={onDarkModeToggle} />
          </div>
        </div>
      </div>
    </>
  );
};