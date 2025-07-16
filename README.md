# AI-Powered Farming Assistant

A comprehensive farming assistant application with AI integration, plant identification, weather data, voice interaction capabilities, and dark mode support.

## Features

- **AI Chat**: Powered by Google Gemini AI with intelligent fallback responses
- **Plant Identification**: Advanced plant identification using Plant.id API with free PlantNet fallback
- **Weather Integration**: Real-time weather data using OpenWeatherMap with free weather service fallback
- **Voice Assistant**: Speech recognition and synthesis for hands-free interaction
- **Multi-language Support**: Configurable language preferences
- **Dark Mode**: Toggle between light and dark themes with system preference detection
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Setup Instructions

### 1. API Keys

The application uses premium APIs with free fallbacks. API keys are included in `.env.local`:

```env
# AI Configuration
VITE_GEMINI_API_KEY=AIzaSyAge-qq1GVUods3bNKqftck8ov_TmKY8Ic

# Weather API
VITE_WEATHER_API_KEY=02bc691d075c05733cc2af25925f87a7

# Plant Identification API
VITE_PLANT_API_KEY=cPhXXswE1v5YKGXp7cIVArQsfRwMpuCnblJogusHbYK1ZjWGRb
```

### 2. API Services Used

#### Google Gemini AI
- Primary AI service for intelligent farming advice
- Fallback to Hugging Face API if unavailable

#### OpenWeatherMap
- Real-time weather data and forecasts
- Fallback to wttr.in free weather API

#### Plant.id
- Advanced plant identification and health assessment
- Fallback to PlantNet free API

### 3. Installation

```bash
npm install
npm run dev
```

## Usage

1. **Welcome Screen**: Set your name, region, and language preferences
2. **Chat Interface**: Ask farming questions and get AI-powered responses
3. **Plant Identification**: Upload plant photos for identification and care advice
4. **Weather Advice**: Get location-specific weather and farming recommendations
5. **Voice Assistant**: Use voice commands for hands-free interaction
6. **Dark Mode**: Toggle between light and dark themes in the sidebar
6. **Dashboard**: Track your farming activities and insights

## Browser Compatibility

- **Voice Features**: Requires modern browsers with Web Speech API support
- **Image Upload**: All modern browsers supported
- **Responsive Design**: Works on all screen sizes

## Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **AI Service**: Google Gemini AI with Hugging Face fallback
- **Weather API**: OpenWeatherMap with wttr.in fallback  
- **Plant ID**: Plant.id API with PlantNet fallback
- **Voice**: Web Speech API
- **Build Tool**: Vite

## Fallback Behavior

The application includes comprehensive fallback systems:
- AI chat falls back to Hugging Face API, then to contextual responses
- Weather falls back to free wttr.in API, then to demo data
- Plant identification falls back to PlantNet API, then to basic analysis
- Voice features gracefully degrade if not supported
- Dark mode persists user preference and respects system settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your API keys to `.env.local`
4. Test your changes
5. Submit a pull request

## License

MIT License - see LICENSE file for details