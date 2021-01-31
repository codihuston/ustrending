import {
  useQuery,
} from 'react-query'

import { GoogleDailyTrend } from "../types";
import { fetchGoogleDailyTrends } from "../queries";

export function useGoogleDailyTrends(){
  return useQuery<GoogleDailyTrend[], Error>("googleDailyTrends", fetchGoogleDailyTrends);
}
