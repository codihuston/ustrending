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

import allStates from "../allstates.json";

const tooltipFontSize = "1rem";
const debug = debugLib("client:mapchart");
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const offsets = {
  VT: [50, -8],
  NH: [34, 2],
  MA: [30, -1],
  RI: [28, 2],
  CT: [35, 10],
  NJ: [34, 1],
  DE: [33, 0],
  MD: [47, 10],
  DC: [49, 21],
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

const MapChart = ({ dailyTrends, colorsByTopic }) => {
  const [tooltipContent, setTooltipContent] = useState("");

  return (
    <>
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
                    onMouseEnter={() => {
                      const { name } = geo.properties;
                      const dailyTrend = dailyTrends.get(name);
                      if (!dailyTrend) {
                        console.warn(`Trends not found for state '${name}'`);
                        return;
                      }

                      debug(`Daily Trend for '${name}'`, dailyTrend);

                      setTooltipContent(
                        dailyTrend
                          .map((trend, i) => {
                            const content = `<span style="color: ${colorsByTopic.get(
                              trend.topic
                            )};">${i} - ${trend.topic} - ${colorsByTopic.get(
                              trend.topic
                            )}</span>`;
                            return content;
                          })
                          .join("<br>")
                      );
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    style={(() => {
                      // get color of top trending item for this state
                      const { name } = geo.properties;
                      const topicName = dailyTrends.get(name)
                        ? dailyTrends.get(name)[0].topic
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
                    })()}
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
                            >
                              {cur.id}
                            </text>
                          </Marker>
                        ) : (
                          <Annotation
                            subject={centroid}
                            dx={offsets[cur.id][0]}
                            dy={offsets[cur.id][1]}
                            style={labelStyle}
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
      <ReactTooltip html={true} multiline={true}>
        {tooltipContent}
      </ReactTooltip>
    </>
  );
};

export default memo(MapChart);
