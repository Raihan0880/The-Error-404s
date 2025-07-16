import React from 'react';
import { MessageSquare, Camera, CloudRain, BarChart3, User, Settings, Mic } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { UserPreferences } from '../types';

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
  const menuItems = [
    { id: 'chat', icon: MessageSquare, label: 'Chat', description: 'Ask questions' },
    { id: 'plant', icon: Camera, label: 'Plant ID', description: 'Identify plants' },
    { id: 'weather', icon: CloudRain, label: 'Weather', description: 'Get advice' },
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', description: 'View analytics' },
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
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Welcome back, {userPreferences.name}!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userPreferences.region}</p>
            </div>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                      isActive
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'} />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Voice Assistant Toggle */}
          <div className="mb-4">
            <button
              onClick={() => onVoiceToggle(!isVoiceActive)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isVoiceActive
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Mic size={20} className={isVoiceActive ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'} />
              <div>
                <div className="font-medium">Voice Assistant</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {isVoiceActive ? 'Active' : 'Click to activate'}
                </div>
              </div>
              {isVoiceActive && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={onDarkModeToggle} />
          </div>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300">
            <Settings size={20} className="text-gray-500 dark:text-gray-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};