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
} from "react-simple-maps";
import debugLib from "debug";
import invert from "invert-color";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

import allStates from "../allstates.json";

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
  default: {
    fill: "#FFFFFF",
    outline: "none",
  },
  hover: {
    fill: "#FFFFFF",
    outline: "none",
  },
  pressed: {
    fill: "#FFFFFF",
    outline: "none",
  },
};

const MapChart = ({ handleClick, dailyTrendsByState, colorsByTopic }) => {
  const [tooltipContent, setTooltipContent] = useState("");

  function tooltipStyle(name) {
    if (!name) {
      console.warn(`Unable to fetch tooltip style for state '${name}'`);
      return;
    }

    // get color of top trending item for this state
    const topicName = dailyTrendsByState.get(name)
      ? dailyTrendsByState.get(name)[0].topic
      : null;
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

    // style each state with color matching the #1 topic
    if (topicName) {
      style.default.fill = colorsByTopic.get(topicName);
    }

    return style;
  }

  function handleButtonClick(event, value) {
    handleMouseEnter(event, offsets[value].name);
    handleClick(event, offsets[value].name);
  }

  function handleMouseEnter(event, name) {
    const dailyTrend = dailyTrendsByState.get(name);
    if (!dailyTrend) {
      console.warn(`Trends not found for state '${name}'`);
      return;
    }
    if (!name) {
      console.warn(`Unable to generate tooltip for state '${name}'`);
      return;
    }

    debug(`Daily Trend for '${name}'`, dailyTrend);

    setTooltipContent(
      `Trending for ${name}<br><br>` +
        dailyTrend
          .map((trend, i) => {
            const color = colorsByTopic.get(trend.topic);

            const style = `background-color: ${color}; 
          padding: 1px 3px;
          color: ${color ? invert(color, true) : "white"};
          font-weight: 900;`;

            const content = `<span style="${style}">${i + 1}</span><span> – ${
              trend.topic
            }</span>`;
            return content;
          })
          .join("<br>")
    );
  }

  return (
    <>
      <ReactTooltip html={true} multiline={true}>
        {tooltipContent}
      </ReactTooltip>
      <Box align="center">
        {Object.keys(offsets)
          .sort()
          .map((key) => {
            return (
              <Button
                key={key}
                onClick={(e) => handleButtonClick(e, key)}
                color="primary"
              >
                {key}
              </Button>
            );
          })}
      </Box>
      <ComposableMap data-tip="" projection={"geoAlbersUsa"}>
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
                    style={tooltipStyle(geo?.properties?.name)}
                    onClick={(event) =>
                      handleClick(event, geo?.properties?.name)
                    }
                  />
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
                            style={labelStyle}
                            onMouseEnter={(event) =>
                              handleMouseEnter(event, geo?.properties?.name)
                            }
                            onClick={(event) =>
                              handleClick(event, geo?.properties?.name)
                            }
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
    </>
  );
};

export default memo(MapChart);
