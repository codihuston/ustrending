import { useState, useRef } from "react";
import Head from "next/head";
import { ValueType } from "react-select";
import { Box, Paper, Typography } from "@material-ui/core";

import { Navigation } from "../../../components/Navigation";
import { GoogleDailyTrendsList } from "../../../components/GoogleDailyTrendsList";
import { GoogleDailyTrendsContainer } from "../../../components/containers/GoogleDailyTrendsContainer";
import { GoogleDailyTrendsByStateContainer } from "../../../components/containers/GoogleDailyTrendsByStateContainer";
import { GoogleDailyTrendsByStateList } from "../../../components/GoogleDailyTrendsByStateList";
import { RegionSelect, OptionType } from "../../../components/RegionSelect";
import GoogleTrendMap from "../../../components/GoogleTrendMap";

export default function GoogleDaily() {
  const ref = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const sectionRegionTrends = "#region-trends";

  const executeScroll = () =>
    ref.current.scrollIntoView({ behavior: "smooth" });

  const handleChange = (option: ValueType<OptionType, false>): void => {
    setSelectedRegion(option.value);
  };

  const handleMapClick = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    regionName: string
  ): void => {
    setSelectedRegion(regionName);
    executeScroll();
  };

  return (
    <>
      <Head>Google Daily Trends</Head>
      <Navigation />
      <Box>
        <Paper>
          <h3>Trending Right Now</h3>
          <GoogleDailyTrendsContainer>
            <GoogleDailyTrendsList googleDailyTrends={[]} />
          </GoogleDailyTrendsContainer>
          <h3 ref={ref}>Trending by Region</h3>
          <GoogleDailyTrendsByStateContainer>
            <Typography>
              To see trends for a particular region, please choose the region by
              using the dropdown or by clicking on a region on the map.
            </Typography>
            <RegionSelect
              value={{
                label: selectedRegion,
                value: selectedRegion,
              }}
              googleDailyTrendsByState={[]}
              handleChange={handleChange}
            />

            <GoogleDailyTrendsByStateList
              withTitle
              googleDailyTrendsByState={[]}
              selectedRegion={selectedRegion}
            />
            <GoogleTrendMap
              handleClick={handleMapClick}
              googleDailyTrendsByState={[]}
              colorsByTopic={new Map<string, string>()}
            />
            <h4 id={sectionRegionTrends}>
              {selectedRegion ? `2. Trending today in ${selectedRegion}` : null}
            </h4>
          </GoogleDailyTrendsByStateContainer>
        </Paper>
      </Box>
    </>
  );
}
