import { useSession } from "next-auth/react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import Editor from "~/components/editor/Editor";
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
  const { data: activityDataFetched, isLoading: activityDataLoading } =
    api.activities.fetchActivities.useQuery(
      {
        accessToken: accountData?.access_token ?? "",
      },
      {
        enabled: accountData !== undefined,
      },
    );

  // Set activity data
  if (!user || activityDataFetched === undefined) {
    // Use demo data if user is not logged in
    activityData = activityDataDemo.map((activity) =>
      fromStravaActivity(activity),
    );
  } else {
    activityData = activityDataFetched;
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
          <Editor activities={activityData} />
        </div>
      </div>
    </Layout>
  );
}
