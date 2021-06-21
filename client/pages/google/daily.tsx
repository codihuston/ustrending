import GoogleTrendsPage from "../../components/pages/GoogleTrendsPage";

import Head from "next/head";
import Layout from "../../components/Layout";
import {
  fetchGoogleDailyTrends,
  fetchGoogleDailyTrendsByState,
} from "../../queries";
import {
  useDebouncedCallback,
  useGoogleDailyTrends,
  useGoogleDailyTrendsByState,
} from "../../hooks";

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
      />
    </Layout>
  );
}
