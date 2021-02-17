import { http } from "../services";

import { GoogleRealtimeTrend } from "../types";

export async function fetchGoogleDailyTrends() {
  const { data } = await http.get("/api/google/trends/daily");
  return data;
}

export async function fetchGoogleDailyTrendsByState() {
  const { data } = await http.get("/api/google/trends/daily/states");
  return data;
}

/**
 * TODO: remove duplicates?
 * @param expand
 * @param maxNumTrends
 */
export async function fetchGoogleRealtimeTrends(
  expand: boolean,
  maxNumTrends: number
) {
  const { data } = await http.get<GoogleRealtimeTrend[]>(
    "/api/google/trends/realtime"
  );
  // expand list based on comma-delimited trending topics
  if (expand) {
    let temp: GoogleRealtimeTrend[] = [];
    for (const trend of data) {
      const titles = trend.title.split(",");
      for (const title of titles) {
        if (temp.length >= maxNumTrends) {
          break;
        }

        const curatedTrend: GoogleRealtimeTrend = {
          title: title.trim(),
          image: trend.image,
          articles: trend.articles,
        };
        temp = temp.concat(curatedTrend);
      }
    }
    return temp;
  }
  return data;
}

/**
 * TODO: remove duplicates?
 *
 */
export async function fetchGoogleRealtimeTrendsByState() {
  const { data } = await http.get("/api/google/trends/realtime/states");
  return data;
}

export async function fetchTwitterRealtimeTrends() {
  const { data } = await http.get("/api/twitter/trends");
  return data;
}

export async function fetchUSPlaces() {
  const { data } = await http.get("/api/places/US");
  return data;
}
