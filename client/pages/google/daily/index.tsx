import { useState } from "react";
import Head from "next/head";
import { ValueType } from "react-select";

import { Navigation } from "../../../components/Navigation";
import { GoogleDailyTrendsList } from "../../../components/GoogleDailyTrendsList";
import { GoogleDailyTrendsContainer } from "../../../components/containers/GoogleDailyTrendsContainer";
import { GoogleDailyTrendsByStateContainer } from "../../../components/containers/GoogleDailyTrendsByStateContainer";
import { GoogleDailyTrendsByState } from "../../../components/GoogleDailyTrendsByState";
import { RegionSelect, OptionType } from "../../../components/RegionSelect";

export default function GoogleDaily() {
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const handleChange = (option: ValueType<OptionType, false>): void => {
    setSelectedRegion(option.value);
  };

  return (
    <>
      <Head>Google Daily Trends</Head>
      <Navigation />
      <div>
        <GoogleDailyTrendsContainer>
          <GoogleDailyTrendsList googleDailyTrends={[]} />
        </GoogleDailyTrendsContainer>
        <GoogleDailyTrendsByStateContainer>
          <RegionSelect
            googleDailyTrendsByState={[]}
            handleChange={handleChange}
          />
          <GoogleDailyTrendsByState
            googleDailyTrendsByState={[]}
            selectedRegion={selectedRegion}
          />
        </GoogleDailyTrendsByStateContainer>
      </div>
    </>
  );
}
