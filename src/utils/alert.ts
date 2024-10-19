interface Weather {
  main: string | undefined;
  temp: number;
  feels_like: number;
  dt: number;
}

export const checkThresholds = async ({
  weather,
  city,
  threshold = 308,
}: {
  weather: Weather;
  city: string;
  threshold?: number;
}) => {
  if (weather.temp > threshold) {
    console.log(
      `Alert! ${city} temperature exceeded threshold: ${weather.temp}`
    );
  }
};
