import GoogleTrendsPage from "./GoogleTrendsPage";

import {
  fetchGoogleDailyTrends,
  fetchGoogleDailyTrendsByState,
} from "../../../queries";
import {
  useDebouncedCallback,
  useGoogleDailyTrends,
  useGoogleDailyTrendsByState,
} from "../../../hooks";

function getGoogleTrendNames(googleTrends, maxNumTrendsToShow) {
  return googleTrends
    .map((trends) => trends.title.query)
    .slice(0, maxNumTrendsToShow);
}

export default function Daily() {
  // data
  const useGoogleDailyTrendsHook = useGoogleDailyTrends();
  const useGoogleDailyTrendsByStateHook = useGoogleDailyTrendsByState();
  const googleTrends = useGoogleDailyTrendsHook.data;
  const googleRegionTrends = useGoogleDailyTrendsByStateHook.data;

  return (
    <GoogleTrendsPage
      googleTrends={googleTrends}
      googleRegionTrends={googleRegionTrends}
      getGoogleTrendNames={getGoogleTrendNames}
    />
  );
}
