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
import invert from "invert-color";

import allStates from "../data/regions.json";
import { GoogleRegionTrend } from "../types";

const tooltipFontSize = "1rem";
const debug = debugLib("client:mapchart");
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
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

type Props = {
  handleClick(
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    regionName: string
  ): void;
  googleDailyTrendsByState: GoogleRegionTrend[];
  colorMap: Map<string, string>;
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

const defaultAnnotationProps: AnnotationProps = {
  connectorProps: {
    stroke: "#A2D6F9",
    strokeWidth: 3,
    strokeLinecap: "round",
  },
};

const GoogleTrendMap = ({
  handleClick,
  googleDailyTrendsByState,
  colorMap,
}: Props) => {
  const projection = "geoAlbersUsa";

  if (!googleDailyTrendsByState || !googleDailyTrendsByState.length) {
    return <span>No trends data provided.</span>;
  }

  function getTrendingTopicColorByRegion(
    name: string,
    defaultColor: string
  ): string {
    // handle null region
    if (!name) {
      console.warn(
        `Unable to fetch style, region not provided, using defaults.`
      );
      return defaultColor;
    }

    // handle region not found
    const region = googleDailyTrendsByState.find((x) => x.name === name);
    if (!region) {
      console.warn(
        `No trends found for region named: ${name}, using default styles.`
      );
      return defaultColor;
    }

    // get the #1 topic for this region
    const topicName = region.trends[0].topic;

    // style this region with the color for this #1 topic
    const color = colorMap.get(topicName);

    return color ? color : defaultColor;
  }

  function getRegionStyle(color: string): GeographyStyle {
    const style = cloneDeep(defaultRegionStyle);

    style.default.fill = color;

    return style;
  }

  function getConnectorProps(color: string): React.SVGProps<SVGPathElement> {
    const style = cloneDeep(defaultAnnotationProps);

    style.connectorProps.stroke = color;

    return style.connectorProps;
  }

  return (
    <div>
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
                              fill={invert(
                                getTrendingTopicColorByRegion(
                                  geo?.properties?.name,
                                  defaultRegionStyle.default.fill
                                ),
                                true
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
                            connectorProps={getConnectorProps(
                              getTrendingTopicColorByRegion(
                                geo?.properties?.name,
                                defaultAnnotationProps.connectorProps.stroke
                              )
                            )}
                          >
                            <text
                              x={4}
                              fill={invert(
                                getTrendingTopicColorByRegion(
                                  geo?.properties?.name,
                                  defaultRegionStyle.default.fill
                                ),
                                true
                              )}
                              fontSize={tooltipFontSize}
                              alignmentBaseline="middle"
                            >
                              {cur.id}
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
    </div>
  );
};

export default memo(GoogleTrendMap);
