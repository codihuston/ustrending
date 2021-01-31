import Head from "next/head";

import { Navigation } from "../../../components/Navigation";
import { GoogleRealtimeTrendsList } from "../../../components/GoogleRealtimeTrendsList";

export default function GoogleDaily() {
  return (
    <>
      <Head>Google Realtime Trends</Head>
      <Navigation/>
      <div>
        <GoogleRealtimeTrendsList/>
      </div>
    </>
  )
}
