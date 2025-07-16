import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Calendar, Thermometer, Droplets, Camera, MessageSquare, RefreshCw, Zap } from 'lucide-react';
import { UserPreferences, WeatherData } from '../types';
import { weatherService } from '../services/weatherService';

interface DashboardProps {
  userPreferences: UserPreferences;
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ userPreferences, isDarkMode }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await weatherService.getCurrentWeather(userPreferences.region);
        setWeatherData(data);
      } catch (error) {
        console.error('Dashboard weather fetch error:', error);
      } finally {
        setLoadingWeather(false);
      }
    };

    if (userPreferences.region) {
      fetchWeatherData();
    } else {
      setLoadingWeather(false);
    }
  }, [userPreferences.region]);

  const stats = [
    { label: 'Plants Identified', value: '24', change: '+12%', icon: Activity, color: 'green' },
    { label: 'Questions Asked', value: '156', change: '+8%', icon: MessageSquare, color: 'blue' },
    { label: 'Weather Checks', value: '89', change: '+15%', icon: TrendingUp, color: 'purple' },
    { label: 'Days Active', value: '7', change: 'New', icon: Calendar, color: 'orange' }
  ];

  const recentActivity = [
    { action: 'Identified Tomato Plant', time: '2 hours ago', type: 'plant', icon: '🌱' },
    { action: 'Asked about watering schedule', time: '4 hours ago', type: 'question', icon: '💧' },
    { action: 'Checked weather for planting', time: '6 hours ago', type: 'weather', icon: '🌤️' },
    { action: 'Identified Rose Bush', time: '1 day ago', type: 'plant', icon: '🌹' },
    { action: 'Asked about pest control', time: '1 day ago', type: 'question', icon: '🐛' }
  ];

  const quickActions = [
    {
      title: 'Identify Plant',
      description: 'Upload or capture plant photo',
      icon: Camera,
      color: 'green',
      action: () => {
        // Could trigger plant identification modal or navigate to plant tab
        console.log('Navigate to plant identification');
      }
    },
    {
      title: 'Check Weather',
      description: 'Get current conditions',
      icon: Thermometer,
      color: 'blue',
      action: () => {
        console.log('Navigate to weather');
      }
    },
    {
      title: 'Ask Question',
      description: 'Chat with AI assistant',
      icon: MessageSquare,
      color: 'purple',
      action: () => {
        console.log('Navigate to chat');
      }
    },
    {
      title: 'Voice Assistant',
      description: 'Hands-free interaction',
      icon: Zap,
      color: 'orange',
      action: () => {
        console.log('Activate voice assistant');
      }
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        bg: 'bg-green-50 dark:bg-green-900/30',
        text: 'text-green-500',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/50'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        text: 'text-blue-500',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/50'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        text: 'text-purple-500',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/50'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/30',
        text: 'text-orange-500',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/50'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.green;
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Welcome back, {userPreferences.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your farming dashboard for {userPreferences.region}
          </p>
        </div>

        {/* Weather Summary Card */}
        {weatherData && (
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Current Weather</h3>
                <p className="text-blue-100">{weatherData.location}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <Thermometer size={20} />
                    <span className="text-2xl font-bold">{weatherData.temperature}°C</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets size={20} />
                    <span className="text-lg">{weatherData.humidity}%</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {weatherData.conditions.toLowerCase().includes('sun') ? '☀️' : 
                   weatherData.conditions.toLowerCase().includes('rain') ? '🌧️' : 
                   weatherData.conditions.toLowerCase().includes('cloud') ? '☁️' : '🌤️'}
                </div>
                <p className="text-blue-100">{weatherData.conditions}</p>
              </div>
            </div>
            {weatherData.advice.length > 0 && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <p className="text-sm text-blue-100">
                  💡 {weatherData.advice[0]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colors = getColorClasses(stat.color);
            
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon size={24} className={colors.text} />
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Activity</h2>
              <RefreshCw size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const colors = getColorClasses(action.color);
                
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`p-4 ${colors.bg} ${colors.hover} rounded-xl transition-colors text-center group`}
                  >
                    <Icon size={24} className={`${colors.text} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{action.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">This Week's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🌱</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Plants Identified</h3>
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">+3 from last week</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Questions Asked</h3>
              <p className="text-2xl font-bold text-blue-600">45</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">+8 from last week</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌤️</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Weather Checks</h3>
              <p className="text-2xl font-bold text-purple-600">23</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">+5 from last week</p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">💡 Today's Farming Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start space-x-2">
              <span className="text-green-500">•</span>
              <span>Check soil moisture before watering - stick your finger 2 inches deep</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">•</span>
              <span>Early morning watering reduces evaporation and disease risk</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">•</span>
              <span>Inspect plants regularly for early pest and disease detection</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">•</span>
              <span>Mulch around plants to retain moisture and suppress weeds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};