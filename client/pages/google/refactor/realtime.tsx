import GoogleTrendsPage from "./GoogleTrendsPage";

import {
  fetchGoogleDailyTrends,
  fetchGoogleDailyTrendsByState,
} from "../../../queries";
import {
  useDebouncedCallback,
  useGoogleRealtimeTrends,
  useGooleRealtimeTrendsByState,
} from "../../../hooks";

function getGoogleTrendNames(googleTrends, maxNumTrendsToShow) {
  return googleTrends
    .map((trends) => trends.title)
    .slice(0, maxNumTrendsToShow);
}

export default function Daily() {
  const hasDuplicates = false;
  const MAX_NUM_GOOGLE_REGION_TRENDS = 50;
  // data
  const useGoogleRealtimeTrendsHook = useGoogleRealtimeTrends(
    // expand comma-delimited realtime trends
    true,
    // remove duplicates
    hasDuplicates,
    // total limit
    MAX_NUM_GOOGLE_REGION_TRENDS
  );
  const useGoogleRealtimeTrendsByStateHook = useGooleRealtimeTrendsByState(
    // remove duplicates
    hasDuplicates
  );
  const googleTrends = useGoogleRealtimeTrendsHook.data;
  const googleRegionTrends = useGoogleRealtimeTrendsByStateHook.data;

  return (
    <GoogleTrendsPage
      googleTrends={googleTrends}
      googleRegionTrends={googleRegionTrends}
      getGoogleTrendNames={getGoogleTrendNames}
    />
  );
}
