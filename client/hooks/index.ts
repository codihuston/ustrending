import { useRef, useEffect } from 'react';
import { useQuery } from "react-query";

import {
  GoogleDailyTrend,
  GoogleRegionTrend,
  GoogleRealtimeTrend,
  Place,
  TwitterTrendsMap,
} from "../types";
import {
  fetchGoogleDailyTrends,
  fetchGoogleDailyTrendsByState,
  fetchGoogleRealtimeTrends,
  fetchGoogleRealtimeTrendsByState,
  fetchTwitterRealtimeTrends,
  fetchUSPlaces,
} from "../queries";

/**
 * Executes a callback in a debounced manner
 * 
 * Ref: bingles @ https://stackoverflow.com/questions/56283920/how-to-debounce-a-callback-in-functional-component-using-hooks
 * @param callback 
 * @param wait 
 */
export function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  wait: number
) {
  // track args & timeout handle between calls
  const argsRef = useRef<A>();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  function cleanup() {
    if(timeout.current) {
      clearTimeout(timeout.current);
    }
  }

  // make sure our timeout gets cleared if
  // our consuming component gets unmounted
  useEffect(() => cleanup, []);

  return function debouncedCallback(
    ...args: A
  ) {
    // capture latest args
    argsRef.current = args;

    // clear debounce timer
    cleanup();

    // start waiting again
    timeout.current = setTimeout(() => {
      if(argsRef.current) {
        callback(...argsRef.current);
      }
    }, wait);
  };
}

export function useGoogleDailyTrends() {
  return useQuery<GoogleDailyTrend[], Error>(
    "googleDailyTrends",
    fetchGoogleDailyTrends
  );
}

export function useGoogleDailyTrendsByState() {
  return useQuery<GoogleRegionTrend[], Error>(
    "googleDailyTrendsByState",
    fetchGoogleDailyTrendsByState
  );
}

export function useGoogleRealtimeTrends() {
  return useQuery<GoogleRealtimeTrend[], Error>(
    "googleRealtimeTrends",
    fetchGoogleRealtimeTrends
  );
}

export function useGooleRealtimeTrendsByState() {
  return useQuery<GoogleRegionTrend[], Error>(
    "googleRealtimeTrendsByState",
    fetchGoogleRealtimeTrendsByState
  );
}

export function useTwitterRealtimeTrends() {
  return useQuery<TwitterTrendsMap, Error>(
    "twitterRealtimeTrends",
    fetchTwitterRealtimeTrends
  );
}

export function useUSPlaces() {
  return useQuery<Place[], Error>("USPlaces", fetchUSPlaces);
}