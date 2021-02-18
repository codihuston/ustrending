import React, { useEffect, useState } from "react";
import { ValueType } from "react-select";
import invert from "invert-color";
import { Box, makeStyles } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import {
  GoogleRegionTrend,
  RegionTrend,
  SelectStringOptionType,
} from "../types";
import { getListPositionChange, getSelectedRegionOption } from "../lib";
import { PositionChangeIndicator } from "./PositionChangeIndicator";

const useStyles = makeStyles((theme) => ({
  root: {},
  topRight: { position: "absolute", top: 0, right: 0 },
  trendingRank: {
    borderRadius: "2px",
    textAlign: "center",
  },
  trendingName: {
    width: "99%",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
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
  maxNumTrendsToShow: number;
  selectedRegions: ValueType<SelectStringOptionType, true>;
  sourceMap: Map<string, number>;
  withTitle?: boolean;
  withColor?: boolean;
};

export function GoogleTrendsByRegionListItem({
  colorMap,
  handleClick,
  handleTrendClick,
  maxNumTrendsToShow,
  region,
  selectedRegions,
  sourceMap,
  withColor,
  withTitle,
}: Props) {
  const classes = useStyles();
  const defaultFontColor = "#FFFFFF";
  const [trends, setTrends] = useState<RegionTrend[]>([]);

  useEffect(() => {
    if (region && maxNumTrendsToShow) {
      setTrends(region.trends.slice(0, maxNumTrendsToShow));
    } else {
      setTrends(region.trends);
    }
  }, [
    colorMap,
    handleClick,
    handleTrendClick,
    maxNumTrendsToShow,
    region,
    selectedRegions,
    sourceMap,
    withColor,
    withTitle,
  ]);
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
      {trends.map((trend, i) => {
        // add +1 to account for the first column that contains the region name (non-trending data)
        const positionChange = getListPositionChange(trend.topic, i, sourceMap);
        const color = colorMap.get(trend.topic);
        const fontColor = color ? color : defaultFontColor;

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
                    color: invert(fontColor, true),
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
                  <Box className={classes.trendingName} title={trend.topic}>
                    {trend.topic}
                  </Box>
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
