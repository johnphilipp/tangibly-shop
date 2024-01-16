import type { Activity } from "@prisma/client";
import { getDayOfYear } from "./getDayOfYear";

export function buildYearlyActivityMap(activities: (Activity | null)[]) {
  const yearMap = Array(365).fill(0); // Assuming a non-leap year

  activities.forEach((activity) => {
    if (activity?.start_date_local && activity?.moving_time) {
      const date = new Date(activity.start_date_local);
      const dayOfYear = getDayOfYear(date) - 1; // -1 because array is 0-indexed
      const movingTimeHours = activity.moving_time / 60 / 60;
      yearMap[dayOfYear] += movingTimeHours; // Accumulate moving time
    }
  });

  // round each value to 2 decimal places
  yearMap.forEach((value: number, index) => {
    yearMap[index] = parseFloat(value.toFixed(2));
  });

  return yearMap as number[];
}
