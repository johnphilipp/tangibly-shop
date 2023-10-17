// other imports
import { z, ZodError } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"; // Adjust the import based on your project structure
import axios from "axios";
import { TRPCError } from "@trpc/server";

interface Athlete {
  id: number;
  resource_state: number;
}

interface Map {
  id: string;
  summary_polyline: string;
  resource_state: number;
}

interface Activity {
  resource_state: number;
  athlete: Athlete;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type?: number;
  id: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  location_city: null | string;
  location_state: null | string;
  location_country: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: Map;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gear_id: null | string;
  start_latlng: number[];
  end_latlng: number[];
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  has_heartrate: boolean;
  average_heartrate: number;
  max_heartrate: number;
  heartrate_opt_out: boolean;
  display_hide_heartrate_option: boolean;
  elev_high?: number;
  elev_low?: number;
  upload_id: number;
  upload_id_str: string;
  external_id: string;
  from_accepted_tag: boolean;
  pr_count: number;
  total_photo_count: number;
  has_kudoed: boolean;
}

interface FlattenedActivity {
  athlete: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type?: number;
  id: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  location_city: null | string;
  location_state: null | string;
  location_country: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  mapId: string;
  summaryPolyline: string;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gear_id: null | string;
  start_latlng: number[];
  end_latlng: number[];
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  has_heartrate: boolean;
  average_heartrate: number;
  max_heartrate: number;
  heartrate_opt_out: boolean;
  display_hide_heartrate_option: boolean;
  elev_high?: number;
  elev_low?: number;
  upload_id: number;
  upload_id_str: string;
  external_id: string;
  from_accepted_tag: boolean;
  pr_count: number;
  total_photo_count: number;
  has_kudoed: boolean;
}

type ActivitiesResponse = Activity[];

const GetActivitiesInput = z.object({
  accessToken: z.string(),
  after: z.number().optional(),
  perPage: z.number().optional(),
});

// TODO:
// Add Activity to Prisma model
// Check if user has activites
// If yes, get latest timestamp from db --> Fetch api with after=timestamp --> save to db
// If no, fetch api --> save to db
// Return allactivities from db

export const activitiesRouter = createTRPCRouter({
  fetchActivities: protectedProcedure
    .input(GetActivitiesInput)
    .query(async ({ ctx, input }) => {
      console.log(input);
      console.log(ctx.session?.user);

      try {
        // Build url
        let url;
        if (input.after && input.perPage) {
          url = `https://www.strava.com/api/v3/athlete/activities?after=${input.after}&per_page=${input.perPage}`;
        } else if (input.after) {
          url = `https://www.strava.com/api/v3/athlete/activities?after=${input.after}&per_page=200`;
        } else if (input.perPage) {
          url = `https://www.strava.com/api/v3/athlete/activities?per_page=${input.perPage}`;
        } else {
          url = `https://www.strava.com/api/v3/athlete/activities?per_page=200`;
        }

        // Prepare the axios configuration
        const config = {
          method: "get",
          url: url,
          headers: {
            Authorization: `Bearer ${input.accessToken}`, // it's more secure to use the 'Authorization' header
          },
        };

        // Make the request to the Strava API
        const response = await axios(config);
        const activities: ActivitiesResponse =
          response.data as ActivitiesResponse;

        // Return the data from the response
        if (!activities) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No activities found",
          });
        }

        return activities.map((activity) => flattenActivity(activity));
      } catch (error) {
        // If there's an HTTP error, throw a TRPCError with the message from the error
        if (axios.isAxiosError(error)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        } else if (error instanceof ZodError) {
          // If there's a validation error, throw a TRPCError with details
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        } else {
          // For any other errors, throw a generic server error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }
      }
    }),
});

function flattenActivity(activity: Activity): FlattenedActivity {
  return {
    athlete: activity.athlete.id,
    name: activity.name,
    distance: activity.distance,
    moving_time: activity.moving_time,
    elapsed_time: activity.elapsed_time,
    total_elevation_gain: activity.total_elevation_gain,
    type: activity.type,
    sport_type: activity.sport_type,
    workout_type: activity.workout_type,
    id: activity.id,
    start_date: activity.start_date,
    start_date_local: activity.start_date_local,
    timezone: activity.timezone,
    utc_offset: activity.utc_offset,
    location_city: activity.location_city,
    location_state: activity.location_state,
    location_country: activity.location_country,
    achievement_count: activity.achievement_count,
    kudos_count: activity.kudos_count,
    comment_count: activity.comment_count,
    athlete_count: activity.athlete_count,
    photo_count: activity.photo_count,
    mapId: activity.map.id,
    summaryPolyline: activity.map.summary_polyline,
    trainer: activity.trainer,
    commute: activity.commute,
    manual: activity.manual,
    private: activity.private,
    visibility: activity.visibility,
    flagged: activity.flagged,
    gear_id: activity.gear_id,
    start_latlng: activity.start_latlng,
    end_latlng: activity.end_latlng,
    average_speed: activity.average_speed,
    max_speed: activity.max_speed,
    average_cadence: activity.average_cadence,
    has_heartrate: activity.has_heartrate,
    average_heartrate: activity.average_heartrate,
    max_heartrate: activity.max_heartrate,
    heartrate_opt_out: activity.heartrate_opt_out,
    display_hide_heartrate_option: activity.display_hide_heartrate_option,
    elev_high: activity.elev_high,
    elev_low: activity.elev_low,
    upload_id: activity.upload_id,
    upload_id_str: activity.upload_id_str,
    external_id: activity.external_id,
    from_accepted_tag: activity.from_accepted_tag,
    pr_count: activity.pr_count,
    total_photo_count: activity.total_photo_count,
    has_kudoed: activity.has_kudoed,
  };
}
