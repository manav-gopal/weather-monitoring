import type { NextApiRequest, NextApiResponse } from 'next';
import fetchWeatherData from '../../lib/weather';
import connectDB from '../../lib/db';
import DailyWeatherSummary from '../../models/Weather';

const CITIES = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of the day

    let dailySummary = await DailyWeatherSummary.findOne({ date: today });

    if (dailySummary) {
      // Update existing daily summary
      for (const city of CITIES) {
        const weather = await fetchWeatherData(city);

        // Find or create city summary
        const citySummary = dailySummary.cities.find((c) => c.city === city);

        if (citySummary) {
          // Add new weather update
          citySummary.weatherUpdates.push({
            timestamp: new Date(),
            temp: weather.temp,
            feels_like: weather.feels_like,
            main: weather.main ?? '',
            dt: weather.dt,
          });
        } else {
          // Create new city summary
          dailySummary.cities.push({
            city,
            averageTemp: null,
            maxTemp: null,
            minTemp: null,
            dominantCondition: null,
            weatherUpdates: [
              {
                timestamp: new Date(),
                temp: weather.temp,
                feels_like: weather.feels_like,
                main: weather.main ?? '',
                dt: weather.dt,
              },
            ],
          });
        }
      }

      // Save updates
      await dailySummary.save();
    } else {
      // Create new daily summary
      const citiesData = [];

      for (const city of CITIES) {
        const weather = await fetchWeatherData(city);

        citiesData.push({
          city,
          averageTemp: null,
          maxTemp: null,
          minTemp: null,
          dominantCondition: null,
          weatherUpdates: [
            {
              timestamp: new Date(),
              temp: weather.temp,
              feels_like: weather.feels_like,
              main: weather.main ?? 'Unknown',
              dt: weather.dt,
            },
          ],
        });
      }

      dailySummary = new DailyWeatherSummary({
        date: today,
        cities: citiesData,
      });

      await dailySummary.save();
    }

    res.status(200).json({ message: 'Real-time weather data fetched successfully.' });
  } catch (error) {
    console.error('Error fetching real-time weather data:', error);
    res.status(500).json({ error: 'Failed to fetch real-time weather data.' });
  }
}
