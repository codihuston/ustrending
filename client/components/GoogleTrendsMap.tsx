import React, { memo } from "react";
import { cloneDeep } from "lodash";
import { geoCentroid } from "d3-geo";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
  AnnotationProps,
} from "react-simple-maps";
import debugLib from "debug";
import invert, { HexColor, RgbArray } from "invert-color";
import { fade, decomposeColor } from "@material-ui/core";

// TODO: modularize this by country?
import allStates from "../data/regions.json";
import { GoogleRegionTrend } from "../types";

const tooltipFontSize = "1rem";
const debug = debugLib("client:mapchart");
// TODO: modularize this by country?
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
// TODO: modularize this by country?
const offsets = {
  VT: {
    name: "Vermont",
    offsets: [50, -8],
  },
  NH: {
    name: "New Hampshire",
    offsets: [34, 2],
  },
  MA: {
    name: "Massachusetts",
    offsets: [30, -1],
  },
  RI: {
    name: "Rhode Island",
    offsets: [28, 2],
  },
  CT: {
    name: "Connecticut",
    offsets: [35, 10],
  },
  NJ: {
    name: "New Jersey",
    offsets: [34, 1],
  },
  DE: {
    name: "Delaware",
    offsets: [33, 0],
  },
  MD: {
    name: "Maryland",
    offsets: [47, 10],
  },
  DC: {
    name: "District of Columbia",
    offsets: [49, 21],
  },
};

// styles the region labels
const labelStyle = {
  hover: {
    fill: "#FFFFFF",
    outline: "none",
  },
  pressed: {
    fill: "#FFFFFF",
    outline: "none",
  },
};

/**
 * The map can be colored in different ways
 */
export enum MapColorMode {
  // highlight all number X trends (shows popularity of all trends in a country)
  All,
  // highlight only 1 trend (shows popularity of a single trend in a country)
  One,
}

type Props = {
  handleClick(
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    regionName: string
  ): void;
  handleHover(
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    regionName: string
  ): void;
  googleRegionTrends: GoogleRegionTrend[];
  colorMap: Map<string, string>;
  mapColorMode: MapColorMode;
  trendNumberToShow: number;
  countryTrendName: string;
};

type GeographyStyle = {
  default: {
    fill: string;
    outline: string;
  };
  hover: {
    fill: string;
    outline: string;
  };
  pressed: {
    fill: string;
    outline: string;
  };
};

// styles the regions themselves (not the label)
const defaultRegionStyle: GeographyStyle = {
  default: {
    fill: "#D6D6DA",
    outline: "none",
  },
  hover: {
    fill: "#F53",
    outline: "none",
  },
  pressed: {
    fill: "#E42",
    outline: "none",
  },
};

// styles the annotations (for region offsets)
const defaultAnnotationProps: AnnotationProps = {
  connectorProps: {
    stroke: "#A2D6F9",
    strokeWidth: 3,
    strokeLinecap: "round",
  },
};

