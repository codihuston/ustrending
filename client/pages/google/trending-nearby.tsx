import { useState, useEffect } from "react";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { ValueType } from "react-select";
import Head from "next/head";
import { Box, makeStyles, Paper, Theme } from "@material-ui/core";

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
  useZipcodesByGPS,
  useZipcode,
} from "../../hooks";
import { getColors } from "../../themes";
import Layout from "../../components/Layout";
import Loading from "../../components/Loading";
import LocationForm from "../../components/LocationForm";
import GoogleTrendArticleDialog from "../../components/GoogleTrendArticleDialog";
import GoogleTrendsList from "../../components/GoogleTrendsList";
import GoogleTrendsByRegionList from "../../components/GoogleTrendsByRegionList";
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
// sort region list items
const isAlphabetical = true;

/**
 * Statically loads values before page render.
 *
 * @returns
 */
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
  // google trends
  const [googleDailyTrendsNames, setGoogleDailyTrendsNames] = useState<
    string[]
  >([]);
  const [googleRealtimeTrendsNames, setGoogleRealtimeTrendsNames] = useState<
    string[]
  >([]);
  const [googleDailyColorMap, setGoogleDailyTrendsColorMap] = useState<
    Map<string, string>
  >(new Map());
  const [googleRealtimeTrendsColorMap, setgoogleRealtimeTrendsColorMap] =
    useState<Map<string, string>>(new Map());
  const [googleDailyTrendSourceMap, setGoogleDailyTrendSourceMap] = useState<
    Map<string, number>
  >(new Map());
  const [googleRealtimeTrendsSourceMap, setgoogleRealtimeTrendsSourceMap] =
    useState<Map<string, number>>(new Map());
  // hooks
  const { data: zipcodePlace, isLoading: isLoadingZip } = useZipcode(
    zipcode,
    1
  );
  const { data: zipcodesByGPS, isLoading: isLoadingZipGPS } = useZipcodesByGPS(
    coordinates,
    1
  );
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

  /**
   * Compute google daily/realtime trend properties
   */
  useEffect(() => {
    const colorMap = new Map<string, string>();
    const googleDailyTrendSourceMap = new Map<string, number>();
    const googleRealtimeTrendsColorMap = new Map<string, string>();
    const googleRealtimeTrendsSourceMap = new Map<string, number>();

    if (googleDailyTrends) {
      // get all daily trend names
      const allTrendNames = getGoogleTrendNames(
        googleDailyTrends,
        googleDailyTrends.length
      );

      // init the color palette for all daily trends
      const palette = getColors(
        "Rainbow",
        "Very High",
        googleDailyTrends.length
      );

      // init the colors for all daily trends
      allTrendNames.map((name, i) => {
        colorMap.set(name, palette[i]);
        googleDailyTrendSourceMap.set(name, i);
      });

      setGoogleDailyTrendsNames(allTrendNames);
      setGoogleDailyTrendsColorMap(colorMap);
      setGoogleDailyTrendSourceMap(googleDailyTrendSourceMap);
    }

    // compute state around google realtime trends
    if (googleRealtimeTrends) {
      // get all realtime trend names
      const allTrendNames = getGoogleTrendNames(
        googleRealtimeTrends,
        googleRealtimeTrends.length
      );

      // init the realtime color palette
      const palette = getColors(
        "Rainbow",
        "Very High",
        googleRealtimeTrends.length
      );

      // init the colors for all realtime trends
      allTrendNames.map((name, i) => {
        googleRealtimeTrendsColorMap.set(name, palette[i]);
        googleRealtimeTrendsSourceMap.set(name, i);
      });

      // init the list of trends (only the ones within the given limit)
      setGoogleRealtimeTrendsNames(allTrendNames);
      setgoogleRealtimeTrendsColorMap(googleRealtimeTrendsColorMap);
      setgoogleRealtimeTrendsSourceMap(googleRealtimeTrendsSourceMap);
    }
  }, [
    googleDailyTrends,
    googleDailyRegionTrends,
    googleRealtimeTrends,
    googleRealtimeRegionTrends,
    maxNumTrendsToShow,
  ]);

  /**
   * Compute google daily/realtime article list
   */
  useEffect(() => {
    let articles = [];
    if (googleDailyTrends) {
      articles = getGoogleTrendArticles(googleDailyTrends);
    }
    if (googleRealtimeTrends) {
      articles = articles.concat(getGoogleTrendArticles(googleRealtimeTrends));
    }
    setRelatedArticles(articles);
  }, [googleDailyTrends, googleRealtimeTrends, selectedTrend]);

  /**
   * Compute zipcode/location
   */
  useEffect(() => {
    if (zipcodePlace && !coordinates) {
      setZipcodePlaces([].concat(zipcodePlace));
    } else if (zipcodesByGPS) {
      setZipcodePlaces([].concat(zipcodesByGPS));
      // update zipcode in the input field
      setZipcode(
        zipcodesByGPS[0]?.Fields?.zip
          ? zipcodesByGPS[0]?.Fields?.zip
          : zipcode
          ? zipcode
          : INITIAL_VALUE
      );
    }
  }, [zipcodePlace, zipcodesByGPS]);

  /**
   * Compute selected region based on zipcode(s)
   */
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

  /**
   * @returns google daily/realtime article list
   */
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

  /**
   * @returns google daily/realtime names, used in the list components
   */
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

  /**
   * Handles selection (click) of a trend
   *
   * @param e
   * @param name
   */
  const handleTrendClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
    name: string
  ): void => {
    setSelectedTrend(name);
  };

  /**
   * Handles mousing over a trend
   *
   * @param name
   */
  const handleChangeHighlightedTrend = (name: string) => {
    setHighlightedTrend(name);
  };

  /**
   * Will nullify selectedTrend
   */
  const handleCloseDialog = () => {
    setSelectedTrend("");
  };

  /**
   * Change the zipcode
   *
   * @param zipcode
   */
  const handleChangeZipcode = (zipcode) => {
    setZipcode(zipcode);
    setCoordinates(null);
  };

  /**
   * Change the coordinates
   *
   * @param coordinates
   */
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
                isAlphabetical={isAlphabetical}
                maxNumTrendsToShow={maxNumTrendsToShow}
                sourceMap={googleDailyTrendSourceMap}
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
                handleTrendClick={handleTrendClick}
                isAlphabetical={isAlphabetical}
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
