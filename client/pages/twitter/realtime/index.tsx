import Head from "next/head";

import Navigation from "../../../components/Navigation";
import TwitterRealtimeTrendsContainer from "../../../components/containers/TwitterRealtimeTrendsContainer";
import PlacesContainer from "../../../components/containers/PlacesContainer";
import TwitterRealtimeTrendsList from "../../../components/TwitterRealtimeTrendsList";

export default function TwitterRealtimeTrends() {
  return (
    <>
      <Head>Twitter Realtime Trends</Head>
      <Navigation />
      <div>
        <TwitterRealtimeTrendsContainer>
          <PlacesContainer>
            <TwitterRealtimeTrendsList places={[]} twitterRealtimeTrends={{}} />
          </PlacesContainer>
        </TwitterRealtimeTrendsContainer>
      </div>
    </>
  );
}
