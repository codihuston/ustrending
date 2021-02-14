import { useState, useRef, useEffect } from "react";
import { isEqual, clone } from "lodash";
import Head from "next/head";
import { ValueType } from "react-select";
import {
  Box,
  FormControlLabel,
  Paper,
  Switch,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { RegionSelectOptionType } from "../../../types";
import {
  useGoogleDailyTrends,
  useGoogleDailyTrendsByState,
} from "../../../hooks";
import { Navigation } from "../../../components/Navigation";
import { GoogleDailyTrendsList } from "../../../components/GoogleDailyTrendsList";
import { GoogleDailyTrendsByRegionList } from "../../../components/GoogleDailyTrendsByRegionList";
import { RegionSelect } from "../../../components/RegionSelect";
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
  const [selectedRegions, setSelectedRegions] = useState<
    ValueType<RegionSelectOptionType, true>
  >([]);
  const [isAlphabetical, setIsAlphabetical] = useState<boolean>(false);
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const [sourceMap, setSourceMap] = useState<Map<string, number>>(new Map());
  const useGoogleDailyTrendsHook = useGoogleDailyTrends();
  const useGoogleDailyTrendsByStateHook = useGoogleDailyTrendsByState();
  const googleDailyTrends = useGoogleDailyTrendsHook.data;

  useEffect(() => {
    const colorMap = new Map<string, string>();
    const sourceMap = new Map<string, number>();
    const selectedColorPalatte = "default";
    if (googleDailyTrends) {
      // NOTE: x.title.query will differ between realtime and daily trends
      googleDailyTrends.map((x, i) => {
        colorMap.set(x.title.query, colorPalatte[selectedColorPalatte][i]);
        sourceMap.set(x.title.query, i);
      });
    }
    setColorMap(colorMap);
    setSourceMap(sourceMap);
  }, [googleDailyTrends]);

  const executeScroll = () =>
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

  /**
   * Handles change event from the dropdown select
   * @param option
   */
  const handleChange = (
    option: ValueType<RegionSelectOptionType, true>
  ): void => {
    setSelectedRegions(option);
    executeScroll();
  };

  /**
   * Handles click event on the map regions
   * @param e
   * @param regionName
   */
  const handleMapClick = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    regionName: string
  ): void => {
    let found = false;

    // check if region is already selected
    for (const region of selectedRegions) {
      if (region.label === regionName || region.value === regionName) {
        found = true;
        break;
      }
    }

    // if not found, add to it
    if (!found) {
      const newValue: ValueType<RegionSelectOptionType, false> = {
        label: regionName,
        value: regionName,
      };

      const temp = clone(selectedRegions).concat(newValue);

      setSelectedRegions(temp);
    }

    // scroll to view
    executeScroll();
  };

  /**
   * Handles the click event for toggling sort method for the regions' trends list
   * @param event
   */
  const handleListSort = (event) => {
    setIsAlphabetical(event.target.checked);
  };

  /**
   * Handles click event for deleting a list from the regions' trends list
   * @param e
   * @param selectedRegion
   */
  const handleListDelete = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    selectedRegion: ValueType<RegionSelectOptionType, true>
  ) => {
    if (!selectedRegion) return;

    // filter out the given region
    const temp = selectedRegions.filter(
      (region) => !isEqual(region, selectedRegion)
    );

    setSelectedRegions(temp);
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
          <h3>Select a Region to Compare</h3>
          <Typography>
            To see trends for a particular region, please choose the region by
            using the dropdown or by clicking on a region on the map below.
            After making your selection, the results will appear above.{" "}
            <a href={`#${selectedRegions}`}>Click here to see the results</a>.
          </Typography>
          <RegionSelect
            values={selectedRegions}
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
          <h3 id={"selectedRegions"} ref={ref}>
            Trending in Your Selected Region(s)
          </h3>
          <Toolbar>
            <FormControlLabel
              control={
                <Switch checked={isAlphabetical} onChange={handleListSort} />
              }
              label={`Sort alphabetically (currently: ${
                isAlphabetical ? "ordered by name" : "ordered by selection"
              })`}
            />
          </Toolbar>
          <GoogleDailyTrendsByRegionList
            handleClick={handleListDelete}
            withTitle
            isAlphabetical={isAlphabetical}
            sourceMap={sourceMap}
            googleRegionTrends={
              useGoogleDailyTrendsByStateHook.data
                ? useGoogleDailyTrendsByStateHook.data
                : []
            }
            selectedRegions={selectedRegions}
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
