import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/db';
import DailyWeatherSummary from '../../models/Weather';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Set time to start of the day

    const dailySummary = await DailyWeatherSummary.findOne({ date: yesterday });

    if (dailySummary) {
      for (const citySummary of dailySummary.cities) {
        if (citySummary.weatherUpdates.length > 0) {
          // Calculate aggregates
          const temps = citySummary.weatherUpdates.map((update) => update.temp);
          const averageTemp = temps.reduce((acc: number, temp: number) => acc + temp, 0) / temps.length;
          const maxTemp = Math.max(...temps);
          const minTemp = Math.min(...temps);

          // Calculate dominant condition
          const conditionFrequency = citySummary.weatherUpdates.reduce((acc, update) => {
            const condition = update.main ?? 'Unknown';
            acc[condition] = (acc[condition] ?? 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const dominantCondition = Object.keys(conditionFrequency).reduce((a, b) =>
            conditionFrequency[a]! > conditionFrequency[b]! ? a : b
          );

          // Update city summary
          citySummary.averageTemp = averageTemp;
          citySummary.maxTemp = maxTemp;
          citySummary.minTemp = minTemp;
          citySummary.dominantCondition = dominantCondition;
        } else {
          // No updates collected
          citySummary.averageTemp = null;
          citySummary.maxTemp = null;
          citySummary.minTemp = null;
          citySummary.dominantCondition = null;
        }
      }

      // Save updates
      await dailySummary.save();

      res.status(200).json({ message: 'Daily weather rollup completed successfully.' });
    } else {
      console.log(`No daily summary found for ${yesterday.toDateString()}`);
      res.status(404).json({ error: 'No daily summary found for yesterday.' });
    }
  } catch (error) {
    console.error('Error during daily weather rollup:', error);
    res.status(500).json({ error: 'Failed to perform daily weather rollup.' });
  }
}
