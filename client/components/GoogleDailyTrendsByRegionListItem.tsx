import React from "react";
import { ValueType } from "react-select";
import invert from "invert-color";
import { Box } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { GoogleRegionTrend, RegionSelectOptionType } from "../types";
import { getSelectedRegionOption } from "../lib";
import { PositionChangeIndicator } from "./GoogleDailyTrendsByRegionList";

type Props = {
  colorMap: Map<string, string>;
  region: GoogleRegionTrend;
  handleClick(
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    selectedRegion: ValueType<RegionSelectOptionType, true>
  ): void;
  selectedRegions: ValueType<RegionSelectOptionType, true>;
  sourceMap: Map<string, number>;
  withTitle?: boolean;
  withColor?: boolean;
};

export function GoogleDailyTrendsByRegionListItem({
  colorMap,
  handleClick,
  region,
  selectedRegions,
  sourceMap,
  withColor,
  withTitle,
}: Props) {
  /**
   * Calculates position changes of a topic in this region list, compared to the sourceMap
   * @param topic
   * @param index
   */
  function getListPositionChange(topic: string, index: number) {
    const srcIndex = sourceMap.get(topic);
    if (srcIndex >= 0) {
      return srcIndex - index;
    }
    return 0;
  }

  return (
    <>
      {withTitle ? (
        <>
          <ListItem
            style={{
              cursor: "pointer",
            }}
            onClick={(e) =>
              handleClick(
                e,
                getSelectedRegionOption(region.name, selectedRegions)
              )
            }
          >
            <ListItemText style={{ textAlign: "center" }}>
              {region.name}
            </ListItemText>
            <IconButton
              aria-label="delete"
              color="secondary"
              style={{ position: "absolute", top: 0, right: 0 }}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
          <Divider />
        </>
      ) : null}
      {region.trends.map((trend, i) => {
        const positionChange = getListPositionChange(trend.topic, i);

        return (
          <ListItem key={i}>
            <Box display="flex" width={"100%"}>
              {withColor ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  width={"3rem"}
                  style={{
                    background: colorMap.get(trend.topic),
                    color: invert(colorMap.get(trend.topic), true),
                    borderRadius: "2px",
                    textAlign: "center",
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
                <ListItemText>{trend.topic}</ListItemText>
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
