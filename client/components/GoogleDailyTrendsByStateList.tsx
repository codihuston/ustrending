import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { GoogleRegionTrend } from "../types";

type Props = {
  withTitle?: boolean;
  googleDailyTrendsByState: GoogleRegionTrend[];
  selectedRegion: string;
};

const defaultProps = {
  bgcolor: "background.paper",
  width: "100%",
  maxWidth: 360,
  margin: "auto",
  // border: 1,
  boxShadow: 3,
};

export function GoogleDailyTrendsByStateList({
  withTitle,
  googleDailyTrendsByState,
  selectedRegion,
}: Props) {
  if (!googleDailyTrendsByState || !googleDailyTrendsByState.length) {
    return <span>Error: no google daily trends are provided!</span>;
  }

  const region = googleDailyTrendsByState.find(
    (x) => x.name === selectedRegion
  );

  if (!region) {
    return <span>Please select a region.</span>;
  } else if (!region.trends.length) {
    return <span>No regions found for {region}.</span>;
  }

  return (
    <Box {...defaultProps}>
      <List>
        {withTitle ? (
          <>
            <ListItem>
              <ListItemText>Trending today in {selectedRegion}</ListItemText>
            </ListItem>
            <Divider />
          </>
        ) : null}
        {region.trends.map((trend, i) => {
          return (
            <ListItem key={i}>
              <ListItemText>
                <Typography>
                  #{i + 1}. {trend.topic} | {trend.geoCode} | {trend.value}
                </Typography>
              </ListItemText>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
