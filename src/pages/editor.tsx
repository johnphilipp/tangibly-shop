import { XMarkIcon } from "@heroicons/react/20/solid";
import { Activity } from "@prisma/client";
import { useSession } from "next-auth/react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { LoadingSpinner } from "~/components/Loading";
import Editor from "~/components/editor";
import Alert from "~/components/editor/Alert";
import DemoBanner from "~/components/editor/DemoBanner";
import { activityDataDemo } from "~/components/editor/demoData/demoData";
import { api } from "~/utils/api";
import { fromStravaActivity } from "~/utils/fromStravaActivity";

export default function EditorPage() {
  let activityData;
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

          <Editor activities={activityData} />
        </div>
      </div>
      {/* <Alert /> */}
    </Layout>
  );
}
