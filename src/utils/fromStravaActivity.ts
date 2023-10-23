import { type Activity } from '@prisma/client';

interface Athlete {
  id: number;
  resource_state: number;
}

interface Map {
  id: string;
  summary_polyline: string;
  resource_state: number;
}

export interface StravaActivity {
  resource_state: number;
  athlete: Athlete;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type?: number | null;
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
  average_temp?: null | number;
  average_watts?: null | number;
  kilojoules?: null | number;
  device_watts?: false,
  average_cadence?: number;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
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


export function fromStravaActivity(activity: StravaActivity): Activity {
  return {
    athlete: activity.athlete.id.toString(),
    name: activity.name,
    distance: activity.distance,
    moving_time: activity.moving_time,
    elapsed_time: activity.elapsed_time,
    total_elevation_gain: activity.total_elevation_gain,
    type: activity.type,
    sport_type: activity.sport_type,
    workout_type: activity.workout_type ?? null,
    id: BigInt(activity.id),
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
    lat_start: activity.start_latlng[0] ?? 0,
    lng_start: activity.start_latlng[1] ?? 0,
    lat_end: activity.end_latlng[0] ?? 0,
    lng_end: activity.end_latlng[1] ?? 0,
    average_speed: activity.average_speed,
    max_speed: activity.max_speed,
    average_cadence: activity.average_cadence ?? null,
    has_heartrate: activity.has_heartrate,
    average_heartrate: activity.average_heartrate ?? 0,
    max_heartrate: activity.max_heartrate ?? 0,
    heartrate_opt_out: activity.heartrate_opt_out,
    display_hide_heartrate_option: activity.display_hide_heartrate_option,
    elev_high: activity.elev_high ?? null,
    elev_low: activity.elev_low ?? null,
    upload_id: BigInt(activity.upload_id),
    upload_id_str: activity.upload_id_str,
    external_id: activity.external_id,
    from_accepted_tag: activity.from_accepted_tag,
    pr_count: activity.pr_count,
    total_photo_count: activity.total_photo_count,
    has_kudoed: activity.has_kudoed,
  };
}
