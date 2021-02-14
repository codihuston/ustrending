import { ValueType } from "react-select";

import { RegionSelectOptionType } from "../types";

// ref: https://material-ui.com/customization/components/#2-dynamic-variation-for-a-one-time-situation
export const styledBy = (property, mapping) => (props) =>
  mapping[props[property]];

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
