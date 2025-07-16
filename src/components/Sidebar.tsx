import React from 'react';
import { MessageSquare, Camera, CloudRain, BarChart3, User, Settings, Mic } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { UserPreferences } from '../types';
import { useTranslation } from '../hooks/useTranslation';

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: 'chat' | 'plant' | 'weather' | 'dashboard') => void;
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
  isVoiceActive,
  onVoiceToggle,
  open = true,
  setOpen
}) => {
  const { t } = useTranslation(userPreferences);
  const menuItems = [
    { id: 'chat', icon: MessageSquare, label: t('chat') },
    { id: 'plant', icon: Camera, label: t('plant_id') },
    { id: 'weather', icon: CloudRain, label: t('weather') },
    { id: 'dashboard', icon: BarChart3, label: t('dashboard') },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setOpen && setOpen(false)}></div>
      )}
      <div
        className={`fixed md:static top-0 left-0 z-50 md:z-0 h-full w-72 md:w-80 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ maxWidth: '90vw' }}
      >
        {/* Close button for mobile */}
        {typeof window !== 'undefined' && window.innerWidth < 768 && (
          <button
            className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-full"
            onClick={() => setOpen && setOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        {/* Navigation */}
        <nav className="flex-1 p-8 flex flex-col justify-center">
          <ul className="space-y-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id as any)}
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 text-left text-lg font-semibold tracking-tight shadow-sm border border-transparent ${
                      isActive
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'
                    }`}
                  >
                    <Icon size={28} className={isActive ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
            {/* AI Voice Feature Button */}
            <button
              onClick={() => onVoiceToggle(!isVoiceActive)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 text-left text-lg font-semibold tracking-tight shadow-sm border border-transparent mt-8 ${
                isVoiceActive
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'
              }`}
            >
              <Mic size={28} className={isVoiceActive ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'} />
              <span>AI Voice</span>
            </button>
          </ul>
        </nav>
        {/* Dark mode toggle only */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('theme')}</span>
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={onDarkModeToggle} />
        </div>
      </div>
    </>
  );
};