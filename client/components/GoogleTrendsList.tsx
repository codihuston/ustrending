import React, { FunctionComponent } from "react";
import invert from "invert-color";
import {
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Theme,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  highlight: {
    backgroundColor: theme.palette.info.light,
  },
  trendingRank: {
    borderRadius: "2px",
    textAlign: "center",
    width: "3rem",
  },
  trendingName: {
    maxWidth: "10rem",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
}));

type Props = {
  googleTrendNames: string[];
  handleTrendClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    name: string
  ): void;
  colorMap: Map<string, string>;
  withColor: boolean;
  highlightedTrend: string;
  handleChangeHighlightedTrend(name: string): void;
};

const GoogleTrendsList: FunctionComponent<Props> = ({
  children,
  colorMap,
  googleTrendNames,
  handleTrendClick,
  withColor,
  highlightedTrend,
  handleChangeHighlightedTrend,
}) => {
  const classes = useStyles();

  if (!googleTrendNames || !googleTrendNames.length) {
    return <span>Error: no google trends are provided!</span>;
  }

  return (
    <Box>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={3}
      >
        {/* display trends for this country */}
        <List>
          <ListItem>
            <ListItemText>
              <Box textAlign="center">United States</Box>
            </ListItemText>
          </ListItem>
          <Divider />
          {googleTrendNames.map((trend, i) => {
            const color = colorMap.get(trend);
            const background = color ? color : "#000000";
            const textColor = color
              ? invert(color, true)
              : invert(background, true);

            return (
              <ListItem
                key={i}
                button
                onMouseEnter={(e) => handleChangeHighlightedTrend(trend)}
                className={
                  highlightedTrend === trend ? classes.highlight : null
                }
              >
                <Box display="flex" width={"100%"}>
                  {withColor ? (
                    <Box
                      className={classes.trendingRank}
                      display="flex"
                      justifyContent="center"
                      style={{
                        background,
                        color: textColor,
                      }}
                    >
                      <ListItemText>
                        <b>{i + 1}</b>
                      </ListItemText>
                    </Box>
                  ) : (
                    <Box>
                      <ListItemText>
                        <b>{i + 1}</b>
                      </ListItemText>
                    </Box>
                  )}
                  <Box ml={2} flexGrow={1}>
                    <ListItemText
                      className="cursor-pointer"
                      onClick={(
                        event: React.MouseEvent<HTMLDivElement, MouseEvent>
                      ) => handleTrendClick(event, trend)}
                    >
                      <Box
                        className={classes.trendingName}
                        title={`Click to view news about "${trend}"`}
                      >
                        {trend}
                      </Box>
                    </ListItemText>
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>
        {children}
      </Grid>
    </Box>
  );
};

export default GoogleTrendsList;
