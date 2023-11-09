import type { Activity } from "@prisma/client";
import { useMemo, useState } from "react";

export function useActivityTypes(activities: Activity[]) {
  const activitiesWithGPS = useMemo(
    () => activities.filter((activity) => activity.summaryPolyline),
    [activities],
  );

  const sportTypes = useMemo(
    () =>
      activitiesWithGPS.reduce<string[]>((acc, activity) => {
        if (!acc.includes(activity.sport_type)) {
          acc.push(activity.sport_type);
        }
        return acc;
      }, []),
    [activitiesWithGPS],
  );

  const [selectedActivityTypes, setSelectedActivityTypes] =
    useState(sportTypes);

  return {
    activitiesWithGPS,
    sportTypes,
    selectedActivityTypes,
    setSelectedActivityTypes,
  };
}
