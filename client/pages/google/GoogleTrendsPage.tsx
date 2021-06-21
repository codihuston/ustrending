import { FunctionComponent, useState, useRef, useEffect } from "react";
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
  makeStyles,
  Paper,
  Slider,
  Switch,
  TextField,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
  Snackbar,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { AiOutlineInfoCircle } from "react-icons/ai";

import {
  GoogleDailyTrend,
  GoogleDailyTrendArticle,
  GoogleRealtimeTrend,
  GoogleRealtimeTrendArticle,
  GoogleRegionTrend,
  SelectStringOptionType,
  isGoogleDailyTrend,
  isGoogleDailyTrendArticle,
  isGoogleRealtimeTrend,
  isGoogleRealtimeTrendArticle,
} from "../../types";
import {
  fetchGoogleDailyTrends,
  fetchGoogleDailyTrendsByState,
} from "../../queries";
import { useDebouncedCallback } from "../../hooks";
import { getColors, defaultPalette, defaultContrast } from "../../themes";
import ColorPalette from "../../components/ColorPalette";
import GoogleTrendArticleDialog from "../../components/GoogleTrendArticleDialog";
import GoogleTrendsList from "../../components/GoogleTrendsList";
import GoogleTrendsByRegionList from "../../components/GoogleTrendsByRegionList";
import RegionSelect from "../../components/RegionSelect";
import GoogleTrendsTableContainer, {
  RowProps,
} from "../../components/containers/GoogleTrendsTableContainer";
import GoogleTrendsMap, {
  MapColorMode,
} from "../../components/GoogleTrendsMap";

