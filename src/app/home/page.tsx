import { HydrateClient } from "@/trpc/server";
import WeatherDashboard from "./weatherDashboard";
import startCronJob from "@/server/jobs/weatherJob";

export default async function Home() {
  // Start the cron job when the layout is loaded
  if(typeof window === 'undefined'){
    startCronJob();
  }
  return (
    <HydrateClient>
        <WeatherDashboard />
    </HydrateClient>
  );
}
