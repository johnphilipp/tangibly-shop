import { useSession } from "next-auth/react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { LoadingPage } from "~/components/Loading";
import Editor from "~/components/editor/Editor";
import { activityDataDemo } from "~/components/editor/demoData/demoData";
import { api } from "~/utils/api";
import { flattenActivity } from "~/utils/flattenActivity";

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
      flattenActivity(activity),
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

  console.log(activityData);

  // Render editor
  return (
    <Layout>
      <div className="relative isolate">
        <Background />
        <div className="overflow-hidden">
          <Editor activities={activityData} />
        </div>
      </div>
    </Layout>
  );
}
