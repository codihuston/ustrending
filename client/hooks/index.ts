import {
  useQuery,
} from 'react-query'

import { GoogleDailyTrend, GoogleRealtimeTrend, Place, TwitterTrendsMap } from "../types";
import { fetchGoogleDailyTrends, fetchGoogleRealtimeTrends, fetchTwitterRealtimeTrends, fetchUSPlaces } from "../queries";

export function useGoogleDailyTrends(){
  return useQuery<GoogleDailyTrend[], Error>("googleDailyTrends", fetchGoogleDailyTrends);
}

export function useGoogleRealtimeTrends(){
  return useQuery<GoogleRealtimeTrend[], Error>("googleRealtimeTrends", fetchGoogleRealtimeTrends);
}

export function useTwitterRealtimeTrends(){
  return useQuery<TwitterTrendsMap, Error>("twitterRealtimeTrends", fetchTwitterRealtimeTrends); 
}

export function useUSPlaces(){
  return useQuery<Place[], Error>("USPlaces", fetchUSPlaces); 
}