import { ValueType } from "react-select";

import { RegionSelectOptionType } from "../types";

// ref: https://material-ui.com/customization/components/#2-dynamic-variation-for-a-one-time-situation
export const styledBy = (property, mapping) => (props) =>
  mapping[props[property]];

/**
 * Calculates position changes of a topic in this region list, compared to the sourceMap
 * @param topic
 * @param index
 */
export function getListPositionChange(
  topic: string,
  index: number,
  sourceMap: Map<string, number>
) {
  const srcIndex = sourceMap.get(topic);
  if (srcIndex >= 0) {
    return srcIndex - index;
  }
  return 0;
}

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