const useStyles = makeStyles((theme: Theme) => ({
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

type Props = {
  googleTrends: (GoogleDailyTrend | GoogleRealtimeTrend)[];
  googleRegionTrends: GoogleRegionTrend[];
};

const GoogleTrendsPage: FunctionComponent<Props> = ({
  googleTrends,
  googleRegionTrends,
}) => {
  const googleTrendsUrlQueryToken = "QUERY";
  const googleTrendsUrl = `https://trends.google.com/trends/explore?q=${googleTrendsUrlQueryToken}&date=now%201-d&geo=US`;
  const classes = useStyles();
  const ref = useRef(null);
  // overridden by maxNumTrendsToShow
  // total # trends per region to render (up to the total)
  const DEFAULT_NUM_TRENDS_TO_SHOW = parseInt(
    process.env.NEXT_PUBLIC_DEFAULT_NUM_TRENDS_TO_SHOW
  );
  // max # of trends per region, total
  const MAX_NUM_GOOGLE_REGION_TRENDS = parseInt(
    process.env.NEXT_PUBLIC_MAX_NUM_GOOGLE_REGION_TRENDS
  );
  // max # of regions that can be compared
  const MAX_NUM_SELECTED_REGIONS = parseInt(
    process.env.NEXT_PUBLIC_MAX_NUM_SELECTED_REGIONS
  );
  const MAX_NUM_SELECTED_REGIONS_TEXT = `You may only compare up to "${MAX_NUM_SELECTED_REGIONS}" regions! Please remove some regions before comparing more.`;
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
  MapColorMode;
  const [mapColorMode, setMapColorMode] = useState<MapColorMode>(
    MapColorMode.All
  );
  const [maxNumTrendsToShow, setMaxNumTrendsToShow] = useState<number>(
    DEFAULT_NUM_TRENDS_TO_SHOW
  );
  const [selectedRegions, setSelectedRegions] = useState<
    ValueType<SelectStringOptionType, true>
  >([]);
  const [selectedTrend, setSelectedTrend] = useState<string>("");
  const [highlightedTrend, setHighlightedTrend] = useState<string>("");
  const [trendNumberToShow, setTrendNumberToShow] = useState<number>(0);
  // computed stateful data
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const [sourceMap, setSourceMap] = useState<Map<string, number>>(new Map());
  const [googleTrendsNames, setGoogleTrendsNames] = useState<string[]>([]);
  const [countryTrendName, setCountryTrendName] = useState<string>("");
  const [relatedArticles, setRelatedArticles] = useState<
    (GoogleDailyTrendArticle | GoogleRealtimeTrendArticle)[]
  >([]);
  const [rows, setRows] = useState<RowProps[]>([]);

  useEffect(() => {
    const colorMap = new Map<string, string>();
    const sourceMap = new Map<string, number>();

    // compute state around googleTrends
    if (googleTrends) {
      const allTrendNames = getGoogleTrendNames(googleTrends.length);
      const trendNames = getGoogleTrendNames(maxNumTrendsToShow);

      // init the color palette
      const palette = getColors(
        selectedPalette.value,
        selectedContrast.value,
        googleTrends.length
      );

      // init the colors for all trends
      allTrendNames.map((name, i) => {
        colorMap.set(name, palette[i]);
        sourceMap.set(name, i);
      });

      // init the list of trends (only the ones within the given limit)
      setGoogleTrendsNames(trendNames);
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
      setRelatedArticles(getGoogleTrendArticles());
    }
  }, [selectedTrend]);

  useEffect(() => {
    if (googleTrends) {
      setCountryTrendName(getCountryTrendName());
    }
  }, [trendNumberToShow]);

  const getGoogleTrendNames = (max): string[] => {
    return googleTrends
      .map((trend) => {
        if (isGoogleDailyTrend(trend)) {
          return trend.title.query;
        } else if (isGoogleRealtimeTrend(trend)) {
          return trend.title;
        }
      })
      .slice(0, max);
  };

  const getGoogleTrendArticles = (): (
    | GoogleDailyTrendArticle
    | GoogleRealtimeTrendArticle
  )[] => {
    return selectedTrend
      ? googleTrends
          .filter((trend) => {
            if (isGoogleDailyTrend(trend)) {
              return trend.title.query === selectedTrend;
            } else if (isGoogleRealtimeTrend(trend)) {
              return trend.title === selectedTrend;
            }
          })
          .map((trend) => {
            return trend.articles;
          })
          .flat(1)
      : [];
  };

  const getCountryTrendName = () => {
    if (googleTrends) {
      const trend = googleTrends[trendNumberToShow];
      if (isGoogleDailyTrend(trend)) {
        return trend?.title?.query;
      } else if (isGoogleRealtimeTrend(trend)) {
        return trend?.title;
      }
    }
    return null;
  };

  const getTrendCountDisplay = () => {
    return googleTrends &&
      googleTrends.length &&
      googleTrends.length <= MAX_NUM_GOOGLE_REGION_TRENDS
      ? `${maxNumTrendsToShow}/${MAX_NUM_GOOGLE_REGION_TRENDS}`
      : MAX_NUM_GOOGLE_REGION_TRENDS;
  };

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
      setSnackbarText(MAX_NUM_SELECTED_REGIONS_TEXT);
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
      setSnackbarText(MAX_NUM_SELECTED_REGIONS_TEXT);
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
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
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
   * If checked, map color mode is "All", otherwise it is "One"
   * @param event
   */
  const toggleMapColorMode = (event) => {
    if (event.target.checked) {
      setMapColorMode(MapColorMode.All);
    } else {
      setMapColorMode(MapColorMode.One);
    }
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
    if (selectedRegion.length <= 0) return;

    // filter out the given region
    const temp = selectedRegions.filter(
      (region) => !isEqual(region, selectedRegion[0])
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
    let validValue = 1;

    if (googleTrends && googleTrends.length > 0) {
      // the slider is 1 indexed
      if (newValue - 1 < 0) {
        validValue = 1;
      } else if (newValue > MAX_NUM_GOOGLE_REGION_TRENDS) {
        validValue = MAX_NUM_GOOGLE_REGION_TRENDS - 1;
      } else if (newValue > googleTrends.length) {
        validValue = googleTrends.length - 1;
      } else {
        validValue = newValue - 1;
      }
    } else {
      validValue = 1;
    }
    setTrendNumberToShow(validValue);
  };

  const debouncedHandleInputChangeTrendNumberToShow = useDebouncedCallback(
    handleInputChangeTrendNumberToShow,
    250
  );

  const handleChangeHighlightedTrend = (name: string) => {
    setHighlightedTrend(name);
  };

  return (
    <>
      <GoogleTrendArticleDialog
        googleTrendsUrl={googleTrendsUrl}
        googleTrendsUrlQueryToken={googleTrendsUrlQueryToken}
        handleCloseDialog={handleCloseDialog}
        relatedArticles={relatedArticles}
        selectedTrend={selectedTrend}
      ></GoogleTrendArticleDialog>
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
          <section>
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
                googleRegionTrends={
                  googleRegionTrends ? googleRegionTrends : []
                }
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
                  {googleTrends && googleTrends.length ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={
                            mapColorMode === MapColorMode.All ? true : false
                          }
                          onChange={toggleMapColorMode}
                        />
                      }
                      label={`${
                        mapColorMode === MapColorMode.All
                          ? `Color #${
                              trendNumberToShow + 1
                            } trends in each region`
                          : `Showing popularity of #${
                              trendNumberToShow + 1
                            } trend in the country (${countryTrendName})`
                      }`}
                    />
                  ) : null}
                  <Grid item>
                    {mapColorMode === MapColorMode.One ? (
                      <Button
                        onClick={(e) => handleTrendClick(e, countryTrendName)}
                        variant="contained"
                        color="primary"
                      >
                        Click for News on this Trend
                      </Button>
                    ) : null}
                  </Grid>
                  <TextField
                    defaultValue={1}
                    id="standard-number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      inputProps: {
                        min: 1,
                        max: MAX_NUM_GOOGLE_REGION_TRENDS,
                      },
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
                  mapColorMode={mapColorMode}
                  trendNumberToShow={trendNumberToShow}
                  countryTrendName={countryTrendName}
                />
              </div>
            </div>
          </section>
          <section>
            <h3 id={"selectedRegions"} ref={ref}>
              Trending in the United States
            </h3>
            <Grid
              container
              spacing={2}
              alignItems="center"
              className={classes.mapContainer}
            >
              <Grid item xs={12} md={3}>
                <Typography id="discrete-slider" gutterBottom>
                  Number of Trends ({getTrendCountDisplay()})
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
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
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isWithColors}
                      onChange={toggleListColors}
                    />
                  }
                  label={`Show colors`}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAlphabetical}
                      onChange={toggleListSort}
                    />
                  }
                  label={`Sort regions alphabetically`}
                />
              </Grid>
            </Grid>
            <GoogleTrendsList
              googleTrendNames={googleTrendsNames}
              colorMap={colorMap}
              withColor={isWithColors}
              handleTrendClick={handleTrendClick}
              highlightedTrend={highlightedTrend}
              handleChangeHighlightedTrend={handleChangeHighlightedTrend}
            >
              <GoogleTrendsByRegionList
                googleRegionTrends={
                  googleRegionTrends ? googleRegionTrends : []
                }
                handleClick={handleListDelete}
                handleTrendClick={handleTrendClick}
                isAlphabetical={isAlphabetical}
                maxNumTrendsToShow={maxNumTrendsToShow}
                sourceMap={sourceMap}
                selectedRegions={selectedRegions}
                colorMap={colorMap}
                withColor={isWithColors}
                withTitle
                highlightedTrend={highlightedTrend}
                handleChangeHighlightedTrend={handleChangeHighlightedTrend}
              />
            </GoogleTrendsList>
          </section>
          <section>
            <h3>Trends by Region: Grid View</h3>
            <Typography>
              Below lists all of the trends for each region in a sortable,
              filterable fashion.
            </Typography>
            <Toolbar>
              <Grid
                container
                spacing={2}
                alignItems="center"
                className={classes.mapContainer}
              >
                <Grid item xs={12} md={3}>
                  <Typography id="discrete-slider" gutterBottom>
                    Number of Trends ({getTrendCountDisplay()})
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
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
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isWithColors}
                        onChange={toggleListColors}
                      />
                    }
                    label={`Show colors`}
                  />
                </Grid>
              </Grid>
            </Toolbar>
            {googleTrends && googleRegionTrends ? (
              <GoogleTrendsTableContainer
                handleTrendClick={handleTrendClick}
                googleTrendNames={googleTrendsNames ? googleTrendsNames : []}
                rows={rows}
                colorMap={colorMap}
                isWithColors={isWithColors}
                sourceMap={sourceMap}
              />
            ) : null}
          </section>
        </Paper>
      </Box>
    </>
  );
};

export default GoogleTrendsPage;
