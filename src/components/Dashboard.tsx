import type { Activity } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
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

const posts = [
  {
    id: 1,
    href: "/editor",
    title: "Collage",
    description:
      "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.",
    imageUrl: "/collage-1.png",
    date: "Mar 16, 2020",
    datetime: "2020-03-16",
  },
  {
    id: 2,
    href: "/bubbles",
    title: "Bubbles",
    description:
      "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.",
    imageUrl: "/bubbles-1.jpg",
    date: "Mar 16, 2020",
    datetime: "2020-03-16",
  },
];

export default function Dashboard() {
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
          <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Dashboard
                </h2>
                <p className="mt-2 text-lg leading-8 text-gray-600">
                  Your adventures. Made tangible.
                </p>
              </div>
              <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80"
                    href={post.href}
                  >
                    <Image
                      src={post.imageUrl}
                      alt=""
                      className="absolute inset-0 -z-10 h-full w-full object-cover"
                      width={1000}
                      height={1000}
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                    <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                    <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
                      <time dateTime={post.datetime} className="mr-8">
                        {post.date}
                      </time>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                      <a href={post.href}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </a>
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Alert /> */}
    </Layout>
  );
}
