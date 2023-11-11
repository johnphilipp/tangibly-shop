import React, { useState } from "react";
import { useData } from "~/contexts/DataContext";
import { ActivityModal } from "../editor/ActivityModal";
import type { Activity } from "@prisma/client";

interface MappedActivity {
  dayOfYear: number;
  intensity: number;
  activity: Activity;
}

export default function Bubbles() {
  const { activities } = useData();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const numberOfElements = 365;

  const getDayOfYear = (dateString: string): number => {
    const date = new Date(dateString);
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) - 1;
  };

  const maxMovingTime = Math.max(...activities.map((a) => a.moving_time / 60));
  const minMovingTime = Math.min(...activities.map((a) => a.moving_time / 60));

  const logIntensity = (value: number, min: number, max: number): number => {
    const adjustedValue = Math.max(value, 1);
    return (
      (Math.log(adjustedValue) - Math.log(min)) /
      (Math.log(max) - Math.log(min))
    );
  };

  const mappedActivities: MappedActivity[] = activities.map((activity) => {
    const dayOfYear = getDayOfYear(activity.start_date_local);
    const intensity =
      logIntensity(activity.moving_time / 60, minMovingTime, maxMovingTime) *
        80 +
      20;
    return { dayOfYear, intensity, activity };
  });

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalVisible(true);
  };

  const generateElements = (): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < numberOfElements; i++) {
      const activity = mappedActivities.find((a) => a.dayOfYear === i);
      const intensity = activity ? activity.intensity : 20;
      const backgroundColor = `rgba(0, 0, 0, ${intensity / 100})`;

      elements.push(
        <div
          key={i}
          className="h-4 w-4 cursor-pointer rounded-sm"
          style={{ backgroundColor }}
          onClick={() =>
            activity?.activity && handleActivityClick(activity.activity)
          }
        />,
      );
    }
    return elements;
  };

  return (
    <div className="m-4 space-y-4">
      <div className="overflow-x-auto">
        <div
          className="grid-cols-53 grid gap-2 border bg-white p-4 text-center shadow-lg"
          style={{ minWidth: "calc(53 * (1rem + 0.5rem))" }}
        >
          {generateElements()}
        </div>
      </div>
      {isModalVisible && selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedActivity(null);
          }}
        />
      )}
    </div>
  );
}
