import { HydrateClient } from "@/trpc/server";
import WeatherDashboard from "./weatherDashboard";
// import startCronJob from "@/jobs/weatherJob";

export default async function Home() {
  // Start the cron job when the layout is loaded
  //? Valid for hosted site with server (not vercel)
  // if(typeof window === 'undefined'){
  //   startCronJob();
  // }
  return (
    <HydrateClient>
        <WeatherDashboard />
    </HydrateClient>
  );
}
