import Head from "next/head";

import { Navigation } from "../../../components/Navigation";
import { GoogleDailyTrendsList } from "../../../components/GoogleDailyTrendsList";

export default function GoogleDaily() {
  return (
    <>
      <Head>Google Daily Trends</Head>
      <Navigation/>
      <div>
        <GoogleDailyTrendsList/>
      </div>
    </>
  )
}
