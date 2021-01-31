import {
  useQuery,
} from 'react-query'

import { GoogleDailyTrend, GoogleRealtimeTrend } from "../types";
import { fetchGoogleDailyTrends, fetchGoogleRealtimeTrends } from "../queries";

export function useGoogleDailyTrends(){
  return useQuery<GoogleDailyTrend[], Error>("googleDailyTrends", fetchGoogleDailyTrends);
}

export function useGoogleRealtimeTrends(){
  return useQuery<GoogleRealtimeTrend[], Error>("googleRealtimeTrends", fetchGoogleRealtimeTrends);
}