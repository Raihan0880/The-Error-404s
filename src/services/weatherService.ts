import { WeatherData } from '../types';

export class WeatherService {
  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      
      if (apiKey && apiKey !== 'demo-key') {
        return await this.getOpenWeatherData(location, apiKey);
      } else {
        // Use free weather API as fallback
        return await this.getFreeWeatherData(location);
      }
    } catch (error) {
      console.error('Weather Service Error:', error);
      // Try free API as fallback
      try {
        return await this.getFreeWeatherData(location);
      } catch (fallbackError) {
        console.error('Free Weather API Error:', fallbackError);
        return this.getFallbackWeatherData(location);
      }
    }
  }

  private async getOpenWeatherData(location: string, apiKey: string): Promise<WeatherData> {
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';
    
    // Get coordinates for the location
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
    );

    const geoData = await geoResponse.json();
    if (geoData.length === 0) {
      throw new Error('Location not found');
    }

    const { lat, lon } = geoData[0];

    // Get current weather
    const weatherResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error('Weather API request failed');
    }

    const current = await weatherResponse.json();
    const forecast = await forecastResponse.json();

    return {
      location: `${current.name}, ${current.sys.country}`,
      temperature: Math.round(current.main.temp),
      humidity: current.main.humidity,
      conditions: this.capitalizeWords(current.weather[0].description),
      advice: this.generateFarmingAdvice(current),
      forecast: this.processForecast(forecast.list)
    };
  }

  private async getFreeWeatherData(location: string): Promise<WeatherData> {
    try {
      // Using wttr.in free weather API
      const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
      
      if (!response.ok) {
        throw new Error('Free weather API request failed');
      }
      
      const data = await response.json();
      
      const current = data.current_condition[0];
      const forecast = data.weather;

      return {
        location: `${data.nearest_area[0].areaName[0].value}, ${data.nearest_area[0].country[0].value}`,
        temperature: parseInt(current.temp_C),
        humidity: parseInt(current.humidity),
        conditions: current.weatherDesc[0].value,
        advice: this.generateFarmingAdvice({
          main: { temp: parseInt(current.temp_C), humidity: parseInt(current.humidity) },
          weather: [{ main: current.weatherDesc[0].value }]
        }),
        forecast: forecast.slice(0, 5).map((day: any, index: number) => ({
          day: index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: parseInt(day.maxtempC),
          condition: day.hourly[0].weatherDesc[0].value
        }))
      };
    } catch (error) {
      throw error;
    }
  }

  private generateFarmingAdvice(weatherData: any): string[] {
    const advice: string[] = [];
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const condition = weatherData.weather[0].main.toLowerCase();

    // Temperature-based advice
    if (temp < 5) {
      advice.push('Protect sensitive plants from frost - consider row covers or bringing potted plants indoors');
      advice.push('Good time for winter preparation tasks like mulching and tool maintenance');
    } else if (temp > 30) {
      advice.push('Provide shade for sensitive plants and increase watering frequency during hot weather');
      advice.push('Early morning or late evening are best times for outdoor work');
    } else if (temp >= 15 && temp <= 25) {
      advice.push('Ideal temperature for most outdoor farming activities and planting');
      advice.push('Perfect conditions for transplanting and garden maintenance');
    }

    // Humidity-based advice
    if (humidity > 80) {
      advice.push('High humidity may increase disease risk - ensure good air circulation around plants');
      advice.push('Monitor for fungal issues and avoid overhead watering');
    } else if (humidity < 40) {
      advice.push('Low humidity may stress plants - consider mulching to retain soil moisture');
      advice.push('Increase watering frequency and consider misting for humidity-loving plants');
    }

    // Weather condition advice
    if (condition.includes('rain')) {
      advice.push('Skip watering today - natural rainfall should be sufficient for most plants');
      advice.push('Good time for indoor tasks like seed starting, planning, or tool maintenance');
      advice.push('Check for proper drainage to prevent waterlogged soil');
    } else if (condition.includes('sun')) {
      advice.push('Excellent conditions for photosynthesis and plant growth');
      advice.push('Good day for transplanting, harvesting, and outdoor farming activities');
      advice.push('Ensure adequate watering as sunny conditions increase evaporation');
    } else if (condition.includes('cloud')) {
      advice.push('Overcast conditions are ideal for transplanting to reduce plant stress');
      advice.push('Good time for pruning and garden maintenance work');
    }

    return advice.length > 0 ? advice : ['Monitor your plants and adjust care based on their specific needs'];
  }

  private processForecast(forecastList: any[]): Array<{day: string, temp: number, condition: string}> {
    const dailyForecasts: { [key: string]: any } = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      
      if (!dailyForecasts[dayKey]) {
        dailyForecasts[dayKey] = {
          temps: [],
          conditions: [],
          date: date
        };
      }
      
      dailyForecasts[dayKey].temps.push(item.main.temp);
      dailyForecasts[dayKey].conditions.push(item.weather[0].main);
    });

    return Object.values(dailyForecasts)
      .slice(0, 5)
      .map((day: any) => ({
        day: day.date.toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length),
        condition: this.getMostCommonCondition(day.conditions)
      }));
  }

  private getMostCommonCondition(conditions: string[]): string {
    const counts: { [key: string]: number } = {};
    conditions.forEach(condition => {
      counts[condition] = (counts[condition] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  private getFallbackWeatherData(location: string): WeatherData {
    return {
      location: location,
      temperature: 22,
      humidity: 65,
      conditions: 'Partly Cloudy',
      advice: [
        'Weather data temporarily unavailable',
        'General advice: Check soil moisture before watering',
        'Monitor plants for signs of stress in current conditions',
        'Consider local weather patterns for your region',
        'Early morning watering is generally best to reduce evaporation'
      ],
      forecast: [
        { day: 'Today', temp: 22, condition: 'Partly Cloudy' },
        { day: 'Tomorrow', temp: 24, condition: 'Sunny' },
        { day: 'Thu', temp: 20, condition: 'Cloudy' },
        { day: 'Fri', temp: 23, condition: 'Sunny' },
        { day: 'Sat', temp: 25, condition: 'Sunny' }
      ]
    };
  }
}

export const weatherService = new WeatherService();