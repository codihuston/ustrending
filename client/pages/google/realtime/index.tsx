import { useState, useRef, useEffect } from "react";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { isEqual, clone } from "lodash";
import { ValueType } from "react-select";
import Head from "next/head";
import ReactTooltip from "react-tooltip";
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Switch,
  Toolbar,
  Typography,
  Slider,
  Snackbar,
  TextField,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { AiOutlineInfoCircle } from "react-icons/ai";

import {
  GoogleRealtimeTrendArticle,
  SelectStringOptionType,
} from "../../../types";
import {
  fetchGoogleRealtimeTrends,
  fetchGoogleRealtimeTrendsByState,
} from "../../../queries";
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
import { GoogleTrendsByRegionList } from "../../../components/GoogleTrendsByRegionList";
import { RegionSelect } from "../../../components/RegionSelect";
import {
  GoogleTrendsTableContainer,
  RowProps,
} from "../../../components/containers/GoogleTrendsTableContainer";
import { GoogleTrendsMap } from "../../../components/GoogleTrendsMap";

// max # of trends per region, total
const MAX_NUM_GOOGLE_REGION_TRENDS = 50;

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
  input: {},
}));

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery("googleRealtimeTrends", () => fetchGoogleRealtimeTrends(true, false, MAX_NUM_GOOGLE_REGION_TRENDS));
  await queryClient.prefetchQuery(
    "googleRealtimeTrendsByState",
    fetchGoogleRealtimeTrendsByState
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export default function GoogleRealtime() {
  const classes = useStyles();
  const ref = useRef(null);
  const hasDuplicates = false;
  // overridden by maxNumTrendsToShow
  // total # trends per region to render (up to the total)
  const DEFAULT_NUM_TRENDS_TO_SHOW = 10;
  // max # of regions that can be compared
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
  const [open, setOpen] = useState<boolean>(false);
  const [snackbarText, setSnackbarText] = useState<string>("");
  const [tooltipContent, setTooltipContent] = useState<string>("");
  // stateful data
  const [maxNumTrendsToShow, setMaxNumTrendsToShow] = useState<number>(
    DEFAULT_NUM_TRENDS_TO_SHOW
  );
  const [selectedRegions, setSelectedRegions] = useState<
    ValueType<SelectStringOptionType, true>
  >([]);
  const [trendNumberToShow, setTrendNumberToShow] = useState<number>(0);
  const [selectedTrend, setSelectedTrend] = useState<string>("");
  // computed stateful data
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const [sourceMap, setSourceMap] = useState<Map<string, number>>(new Map());
  const [googleTrendsNames, setGoogleTrendsNames] = useState<string[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<
    GoogleRealtimeTrendArticle[]
  >([]);
  const [rows, setRows] = useState<RowProps[]>([]);
  // data
  const useGoogleRealtimeTrendsHook = useGoogleRealtimeTrends(
    // expand comma-delimited realtime trends
    true,
    // remove duplicates
    hasDuplicates,
    // total limit
    MAX_NUM_GOOGLE_REGION_TRENDS
  );
  const useGoogleRealtimeTrendsByStateHook = useGooleRealtimeTrendsByState(
    // remove duplicates
    hasDuplicates
  );
  const googleTrends = useGoogleRealtimeTrendsHook.data;
  const googleRegionTrends = useGoogleRealtimeTrendsByStateHook.data;

  useEffect(() => {
    const colorMap = new Map<string, string>();
    const sourceMap = new Map<string, number>();

    // compute state around googleTrends
    if (googleTrends) {
      // init the color palette
      // const palette = getColors(selectedPalette.value, selectedContrast.value, maxNumTrendsToShow);
      const palette = getColors(
        selectedPalette.value,
        selectedContrast.value,
        googleTrends.length
      );

      googleTrends.map((x, i) => {
        colorMap.set(x.title, palette[i]);
        sourceMap.set(x.title, i);
      });

      setGoogleTrendsNames(
        googleTrends.map((trends) => trends.title).slice(0, maxNumTrendsToShow)
      );
    }

    // compute state around googleRegionTrends
    if (googleRegionTrends) {
      setRows(
        googleRegionTrends.map((region) => {
          const topics = region.trends.map((trend) => trend.topic);

          return {
            region: region.name,
            ...topics,
          };
        })
      );
    }

    setTooltipVisibility(true);
    setColorMap(colorMap);
    setSourceMap(sourceMap);
  }, [
    googleRegionTrends,
    googleTrends,
    isTooltipVisible,
    maxNumTrendsToShow,
    selectedContrast,
    selectedPalette,
  ]);

  useEffect(() => {
    if (googleTrends) {
      setRelatedArticles(
        selectedTrend
          ? googleTrends
              .filter((trend) => trend.title === selectedTrend)
              .map((trend) => {
                return trend.articles;
              })
              .flat(1)
          : []
      );
    }
  }, [selectedTrend]);

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

  const debouncedHandleTrendClick = useDebouncedCallback(handleTrendClick, 250);

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

  const handleSliderChangeNumTrendsToShow = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: number
  ) => {
    setMaxNumTrendsToShow(newValue);
  };

  const debouncedHandleSliderChangeNumTrendsToShow = useDebouncedCallback(
    handleSliderChangeNumTrendsToShow,
    1000
  );

  const handleInputChangeTrendNumberToShow = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue: number =
      event.target.value === "" ? 1 : Number(event.target.value);
    // the slider is 1 indexed
    if (newValue - 1 < 0) {
      setTrendNumberToShow(0);
    } else if (newValue > MAX_NUM_GOOGLE_REGION_TRENDS) {
      setTrendNumberToShow(MAX_NUM_GOOGLE_REGION_TRENDS);
    } else if (
      googleTrends &&
      googleTrends.length > 0 &&
      newValue > googleTrends.length
    ) {
      setTrendNumberToShow(googleTrends.length - 1);
    } else {
      setTrendNumberToShow(newValue - 1);
    }
  };

  const debouncedHandleInputChangeTrendNumberToShow = useDebouncedCallback(
    handleInputChangeTrendNumberToShow,
    250
  );

  return (
    <Layout>
      <Head>Google Realtime Trends</Head>
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
          <h2>Trending Right Now on Google</h2>
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
            <Grid
              container
              spacing={2}
              alignItems="center"
              className={classes.mapContainer}
            >
              <Grid item>
                <Tooltip
                  title={
                    <div
                      style={{
                        fontSize: "1rem",
                      }}
                    >
                      {
                        "The trend at this rank for each region will be highlighted on the map. Each color is determined by the trend's rank in your country."
                      }
                    </div>
                  }
                >
                  <IconButton aria-label="info">
                    <AiOutlineInfoCircle />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs>
                <TextField
                  defaultValue={1}
                  id="standard-number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    inputProps: { min: 1, max: MAX_NUM_GOOGLE_REGION_TRENDS },
                  }}
                  label="Trend #"
                  onChange={debouncedHandleInputChangeTrendNumberToShow}
                  style={{
                    width: "100%",
                  }}
                  type="number"
                  // value={trendNumberToShow}
                />
              </Grid>
            </Grid>
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
                trendNumberToShow={trendNumberToShow}
              />
            </div>
          </div>
          <h3>Trending in the United States</h3>
          <Grid
            container
            spacing={2}
            alignItems="center"
            className={classes.mapContainer}
          >
            <Grid item>
              <Typography id="discrete-slider" gutterBottom>
                Number of Trends to Display
              </Typography>
            </Grid>
            <Grid item xs>
              <Slider
                aria-labelledby="discrete-slider"
                defaultValue={DEFAULT_NUM_TRENDS_TO_SHOW}
                marks
                max={
                  googleTrends &&
                  googleTrends.length &&
                  googleTrends.length < MAX_NUM_GOOGLE_REGION_TRENDS
                    ? googleTrends.length
                    : MAX_NUM_GOOGLE_REGION_TRENDS
                }
                min={1}
                onChange={debouncedHandleSliderChangeNumTrendsToShow}
                step={1}
                valueLabelDisplay="auto"
                value={
                  typeof maxNumTrendsToShow === "number"
                    ? maxNumTrendsToShow
                    : 0
                }
              />
            </Grid>
            <Grid item>
              <Typography>
                {maxNumTrendsToShow} /{" "}
                {googleTrends &&
                googleTrends.length &&
                googleTrends.length < MAX_NUM_GOOGLE_REGION_TRENDS
                  ? googleTrends.length
                  : MAX_NUM_GOOGLE_REGION_TRENDS}{" "}
              </Typography>
            </Grid>
          </Grid>
          <GoogleTrendsList
            googleTrendNames={googleTrends ? googleTrendsNames : []}
            colorMap={colorMap}
            withColor={isWithColors}
            handleTrendClick={debouncedHandleTrendClick}
          />
          <h4 id={"selectedRegions"} ref={ref}>
            Trending in Your Selected Region(s)
          </h4>
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
          <GoogleTrendsByRegionList
            handleClick={handleListDelete}
            handleTrendClick={debouncedHandleTrendClick}
            isAlphabetical={isAlphabetical}
            sourceMap={sourceMap}
            googleRegionTrends={googleRegionTrends ? googleRegionTrends : []}
            maxNumTrendsToShow={maxNumTrendsToShow}
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
          {googleTrends && googleRegionTrends ? (
            <GoogleTrendsTableContainer
              handleTrendClick={handleTrendClick}
              googleTrendNames={
                googleTrendsNames ? googleTrendsNames.slice(0, 10) : []
              }
              rows={rows}
              colorMap={colorMap}
              sourceMap={sourceMap}
            />
          ) : null}
        </Paper>
      </Box>
    </Layout>
  );
}
