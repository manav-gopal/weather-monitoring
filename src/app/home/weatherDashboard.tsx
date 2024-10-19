"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import styles from "@/styles/WeatherDashboard.module.scss";

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
  const [threshold, setThreshold] = useState<number>(30);

  // State variables for daily summary
  const defaultDate = new Date().toISOString().split("T")[0] ?? "2000-12-12";
  const [dailySummaryCity, setDailySummaryCity] = useState<string>("Delhi");
  const [dailySummaryDate, setDailySummaryDate] = useState<string>(defaultDate);

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
      enabled: !!dailySummaryCity && !!dailySummaryDate,
    }
  );
  const { data: alertData, isLoading: thresholdLoading } =
    api.weather.checkThreshold.useQuery({ city, threshold });
    if (alertData?.alert) console.log(alertData?.alert);

  return (
    <div className={styles.weatherDashboard}>
      <h1 className={styles.title}>Weather Dashboard</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Current Weather</h2>
        <div className={styles.selectWrapper}>
          <label htmlFor="currentCity">Select City:</label>
          <select
            id="currentCity"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={styles.select}
          >
            {[
              "Delhi",
              "Mumbai",
              "Chennai",
              "Bangalore",
              "Kolkata",
              "Hyderabad",
            ].map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
        </div>

        {/* Threshold input */}
        <div className={styles.selectWrapper}>
          <label htmlFor="threshold">Set Temperature Threshold (°C):</label>
          <input
            id="threshold"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className={styles.input}
          />
        </div>

        {weatherLoading ? (
          <p className={styles.loading}>Loading current weather...</p>
        ) : currentWeather ? (
          <div className={styles.weatherCard}>
            <h3>{currentWeather.city}</h3>
            <p className={styles.temperature}>{currentWeather.temp}°C</p>
            <p>Feels Like: {currentWeather.feels_like}°C</p>
            <p>Condition: {currentWeather.main}</p>
            <p className={styles.timestamp}>
              Updated: {new Date(currentWeather.timestamp).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className={styles.error}>Failed to fetch current weather data.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Daily Summary</h2>
        <div className={styles.summaryControls}>
          <div className={styles.selectWrapper}>
            <label htmlFor="summaryCity">City:</label>
            <select
              id="summaryCity"
              value={dailySummaryCity}
              onChange={(e) => setDailySummaryCity(e.target.value)}
              className={styles.select}
            >
              {[
                "Delhi",
                "Mumbai",
                "Chennai",
                "Bangalore",
                "Kolkata",
                "Hyderabad",
              ].map((cityOption) => (
                <option key={cityOption} value={cityOption}>
                  {cityOption}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.selectWrapper}>
            <label htmlFor="summaryDate">Date:</label>
            <input
              id="summaryDate"
              type="date"
              value={dailySummaryDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDailySummaryDate(e.target.value)
              }
              min="2024-10-18"
              max={new Date().toISOString().split("T")[0]}
              className={styles.dateInput}
            />
          </div>
        </div>

        {summaryLoading ? (
          <p className={styles.loading}>Loading daily summary...</p>
        ) : summaryError ? (
          <p className={styles.error}>
            Error fetching daily summary: {summaryError.message}
          </p>
        ) : summaryData ? (
          <div className={styles.summaryCard}>
            <h3>
              {dailySummaryCity} on{" "}
              {new Date(summaryData.date).toLocaleDateString()}
            </h3>
            <div className={styles.summaryDetails}>
              <p>
                Average Temp:{" "}
                {summaryData.averageTemp !== null
                  ? `${summaryData.averageTemp.toFixed(2)}°C`
                  : "N/A"}
              </p>
              <p>
                Max Temp:{" "}
                {summaryData.maxTemp !== null
                  ? `${summaryData.maxTemp.toFixed(2)}°C`
                  : "N/A"}
              </p>
              <p>
                Min Temp:{" "}
                {summaryData.minTemp !== null
                  ? `${summaryData.minTemp.toFixed(2)}°C`
                  : "N/A"}
              </p>
              <p>
                Dominant Condition: {summaryData.dominantCondition ?? "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <p className={styles.noData}>
            No summary available for the selected city and date.
          </p>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
