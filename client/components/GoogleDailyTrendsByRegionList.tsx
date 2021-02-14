import React from "react";
import invert from "invert-color";
import { BsDash } from "react-icons/bs";
import { ValueType } from "react-select";
import { Box, Grid } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { GoogleRegionTrend, RegionSelectOptionType } from "../types";
import { StyledUpArrow, StyledDownArrow } from "./Icons";

type Props = {
  colorMap: Map<string, string>;
  googleRegionTrends: GoogleRegionTrend[];
  handleClick(
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    selectedRegion: ValueType<RegionSelectOptionType, true>
  ): void;
  isAlphabetical: boolean;
  selectedRegions: ValueType<RegionSelectOptionType, true>;
  sourceMap: Map<string, number>;
  withTitle?: boolean;
};

export function getSelectedRegionOption(
  regionName,
  selectedRegions
): ValueType<RegionSelectOptionType, true> {
  for (const givenRegion of selectedRegions) {
    if (givenRegion.label === regionName || givenRegion.value === regionName) {
      return givenRegion;
    }
  }
  return null;
}

function PositionChangeIndicator({ index }) {
  const description = `This trend has changed ${index} positions relative to the trends for this country.`;
  const style = {
    cursor: "pointer",
  };
  let Position = null;

  if (index > 0) {
    Position = <StyledUpArrow color={"success"} number={index} />;
  } else if (index < 0) {
    Position = <StyledDownArrow color={"error"} number={index * -1} />;
  } else if (index === 0) {
    return <BsDash />;
  }
  return (
    <span title={description} style={style}>
      {Position}
    </span>
  );
}

export function GoogleDailyTrendsByRegionList({
  colorMap,
  googleRegionTrends,
  handleClick,
  isAlphabetical,
  selectedRegions,
  sourceMap,
  withTitle,
}: Props) {
  let regions: GoogleRegionTrend[] = [];

  function getListPositionChange(topic: string, index: number) {
    const srcIndex = sourceMap.get(topic);
    if (srcIndex >= 0) {
      return srcIndex - index;
    }
    return 0;
  }

  if (!googleRegionTrends || !googleRegionTrends.length) {
    return <span>Error: no google trends are provided!</span>;
  }

  // sort regions by name
  if (isAlphabetical) {
    regions = googleRegionTrends.filter((region) => {
      const foundRegion = getSelectedRegionOption(region.name, selectedRegions);
      return foundRegion ? foundRegion : false;
    });
  }
  // sort regions by the position in which they were clicked
  else {
    // for each selected option
    for (const option of selectedRegions) {
      // pick it out of googleRegionTrends
      for (const region of googleRegionTrends) {
        if (option.value === region.name || option.label === region.name) {
          regions.push(region);
        }
      }
    }
  }

  if (!selectedRegions || selectedRegions.length <= 0) {
    return <div>Please select a region.</div>;
  } else if (!regions || regions.length <= 0) {
    return <div>No regions found for {regions.join(", ")}.</div>;
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
        {regions.map((region) => (
          <Grid
            item
            key={region.name}
            style={{
              minWidth: "25%",
            }}
          >
            <List>
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
                      <Box
                        display="flex"
                        justifyContent="center"
                        width={50}
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
            </List>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
