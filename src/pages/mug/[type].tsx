import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { LoadingSpinner } from "~/components/Loading";
import { useData } from "~/contexts/DataContext";
import { api } from "~/utils/api";
import { router } from "next/client";
import { useRouter } from "next/router";
import CollageMug from "~/components/mug";

function getFirstString(
  value: undefined | string[] | string,
): string | undefined {
  if (Array.isArray(value)) {
    // value is an array, return the first element
    return value[0];
  }
  return value;
}

export default function CollageMugPage() {
  const { setActivities } = useData();

  const { type } = useRouter().query;

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

        <CollageMug
          isLoading={activityDataLoading}
          type={getFirstString(type)}
        />
      </div>
    </Layout>
  );
}
