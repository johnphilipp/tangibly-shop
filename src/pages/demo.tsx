import { XMarkIcon } from "@heroicons/react/20/solid";
import type { Activity } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { LoadingSpinner } from "~/components/Loading";
import CollageMug from "~/components/collage/mug";
import { useData } from "~/contexts/DataContext";
import { demoData1 } from "~/data/demoData1";
import { api } from "~/utils/api";
import { fromStravaActivity } from "~/utils/fromStravaActivity";

export default function CollageMugPage() {
  const activityDataRef = useRef<Activity[]>([]);
  const { setActivities } = useData();
  const user = useSession().data?.user;
  const [showBanner, setShowBanner] = useState(true);

  let activityData = [] as Activity[];

  activityData = [];
  activityData = demoData1.map((activity) => fromStravaActivity(activity));

  activityDataRef.current = activityData;
  setActivities(activityData);

  return (
    <Layout>
      <div className="relative isolate mx-auto max-w-3xl">
        <Background />

        <div className="pointer-events-none mt-0 sm:mt-4 sm:flex sm:justify-center">
          <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-gray-900 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
            <p className="text-sm leading-6 text-white">
              <strong className="font-semibold">Demo</strong>
              <svg
                viewBox="0 0 2 2"
                className="mx-2 inline h-0.5 w-0.5 fill-current"
                aria-hidden="true"
              >
                <circle cx={1} cy={1} r={1} />
              </svg>
              <Link href="/api/auth/signin" className="underline">
                Log in to Strava
              </Link>{" "}
              to interact with your own activities
            </p>
            <button
              type="button"
              className="-m-1.5 flex-none p-1.5"
              onClick={() => setShowBanner(false)}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* {!user && <DemoBanner />} */}

        {/* <CollageMug isLoading={false} /> */}
      </div>
      {/* <Alert /> */}
    </Layout>
  );
}
