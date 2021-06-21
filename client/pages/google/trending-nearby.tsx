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
  FormControl,
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

import { convertRegion } from "../../lib";
import {
  GoogleDailyTrendArticle,
  GoogleRealtimeTrendArticle,
  SelectStringOptionType,
  ZipCode,
  isGoogleDailyTrend,
  isGoogleRealtimeTrend,
} from "../../types";
import {
  fetchGoogleDailyTrends,
  fetchGoogleDailyTrendsByState,
  fetchGoogleRealtimeTrends,
  fetchGoogleRealtimeTrendsByState,
} from "../../queries";
import {
  useDebouncedCallback,
  useGoogleDailyTrends,
  useGoogleDailyTrendsByState,
  useGoogleRealtimeTrends,
  useGooleRealtimeTrendsByState,
  usePlacesByZipcode,
  useZipcodesByGPS,
  useZipcode,
} from "../../hooks";
import { getColors, defaultPalette, defaultContrast } from "../../themes";
import Layout from "../../components/Layout";
import Loading from "../../components/Loading";
import LocationForm from "../../components/LocationForm";
import ColorPalette from "../../components/ColorPalette";
import GoogleRealtimeTrendArticleDialog from "../../../components/GoogleRealtimeTrendArticleDialog";
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

// total # trends per region to render (up to the total)
const DEFAULT_NUM_TRENDS_TO_SHOW = parseInt(
  process.env.NEXT_PUBLIC_DEFAULT_NUM_TRENDS_TO_SHOW
);
// max # of trends per region, total
const MAX_NUM_GOOGLE_REGION_TRENDS = parseInt(
  process.env.NEXT_PUBLIC_MAX_NUM_GOOGLE_REGION_TRENDS
);
const realtimeTrendsHasDuplicates = false;
const shouldExpandRealtimeTrends = true;

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

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery("googleDailyTrends", fetchGoogleDailyTrends);
  await queryClient.prefetchQuery(
    "googleDailyTrendsByState",
    fetchGoogleDailyTrendsByState
  );
  await queryClient.prefetchQuery("googleRealtimeTrends", () =>
    fetchGoogleRealtimeTrends(
      shouldExpandRealtimeTrends,
      realtimeTrendsHasDuplicates,
      MAX_NUM_GOOGLE_REGION_TRENDS
    )
  );
  await queryClient.prefetchQuery("googleRealtimeTrendsByState", () =>
    fetchGoogleRealtimeTrendsByState(realtimeTrendsHasDuplicates)
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export default function TrendingNearby() {
  const googleTrendsUrlQueryToken = "QUERY";
  const googleTrendsUrl = `https://trends.google.com/trends/explore?q=${googleTrendsUrlQueryToken}&date=now%201-d&geo=US`;
  // stateful data
  const INITIAL_VALUE = "10002";
  const [zipcode, setZipcode] = useState<string>(INITIAL_VALUE);
  const [coordinates, setCoordinates] = useState<[number, number]>(null);
  const [isWithColors, setIsWithColors] = useState<boolean>(true);
  const [highlightedTrend, setHighlightedTrend] = useState<string>("");
  const [selectedTrend, setSelectedTrend] = useState<string>("");
  const [maxNumTrendsToShow, setMaxNumTrendsToShow] = useState<number>(
    DEFAULT_NUM_TRENDS_TO_SHOW
  );
  const [zipcodePlaces, setZipcodePlaces] = useState<ZipCode[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<
    (GoogleDailyTrendArticle | GoogleRealtimeTrendArticle)[]
  >([]);
  const [selectedRegions, setSelectedRegions] = useState<
    ValueType<SelectStringOptionType, true>
  >([]);
  // daily trends state
  const [googleDailyTrendsNames, setGoogleDailyTrendsNames] = useState<
    string[]
  >([]);
  const [googleRealtimeTrendsNames, setGoogleRealtimeTrendsNames] = useState<
    string[]
  >([]);
  const [googleDailyColorMap, setColorMap] = useState<Map<string, string>>(
    new Map()
  );
  const [googleRealtimeTrendsColorMap, setgoogleRealtimeTrendsColorMap] = useState<Map<string, string>>(
    new Map()
  );
  const [sourceMap, setSourceMap] = useState<Map<string, number>>(new Map());
  const [googleRealtimeTrendsSourceMap, setgoogleRealtimeTrendsSourceMap] = useState<Map<string, number>>(new Map());
  // realtime trend state
  // ...
  // hooks
  const { data: zipcodePlace, isLoading: isLoadingZip } = useZipcode(
    zipcode,
    1
  );
  const { data: zipcodesByGPS, isLoading: isLoadingZipGPS } = useZipcodesByGPS(
    coordinates,
    1
  );
  // data
  const { data: googleDailyTrends } = useGoogleDailyTrends();
  const { data: googleDailyRegionTrends } = useGoogleDailyTrendsByState();
  const { data: googleRealtimeTrends } = useGoogleRealtimeTrends(
    shouldExpandRealtimeTrends,
    realtimeTrendsHasDuplicates,
    MAX_NUM_GOOGLE_REGION_TRENDS
  );
  const { data: googleRealtimeRegionTrends } = useGooleRealtimeTrendsByState(
    realtimeTrendsHasDuplicates
  );
  // computed data
  const isLoading = isLoadingZip || isLoadingZipGPS;

  useEffect(() => {
    const colorMap = new Map<string, string>();
    const sourceMap = new Map<string, number>();
    const googleRealtimeTrendsColorMap = new Map<string, string>();
    const googleRealtimeTrendsSourceMap  = new Map<string, number>();

    // compute state around googleTrends
    if (googleDailyTrends) {
      const allTrendNames = getGoogleTrendNames(
        googleDailyTrends,
        googleDailyTrends.length
      );
      const trendNames = getGoogleTrendNames(
        googleDailyTrends,
        maxNumTrendsToShow
      );

      // init the color palette
      const palette = getColors(
        "Rainbow",
        "Very High",
        googleDailyTrends.length
      );

      // init the colors for all trends
      allTrendNames.map((name, i) => {
        colorMap.set(name, palette[i]);
        sourceMap.set(name, i);
      });

      // init the list of trends (only the ones within the given limit)
      setGoogleDailyTrendsNames(trendNames);
      setColorMap(colorMap);
      setSourceMap(sourceMap);
    }
    // compute state around google realtim trends
    if (googleRealtimeTrends) {
      const allTrendNames = getGoogleTrendNames(
        googleRealtimeTrends,
        googleRealtimeTrends.length
      );
      const trendNames = getGoogleTrendNames(
        googleRealtimeTrends,
        maxNumTrendsToShow
      );

      // init the color palette
      const palette = getColors(
        "Rainbow",
        "Very High",
        googleRealtimeTrends.length
      );

      // init the colors for all trends
      allTrendNames.map((name, i) => {
        googleRealtimeTrendsColorMap.set(name, palette[i]);
        googleRealtimeTrendsSourceMap.set(name, i);
      });

      // init the list of trends (only the ones within the given limit)
      setGoogleRealtimeTrendsNames(trendNames);
      setgoogleRealtimeTrendsColorMap(googleRealtimeTrendsColorMap);
      setgoogleRealtimeTrendsSourceMap(googleRealtimeTrendsSourceMap);
    }
  }, [
    googleDailyTrends,
    googleDailyRegionTrends,
    googleRealtimeTrends,
    googleRealtimeRegionTrends,
    // isTooltipVisible,
    maxNumTrendsToShow,
    // selectedContrast,
    // selectedPalette,
  ]);

  useEffect(() => {
    if (googleDailyTrends) {
      setRelatedArticles(getGoogleTrendArticles(googleDailyTrends));
    }
  }, [googleDailyTrends, selectedTrend]);

  useEffect(() => {
    if (zipcodePlace && !coordinates) {
      setZipcodePlaces([].concat(zipcodePlace));
    } else if (zipcodesByGPS) {
      setZipcodePlaces([].concat(zipcodesByGPS));
      // update zipcode in the input field
      setZipcode(
        zipcodesByGPS[0]?.Fields?.zip ? zipcodesByGPS[0]?.Fields?.zip : zipcode ? zipcode : INITIAL_VALUE
      );
    }
  }, [zipcodePlace, zipcodesByGPS]);

  useEffect(() => {
    setSelectedRegions(
      zipcodePlaces.map((p) => {
        const regionFullName = p.Fields.state
          ? convertRegion(p.Fields.state, false)
          : null;
        if (!regionFullName) {
          return;
        }
        return {
          label: regionFullName,
          value: regionFullName,
        };
      })
    );
  }, [zipcodePlace, zipcodesByGPS, zipcodePlaces]);

  const getGoogleTrendArticles = (
    trends
  ): (GoogleDailyTrendArticle | GoogleRealtimeTrendArticle)[] => {
    return selectedTrend
      ? trends
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

  const getGoogleTrendNames = (trends, max): string[] => {
    return trends
      .map((trend) => {
        if (isGoogleDailyTrend(trend)) {
          return trend.title.query;
        } else if (isGoogleRealtimeTrend(trend)) {
          return trend.title;
        }
      })
      .slice(0, max);
  };

  const handleTrendClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
    name: string
  ): void => {
    setSelectedTrend(name);
  };

  const handleChangeHighlightedTrend = (name: string) => {
    setHighlightedTrend(name);
  };

  /**
   * Will nullify selectedTrend
   */
  const handleCloseDialog = () => {
    setSelectedTrend("");
  };

  const handleChangeZipcode = (zipcode) => {
    setZipcode(zipcode);
    setCoordinates(null);
  };

  const handleChangeCoordinates = (coordinates) => {
    setCoordinates(coordinates);
  };

  return (
    <Layout>
      <Head>
        <title>Trending Nearby | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <GoogleTrendArticleDialog
        googleTrendsUrl={googleTrendsUrl}
        googleTrendsUrlQueryToken={googleTrendsUrlQueryToken}
        handleCloseDialog={handleCloseDialog}
        relatedArticles={relatedArticles}
        selectedTrend={selectedTrend}
      ></GoogleTrendArticleDialog>
      <Box>
        <Paper>
          <h2>Trending Nearby</h2>
          <div>
            <LocationForm
              initialValue={zipcode}
              handleChangeZipcode={handleChangeZipcode}
              handleChangeCoordinates={handleChangeCoordinates}
            />
            {isLoading ? (
              <Loading />
            ) : !zipcodePlaces.length ? (
              `No location found!`
            ) : null}
          </div>
          <section>
            <h2>Trending Today</h2>
            <GoogleTrendsList
              googleTrendNames={googleDailyTrendsNames}
              colorMap={googleDailyColorMap}
              withColor={isWithColors}
              handleTrendClick={handleTrendClick}
              highlightedTrend={highlightedTrend}
              handleChangeHighlightedTrend={handleChangeHighlightedTrend}
            >
              <GoogleTrendsByRegionList
                googleRegionTrends={
                  googleDailyRegionTrends ? googleDailyRegionTrends : []
                }
                // handleClick={handleListDelete}
                handleTrendClick={handleTrendClick}
                isAlphabetical={true}
                maxNumTrendsToShow={maxNumTrendsToShow}
                sourceMap={sourceMap}
                selectedRegions={selectedRegions}
                colorMap={googleDailyColorMap}
                withColor={isWithColors}
                withTitle
                highlightedTrend={highlightedTrend}
                handleChangeHighlightedTrend={handleChangeHighlightedTrend}
              />
            </GoogleTrendsList>
          </section>
          <section>
            <h2>Trending Right Now</h2>
            <GoogleTrendsList
              googleTrendNames={googleRealtimeTrendsNames}
              colorMap={googleRealtimeTrendsColorMap}
              withColor={isWithColors}
              handleTrendClick={handleTrendClick}
              highlightedTrend={highlightedTrend}
              handleChangeHighlightedTrend={handleChangeHighlightedTrend}
            >
              <GoogleTrendsByRegionList
                googleRegionTrends={
                  googleRealtimeRegionTrends ? googleRealtimeRegionTrends : []
                }
                // handleClick={handleListDelete}
                handleTrendClick={handleTrendClick}
                isAlphabetical={true}
                maxNumTrendsToShow={maxNumTrendsToShow}
                sourceMap={googleRealtimeTrendsSourceMap}
                selectedRegions={selectedRegions}
                colorMap={googleRealtimeTrendsColorMap}
                withColor={isWithColors}
                withTitle
                highlightedTrend={highlightedTrend}
                handleChangeHighlightedTrend={handleChangeHighlightedTrend}
              />
            </GoogleTrendsList>
          </section>
        </Paper>
      </Box>
    </Layout>
  );
}
