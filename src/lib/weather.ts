import axios, { type AxiosResponse } from "axios";
import type { GeoLocationResponse, WeatherResponse } from "@/types/weather.types";

const fetchGeoLocation = async (city: string) => {
  const geoApiKey = process.env.OPENWEATHERMAP_API_KEY!;
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${geoApiKey}`;
  const res: AxiosResponse = await axios.get(geoUrl);
  const geoData = (res.data as GeoLocationResponse[])[0]!;

  return {
    lat: geoData.lat,
    lon: geoData.lon,
  };
};

const fetchWeatherData = async (city: string) => {
  const { lat, lon } = await fetchGeoLocation(city);
  const apiKey = process.env.OPENWEATHERMAP_API_KEY!;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  const res: AxiosResponse = await axios.get(url);
  const data = res.data as WeatherResponse;

  return {
    main: data?.weather[0]?.main,
    temp: data.main.temp - 273.15,
    feels_like: data.main.feels_like - 273.15,
    dt: data.dt,
  };
};

export default fetchWeatherData;
