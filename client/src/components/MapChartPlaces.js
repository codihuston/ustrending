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
import debugLib, { names } from "debug";
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

const MapChart = ({
  handleClick,
  dailyTrendsByState,
  colorsByTopic,
  places,
  twitterTrendsByPlace,
}) => {
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

  function handleMouseEnter(event, woeid) {
    const placeTrends = twitterTrendsByPlace.get(String(woeid));
    const place = places.get(woeid);

    if (!placeTrends) {
      console.warn(`Trends not found for state '${woeid}'`);
      return;
    }

    debug(`Daily Trend for '${woeid}'`, placeTrends);

    let html = "";

    const maxTrendsLimit = 10;
    for (let i = 0; i < maxTrendsLimit; i++) {
      const trend = placeTrends.trends[i];
      const color = colorsByTopic.get(trend.name);

      const style = `background-color: ${color}; 
    padding: 1px 3px;
    color: ${color ? invert(color, true) : "white"};
    font-weight: 900;`;

      const content = `<span style="${style}">${i + 1}</span><span> – ${
        trend.name
      }</span>`;

      html += content + "<br>";
    }

    setTooltipContent(
      `Trending for ${place.name}, ${place.region}<br><br>` + html
    );
  }

  function getPlaceMarkers(places) {
    let markers = [];
    let i = 0;
    for (const [key, value] of places) {
      if (
        !value.geo.coordinates ||
        (!value.geo.coordinates[1] && !value.geo.coordinates[0])
      ) {
        continue;
      }
      const result = (
        <Marker
          key={value.name}
          coordinates={value.geo.coordinates}
          onMouseEnter={(event) => handleMouseEnter(event, value.woeid)}
          onMouseLeave={() => {
            setTooltipContent("");
          }}
          style={tooltipStyle(value.name)}
          onClick={(event) => handleClick(event, value.woeid)}
        >
          <g
            fill="none"
            stroke="#FF5533"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-12, -24)"
          >
            <circle cx="12" cy="10" r="3" />
            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
          </g>
          <text
            textAnchor="middle"
            // y={markerOffset}
            style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
          >
            {/* {value.name} */}
          </text>
        </Marker>
      );
      markers.push(result);
      i++;
    }
    return markers;
  }

  return (
    <>
      <ReactTooltip html={true} multiline={true}>
        {tooltipContent}
      </ReactTooltip>
      <ComposableMap data-tip="" projection={"geoAlbersUsa"}>
        <Geographies geography={geoUrl}>
          {({ geographies }) => {
            return (
              <>
                {/* Build the states map */}
                {geographies.map((geo) => (
                  <Geography key={geo.rsmKey} geography={geo} />
                ))}
              </>
            );
          }}
        </Geographies>
        {getPlaceMarkers(places)}
      </ComposableMap>
    </>
  );
};

export default memo(MapChart);
