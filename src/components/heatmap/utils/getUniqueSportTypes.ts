import type { Activity } from "@prisma/client";

export const getUniqueSportTypes = (activities: Activity[]): string[] =>
  activities.reduce<string[]>((acc, activity) => {
    if (!acc.includes(activity.sport_type)) acc.push(activity.sport_type);
    return acc;
  }, []);
