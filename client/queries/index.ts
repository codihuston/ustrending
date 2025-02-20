import { http } from "../services";
import { AxiosError } from "axios";

import {
  GoogleDailyTrend,
  GoogleRealtimeTrend,
  GoogleRegionTrend,
} from "../types";

export async function fetchGoogleDailyTrends() {
  try {
    const { data } = await http.get<GoogleDailyTrend[]>("/google/trends/daily");
    return data;
  } catch (e) {
    console.error("Failed to get google daily trends: http", e?.response?.status, e?.response?.statusText);
  }
  return [];
}

export async function fetchGoogleDailyTrendsByState() {
  try {
    const { data } = await http.get<GoogleRegionTrend[]>(
      "/google/trends/daily/states"
    );
    return data;
  } catch (e) {
    console.error("Failed to get google region trends:", e?.response?.status, e?.response?.statusText);
  }
  return [];
}

/**
 * Returns Google Realtime Trends, with the ability to exclude duplicates
 * 
 * @param expand
 * @param hasDuplicates
 * @param maxNumTrends
 */
export async function fetchGoogleRealtimeTrends(
  expand: boolean,
  hasDuplicates: boolean,
  maxNumTrends: number
) {
  try {
    const { data } = await http.get<GoogleRealtimeTrend[]>(
      "/google/trends/realtime"
    );
    /**
     * Removes duplicate trending items (based on the title).
     * 
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
  } catch (e) {
    console.error("Failed to get google realtime trends:", e?.response?.status, e?.response?.statusText);
  }
  return [];
}

export async function fetchGoogleRealtimeTrendsByState(hasDuplicates) {
  try {
    const { data } = await http.get("/google/trends/realtime/states");

    /**
     * Removes duplicate trending items for each region (based on the title).
     * 
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
  } catch (e) {
    console.error("Failed to get google region trends by state:", e?.response?.status, e?.response?.statusText);
  }
  return [];
}

export async function fetchZipcode(
  zipcode: string,
  limit: number = 1
) {
  if (!zipcode) {
    return null;
  }

  try {
    const { data } = await http.get(`/zipcodes/${zipcode}`, {
      params: { limit },
    });
    return data;
  } catch (e) {
    console.error("Failed to get zipcode:", e?.response?.status, e?.response?.statusText);
  }
  return [];
}

export async function fetchNearestZipcodesByGPS(
  coordinates: [number, number],
  limit: number = 1
) {
  if (!coordinates) {
    return null;
  }

  try {
    const { data } = await http.get(`/zipcodes/nearest/point`, {
      params: {
        long: coordinates[0],
        lat: coordinates[1],
        limit: limit,
      },
    });
    return data;
  } catch (e) {
    console.error("Failed to get nearest zipcodes:", e?.response?.status, e?.response?.statusText);
  }
  return [];
}
