import humanFormat from "human-format";
import Button from "../Button";
import { timeScale } from "./AddActivityModal";
import type { FlattenedActivity } from "~/server/api/routers/activities";

export function ActivityModal({
  activity,
  onClose,
  onDelete,
}: {
  activity: FlattenedActivity;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-80 rounded-2xl bg-gray-700 p-4">
        <div className="mb-4 rounded-lg bg-gray-800 p-4">
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
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Button onClick={onClose}>Close</Button>
          <Button onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
