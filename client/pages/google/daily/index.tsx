import Head from "next/head";

import { Navigation } from "../../../components/Navigation";
import { GoogleDailyTrendsList } from "../../../components/GoogleDailyTrendsList";
import { GoogleDailyTrendsContainer } from "../../../components/containers/GoogleDailyTrendsContainer";
import { GoogleDailyTrendsByStateContainer } from "../../../components/containers/GoogleDailyTrendsByStateContainer";
import { GoogleDailyTrendsByState } from "../../../components/GoogleDailyTrendsByState";

export default function GoogleDaily() {
  return (
    <>
      <Head>Google Daily Trends</Head>
      <Navigation />
      <div>
        <GoogleDailyTrendsContainer>
          <GoogleDailyTrendsList googleDailyTrends={[]} />
        </GoogleDailyTrendsContainer>
        <GoogleDailyTrendsByStateContainer>
          <GoogleDailyTrendsByState googleDailyTrendsByState={[]} />
        </GoogleDailyTrendsByStateContainer>
      </div>
    </>
  );
}
