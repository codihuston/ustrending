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
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
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

  const initColorMap = (colorMap: Map<string, string>) => {
    setColorMap(colorMap);
  };

  return (
    <>
      <Head>Google Daily Trends</Head>
      <Navigation />
      <Box>
        <Paper>
          <h3>Trending Right Now</h3>
          <GoogleDailyTrendsContainer setColorMap={initColorMap}>
            <GoogleDailyTrendsList googleDailyTrends={[]} />
          </GoogleDailyTrendsContainer>
          <h3 ref={ref}>Trending by Region</h3>
          <Typography>
            To see trends for a particular region, please choose the region by
            using the dropdown or by clicking on a region on the map below.
          </Typography>
          <GoogleDailyTrendsByStateContainer>
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
              colorMap={colorMap}
            />
            <GoogleTrendMap
              handleClick={handleMapClick}
              googleDailyTrendsByState={[]}
              colorMap={colorMap}
            />
          </GoogleDailyTrendsByStateContainer>
        </Paper>
      </Box>
    </>
  );
}
