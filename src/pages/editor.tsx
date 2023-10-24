import { XMarkIcon } from "@heroicons/react/20/solid";
import { Activity } from "@prisma/client";
import { useSession } from "next-auth/react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { LoadingSpinner } from "~/components/Loading";
import Editor from "~/components/editor";
import Alert from "~/components/Alert";
import DemoBanner from "~/components/editor/DemoBanner";
import { activityDataDemo } from "~/components/editor/demoData/demoData";
import { api } from "~/utils/api";
import { fromStravaActivity } from "~/utils/fromStravaActivity";
import { useEffect, useState } from "react";
import { useData } from "~/contexts/DataContext";

export default function EditorPage() {
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
      activityData = activityDataDemo.map((activity) =>
        fromStravaActivity(activity),
      );
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
          {!user && <DemoBanner />}

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

          <Editor />
        </div>
      </div>
      {/* <Alert /> */}
    </Layout>
  );
}
