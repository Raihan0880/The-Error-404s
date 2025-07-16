import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Calendar, Thermometer, Droplets, Camera, MessageSquare, RefreshCw, Zap } from 'lucide-react';
import { UserPreferences, WeatherData } from '../types';
import { weatherService } from '../services/weatherService';
import { useTranslation } from '../hooks/useTranslation';

interface DashboardProps {
  userPreferences: UserPreferences;
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ userPreferences, isDarkMode }) => {
  const { t } = useTranslation(userPreferences);
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

  // Helper to get next 5 day names starting from today
  const getNextFiveDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };

  // Build robust forecast array (always 5 days, fill missing)
  let robustForecast: { day: string; temp: number; condition: string }[] = [];
  if (weatherData && weatherData.forecast) {
    const forecastDays = getNextFiveDays();
    const forecastMap = (weatherData.forecast || []).reduce((acc, f) => {
      acc[f.day] = f;
      return acc;
    }, {} as Record<string, { day: string; temp: number; condition: string }>);
    robustForecast = forecastDays.map((day, idx) =>
      forecastMap[day] || { day, temp: NaN, condition: 'No data' }
    );
  }

  // Example farming tips (could be dynamic)
  const farmingTips = [
    'Check soil moisture before watering.',
    'Early morning is best for watering.',
    'Mulch to retain soil moisture and suppress weeds.',
    'Inspect plants regularly for pests.',
    'Rotate crops to prevent soil depletion.'
  ];
  const displayedTips = farmingTips.slice(0, 3);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl space-y-8">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('welcome')}, {userPreferences.name}!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t('dashboard')} - {userPreferences.region}</p>
        </div>
        {/* Weather Summary Card */}
        {weatherData && (
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl shadow-xl p-8 text-white flex flex-col items-center">
            <h3 className="text-2xl font-semibold mb-2">{t('current_weather')}</h3>
            <p className="text-blue-100 mb-4">{weatherData.location}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-6">
              <div className="flex items-center space-x-3">
                <Thermometer size={32} />
                <span className="text-3xl font-bold">{weatherData.temperature}°C</span>
              </div>
              <div className="flex items-center space-x-3">
                <Droplets size={32} />
                <span className="text-2xl">{weatherData.humidity}%</span>
              </div>
            </div>
            {/* Extra Weather Metrics (mocked for now) */}
            <div className="flex flex-wrap gap-6 justify-center mb-6">
              <div className="flex flex-col items-center">
                <span className="text-sm">{t('wind') || 'Wind'}</span>
                <span className="text-lg font-bold">12 km/h</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm">{t('uv_index') || 'UV Index'}</span>
                <span className="text-lg font-bold">6</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm">{t('sunrise') || 'Sunrise'}</span>
                <span className="text-lg font-bold">6:12 AM</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm">{t('sunset') || 'Sunset'}</span>
                <span className="text-lg font-bold">6:45 PM</span>
              </div>
            </div>
            {/* 5-Day Forecast */}
            <div className="w-full max-w-xl mx-auto">
              <h4 className="text-lg font-semibold mb-2">{t('forecast_5day')}</h4>
              <div className="grid grid-cols-5 gap-2">
                {robustForecast.map((day, idx) => (
                  <div key={idx} className={`rounded-xl p-3 flex flex-col items-center ${day.condition === 'No data' ? 'bg-gray-100/60 text-gray-400' : 'bg-white/20 text-white'}`}>
                    <span className="font-medium">{day.day}</span>
                    <span className="text-2xl font-bold">{isNaN(day.temp) ? '--' : `${day.temp}°`}</span>
                    <span className="text-xs">{day.condition}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Farming Tips */}
            <div className="mt-8 w-full max-w-xl mx-auto">
              <h4 className="text-lg font-semibold mb-2">{t('farming_tips')}</h4>
              <ul className="space-y-2">
                {displayedTips.map((tip, idx) => (
                  <li key={idx} className="bg-green-100/40 dark:bg-green-900/40 rounded-lg px-4 py-2 text-green-900 dark:text-green-200 text-sm font-medium shadow-sm">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      {/* Profile Footer */}
      <footer className="w-full max-w-2xl mx-auto mt-8 text-center text-xs text-gray-500 dark:text-gray-400 opacity-80">
        Profile: <span className="font-semibold">{userPreferences.name}</span> &bull; Region: <span className="font-semibold">{userPreferences.region}</span>
      </footer>
    </div>
  );
};