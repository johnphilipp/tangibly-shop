import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { LoadingSpinner } from "~/components/Loading";
import CollagePoster from "~/components/collage/poster";
import { useData } from "~/contexts/DataContext";
import { api } from "~/utils/api";

export default function CollagePosterPage() {
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
    if (activityDataFetched) {
      setActivities(activityDataFetched);
    } else {
      setActivities([]);
    }
  }, [activityDataFetched, setActivities]);

  // Render editor
  return (
    <Layout>
      <div className="relative isolate mx-auto max-w-3xl">
        <Background />

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

        <CollagePoster isLoading={activityDataLoading} />
      </div>
    </Layout>
  );
}
