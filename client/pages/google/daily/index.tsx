import { useState, useRef, useEffect } from "react";
import { isEqual, clone } from "lodash";
import { ValueType } from "react-select";
import Head from "next/head";
import ReactTooltip from "react-tooltip";
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Toolbar,
  Typography,
  Snackbar,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";

import { RegionSelectOptionType } from "../../../types";
import {
  useDebouncedCallback,
  useGoogleDailyTrends,
  useGoogleDailyTrendsByState,
} from "../../../hooks";
import { Navigation } from "../../../components/Navigation";
import { GoogleDailyTrendsList } from "../../../components/GoogleDailyTrendsList";
import { GoogleDailyTrendsByRegionList } from "../../../components/GoogleDailyTrendsByRegionList";
import { RegionSelect } from "../../../components/RegionSelect";
import { GoogleTrendsTableContainer } from "../../../components/containers/GoogleTrendsTableContainer";
import { GoogleTrendsMap } from "../../../components/GoogleTrendsMap";

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
  const MAX_NUM_SELECTED_REGIONS = 5;
  const [isTooltipVisible, setTooltipVisibility] = useState(false);
  const [isAlphabetical, setIsAlphabetical] = useState<boolean>(false);
  const [isWithColors, setIsWithColors] = useState<boolean>(true);
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const [open, setOpen] = useState<boolean>(false);
  const [snackbarText, setSnackbarText] = useState<string>("");
  const [sourceMap, setSourceMap] = useState<Map<string, number>>(new Map());
  const [tooltipContent, setTooltipContent] = useState<string>("");
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
    setTooltipVisibility(true)
    setColorMap(colorMap);
    setSourceMap(sourceMap);
  }, [googleDailyTrends, isTooltipVisible]);

  /**
   * Scrolls to the reference (selected regions / region comparison secion)
   */
  const executeScroll = () =>
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

  /**
   * Opens the snackbar
   */
  const handleOpen = () => {
    setOpen(true);
  };

  /**
   * Closes the snackbar
   */
  const handleClose = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    setOpen(false);
  };

  /**
   * Handles change event from the dropdown select
   * @param option
   */
  const handleChange = (
    option: ValueType<RegionSelectOptionType, true>
  ): void => {
    
    // to save on performance, only allow a max number of comparisons
    if(option.length > MAX_NUM_SELECTED_REGIONS){
      console.log(option);
      setSnackbarText(`You may only compare up to "${MAX_NUM_SELECTED_REGIONS}" regions! Remove some regions via the dropdown select menu.`);
      handleOpen();
      return;
    }

    setSelectedRegions(option);
    
    // if the new list of options has a length
    if (option.length > 0) {
      // and it is longer than the currently selectedRegions
      if(option.length <= selectedRegions.length){
        // an item was removed from the selectedRegions list, no need to notify
      }
      else{
        // notify that we added a new item for comparison
        setSnackbarText(
          `Region "${option[option.length - 1].label}" added for comparison.`
        );
        handleOpen();
      }
    } else {
      // items have been cleared
      setSnackbarText(`Region compairsons have been cleared.`);
      handleOpen();
    }
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

    // to save on performance, only allow a max number of comparisons
    if(selectedRegions.length >= MAX_NUM_SELECTED_REGIONS){
      setSnackbarText(`You may only compare up to "${MAX_NUM_SELECTED_REGIONS}" regions! Remove some regions via the dropdown select menu.`);
      handleOpen();
      return;
    }

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
      setSnackbarText(`Region "${regionName}" added for comparison.`);
    } else {
      setSnackbarText(`Region "${regionName}" is already selected!`);
    }
    handleOpen();
  };

  const debouncedHandleMapClick = useDebouncedCallback(handleMapClick, 250);

  const handleMapHover = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    tooltipContent: string
  ): void => {
    setTooltipContent(tooltipContent);
  };

  const debouncedHandleMapHover = useDebouncedCallback(handleMapHover, 250);


  /**
   * Toggles the sort method for the regions' trends list
   * @param event
   */
  const toggleListSort = (event) => {
    setIsAlphabetical(event.target.checked);
  };

  /**
   * Toggles region list colors
   * @param event 
   */
  const toggleListColors = (event) => {
    setIsWithColors(event.target.checked);
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
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={snackbarText}
        action={
          selectedRegions.length > 0 ? (
            <>
              <Button color="secondary" size="small" onClick={executeScroll}>
                Click here to view
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
                href=""
              >
                <Close fontSize="small" />
              </IconButton>
            </>
          ) : null
        }
      />
      <Box>
        <Paper>
          <h2>Trending Today on Google</h2>
          <h3>Trending in the United States</h3>
          <Toolbar>
            <FormControlLabel
              control={
                <Switch checked={isWithColors} onChange={toggleListColors} />
              }
              label={`Show colors`}
            />
          </Toolbar>
          <GoogleDailyTrendsList
            googleDailyTrends={
              useGoogleDailyTrendsHook.data ? useGoogleDailyTrendsHook.data : []
            }
            colorMap={colorMap}
            withColor={isWithColors}
          />
          <h3 id={"selectedRegions"} ref={ref}>
            Trending in Your Selected Region(s)
          </h3>
          <Toolbar>
            <FormControlLabel
              control={
                <Switch checked={isAlphabetical} onChange={toggleListSort} />
              }
              label={`Sort regions alphabetically`}
            />
            <FormControlLabel
              control={
                <Switch checked={isWithColors} onChange={toggleListColors} />
              }
              label={`Show colors`}
            />
          </Toolbar>
          <GoogleDailyTrendsByRegionList
            handleClick={handleListDelete}
            isAlphabetical={isAlphabetical}
            sourceMap={sourceMap}
            googleRegionTrends={
              useGoogleDailyTrendsByStateHook.data
                ? useGoogleDailyTrendsByStateHook.data
                : []
            }
            selectedRegions={selectedRegions}
            colorMap={colorMap}
            withColor={isWithColors}
            withTitle
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
          <div>
          {isTooltipVisible && <ReactTooltip html>{tooltipContent}</ReactTooltip>}
          <GoogleTrendsMap
            colorMap={colorMap}
            handleClick={debouncedHandleMapClick}
            handleHover={debouncedHandleMapHover}
            googleDailyTrendsByState={
              useGoogleDailyTrendsByStateHook.data
                ? useGoogleDailyTrendsByStateHook.data
                : []
            }
          />
          </div>
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
