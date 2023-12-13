import type { Activity } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { LoadingSpinner } from "~/components/Loading";
import HeatmapPoster from "~/components/heatmap/poster";
import { useData } from "~/contexts/DataContext";
import { demoData1 } from "~/data/demoData1";
import { api } from "~/utils/api";
import { fromStravaActivity } from "~/utils/fromStravaActivity";

export default function HeatmapPosterPage() {
  const activityDataRef = useRef<Activity[]>([]);
  const { setActivities } = useData();
  const user = useSession().data?.user;

  // Fetch user account data to get access token
  const { data: accountData } = api.account.getAccountByUserId.useQuery(
    {
      userId: user?.id ?? "",
    },
    {
      enabled: user !== undefined,
    },
  );

  // Fetch user activity data
  const {
    data: activityDataFetched,
    isLoading: activityDataLoading,
    error: activityDataError,
  } = api.activities.fetchActivities.useQuery(
    {
      accessToken: accountData?.access_token ?? "",
    },
    {
      enabled: accountData !== undefined,
    },
  );

  useEffect(() => {
    let activityData = [] as Activity[];

    if (activityDataLoading) {
      activityData = [];
    } else if (activityDataFetched) {
      activityData = activityDataFetched;
    } else if (user === undefined) {
      activityData = demoData1.map((activity) => fromStravaActivity(activity));
    }

    activityDataRef.current = activityData;
    setActivities(activityData);
  }, [activityDataFetched, activityDataLoading, user, setActivities]);

  // Render editor
  return (
    <Layout>
      <div className="relative isolate mx-auto max-w-3xl">
        <Background />

        {/* {!user && <DemoBanner />} */}

        {user && activityDataLoading && (
          <div className="mt-4 flex justify-center">
            <LoadingSpinner size={40} />
          </div>
        )}

        {user && activityDataError && (
          <div className="mt-4 flex justify-center">
            <p>Error loading activities. Please try again later.</p>
          </div>
        )}

        <HeatmapPoster isLoading={activityDataLoading} />
      </div>
      {/* <Alert /> */}
    </Layout>
  );
}
