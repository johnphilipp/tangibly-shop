import { useSession } from "next-auth/react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { LoadingPage } from "~/components/Loading";
import Editor from "~/components/editor/Editor";
import { FlattenedActivity } from "~/server/api/routers/activities";
import { api } from "~/utils/api";

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

  // Fetch demo activity data
  const activityDataDemo: FlattenedActivity[] = [
    {
      athlete: 19852074,
      name: "happy sunday fellas ☀️",
      distance: 6008.1,
      moving_time: 1469,
      elapsed_time: 1487,
      total_elevation_gain: 59.4,
      type: "Run",
      sport_type: "Run",
      workout_type: 0, // This is optional in your type; make sure it is either `number` or `undefined`.
      id: 9997438081,
      start_date: "2023-10-08T04:58:19Z",
      start_date_local: "2023-10-08T06:58:19Z",
      timezone: "(GMT+01:00) Europe/Berlin",
      utc_offset: 7200,
      location_city: null, // This is fine since it can be `null | string`.
      location_state: null, // This is fine since it can be `null | string`.
      location_country: "", // This is fine since it is of type `string`.
      achievement_count: 28,
      kudos_count: 11,
      comment_count: 0,
      athlete_count: 1,
      photo_count: 0,
      mapId: "a9997438081",
      summaryPolyline: "qxt_ImbypAE?GBa@IG...", // Shortened for brevity; keep your original one.
      trainer: false,
      commute: false,
      manual: false,
      private: false,
      visibility: "everyone",
      flagged: false,
      gear_id: null, // This is fine since it can be `null | string`.
      start_latlng: [52.540416, 13.404715],
      end_latlng: [52.545201, 13.409178],
      average_speed: 4.09,
      max_speed: 6.88,
      has_heartrate: false, // This is mandatory, so it's correctly set.
      average_heartrate: 0, // You need to provide a default value if it's missing. It seems it was missing in your data.
      max_heartrate: 0, // You need to provide a default value if it's missing. It seems it was missing in your data.
      heartrate_opt_out: false,
      display_hide_heartrate_option: false,
      elev_high: 57.2, // This is optional in your type; make sure it is either `number` or `undefined`.
      elev_low: 48.4, // This is optional in your type; make sure it is either `number` or `undefined`.
      upload_id: 10712727675,
      upload_id_str: "10712727675",
      external_id: "0A982020-1C66-468B-85CE-AC3AC232A373-activity.fit",
      from_accepted_tag: false,
      pr_count: 6,
      total_photo_count: 1,
      has_kudoed: false,
      // The field 'average_cadence' is missing in your original data. If it's mandatory, you need to provide a value.
      // Since it's a number, let's set it to 0 or any appropriate default value.
      average_cadence: 0, // Add default value or actual value if available.
    },
  ];

  // Set activity data
  if (!user ?? activityDataFetched === undefined) {
    activityData = activityDataDemo;
  } else {
    activityData = activityDataFetched;
  }

  // Render loading screen
  if (activityDataLoading) {
    return (
      <Layout>
        <LoadingPage />
      </Layout>
    );
  }

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
