import { useRef, useEffect } from "react";
import { useQuery } from "react-query";

import {
  GoogleDailyTrend,
  GoogleRegionTrend,
  GoogleRealtimeTrend,
  ZipCode
} from "../types";
import {
  fetchGoogleDailyTrends,
  fetchGoogleDailyTrendsByState,
  fetchGoogleRealtimeTrends,
  fetchGoogleRealtimeTrendsByState,
  fetchNearestZipcodesByGPS,
  fetchZipcode,
} from "../queries";

const DEFAULT_REACT_QUERY_OPTIONS = {
  staleTime: 60000,
  refetchOnMount: false,
};

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
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  }

  // make sure our timeout gets cleared if
  // our consuming component gets unmounted
  useEffect(() => cleanup, []);

  return function debouncedCallback(...args: A) {
    // capture latest args
    argsRef.current = args;

    // clear debounce timer
    cleanup();

    // start waiting again
    timeout.current = setTimeout(() => {
      if (argsRef.current) {
        callback(...argsRef.current);
      }
    }, wait);
  };
}

export function useGoogleDailyTrends() {
  return useQuery<GoogleDailyTrend[], Error>(
    "googleDailyTrends",
    fetchGoogleDailyTrends,
    DEFAULT_REACT_QUERY_OPTIONS
  );
}

export function useGoogleDailyTrendsByState() {
  return useQuery<GoogleRegionTrend[], Error>(
    "googleDailyTrendsByState",
    fetchGoogleDailyTrendsByState,
    DEFAULT_REACT_QUERY_OPTIONS
  );
}

export function useGoogleRealtimeTrends(
  expand: boolean,
  hasDuplicates: boolean,
  maxNumTrends: number
) {
  // ref: https://github.com/tannerlinsley/react-query/discussions/442
  return useQuery<GoogleRealtimeTrend[], Error>(
    "googleRealtimeTrends",
    () => fetchGoogleRealtimeTrends(expand, hasDuplicates, maxNumTrends),
    DEFAULT_REACT_QUERY_OPTIONS
  );
}

export function useGooleRealtimeTrendsByState(hasDuplicates: boolean) {
  return useQuery<GoogleRegionTrend[], Error>(
    "googleRealtimeTrendsByState",
    () => fetchGoogleRealtimeTrendsByState(hasDuplicates),
    DEFAULT_REACT_QUERY_OPTIONS
  );
}

export function useZipcode(zipcode: string, limit: number = 1) {
  return useQuery<ZipCode, Error>(
    ["zipcode", zipcode],
    () => fetchZipcode(zipcode, limit),
    DEFAULT_REACT_QUERY_OPTIONS
  );
}

export function useZipcodesByGPS(coordinates: [number, number], limit: number) {
  return useQuery<ZipCode[], Error>(
    ["zipcodes", coordinates],
    () => fetchNearestZipcodesByGPS(coordinates, limit),
    DEFAULT_REACT_QUERY_OPTIONS
  );
}
