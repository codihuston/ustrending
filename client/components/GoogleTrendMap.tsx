import React, { memo, useState } from "react";
import ReactTooltip from "react-tooltip";
import { geoCentroid } from "d3-geo";
import {
  ComposableMap,
  ZoomableGroup,
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
import { isOptionDisabled } from "react-select/src/builtins";

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

const GoogleTrendMap = ({
  handleClick,
  googleDailyTrendsByState,
  colorMap,
}: Props) => {
  const [tooltipContent, setTooltipContent] = useState("");
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
      console.warn(`Unable to fetch tooltip style, region not provided.`);
      return defaultColor;
    }

    // handle region not found
    const region = googleDailyTrendsByState.find((x) => x.name === name);
    if (!region) {
      console.warn("No tooltip style found for region: ", region, name);
      return defaultColor;
    }

    // get the #1 topic for this region
    const topicName = region.trends[0].topic;

    // style this region with the color for this #1 topic
    const color = colorMap.get(topicName);

    return color ? color : defaultColor;
  }

  function getTooltipStyle(name: string) {
    const style = {
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

    const color = getTrendingTopicColorByRegion(name, style.default.fill);

    style.default.fill = color;

    return style;
  }

  function getConnectorProps(name: string): React.SVGProps<SVGPathElement> {
    const style: AnnotationProps = {
      connectorProps: {
        stroke: "#A2D6F9",
        strokeWidth: 3,
        strokeLinecap: "round",
      },
    };

    const color = getTrendingTopicColorByRegion(name, style.stroke);
    style.stroke = color;

    return style.connectorProps;
  }

  function handleMouseEnter(event, name) {
    console.log("TODO: implement hover");
  }

  return (
    <div>
      <ReactTooltip html={true} multiline={true}>
        {tooltipContent}
      </ReactTooltip>
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
                    onMouseEnter={(event) =>
                      handleMouseEnter(event, geo?.properties?.name)
                    }
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    style={getTooltipStyle(geo?.properties?.name)}
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
                        // TODO: implement onhover / tooltips for markers?
                        (Object.keys(offsets).indexOf(cur.id) === -1 ? (
                          <Marker coordinates={centroid} style={labelStyle}>
                            <text
                              x={5}
                              fontSize={tooltipFontSize}
                              textAnchor="middle"
                              onMouseEnter={(event) =>
                                handleMouseEnter(event, geo?.properties?.name)
                              }
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
                            onMouseEnter={(event) =>
                              handleMouseEnter(event, geo?.properties?.name)
                            }
                            onClick={(event) =>
                              handleClick(event, geo?.properties?.name)
                            }
                            connectorProps={getConnectorProps(
                              geo?.properties?.name
                            )}
                          >
                            <text
                              x={4}
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

// export default memo(GoogleTrendMap);
export default GoogleTrendMap;
