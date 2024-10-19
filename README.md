# Weather Monitoring

---

**Weather Monitoring** is a full-stack application built with Next.js that collects and displays real-time weather data for multiple cities. It stores daily weather updates in a MongoDB database and aggregates the weather data to provide daily summaries for each city. The cron jobs for fetching real-time data and rolling up daily summaries are working locally, but due to free-tier limitations, they are not enabled in the Vercel deployment.

## Features

- **Real-Time Weather Data**: Fetches real-time weather data for multiple cities using the OpenWeatherMap API.
- **Daily Weather Summary**: Stores and aggregates weather data (average, min, max temperatures, dominant weather condition).
- **MongoDB Integration**: Data is stored in MongoDB for persistence.
- **API Routes**: API endpoints are available for fetching and rolling up weather summaries.

## Tech Stack

- **Frontend**: Next.js (React)
- **Backend**: Node.js with Express-style API routes via Next.js
- **Database**: MongoDB (using Mongoose)
- **Weather API**: [OpenWeatherMap](https://openweathermap.org/api)
- **Hosting**: Vercel (with local cron job support)

## Limitations

- **Cron Jobs**: The cron jobs used to fetch real-time weather data and perform daily rollups work locally, but due to limitations of the free Vercel plan (no native support for cron jobs and function invocation limits), they are not enabled in the deployed version. You can run these cron jobs locally or set up external services to trigger the API calls.

## Installation

### Prerequisites

- **Node.js**: Make sure you have Node.js installed (v18.x or higher).
- **MongoDB**: Set up MongoDB locally or use a service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **OpenWeatherMap API Key**: Obtain an API key from [OpenWeatherMap](https://openweathermap.org/api).

### Clone the Repository

```bash
git clone https://github.com/manav-gopal/weather-monitoring.git
cd weather-monitoring
```

### Install Dependencies

```bash
yarn install
```

### Configure Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```bash
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key
```

### Running Locally

#### 1. **Start the Development Server**:
   
```bash
yarn dev
```

Access the app at [http://localhost:3000](http://localhost:3000).

#### 2. **Start the Cron Jobs Locally**:

- **Real-Time Weather Data Fetching**: Every 5 minutes.
- **Daily Rollup**: Runs every day at midnight.

These cron jobs are automatically triggered when the local server is running.

## API Endpoints

### Fetch Real-Time Weather Data

- **URL**: `/api/fetchRealTimeWeatherData`
- **Method**: GET
- **Description**: Fetches and stores current weather data for predefined cities.

### Rollup Daily Weather Data

- **URL**: `/api/rollupDailyWeather`
- **Method**: GET
- **Description**: Aggregates the daily weather data and calculates statistics (average, min, max temperatures) for each city.

## Deployment

### Deployed on Vercel

The app is deployed on [Vercel](https://vercel.com/), but due to Vercel’s free-tier limitations, the cron jobs are not enabled in the production environment.

You can view the deployed version [here](https://weather-monitoring-three.vercel.app).

### Setting Up Locally or Externally for Cron Jobs

If you want the cron jobs to run on production, you can:

1. **Use External Services for Cron Jobs**:
   Services like `node-cron` can trigger your API routes at the scheduled times.

2. **Run Locally**:
   Keep the server running locally to trigger the cron jobs as defined.


## Future Improvements

- Add user authentication for personalized city tracking.
- Implement better error handling and retries for API requests.
- Optimize database queries to handle larger datasets more efficiently.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.