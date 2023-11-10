import type { Activity } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { LoadingSpinner } from "~/components/Loading";
import Bubbles from "~/components/bubbles";
import Editor from "~/components/editor";
import DemoBanner from "~/components/editor/DemoBanner";
import { useData } from "~/contexts/DataContext";
import { demoData1 } from "~/data/demoData1";
import { api } from "~/utils/api";
import { fromStravaActivity } from "~/utils/fromStravaActivity";

export default function DashboardPage() {
  let activityData;
  const { activities, setActivities } = useData();
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
      enabled: accountData !== undefined && activities.length == 0,
    },
  );

  useEffect(() => {
    // Set activity data
    if (activityDataFetched) {
      // Use demo data if user is not logged in
      activityData = activityDataFetched;
    } else if (user && !activityDataFetched) {
      activityData = [] as Activity[];
    } else {
      // Use demo data if user is not logged in
      activityData = demoData1.map((activity) => fromStravaActivity(activity));
    }
    if (activities.length == 0) setActivities(activityData);
  }, [activityDataFetched]);

  // // Render loading screen
  // if (activityDataLoading) {
  //   return (
  //     <Layout>
  //       <LoadingPage />
  //     </Layout>
  //   );
  // }

  // Render editor
  return (
    <Layout>
      <div className="relative isolate">
        <Background />
        <div className="mx-auto max-w-4xl overflow-hidden">
          <div className="m-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/editor"
              className="h-96 rounded-2xl border bg-white p-4 hover:bg-gray-50"
            >
              Collage
            </Link>
            <Link
              href="/bubbles"
              className="h-96 rounded-2xl border bg-white p-4 hover:bg-gray-50"
            >
              Bubbles
            </Link>
          </div>
        </div>
      </div>
      {/* <Alert /> */}
    </Layout>
  );
}
