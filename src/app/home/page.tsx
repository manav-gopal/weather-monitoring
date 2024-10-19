import { HydrateClient } from "@/trpc/server";
import WeatherDashboard from "./weatherDashboard";

export default async function Home() {
  return (
    <HydrateClient>
        <WeatherDashboard />
    </HydrateClient>
  );
}
