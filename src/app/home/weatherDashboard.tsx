"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

// Define types for the data structures
interface WeatherUpdate {
  timestamp: string;
  temp: number;
  feels_like: number;
  main: string;
  dt: number;
}

interface CitySummary {
  date: string;
  city: string;
  averageTemp: number | null;
  maxTemp: number | null;
  minTemp: number | null;
  dominantCondition: string | null;
  weatherUpdates: WeatherUpdate[];
}

const WeatherDashboard = () => {
  const [city, setCity] = useState<string>("Delhi");

  // State variables for daily summary
  const defaultDate = new Date().toISOString().split("T")[0] ?? "2000-12-12";
  const [dailySummaryCity, setDailySummaryCity] = useState<string>("Delhi");
  const [dailySummaryDate, setDailySummaryDate] = useState<string>(defaultDate); // Format as 'YYYY-MM-DD'

  // Fetch data using TRPC hooks
  const { data: currentWeather, isLoading: weatherLoading } =
    api.weather.fetchCurrentWeather.useQuery({ city });

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = api.weather.getDailySummary.useQuery<CitySummary | null>(
    { city: dailySummaryCity, date: dailySummaryDate },
    {
      enabled: !!dailySummaryCity && !!dailySummaryDate, // Only fetch when both are selected
    }
  );

  return (
    <div>
      <h1>Weather Dashboard</h1>

      {/* Select City for Current Weather */}
      <div>
        <label>
          Select City for Current Weather:
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
        </label>
      </div>

      {/* Current Weather */}
      {weatherLoading ? (
        <p>Loading current weather...</p>
      ) : currentWeather ? (
        <div>
          <h2>Current Weather in {currentWeather.city}</h2>
          <p>Temperature: {currentWeather.temp}°C</p>
          <p>Feels Like: {currentWeather.feels_like}°C</p>
          <p>Condition: {currentWeather.main}</p>
          <p>
            Updated at: {new Date(currentWeather.timestamp).toLocaleString()}
          </p>
        </div>
      ) : (
        <p>Failed to fetch current weather data.</p>
      )}

      {/* Daily Summary */}
      <h2>Daily Summary</h2>

      {/* Select City and Date for Daily Summary */}
      <div>
        <label>
          City:
          <select
            value={dailySummaryCity}
            onChange={(e) => setDailySummaryCity(e.target.value)}
          >
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
        </label>
        <label>
          Date:
          <input
            type="date"
            value={dailySummaryDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDailySummaryDate(e.target.value)
            }
            min="2024-10-18" // Minimum date allowed
            max={new Date().toISOString().split('T')[0]} // Maximum date allowed
          />
        </label>
      </div>

      {/* Daily Summary Data */}
      {summaryLoading ? (
        <p>Loading daily summary...</p>
      ) : summaryError ? (
        <p>Error fetching daily summary: {summaryError.message}</p>
      ) : summaryData ? (
        <div>
          <h4>
            {dailySummaryCity} on{" "}
            {new Date(summaryData.date).toLocaleDateString()}
          </h4>
          <p>
            Average Temperature:{" "}
            {summaryData.averageTemp !== null
              ? summaryData.averageTemp.toFixed(2)
              : "N/A"}
            °C
          </p>
          <p>
            Max Temperature:{" "}
            {summaryData.maxTemp !== null
              ? summaryData.maxTemp.toFixed(2)
              : "N/A"}
            °C
          </p>
          <p>
            Min Temperature:{" "}
            {summaryData.minTemp !== null
              ? summaryData.minTemp.toFixed(2)
              : "N/A"}
            °C
          </p>
          <p>Dominant Condition: {summaryData.dominantCondition ?? "N/A"}</p>
        </div>
      ) : (
        <p>No summary available for the selected city and date.</p>
      )}
    </div>
  );
};

export default WeatherDashboard;
