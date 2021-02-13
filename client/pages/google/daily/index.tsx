import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { ValueType } from "react-select";
import { Box, Paper, Typography } from "@material-ui/core";

import {
  useGoogleDailyTrends,
  useGoogleDailyTrendsByState,
} from "../../../hooks";
import { Loading } from "../../../components/Loading";
import { Navigation } from "../../../components/Navigation";
import { GoogleDailyTrendsList } from "../../../components/GoogleDailyTrendsList";
import { GoogleDailyTrendsByStateList } from "../../../components/GoogleDailyTrendsByStateList";
import { RegionSelect, OptionType } from "../../../components/RegionSelect";
import { GoogleTrendsTableContainer } from "../../../components/containers/GoogleTrendsTableContainer";
import GoogleTrendMap from "../../../components/GoogleTrendMap";

// TODO: initialize this elsewhere?
const colorPalatte = {
  default: [
    "#072AC8",
    "#1E96FC",
    "#A2D6F9",
    "#FCF300",
    "#FFC600",
    "#93827F",
    "#F3F9D2",
    "#2F2F2F",
    "#EF6F6C",
    "#56E39F",
    //
    "#FCEFEF",
    "#7FD8BE",
    "#A1FCDF",
    "#FCD29F",
    "#FCAB64",
    "#0F0A0A",
    "#BDBF09",
    "#D96C06",
    "#006BA6",
    "#0496FF",
  ],
};

export default function GoogleDaily() {
  const ref = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const selectedRegions = "selectedRegions";
  const useGoogleDailyTrendsHook = useGoogleDailyTrends();
  const useGoogleDailyTrendsByStateHook = useGoogleDailyTrendsByState();
  const googleDailyTrends = useGoogleDailyTrendsHook.data;

  /**
   * TODO:
   *  - use hooks to fetch all required data, instead of resorting to
   *    container pattern...
   *  - remove color inversion on map annotations
   */
  useEffect(() => {
    const colorMap = new Map<string, string>();
    const selectedColorPalatte = "default";
    if (googleDailyTrends) {
      googleDailyTrends.map((x, i) => {
        colorMap.set(x.title.query, colorPalatte[selectedColorPalatte][i]);
      });
    }
    setColorMap(colorMap);
  }, [googleDailyTrends]);

  const executeScroll = () =>
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

  const handleChange = (option: ValueType<OptionType, false>): void => {
    setSelectedRegion(option.value);
    executeScroll();
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
          <h2>Trending Today on Google</h2>
          <GoogleDailyTrendsList
            googleDailyTrends={
              useGoogleDailyTrendsHook.data ? useGoogleDailyTrendsHook.data : []
            }
          />
          <h3 id={selectedRegions} ref={ref}>
            Trending in Your Selected Region(s)
          </h3>
          <GoogleDailyTrendsByStateList
            withTitle
            googleDailyTrendsByState={
              useGoogleDailyTrendsByStateHook.data
                ? useGoogleDailyTrendsByStateHook.data
                : []
            }
            selectedRegion={selectedRegion}
            colorMap={colorMap}
          />
          <h3>Select a Region to Compare</h3>
          <Typography>
            To see trends for a particular region, please choose the region by
            using the dropdown or by clicking on a region on the map below.
            After making your selection, the results will appear above.{" "}
            <a href={`#${selectedRegions}`}>Click here to see the results</a>.
          </Typography>
          <RegionSelect
            value={{
              label: selectedRegion,
              value: selectedRegion,
            }}
            googleDailyTrendsByState={
              useGoogleDailyTrendsByStateHook.data
                ? useGoogleDailyTrendsByStateHook.data
                : []
            }
            handleChange={handleChange}
          />
          <GoogleTrendMap
            handleClick={handleMapClick}
            googleDailyTrendsByState={
              useGoogleDailyTrendsByStateHook.data
                ? useGoogleDailyTrendsByStateHook.data
                : []
            }
            colorMap={colorMap}
          />
          <h3>Trends by Region: Grid View</h3>
          <Typography>
            Below lists all of the trends for each region in a sortable,
            filterable fashion.
          </Typography>
          {useGoogleDailyTrendsHook.data &&
          useGoogleDailyTrendsByStateHook.data ? (
            <GoogleTrendsTableContainer
              googleDailyTrends={useGoogleDailyTrendsHook.data}
              googleDailyTrendsByState={useGoogleDailyTrendsByStateHook.data}
              colorMap={colorMap}
            />
          ) : null}
        </Paper>
      </Box>
    </>
  );
}
