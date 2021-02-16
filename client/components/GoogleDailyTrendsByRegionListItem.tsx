import React from "react";
import { ValueType } from "react-select";
import invert from "invert-color";
import { Box, makeStyles } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { GoogleRegionTrend, SelectStringOptionType } from "../types";
import { getListPositionChange, getSelectedRegionOption } from "../lib";
import { PositionChangeIndicator } from "./PositionChangeIndicator";

const useStyles = makeStyles((theme) => ({
  root: {},
  topRight: { position: "absolute", top: 0, right: 0 },
  trendingRank: {
    borderRadius: "2px",
    textAlign: "center",
  },
}));

type Props = {
  colorMap: Map<string, string>;
  region: GoogleRegionTrend;
  handleClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    selectedRegion: ValueType<SelectStringOptionType, true>
  ): void;
  handleTrendClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    name: string
  ): void;
  selectedRegions: ValueType<SelectStringOptionType, true>;
  sourceMap: Map<string, number>;
  withTitle?: boolean;
  withColor?: boolean;
};

export function GoogleDailyTrendsByRegionListItem({
  colorMap,
  handleClick,
  handleTrendClick,
  region,
  selectedRegions,
  sourceMap,
  withColor,
  withTitle,
}: Props) {
  const classes = useStyles();

  return (
    <>
      {withTitle ? (
        <>
          <ListItem
            button
            className="cursor-pointer"
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
              handleClick(
                e,
                getSelectedRegionOption(region.name, selectedRegions)
              )
            }
          >
            <ListItemText>
              <Box textAlign="center">{region.name}</Box>
            </ListItemText>
            <IconButton
              className={classes.topRight}
              aria-label="delete"
              color="secondary"
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
          <Divider />
        </>
      ) : null}
      {region.trends.map((trend, i) => {
        // add +1 to account for the first column that contains the region name (non-trending data)
        const positionChange = getListPositionChange(trend.topic, i, sourceMap);

        return (
          <ListItem key={i} button>
            <Box display="flex" width={"100%"}>
              {withColor ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  width={"3rem"}
                  className={classes.trendingRank}
                  style={{
                    background: colorMap.get(trend.topic),
                    color: invert(colorMap.get(trend.topic), true),
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
                  onClick={(
                    event: React.MouseEvent<HTMLDivElement, MouseEvent>
                  ) => handleTrendClick(event, trend.topic)}
                >
                  {trend.topic}
                </ListItemText>
              </Box>
              <Box>
                <ListItemText>
                  <PositionChangeIndicator index={positionChange} />
                </ListItemText>
              </Box>
            </Box>
          </ListItem>
        );
      })}
    </>
  );
}