const GoogleTrendsMap = ({
  handleClick,
  handleHover,
  googleRegionTrends,
  colorMap,
  countryTrendName,
  mapColorMode,
  trendNumberToShow,
}: Props) => {
  // TODO: make this dynamic?
  const projection = "geoAlbersUsa";

  if (!googleRegionTrends || !googleRegionTrends.length) {
    return <span>No trends data provided.</span>;
  }

  /**
   * Gets a trend at the given index. If the index eceeds the number of trends,
   * return the final trend
   *
   * @param index
   * @param region
   */
  function getRegionTrendNameAt(index: number, region: GoogleRegionTrend) {
    if (index > region.trends.length) {
      debug(
        "An out-of-bound index was given for accessing regional trends at index:",
        index,
        "of region:",
        region.name,
        ". Displaying the trend at index:",
        region.trends.length - 1
      );
      return region.trends[region.trends.length - 1].topic;
    }
    return region.trends[index].topic;
  }
  /**
   * Will fetch a Google Region Trend with the given name
   *
   * @param name
   */
  function getRegionByGeoName(name: string): GoogleRegionTrend {
    // handle null region
    if (!name) {
      debug(
        `Unable to fetch style, region not provided, using defaults.`
      );
      return null;
    }

    // handle region not found
    const region = googleRegionTrends.find((x) => x.name === name);
    if (!region) {
      debug(
        `No trends found for region named: ${name}, using default styles.`
      );
      return null;
    }

    return region;
  }

  /**
   * Determines a background color to use for a given topic and region
   *
   * @param name
   * @param defaultColor
   */
  function getTrendingTopicColorByRegion(
    name: string,
    defaultColor: string
  ): string {
    const region = getRegionByGeoName(name);
    let color = defaultColor;

    if (!region) {
      return defaultColor;
    }

    // if coloring only ONE trend for the entire country
    if (mapColorMode === MapColorMode.One) {
      // get the color of the trend of interest
      color = colorMap.get(countryTrendName);
      // find its popularity rank for this region
      const rank = getTrendAtRankForRegion(name);
      // calculate the opacity (more popular = darker)
      const val = Number(
        Math.abs(rank / googleRegionTrends.length - 1).toFixed(2)
      );
      // change the color's opacity accordingly
      color = fade(color ? color : defaultColor, val);
    }
    // otherwise, we are coloring ALL trends
    else {
      //get the #1 topic for this region
      const topicName = getRegionTrendNameAt(trendNumberToShow, region);

      // style this region with the color for this #1 topic
      color = colorMap.get(topicName);
    }

    return color ? color : defaultColor;
  }

  function getTrendAtRankForRegion(name: string) {
    const region = getRegionByGeoName(name);

    // find the rank of 'countryTrendName'
    if (!region) {
      return null;
    }

    const rank = region.trends.findIndex((x) => x.topic === countryTrendName);

    return rank;
  }

  /**
   * Takes a given color string (#FFFFFF, rgb(...), rgba(...)), and converts it into a hex.
   * Optionally inverts the resulting color according to the invert-color library. You may
   * specify a default color to fall back onto, if the given string is not hex/rgb/rgba.
   *
   * @param color
   * @param shouldInvert
   * @param defaultColor
   */
  function getColorAsHex(
    color: string,
    shouldInvert: boolean,
    defaultColor: string
  ): string {
    let result: HexColor | RgbArray;
    const white = "#FFFFFF";

    // if color is rbg an string
    if (color && color.toLowerCase().startsWith("rgb")) {
      // process into acceptable input for invert()
      const values = decomposeColor(color);
      const rgb: RgbArray = [
        values.values[0],
        values.values[1],
        values.values[2],
      ];
      result = rgb;
    }
    // otherwise, color is a hex value
    else if (color && color.toLowerCase().startsWith("#")) {
      result = color;
    }
    // otherwise it is an undefined color value
    else {
      // use given default color
      if (defaultColor) {
        result = defaultColor;
      }
      // default to white if no default given
      else {
        result = white;
      }
    }
    return invert(result, shouldInvert);
  }

  /**
   * Renders an HTML string to be used for the tooltip content
   * @param name
   */
  function getTooltipContent(name: string) {
    const region = getRegionByGeoName(name);
    // deterime bg color
    const backgroundColor = getTrendingTopicColorByRegion(
      name,
      defaultRegionStyle.default.fill
    );
    const color = getColorAsHex(backgroundColor, true, null);

    if (region) {
      // the rank of this trend, defaults to the prop value when showing ALL trends on the map
      let rank = trendNumberToShow;
      // get trend name, given its rank and region
      let topicName: string;

      // if we are showing ONE trend on the map
      if (mapColorMode === MapColorMode.One) {
        // re-calibrate the rank based on the trend name for this region
        rank = getTrendAtRankForRegion(name);
        // use the topic name passed in as props, rather than the trend
        topicName = countryTrendName;
      }
      // otherwise, we are showing ALL trends on the map
      else {
        // get the name of the trend for this region at the given rank
        topicName = getRegionTrendNameAt(trendNumberToShow, region);
      }

      if (topicName) {
        const html = `
          <div style="text-align: center;">
            <span>
              ${name}
            </span>
          </div>
          <br>
          <div>
            <span style="background-color: ${backgroundColor}; color: ${color}; padding: 0.25rem; width: 0.25rem; border: 1px solid ${color}; border-radius: 2px;">
              <b>
                #${rank + 1 /*account for 0-indexed value*/}
              </b>
            </span>
            <span style="margin-left: 1em;">
              ${topicName}
            </span>
          </div>
        `;
        return html;
      }
    }
    return null;
  }

  function getRegionStyle(color: string): GeographyStyle {
    const style = cloneDeep(defaultRegionStyle);

    style.default.fill = color;
    style.hover.fill = color;
    style.pressed.fill = color;

    return style;
  }

  function getConnectorProps(color: string): React.SVGProps<SVGPathElement> {
    const style = cloneDeep(defaultAnnotationProps);

    style.connectorProps.stroke = color;

    return style.connectorProps;
  }

  return (
    <>
      <ComposableMap data-tip="" projection={projection}>
        <Geographies geography={geoUrl}>
          {({ geographies }) => {
            return (
              <>
                {/* Build the states map */}
                {geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={getRegionStyle(
                      getTrendingTopicColorByRegion(
                        geo?.properties?.name,
                        defaultRegionStyle.default.fill
                      )
                    )}
                    onClick={(
                      event: React.MouseEvent<SVGPathElement, MouseEvent>
                    ) => handleClick(event, geo?.properties?.name)}
                    onMouseEnter={(
                      event: React.MouseEvent<SVGPathElement, MouseEvent>
                    ) =>
                      handleHover(
                        event,
                        getTooltipContent(geo?.properties?.name)
                      )
                    }
                    onMouseLeave={(
                      event: React.MouseEvent<SVGPathElement, MouseEvent>
                    ) => handleHover(event, null)}
                  ></Geography>
                ))}
                {/* Build the annotations */}
                {geographies.map((geo) => {
                  const centroid = geoCentroid(geo);
                  const cur = allStates.find((s) => s.val === geo.id);

                  debug(centroid, geo);

                  return (
                    <g key={geo.rsmKey + "-name"}>
                      {cur &&
                        centroid[0] > -160 &&
                        centroid[0] < -67 &&
                        (Object.keys(offsets).indexOf(cur.id) === -1 ? (
                          <Marker coordinates={centroid} style={labelStyle}>
                            <text
                              x={5}
                              fill={getColorAsHex(
                                getTrendingTopicColorByRegion(
                                  geo?.properties?.name,
                                  defaultRegionStyle.default.fill
                                ),
                                true,
                                null
                              )}
                              fontSize={tooltipFontSize}
                              textAnchor="middle"
                              onClick={(event) =>
                                handleClick(event, geo?.properties?.name)
                              }
                            >
                              {cur.id}
                            </text>
                          </Marker>
                        ) : (
                          <Annotation
                            subject={centroid}
                            dx={offsets[cur.id].offsets[0]}
                            dy={offsets[cur.id].offsets[1]}
                            onClick={(event) =>
                              handleClick(event, geo?.properties?.name)
                            }
                            onMouseEnter={(
                              event: React.MouseEvent<
                                SVGPathElement,
                                MouseEvent
                              >
                            ) =>
                              handleHover(
                                event,
                                getTooltipContent(geo?.properties?.name)
                              )
                            }
                            onMouseLeave={(
                              event: React.MouseEvent<
                                SVGPathElement,
                                MouseEvent
                              >
                            ) => handleHover(event, null)}
                            connectorProps={getConnectorProps(
                              getTrendingTopicColorByRegion(
                                geo?.properties?.name,
                                defaultAnnotationProps.connectorProps.stroke
                              )
                            )}
                          >
                            <text
                              x={4}
                              fontSize={tooltipFontSize}
                              alignmentBaseline="middle"
                            >
                              {cur.id}
                              <text>test</text>
                            </text>
                          </Annotation>
                        ))}
                    </g>
                  );
                })}
              </>
            );
          }}
        </Geographies>
      </ComposableMap>
    </>
  );
};

export default memo(GoogleTrendsMap);
