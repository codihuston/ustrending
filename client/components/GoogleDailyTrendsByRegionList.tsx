import React, { useMemo } from "react";
import { BsDash } from "react-icons/bs";
import { ValueType } from "react-select";
import { Box, Grid } from "@material-ui/core";
import List from "@material-ui/core/List";

import { GoogleRegionTrend, RegionSelectOptionType } from "../types";
import { getSelectedRegionOption } from "../lib";
import { StyledUpArrow, StyledDownArrow } from "./Icons";
import { GoogleDailyTrendsByRegionListItem } from "./GoogleDailyTrendsByRegionListItem";

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
  withColor?: boolean;
};

export function PositionChangeIndicator({ index }) {
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
  withColor,
  withTitle,
}: Props) {
  return useMemo(() => {
    let regions: GoogleRegionTrend[] = [];

    if (!googleRegionTrends || !googleRegionTrends.length) {
      return <span>Error: no google trends are provided!</span>;
    }

    // sort regions by name
    if (isAlphabetical) {
      regions = googleRegionTrends.filter((region) => {
        const foundRegion = getSelectedRegionOption(
          region.name,
          selectedRegions
        );
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
              <List>
                <GoogleDailyTrendsByRegionListItem
                  colorMap={colorMap}
                  handleClick={handleClick}
                  region={region}
                  selectedRegions={selectedRegions}
                  sourceMap={sourceMap}
                  withColor={withColor}
                  withTitle={withTitle}
                />
              </List>
          ))}
        </Grid>
      </Box>
    );
  }, [
    colorMap,
    googleRegionTrends,
    handleClick,
    isAlphabetical,
    selectedRegions,
    sourceMap,
    withColor,
    withTitle,
  ]);
}
