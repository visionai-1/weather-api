/**
 * 🌤️ Simple Weather Mock Data
 * Lightweight mock responses for development and testing
 */

import { TomorrowRealtimeResponse, TomorrowForecastResponse } from '../interfaces/weather';

/**
 * Simple mock real-time weather data
 */
const createMockRealtimeWeather = (
  lat: number = 32.0853, 
  lon: number = 32.0853,
  temperature: number = 20.0
): TomorrowRealtimeResponse => ({
  data: {
    time: new Date().toISOString(),
    values: {
      temperature,
      humidity: 60,
      windSpeed: 5.0,
      windDirection: 180,
      precipitationIntensity: 0,
      precipitationProbability: 10,
      visibility: 15.0,
      uvIndex: 5,
      cloudCover: 30,
      pressureSurfaceLevel: 1013.25,
      weatherCode: 1000
    }
  },
  location: { lat, lon }
});

/**
 * Simple mock forecast data - matches Tomorrow.io API structure
 */
const createMockForecast = (
  lat: number = 32.0853, 
  lon: number = 34.7818,
  timesteps: '1h' | '1d' = '1h'
): any => { // Using 'any' to match the transform function expectation
  const now = new Date();
  const intervalCount = timesteps === '1h' ? 24 : 7;
  const intervalMs = timesteps === '1h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const isHourly = timesteps === '1h';
  const timestepKey = isHourly ? 'hourly' : 'daily';

  const intervals = [];

  for (let i = 0; i < intervalCount; i++) {
    const time = new Date(now.getTime() + (i * intervalMs));
    const baseTemp = 20; // Fixed 20°C temperature
    const tempVariation = Math.random() * 2 - 1; // ±1°C variation around 20°C
    
    if (isHourly) {
      // Hourly data structure
      intervals.push({
        time: time.toISOString(),
        values: {
          temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
          temperatureApparent: Math.round((baseTemp + tempVariation + 1) * 10) / 10,
          humidity: Math.round(50 + Math.sin(i * 0.3) * 20), // 30-70%
          windSpeed: Math.round((3 + Math.random() * 4) * 10) / 10, // 3-7 m/s
          windDirection: (180 + (i * 15)) % 360,
          precipitationProbability: Math.random() > 0.8 ? Math.round(Math.random() * 80 + 20) : Math.round(Math.random() * 20),
          visibility: Math.round((12 + Math.random() * 6) * 10) / 10, // 12-18 km
          uvIndex: Math.max(0, Math.round(7 + Math.sin(i * 0.2) * 3)), // 0-10
          cloudCover: Math.round(Math.random() * 80), // 0-80%
          weatherCode: Math.random() > 0.8 ? 4000 : 1000 // Mostly clear, sometimes rainy
        }
      });
    } else {
      // Daily data structure
      const maxTemp = baseTemp + 2; // 22°C max
      const minTemp = baseTemp - 2; // 18°C min
      intervals.push({
        time: time.toISOString(),
        values: {
          temperatureMax: Math.round(maxTemp * 10) / 10,
          temperatureMin: Math.round(minTemp * 10) / 10,
          temperatureApparentMax: Math.round((maxTemp + 1) * 10) / 10,
          temperatureApparentMin: Math.round((minTemp + 1) * 10) / 10,
          humidityAvg: Math.round(50 + Math.sin(i * 0.3) * 20), // 30-70%
          windSpeedAvg: Math.round((3 + Math.random() * 4) * 10) / 10, // 3-7 m/s
          precipitationProbabilityMax: Math.random() > 0.8 ? Math.round(Math.random() * 80 + 20) : Math.round(Math.random() * 20),
          cloudCoverAvg: Math.round(Math.random() * 80), // 0-80%
          uvIndexMax: Math.max(0, Math.round(7 + Math.sin(i * 0.2) * 3)), // 0-10
          weatherCodeMax: Math.random() > 0.8 ? 4000 : 1000,
          sunriseTime: new Date(time.getTime() + (6 * 60 * 60 * 1000)).toISOString(), // 6 AM
          sunsetTime: new Date(time.getTime() + (18 * 60 * 60 * 1000)).toISOString() // 6 PM
        }
      });
    }
  }

  // Return structure that matches Tomorrow.io API and works with transformForecastResponse
  return {
    timelines: {
      [timestepKey]: intervals
    },
    location: { 
      lat, 
      lon,
      name: `Mock Location ${lat.toFixed(2)}, ${lon.toFixed(2)}`
    }
  };
};

/**
 * City-based weather variations - all set to 20°C
 */
const getCityWeatherVariation = (city: string): { temperature: number; scenario: string } => {
  const cityKey = city.toLowerCase();
  
  // All cities now return 20°C with slight variations
  if (cityKey.includes('london') || cityKey.includes('seattle')) {
    return { temperature: 20, scenario: 'mild' };
  } else if (cityKey.includes('moscow') || cityKey.includes('alaska')) {
    return { temperature: 20, scenario: 'mild' };
  } else if (cityKey.includes('dubai') || cityKey.includes('phoenix')) {
    return { temperature: 20, scenario: 'mild' };
  } else if (cityKey.includes('miami') || cityKey.includes('florida')) {
    return { temperature: 20, scenario: 'mild' };
  } else {
    return { temperature: 20 + (Math.random() - 0.5) * 2, scenario: 'mild' }; // 19-21°C
  }
};

/**
 * Export simple mock functions that match the API client interface
 */
export const getMockRealtimeWeatherByCoordinates = (
  lat: number, 
  lon: number
): TomorrowRealtimeResponse => {
  const temperature = 20 + (lat / 90) * 15 + (Math.random() - 0.5) * 10;
  return createMockRealtimeWeather(lat, lon, temperature);
};

export const getMockRealtimeWeatherByCity = (city: string): TomorrowRealtimeResponse => {
  const { temperature } = getCityWeatherVariation(city);
  // Use default coordinates for mock
  return createMockRealtimeWeather(32.0853, 34.7818, temperature);
};

export const getMockForecastByCoordinates = (
  lat: number, 
  lon: number, 
  timesteps: '1h' | '1d' = '1h'
): any => { // Using 'any' to match Tomorrow.io API structure
  return createMockForecast(lat, lon, timesteps);
};

export const getMockForecastByCity = (
  city: string, 
  timesteps: '1h' | '1d' = '1h'
): any => { // Using 'any' to match Tomorrow.io API structure
  const { temperature } = getCityWeatherVariation(city);
  // Adjust base temperature for the city
  const mockData = createMockForecast(32.0853, 34.7818, timesteps);
  
  // Update location name to include city
  mockData.location.name = city;
  
  return mockData;
};

export const getMockApiHealth = (): { status: 'healthy' | 'unhealthy' } => {
  return { status: 'healthy' };
};