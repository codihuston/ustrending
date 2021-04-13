import GoogleTrendsPage from "./GoogleTrendsPage";

import Head from "next/head";
import Layout from "../../../components/Layout";
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

function getGoogleTrendArticles(googleTrends, selectedTrend) {
  return selectedTrend
    ? googleTrends
        .filter((trend) => trend.title.query === selectedTrend)
        .map((trend) => {
          return trend.articles;
        })
        .flat(1)
    : [];
}

function getCountryTrendName(googleTrends, trendNumberToShow) {
  return googleTrends && googleTrends[trendNumberToShow]
    ? googleTrends[trendNumberToShow]?.title?.query
    : null;
}

export default function Daily() {
  // data
  const useGoogleDailyTrendsHook = useGoogleDailyTrends();
  const useGoogleDailyTrendsByStateHook = useGoogleDailyTrendsByState();
  const googleTrends = useGoogleDailyTrendsHook.data;
  const googleRegionTrends = useGoogleDailyTrendsByStateHook.data;

  return (
    <Layout>
      <Head>
        <title>Google Daily Trends | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <h2>Trending Today on Google</h2>
      <GoogleTrendsPage
        googleTrends={googleTrends}
        googleRegionTrends={googleRegionTrends}
        getGoogleTrendNames={getGoogleTrendNames}
        getGoogleTrendArticles={getGoogleTrendArticles}
        getCountryTrendName={getCountryTrendName}
      />
    </Layout>
  );
}
