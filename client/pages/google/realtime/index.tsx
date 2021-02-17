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
  makeStyles,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";

import { SelectStringOptionType } from "../../../types";
import {
  useDebouncedCallback,
  useGoogleRealtimeTrends,
  useGooleRealtimeTrendsByState,
} from "../../../hooks";
import { getColors, defaultPalette, defaultContrast } from "../../../themes";
import { Layout } from "../../../components/Layout";
import { ColorPalette } from "../../../components/ColorPalette";
import { GoogleRealtimeTrendArticleDialog } from "../../../components/GoogleRealtimeTrendArticleDialog";
import { GoogleTrendsList } from "../../../components/GoogleTrendsList";
import { GoogleDailyTrendsByRegionList } from "../../../components/GoogleDailyTrendsByRegionList";
import { RegionSelect } from "../../../components/RegionSelect";
import { GoogleTrendsTableContainer } from "../../../components/containers/GoogleTrendsTableContainer";
import { GoogleTrendsMap } from "../../../components/GoogleTrendsMap";

const useStyles = makeStyles((theme) => ({
  root: {},
  mapContainer: {
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      margin: "auto",
    },
    [theme.breakpoints.up("lg")]: {
      width: "50%",
      margin: "auto",
    },
  },
}));

export default function GoogleRealtime() {
  const classes = useStyles();
  const ref = useRef(null);
  const MAX_NUM_GOOGLE_REGION_TRENDS = 20;
  const MAX_NUM_SELECTED_REGIONS = 10;
  // stateful visual settings
  const [isTooltipVisible, setTooltipVisibility] = useState(false);
  const [isAlphabetical, setIsAlphabetical] = useState<boolean>(false);
  const [isWithColors, setIsWithColors] = useState<boolean>(true);
  const [selectedPalette, setSelectedPalette] = useState<
    ValueType<SelectStringOptionType, false>
  >({
    label: defaultPalette,
    value: defaultPalette,
  });
  const [selectedContrast, setSelectedContrastLevel] = useState<
    ValueType<SelectStringOptionType, false>
  >({
    label: defaultContrast,
    value: defaultContrast,
  });
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const [open, setOpen] = useState<boolean>(false);
  const [snackbarText, setSnackbarText] = useState<string>("");
  const [sourceMap, setSourceMap] = useState<Map<string, number>>(new Map());
  const [tooltipContent, setTooltipContent] = useState<string>("");
  // stateful data
  const [selectedRegions, setSelectedRegions] = useState<
    ValueType<SelectStringOptionType, true>
  >([]);
  const [selectedTrend, setSelectedTrend] = useState<string>("");

  // data
  const useGoogleRealtimeTrendsHook = useGoogleRealtimeTrends(
    true,
    MAX_NUM_GOOGLE_REGION_TRENDS
  );
  const useGoogleRealtimeTrendsByStateHook = useGooleRealtimeTrendsByState();
  const googleTrends = useGoogleRealtimeTrendsHook.data;
  const googleRegionTrends = useGoogleRealtimeTrendsByStateHook.data;

  useEffect(() => {
    const colorMap = new Map<string, string>();
    const sourceMap = new Map<string, number>();

    // init the color palette
    const palette = getColors(selectedPalette.value, selectedContrast.value);

    if (googleTrends) {
      googleTrends.map((x, i) => {
        colorMap.set(x.title, palette[i]);
        sourceMap.set(x.title, i);
      });
    }
    setTooltipVisibility(true);
    setColorMap(colorMap);
    setSourceMap(sourceMap);
  }, [googleTrends, isTooltipVisible, selectedPalette, selectedContrast]);

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
  const handleOpenSnackbar = () => {
    setOpen(true);
  };

  /**
   * Closes the snackbar
   */
  const handleCloseSnackbar = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    setOpen(false);
  };

  /**
   * Will nullify selectedTrend
   */
  const handleCloseDialog = () => {
    setSelectedTrend("");
  };

  const handleChangePalette = (
    option: ValueType<SelectStringOptionType, false>
  ) => {
    setSelectedPalette(option);
  };

  const handleChangeContrast = (
    option: ValueType<SelectStringOptionType, false>
  ) => {
    setSelectedContrastLevel(option);
  };

  /**
   * Handles change event from the dropdown select
   * @param option
   */
  const handleChange = (
    option: ValueType<SelectStringOptionType, true>
  ): void => {
    // to save on performance, only allow a max number of comparisons
    if (option.length > MAX_NUM_SELECTED_REGIONS) {
      console.log(option);
      setSnackbarText(
        `You may only compare up to "${MAX_NUM_SELECTED_REGIONS}" regions! Remove some regions via the dropdown select menu.`
      );
      handleOpenSnackbar();
      return;
    }

    setSelectedRegions(option);

    // if the new list of options has a length
    if (option.length > 0) {
      // and it is longer than the currently selectedRegions
      if (option.length <= selectedRegions.length) {
        // an item was removed from the selectedRegions list, no need to notify
      } else {
        // notify that we added a new item for comparison
        setSnackbarText(
          `Region "${option[option.length - 1].label}" added for comparison.`
        );
        handleOpenSnackbar();
      }
    } else {
      // items have been cleared
      setSnackbarText(`Region comparisons have been cleared.`);
      handleOpenSnackbar();
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
    if (selectedRegions.length >= MAX_NUM_SELECTED_REGIONS) {
      setSnackbarText(
        `You may only compare up to "${MAX_NUM_SELECTED_REGIONS}" regions! Remove some regions via the dropdown select menu.`
      );
      handleOpenSnackbar();
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
      const newValue: ValueType<SelectStringOptionType, false> = {
        label: regionName,
        value: regionName,
      };

      const temp = clone(selectedRegions).concat(newValue);

      setSelectedRegions(temp);
      setSnackbarText(`Region "${regionName}" added for comparison.`);
    } else {
      setSnackbarText(`Region "${regionName}" is already selected!`);
    }
    handleOpenSnackbar();
  };

  const debouncedHandleMapClick = useDebouncedCallback(handleMapClick, 250);

  const handleMapHover = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    tooltipContent: string
  ): void => {
    setTooltipContent(tooltipContent);
  };

  const debouncedHandleMapHover = useDebouncedCallback(handleMapHover, 250);

  const handleTrendClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    name: string
  ): void => {
    setSelectedTrend(name);
  };

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
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    selectedRegion: ValueType<SelectStringOptionType, true>
  ) => {
    if (!selectedRegion) return;

    // filter out the given region
    const temp = selectedRegions.filter(
      (region) => !isEqual(region, selectedRegion)
    );

    setSelectedRegions(temp);
  };

  const relatedArticles = googleTrends
    ? googleTrends
        .filter((trend) => trend.title === selectedTrend)
        .map((trend) => {
          return trend.articles;
        })
        .flat(1)
    : [];

  return (
    <Layout>
      <Head>Google Daily Trends</Head>
      <GoogleRealtimeTrendArticleDialog
        selectedTrend={selectedTrend}
        relatedArticles={relatedArticles}
        handleCloseDialog={handleCloseDialog}
      ></GoogleRealtimeTrendArticleDialog>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
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
                onClick={handleCloseSnackbar}
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
          <h3>Select a Region to Compare</h3>
          <Typography>
            To see trends for a particular region, please choose the region by
            using the dropdown or by clicking on a region on the map below.
            After making your selection, the results will appear above.{" "}
            <a href={`#${selectedRegions}`}>Click here to see the results</a>.
          </Typography>
          <div className={classes.mapContainer}>
            <RegionSelect
              values={selectedRegions}
              googleRegionTrends={googleRegionTrends ? googleRegionTrends : []}
              handleChange={handleChange}
            />
            <ColorPalette
              handleChangePalette={handleChangePalette}
              handleChangeContrast={handleChangeContrast}
              selectedContrast={selectedContrast}
              selectedPalette={selectedPalette}
            />
            <div>
              {isTooltipVisible && (
                <ReactTooltip html>{tooltipContent}</ReactTooltip>
              )}
              <GoogleTrendsMap
                colorMap={colorMap}
                handleClick={debouncedHandleMapClick}
                handleHover={debouncedHandleMapHover}
                googleRegionTrends={
                  googleRegionTrends ? googleRegionTrends : []
                }
              />
            </div>
          </div>
          <h3>Trending in the United States</h3>
          <Toolbar>
            <FormControlLabel
              control={
                <Switch checked={isWithColors} onChange={toggleListColors} />
              }
              label={`Show colors`}
            />
          </Toolbar>
          <GoogleTrendsList
            googleTrendNames={
              googleTrends ? googleTrends.map((trends) => trends.title) : []
            }
            colorMap={colorMap}
            withColor={isWithColors}
            handleTrendClick={handleTrendClick}
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
            handleTrendClick={handleTrendClick}
            isAlphabetical={isAlphabetical}
            sourceMap={sourceMap}
            googleRegionTrends={googleRegionTrends ? googleRegionTrends : []}
            selectedRegions={selectedRegions}
            colorMap={colorMap}
            withColor={isWithColors}
            withTitle
          />
          <h3>Trends by Region: Grid View</h3>
          <Typography>
            Below lists all of the trends for each region in a sortable,
            filterable fashion.
          </Typography>
          {/* TODO: reimplement me */}
          {/* {googleTrends && googleRegionTrends ? (
            <GoogleTrendsTableContainer
              handleTrendClick={handleTrendClick}
              googleTrends={googleTrends}
              googleRegionTrends={googleRegionTrends}
              colorMap={colorMap}
              sourceMap={sourceMap}
            />
          ) : null} */}
        </Paper>
      </Box>
    </Layout>
  );
}
