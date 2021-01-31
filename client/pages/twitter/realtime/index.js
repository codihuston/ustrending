import Head from "next/head";

import { Navigation } from "../../../components/Navigation";
import { PlacesContainer } from "../../../components/containers/PlacesContainer";
import { TwitterRealtimeTrendsList } from "../../../components/TwitterRealtimeTrendsList";

export default function TwitterRealtimeTrends() {
  return (
    <>
      <Head>Twitter Realtime Trends</Head>
      <Navigation />
      <div>
        {/* TODO: pass places into this component? */}
        <PlacesContainer>
          <TwitterRealtimeTrendsList />
        </PlacesContainer>
      </div>
    </>
  );
}
