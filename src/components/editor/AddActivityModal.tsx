import humanFormat from "human-format";
import Button from "../Button";
import type { FlattenedActivity } from "~/server/api/routers/activities";

export const timeScale = new humanFormat.Scale({
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  months: 2592000,
});

export function AddActivityModal({
  activities,
  onAdd,
  onClose,
}: {
  activities: FlattenedActivity[];
  onAdd: (activity: FlattenedActivity) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-80 overflow-y-scroll rounded-2xl bg-gray-700 p-4">
        <Button onClick={onClose}>Close</Button>
        <div className="mt-4" />
        {activities.map((activity, index) => (
          <div
            className="mb-2 cursor-pointer rounded-lg bg-gray-800 p-4"
            key={index}
            onClick={() => onAdd(activity)}
          >
            <h2 className="text-xl font-bold">{activity.name}</h2>
            <div className="flex justify-center">
              <p className="mb-4 text-sm text-gray-400">
                {new Date(activity.start_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="mx-3 mt-2 h-1 w-1 rounded-full bg-gray-400"></div>
              <p className="mb-4 text-sm text-gray-400">{activity.type}</p>
            </div>
            <div className="grid grid-cols-2 items-center gap-2 text-left">
              <p>Distance:</p>
              <p>{humanFormat(activity.distance, { maxDecimals: 1 })}</p>
              <p>Duration: </p>
              <p>
                {humanFormat(activity.moving_time, {
                  scale: timeScale,
                  maxDecimals: 1,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
