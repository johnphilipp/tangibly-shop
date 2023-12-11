import humanFormat from "human-format";
import Button from "../../Button";
import { timeScale } from "./AddActivityModal";
import type { Activity } from "@prisma/client";
import { convertToSVGPath } from "../utils/convertToSVGPath";
import { getQuadrantCoordinates } from "../utils/getQuadrantCoordinates";

export function ActivityModal({
  isOpen,
  activity,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  activity: Activity;
  onClose: () => void;
  onDelete?: () => void;
}) {
  if (!isOpen) return null;

  const activityPath = [activity].map((activity, index) => {
    if (!activity || typeof activity.summaryPolyline !== "string") return null;

    const quadrantCoordinates = getQuadrantCoordinates(
      activity.summaryPolyline,
      index,
      5,
      1,
      100,
      100,
    );
    return convertToSVGPath(quadrantCoordinates);
  });

  return (
    <div className="fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-xl rounded-lg border bg-white p-4">
        {activity.summaryPolyline ? (
          <div className="grid gap-4 rounded-md border bg-gray-100 p-4 sm:grid-cols-2">
            <div className="">
              <h2 className="text-xl font-bold">{activity.name}</h2>
              <div className="flex">
                <p className="mb-4 text-sm text-gray-500">
                  {new Date(activity.start_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <div className="mx-3 mt-2 h-1 w-1 rounded-full bg-gray-400"></div>
                <p className="mb-4 text-sm text-gray-500">{activity.type}</p>
              </div>
              <div className="flex items-center gap-2 text-left">
                <p>Distance:</p>
                <p>{humanFormat(activity.distance, { maxDecimals: 1 })}</p>
              </div>
              <div className="flex items-center gap-2 text-left">
                <p>Duration: </p>
                <p>
                  {humanFormat(activity.moving_time, {
                    scale: timeScale,
                    maxDecimals: 1,
                  })}
                </p>
              </div>
            </div>
            <div className="rounded-md border bg-white p-4">
              <div className="rounded-md border bg-white p-4">
                <svg width="100%" viewBox={`0 0 ${100} ${100}`}>
                  <path
                    d={activityPath[0]!}
                    fill="none"
                    stroke="black"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="non-interactive-path"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="">
            <div className="">
              <h2 className="text-xl font-bold">{activity.name}</h2>
              <div className="flex">
                <p className="mb-4 text-sm text-gray-500">
                  {new Date(activity.start_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <div className="mx-3 mt-2 h-1 w-1 rounded-full bg-gray-400"></div>
                <p className="mb-4 text-sm text-gray-500">{activity.type}</p>
              </div>
              <div className="flex items-center gap-2 text-left">
                <p>Distance:</p>
                <p>{humanFormat(activity.distance, { maxDecimals: 1 })}</p>
              </div>
              <div className="flex items-center gap-2 text-left">
                <p>Duration: </p>
                <p>
                  {humanFormat(activity.moving_time, {
                    scale: timeScale,
                    maxDecimals: 1,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Button onClick={onClose}>Close</Button>
          <Button onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
