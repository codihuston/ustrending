import React, { FunctionComponent, useMemo } from "react";
import { ValueType } from "react-select";
import List from "@material-ui/core/List";

import { GoogleRegionTrend, SelectStringOptionType } from "../types";
import { getSelectedRegionOption } from "../lib";
import GoogleTrendsByRegionListItem from "./GoogleTrendsByRegionListItem";

type Props = {
  colorMap: Map<string, string>;
  googleRegionTrends: GoogleRegionTrend[];
  handleClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    selectedRegion: ValueType<SelectStringOptionType, true>
  ): void;
  handleTrendClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    name: string
  ): void;
  highlightedTrend: string;
  handleChangeHighlightedTrend(name: string): void;
  isAlphabetical: boolean;
  maxNumTrendsToShow: number;
  selectedRegions: ValueType<SelectStringOptionType, true>;
  sourceMap: Map<string, number>;
  withTitle?: boolean;
  withColor?: boolean;
};

const GoogleTrendsByRegionList: FunctionComponent<Props> = ({
  colorMap,
  googleRegionTrends,
  handleClick,
  handleTrendClick,
  highlightedTrend,
  handleChangeHighlightedTrend,
  isAlphabetical,
  maxNumTrendsToShow,
  selectedRegions,
  sourceMap,
  withColor,
  withTitle,
}) => {
  const regions = useMemo<GoogleRegionTrend[]>(() => {
    let regions: GoogleRegionTrend[] = [];

    if (!googleRegionTrends || !googleRegionTrends.length) {
      return [];
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
      return [];
    } else if (!regions || regions.length <= 0) {
      return [];
    }
    return regions;
  }, [
    colorMap,
    googleRegionTrends,
    handleClick,
    isAlphabetical,
    maxNumTrendsToShow,
    selectedRegions,
    sourceMap,
    withColor,
    withTitle,
  ]);

  return (
    <>
      {regions.map((region: GoogleRegionTrend, i: number) => (
        <List key={i}>
          <GoogleTrendsByRegionListItem
            colorMap={colorMap}
            handleClick={handleClick}
            handleTrendClick={handleTrendClick}
            maxNumTrendsToShow={maxNumTrendsToShow}
            region={region}
            selectedRegions={selectedRegions}
            sourceMap={sourceMap}
            withColor={withColor}
            withTitle={withTitle}
            highlightedTrend={highlightedTrend}
            handleChangeHighlightedTrend={handleChangeHighlightedTrend}
          />
        </List>
      ))}
    </>
  );
};

export default GoogleTrendsByRegionList;
