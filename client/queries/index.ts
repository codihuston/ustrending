import { http } from "../services";

import { GoogleRealtimeTrend, GoogleRegionTrend } from "../types";

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
  hasDuplicates: boolean,
  maxNumTrends: number
) {
  const { data } = await http.get<GoogleRealtimeTrend[]>(
    "/api/google/trends/realtime"
  );

  /**
   * Removes duplicate trending items (based on the title)
   * @param items
   */
  const removeDuplicates = (
    items: GoogleRealtimeTrend[]
  ): GoogleRealtimeTrend[] => {
    const cache = new Map<string, boolean>();
    let result: GoogleRealtimeTrend[] = [];

    for (const item of items) {
      if (!cache.get(item.title)) {
        result = result.concat(item);
      }
      cache.set(item.title, true);
    }
    return result;
  };

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
    return hasDuplicates ? temp : removeDuplicates(temp);
  }
  return hasDuplicates ? data : removeDuplicates(data);
}

export async function fetchGoogleRealtimeTrendsByState(hasDuplicates) {
  const { data } = await http.get("/api/google/trends/realtime/states");

  /**
   * Removes duplicate trending items for each region (based on the title)
   * @param items
   */
  const removeDuplicates = (items: GoogleRegionTrend[]) => {
    let result: GoogleRegionTrend[] = [];

    for (const item of items) {
      let dedupedTrends = [];
      const cache = new Map<string, boolean>();
      for (const trends of item.trends) {
        if (!cache.get(trends.topic)) {
          dedupedTrends = dedupedTrends.concat(trends);
        }
        cache.set(trends.topic, true);
      }
      item.trends = dedupedTrends;
      result = result.concat(item);
    }
    return result;
  };

  return hasDuplicates ? data : removeDuplicates(data);
}

export async function fetchTwitterRealtimeTrends() {
  const { data } = await http.get("/api/twitter/trends");
  return data;
}

export async function fetchUSPlaces() {
  const { data } = await http.get("/api/places/US");
  return data;
}
