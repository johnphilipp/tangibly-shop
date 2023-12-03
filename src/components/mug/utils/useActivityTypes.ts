import type { Activity } from "@prisma/client";
import { useMemo, useState } from "react";

export function useActivityTypes(activities: Activity[]) {
  const sportTypes = useMemo(
    () =>
      activities.reduce<string[]>((acc, activity) => {
        if (!acc.includes(activity.sport_type)) {
          acc.push(activity.sport_type);
        }
        return acc;
      }, []),
    [activities],
  );

  const [selectedActivityTypes, setSelectedActivityTypes] =
    useState(sportTypes);

  return {
    activities,
    sportTypes,
    selectedActivityTypes,
    setSelectedActivityTypes,
  };
}
