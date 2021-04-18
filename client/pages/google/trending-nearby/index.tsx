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

import { convertRegion } from "../../../lib";
import {
  GoogleDailyTrendArticle,
  GoogleRealtimeTrendArticle,
  SelectStringOptionType,
  ZipCode,
  isGoogleDailyTrend,
  isGoogleRealtimeTrend,
} from "../../../types";
import {
  fetchGoogleDailyTrends,
  fetchGoogleDailyTrendsByState,
  fetchGoogleRealtimeTrends,
  fetchGoogleRealtimeTrendsByState,
} from "../../../queries";
import {
  useDebouncedCallback,
  useGoogleDailyTrends,
  useGoogleDailyTrendsByState,
  useGoogleRealtimeTrends,
  useGooleRealtimeTrendsByState,
  usePlacesByZipcode,
  useZipcodesByGPS,
  useZipcode,
} from "../../../hooks";
import { getColors, defaultPalette, defaultContrast } from "../../../themes";
import Layout from "../../../components/Layout";
import Loading from "../../../components/Loading";
import LocationForm from "../../../components/LocationForm";
import ColorPalette from "../../../components/ColorPalette";
import GoogleRealtimeTrendArticleDialog from "../../../components/GoogleRealtimeTrendArticleDialog";
import GoogleTrendArticleDialog from "../../../components/GoogleTrendArticleDialog";
import GoogleTrendsList from "../../../components/GoogleTrendsList";
import GoogleTrendsByRegionList from "../../../components/GoogleTrendsByRegionList";
import RegionSelect from "../../../components/RegionSelect";
import GoogleTrendsTableContainer, {
  RowProps,
} from "../../../components/containers/GoogleTrendsTableContainer";
import GoogleTrendsMap, {
  MapColorMode,
} from "../../../components/GoogleTrendsMap";

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
  const [relatedArticles, setRelatedArticles] = useState<
    (GoogleDailyTrendArticle | GoogleRealtimeTrendArticle)[]
  >([]);
  // daily trends state
  const [googleDailyTrendsNames, setGoogleDailyTrendsNames] = useState<
    string[]
  >([]);
  const [googleDailyColorMap, setColorMap] = useState<Map<string, string>>(
    new Map()
  );
  const [sourceMap, setSourceMap] = useState<Map<string, number>>(new Map());
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
  let places: ZipCode[] = [];
  const isLoading = isLoadingZip || isLoadingZipGPS;

  useEffect(() => {
    const colorMap = new Map<string, string>();
    const sourceMap = new Map<string, number>();

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
    }

    // compute state around googleRegionTrends (for table)
    // if (googleDailyRegionTrends) {
    //   setRows(
    //     googleDailyRegionTrends.map((region) => {
    //       const topics = region.trends.map((trend) => trend.topic);

    //       return {
    //         region: region.name,
    //         ...topics,
    //       };
    //     })
    //   );
    // }
    // setTooltipVisibility(true);
    setColorMap(colorMap);
    setSourceMap(sourceMap);
  }, [
    googleDailyTrends,
    googleDailyRegionTrends,
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

  if (zipcodePlace) {
    places = [].concat(zipcodePlace);
  } else if (zipcodesByGPS) {
    places = [].concat(zipcodesByGPS);
  }

  const handleChangeZipcode = (zipcode) => {
    setZipcode(zipcode);
    setCoordinates(null);
  };

  const handleChangeCoordinates = (coordinates) => {
    setCoordinates(coordinates);
    setZipcode(null);
  };

  const selectedRegions = [
    {
      label: "Kentucky",
      value: "Kentucky",
    },
  ];

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
            ) : !places.length ? (
              `No location found!`
            ) : null}
          </div>
          {places &&
            places.map((p, i) => {
              const regionFullName = p.Fields.state
                ? convertRegion(p.Fields.state, false)
                : null;
              if (!p) {
                return;
              }
              return (
                <div key={i}>
                  {p.Fields.city}, {p.Fields.state}, [
                  {p.geometry.coordinates[0]}, {p.geometry.coordinates[1]}]
                  <div>Trending Overall Today in the United States</div>
                  <ul>
                    {googleDailyTrends.map((t, i) => (
                      <li key={i}>
                        {i + 1} {t.title.query}
                      </li>
                    ))}
                  </ul>
                  <div>Trending Right Now in the United States</div>
                  <ul>
                    {googleRealtimeTrends.map((t, i) => (
                      <li key={i}>
                        {i + 1} {t.title}
                      </li>
                    ))}
                  </ul>
                  <div>Trending Overall Today for {regionFullName}</div>
                  {/* <ul>
                    {googleDailyRegionTrends
                      .find((x) => x.name === regionFullName)
                      .trends.map((t, i) => (
                        <li key={i}>
                          {i + 1} {t.topic}
                        </li>
                      ))}
                  </ul> */}
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
                      selectedRegions={[
                        { label: regionFullName, value: regionFullName },
                      ]}
                      colorMap={googleDailyColorMap}
                      withColor={isWithColors}
                      withTitle
                      highlightedTrend={highlightedTrend}
                      handleChangeHighlightedTrend={
                        handleChangeHighlightedTrend
                      }
                    />
                  </GoogleTrendsList>
                  <div>Trending Right Now for {regionFullName}</div>
                  <ul>
                    {googleRealtimeRegionTrends
                      .find((x) => x.name === regionFullName)
                      .trends.map((t, i) => (
                        <li key={i}>
                          {i + 1} {t.topic}
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
        </Paper>
      </Box>
    </Layout>
  );
}
