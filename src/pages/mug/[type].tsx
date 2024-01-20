import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { useData } from "~/contexts/DataContext";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import CollageMug from "~/components/mug";
import { MdDirectionsBike } from "react-icons/md";
import { MdDirectionsRun } from "react-icons/md";
import { GrSwim } from "react-icons/gr";
import { MdOutlineSportsHandball } from "react-icons/md";
import { MdOutlineSportsMartialArts } from "react-icons/md";
import { GrYoga } from "react-icons/gr";

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

  const [currentIcon, setCurrentIcon] = useState(0);
  const icons = [
    <MdDirectionsBike key="1" className="h-16 w-16" />,
    <MdDirectionsRun key="2" className="h-16 w-16" />,
    <GrSwim key="3" className="h-16 w-16" />,
    <GrYoga key="4" className="h-16 w-16" />,
    <MdOutlineSportsHandball key="5" className="h-16 w-16" />,
    <MdOutlineSportsMartialArts key="6" className="h-16 w-16" />,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((currentIcon + 1) % icons.length);
    }, 250);
    return () => clearInterval(interval);
  }, [currentIcon]);

  return (
    <Layout>
      <div className="relative isolate mx-auto max-w-3xl">
        <Background />

        {user && activityDataError && (
          <div className="mt-4 flex justify-center">
            <p>Error loading activities. Please try again later.</p>
          </div>
        )}

        {user && activityDataLoading ? (
          <div className="my-4 sm:my-6">
            <div className="mx-auto flex items-center justify-center">
              {icons[currentIcon]}
            </div>
            <div className="mx-auto mt-4 flex items-center justify-center text-center font-bold">
              Hang on, {user.name ? user.name : ""}!
            </div>
            <div className="mx-auto flex items-center justify-center text-center text-sm">
              We&apos;re loading your activities. This might take a while.
            </div>
          </div>
        ) : (
          <CollageMug
            isLoading={activityDataLoading}
            type={getFirstString(type)}
          />
        )}
      </div>
    </Layout>
  );
}
