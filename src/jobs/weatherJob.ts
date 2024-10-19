import cron from "node-cron";
import fetchWeatherData from "@/lib/weather";
import connectDB from "@/lib/db";
import DailyWeatherSummary from "@/models/Weather";

const CITIES = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];

const saveRealTimeWeatherData = async () => {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of the day

  let dailySummary = await DailyWeatherSummary.findOne({
    date: today,
  });

  if (dailySummary) {
    // Daily summary exists, update it
    for (const city of CITIES) {
      const weather = await fetchWeatherData(city);

      // Find the city summary
      let citySummary = dailySummary.cities.find((c) => c.city === city);

      if (citySummary) {
        // Push new weather data
        citySummary.weatherUpdates.push({
          timestamp: new Date(),
          temp: weather.temp,
          feels_like: weather.feels_like,
          main: weather.main ?? "",
          dt: weather.dt,
        });
      } else {
        // City summary doesn't exist, create it
        citySummary = {
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
              main: weather.main ?? "",
              dt: weather.dt,
            },
          ],
        };

        dailySummary.cities.push(citySummary);
      }
    }

    // Save the updated document once after all updates
    await dailySummary.save();
  } else {
    // No daily summary exists, create a new one
    const citiesData = [];

    for (const city of CITIES) {
      const weather = await fetchWeatherData(city);

      const cityData = {
        city,
        averageTemp: null, // Set to null before rollup
        maxTemp: null,
        minTemp: null,
        dominantCondition: null,
        weatherUpdates: [
          {
            timestamp: new Date(),
            temp: weather.temp,
            feels_like: weather.feels_like,
            main: weather.main ?? "Unknown",
            dt: weather.dt,
          },
        ],
      };

      citiesData.push(cityData);
    }

    dailySummary = new DailyWeatherSummary({
      date: today,
      cities: citiesData,
    });

    await dailySummary.save();
  }
};

const rollupDailyWeather = async () => {
  await connectDB();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  //? yesterday.setDate(yesterday.getDate()); // for test perpose rollup on same day
  yesterday.setHours(0, 0, 0, 0); // Set time to start of the day

  const dailySummary = await DailyWeatherSummary.findOne({
    date: yesterday,
  });

  if (dailySummary) {
    for (const citySummary of dailySummary.cities) {
      if (citySummary.weatherUpdates.length > 0) {
        // Calculate aggregates
        const temps = citySummary.weatherUpdates.map((update) => update.temp);
        const averageTemp =
          temps.reduce((acc, temp) => acc + temp, 0) / temps.length;
        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);

        // Calculate dominant condition
        const conditionFrequency = citySummary.weatherUpdates.reduce(
          (acc, update) => {
            const condition = update.main ?? "Unknown";
            acc[condition] = (acc[condition] ?? 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );
        const dominantCondition = Object.keys(conditionFrequency).reduce(
          (a, b) => (conditionFrequency[a]! > conditionFrequency[b]! ? a : b)
        );

        // Update the city summary with calculated aggregates
        citySummary.averageTemp = averageTemp;
        citySummary.maxTemp = maxTemp;
        citySummary.minTemp = minTemp;
        citySummary.dominantCondition = dominantCondition;
      } else {
        // If no weather updates were collected, keep the values as null
        citySummary.averageTemp = null;
        citySummary.maxTemp = null;
        citySummary.minTemp = null;
        citySummary.dominantCondition = null;
      }
    }

    // Save the updated daily summary
    await dailySummary.save();
  } else {
    console.log(`No daily summary found for ${yesterday.toDateString()}`);
  }
};

// Schedule real-time weather data fetching every 5 minutes
const task1 = cron.schedule("*/5 * * * *", () => {
  console.log("Fetching real-time weather data...");
  saveRealTimeWeatherData()
    .catch((err) => console.error(err))
    .then(() => console.log("Real-time weather data fetched successfully."))
    .catch((err) =>
      console.error("Error fetching real-time weather data:", err)
    );
});
task1.start();

// Schedule daily rollup at midnight
const task2 = cron.schedule("0 0 * * *", () => {
  rollupDailyWeather().catch((err) => console.error(err));
});

const startCronJob = () => {
  task1.start();
  task2.start();
};
export default startCronJob;
