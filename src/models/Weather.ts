import mongoose, { type Document, type Schema } from "mongoose";

// Define the interface for the WeatherUpdate document
interface IWeatherUpdate {
  timestamp: Date;  // Added for clarity
  temp: number;
  feels_like: number;
  main: string;
  dt: number;
}

// Define the interface for the CityWeatherSummary
interface ICityWeatherSummary {
  city: string;
  averageTemp: number | null;
  maxTemp: number | null;
  minTemp: number | null;
  dominantCondition: string | null;
  weatherUpdates: IWeatherUpdate[];
}

// Define the interface for the DailyWeatherSummary document
interface IDailyWeatherSummary extends Document {
  date: Date;
  cities: ICityWeatherSummary[];  // Array of cities
}

// Define the schema for WeatherUpdate
const WeatherUpdateSchema: Schema<IWeatherUpdate> = new mongoose.Schema({
  timestamp: { type: Date, required: true },  // Made required
  temp: { type: Number, required: true },
  feels_like: { type: Number, required: true },
  main: { type: String, required: true },
  dt: { type: Number, required: true },
});

// Define the schema for CityWeatherSummary
const CityWeatherSummarySchema: Schema<ICityWeatherSummary> = new mongoose.Schema({
  city: { type: String, required: true },
  averageTemp: { type: Number, default: null},
  maxTemp: { type: Number, default: null},
  minTemp: { type: Number, default: null},
  dominantCondition: { type: String, default: null},
  weatherUpdates: [WeatherUpdateSchema],  // Reference to WeatherUpdate schema
});

// Define the schema for DailyWeatherSummary
const DailyWeatherSummarySchema: Schema<IDailyWeatherSummary> = new mongoose.Schema({
  date: { type: Date, required: true },
  cities: [CityWeatherSummarySchema],  // Array of city summaries
});

// Model creation
const DailyWeatherSummary = mongoose.models.DailyWeatherSummary
  ? (mongoose.models.DailyWeatherSummary as mongoose.Model<IDailyWeatherSummary>)
  : mongoose.model<IDailyWeatherSummary>("DailyWeatherSummary", DailyWeatherSummarySchema);

export default DailyWeatherSummary;
