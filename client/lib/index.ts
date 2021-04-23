import { ValueType } from "react-select";

import { SelectStringOptionType } from "../types";

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
  regionName: string,
  selectedRegions: ValueType<SelectStringOptionType, true>
): ValueType<SelectStringOptionType, true> {
  for (const givenRegion of selectedRegions) {
    if (givenRegion.label === regionName || givenRegion.value === regionName) {
      return givenRegion;
    }
  }
  return null;
}

/**
 * Source: https://gist.github.com/calebgrove/c285a9510948b633aa47
 * @param input
 * @param to
 * @returns
 */
export function convertRegion(input: string, shouldReturnAbbreviated: boolean) {
  var states = [
    ["Alabama", "AL"],
    ["Alaska", "AK"],
    ["American Samoa", "AS"],
    ["Arizona", "AZ"],
    ["Arkansas", "AR"],
    ["Armed Forces Americas", "AA"],
    ["Armed Forces Europe", "AE"],
    ["Armed Forces Pacific", "AP"],
    ["California", "CA"],
    ["Colorado", "CO"],
    ["Connecticut", "CT"],
    ["Delaware", "DE"],
    ["District Of Columbia", "DC"],
    ["Florida", "FL"],
    ["Georgia", "GA"],
    ["Guam", "GU"],
    ["Hawaii", "HI"],
    ["Idaho", "ID"],
    ["Illinois", "IL"],
    ["Indiana", "IN"],
    ["Iowa", "IA"],
    ["Kansas", "KS"],
    ["Kentucky", "KY"],
    ["Louisiana", "LA"],
    ["Maine", "ME"],
    ["Marshall Islands", "MH"],
    ["Maryland", "MD"],
    ["Massachusetts", "MA"],
    ["Michigan", "MI"],
    ["Minnesota", "MN"],
    ["Mississippi", "MS"],
    ["Missouri", "MO"],
    ["Montana", "MT"],
    ["Nebraska", "NE"],
    ["Nevada", "NV"],
    ["New Hampshire", "NH"],
    ["New Jersey", "NJ"],
    ["New Mexico", "NM"],
    ["New York", "NY"],
    ["North Carolina", "NC"],
    ["North Dakota", "ND"],
    ["Northern Mariana Islands", "NP"],
    ["Ohio", "OH"],
    ["Oklahoma", "OK"],
    ["Oregon", "OR"],
    ["Pennsylvania", "PA"],
    ["Puerto Rico", "PR"],
    ["Rhode Island", "RI"],
    ["South Carolina", "SC"],
    ["South Dakota", "SD"],
    ["Tennessee", "TN"],
    ["Texas", "TX"],
    ["US Virgin Islands", "VI"],
    ["Utah", "UT"],
    ["Vermont", "VT"],
    ["Virginia", "VA"],
    ["Washington", "WA"],
    ["West Virginia", "WV"],
    ["Wisconsin", "WI"],
    ["Wyoming", "WY"],
  ];

  // So happy that Canada and the US have distinct abbreviations
  var provinces = [
    ["Alberta", "AB"],
    ["British Columbia", "BC"],
    ["Manitoba", "MB"],
    ["New Brunswick", "NB"],
    ["Newfoundland", "NF"],
    ["Northwest Territory", "NT"],
    ["Nova Scotia", "NS"],
    ["Nunavut", "NU"],
    ["Ontario", "ON"],
    ["Prince Edward Island", "PE"],
    ["Quebec", "QC"],
    ["Saskatchewan", "SK"],
    ["Yukon", "YT"],
  ];

  var regions = states.concat(provinces);

  var i; // Reusable loop variable
  if (shouldReturnAbbreviated) {
    input = input.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    for (i = 0; i < regions.length; i++) {
      if (regions[i][0] == input) {
        return regions[i][1];
      }
    }
  } else {
    input = input.toUpperCase();
    for (i = 0; i < regions.length; i++) {
      if (regions[i][1] == input) {
        return regions[i][0];
      }
    }
  }
}
