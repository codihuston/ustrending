import Head from "next/head";

import { Navigation } from "../../../components/Navigation";
import { GoogleRealtimeTrendsContainer } from "../../../components/containers/GoogleRealtimeTrendsContainer";
import { GoogleRealtimeTrendsList } from "../../../components/GoogleRealtimeTrendsList";

export default function GoogleRealtimeTrends() {
  return (
    <>
      <Head>Google Realtime Trends</Head>
      <Navigation/>
      <div>
        <GoogleRealtimeTrendsContainer>
          <GoogleRealtimeTrendsList googleRealtimeTrends={[]}/>
        </GoogleRealtimeTrendsContainer>
      </div>
    </>
  )
}
