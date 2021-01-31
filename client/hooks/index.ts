import {
  useQuery,
} from 'react-query'

import { GoogleDailyTrend, GoogleRegionTrend, GoogleRealtimeTrend, Place, TwitterTrendsMap } from "../types";
import { fetchGoogleDailyTrends, fetchGoogleDailyTrendsByState, fetchGoogleRealtimeTrends, fetchTwitterRealtimeTrends, fetchUSPlaces } from "../queries";

export function useGoogleDailyTrends(){
  return useQuery<GoogleDailyTrend[], Error>("googleDailyTrends", fetchGoogleDailyTrends);
}

export function useGoogleDailyTrendsByState(){
  return useQuery<GoogleRegionTrend[], Error>("googleDailyTrendsByState", fetchGoogleDailyTrendsByState);
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