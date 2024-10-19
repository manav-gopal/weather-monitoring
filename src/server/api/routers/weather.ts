import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "@/server/api/trpc";
import fetchWeatherData from "@/lib/weather";
import connectDB from "@/lib/db";
import DailyWeatherSummary from "@/models/Weather"; // Ensure correct model import

export const weatherRouter = createTRPCRouter({
  fetchCurrentWeather: publicProcedure
    .input(z.object({ city: z.string() }))
    .query(async ({ input }) => {
      const { city } = input;
      try {
        const data = await fetchWeatherData(city);
        return {
          city,
          temp: data.temp.toFixed(2),
          feels_like: data.feels_like.toFixed(2),
          main: data.main,
          timestamp: new Date(data.dt * 1000).toISOString(),
        };
      } catch (error) {
        console.error("Error fetching weather data:", error);
        throw new Error("Failed to fetch current weather data");
      }
    }),

  // Fetch daily weather summaries for multiple cities
  getDailySummary: publicProcedure
    .input(
      z.object({
        city: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Ensure date is in 'YYYY-MM-DD' format
      })
    )
    .query(async ({ input }) => {
      const { city, date } = input;
      await connectDB(); // Ensure database connection
      try {
        // Parse the date string to a Date object and set time to start of the day
        const summaryDate = new Date(date);
        summaryDate.setHours(0, 0, 0, 0);

        // Find the daily summary for the given date
        const summary = await DailyWeatherSummary.findOne({
          date: summaryDate,
        });
        if (!summary) {
          return null;
        }

        // Find the city summary for the given city
        const citySummary = summary.cities.find(
          (citySummary) => citySummary.city === city
        );
        if (!citySummary) {
          return null;
        }

        return {
          date: summary.date.toISOString(),
          city: citySummary.city,
          averageTemp: citySummary.averageTemp,
          maxTemp: citySummary.maxTemp,
          minTemp: citySummary.minTemp,
          dominantCondition: citySummary.dominantCondition,
          weatherUpdates: citySummary.weatherUpdates.map((update) => ({
            timestamp: update.timestamp.toISOString(),
            temp: update.temp,
            feels_like: update.feels_like,
            main: update.main,
            dt: update.dt,
          })),
        };
      } catch (error) {
        console.error("Error fetching daily summary:", error);
        throw new Error("Failed to fetch daily weather summary");
      }
    }),

  // Trigger an alert based on thresholds
  checkThreshold: publicProcedure
    .input(z.object({ city: z.string(), threshold: z.number() }))
    .query(async ({ input }) => {
      const { city, threshold } = input;
      try {
        const weather = await fetchWeatherData(city);
        if (weather.temp > threshold) {
          return {
            alert: `Threshold breached! ${city} temperature is ${weather.temp.toFixed(
              2
            )}°C`,
          };
        }
        return null;
      } catch (error) {
        console.error("Error checking thresholds:", error);
        throw new Error("Failed to check temperature thresholds");
      }
    }),
});
