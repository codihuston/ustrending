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
  SelectStringOptionType,
} from "../../../types";
import {
  fetchGoogleDailyTrends,
  fetchGoogleDailyTrendsByState,
} from "../../../queries";
import {
  useDebouncedCallback,
  useGoogleDailyTrends,
  useGoogleDailyTrendsByState,
  usePlacesByZipcode,
  usePlacesByGPS,
} from "../../../hooks";
import { getColors, defaultPalette, defaultContrast } from "../../../themes";
import Layout from "../../../components/Layout";
import LocationForm from "../../../components/LocationForm";
import ColorPalette from "../../../components/ColorPalette";
import GoogleRealtimeTrendArticleDialog from "../../../components/GoogleRealtimeTrendArticleDialog";
import GoogleDailyTrendArticleDialog from "../../../components/GoogleDailyTrendArticleDialog";
import GoogleTrendsList from "../../../components/GoogleTrendsList";
import GoogleTrendsByRegionList from "../../../components/GoogleTrendsByRegionList";
import RegionSelect from "../../../components/RegionSelect";
import GoogleTrendsTableContainer, {
  RowProps,
} from "../../../components/containers/GoogleTrendsTableContainer";
import GoogleTrendsMap, {
  MapColorMode,
} from "../../../components/GoogleTrendsMap";

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

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export default function TrendingNearby() {
  // stateful data
  const INITIAL_VALUE = "10002";
  const [zipcode, setZipcode] = useState<string>(INITIAL_VALUE);
  const [coordinates, setCoordinates] = useState<[number, number]>(null);

  const { data: placesByZipcode } = usePlacesByZipcode(zipcode, 1);
  const { data: placesByCoordinates } = usePlacesByGPS(coordinates, 1);
  const places = placesByZipcode || placesByCoordinates || [];

  const handleChangeZipcode = (zipcode) => {
    setZipcode(zipcode);
    setCoordinates(null);
  };

  const handleChangeCoordinates = (coordinates) => {
    setCoordinates(coordinates);
    setZipcode(null);
  };

  return (
    <Layout>
      <Head>
        <title>Trending Nearby | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <Box>
        <Paper>
          <h2>Trending Nearby</h2>
          <div>
            <LocationForm
              initialValue={zipcode}
              handleChangeZipcode={handleChangeZipcode}
              handleChangeCoordinates={handleChangeCoordinates}
            />
            {!places.length ? `No location found!` : null}
          </div>
          {places &&
            places.map((p, i) => {
              return (
                <div key={i}>
                  {p.name}, {p.region}, [{p.geo.coordinates[0]},{" "}
                  {p.geo.coordinates[1]}],{" "}
                  {p.region ? convertRegion(p.region, false) : null}
                </div>
              );
            })}
        </Paper>
      </Box>
    </Layout>
  );
}
