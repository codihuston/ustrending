import React from "react";
import { ValueType } from "react-select";
import { Grid, Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { GoogleRegionTrend, RegionSelectOptionType } from "../types";

type Props = {
  colorMap: Map<string, string>;
  googleRegionTrends: GoogleRegionTrend[];
  handleClick(
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    selectedRegion: ValueType<RegionSelectOptionType, true>
  ): void;
  isAlphabetical: boolean;
  selectedRegions: ValueType<RegionSelectOptionType, true>;
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

export function GoogleDailyTrendsByRegionList({
  colorMap,
  googleRegionTrends,
  handleClick,
  isAlphabetical,
  selectedRegions,
  withTitle,
}: Props) {
  let regions: GoogleRegionTrend[] = [];

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
    <Grid container direction="row" justify="center" alignItems="center">
      {regions.map((region) => (
        <List key={region.name}>
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
            return (
              <ListItem key={i}>
                <ListItemText>
                  {/* TODO: color this better */}
                  <Typography
                    style={{ backgroundColor: colorMap.get(trend.topic) }}
                  >
                    #{i + 1}. {trend.topic} | {trend.geoCode} | {trend.value}
                  </Typography>
                </ListItemText>
              </ListItem>
            );
          })}
        </List>
      ))}
    </Grid>
  );
}
