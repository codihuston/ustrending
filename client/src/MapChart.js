import React, { memo } from "react";
import { geoCentroid } from "d3-geo";
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
  Marker
} from "react-simple-maps";
import allStates from "./allstates.json";
import trendingResponse from "./_trendingResponse.json";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

let trendingByState = new Map(require("./_trendingByState.json"));

const offsets = {
  VT: [50, -8],
  NH: [34, 2],
  MA: [30, -1],
  RI: [28, 2],
  CT: [35, 10],
  NJ: [34, 1],
  DE: [33, 0],
  MD: [47, 10],
  DC: [49, 21]
};

const labelStyle = {
  default: {
    fill: "#FFFFFF",
    outline: "none"
  },
  hover: {
    fill: "#FFFFFF",
    outline: "none"
  },
  pressed: {
    fill: "#FFFFFF",
    outline: "none"
  }
}

// TODO: get top 20 trends, assign colors to them "#000000"

const top20 = trendingResponse.default.trendingSearchesDays[0].trendingSearches.map(x => x.title.query);
const colorsByTopic = {};
const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];

top20.forEach((x,i) => {
  colorsByTopic[x] = colors[i];
});

const MapChart = ({ setTooltipContent }) => {
  const fontSize = 14;
  return (
    <>
      <ComposableMap data-tip="" projection={"geoAlbersUsa"}>
          <Geographies geography={geoUrl}>
            {({ geographies }) => {

              return (
              <>
              {/* Build the states map */}
              {geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    const { name } = geo.properties;
                    if(!trendingByState.get(name)) return;

                    console.log(name, trendingByState.get(name));
                    /*
                    TODO:
                      - optimize by initializing this content when top 20 trends
                      and thier colors are updated? Will doing this affect the
                      react-tooltip?
                    */
                    setTooltipContent(trendingByState.get(name).map((x,i) => {
                      return `<span style="color: ${colorsByTopic[x.topic]};">${i} - ${x.topic} - ${colorsByTopic[x.topic]}</span>`
                    }).join("<br>"))
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  style={(() => {
                    // TODO: get color of top trending item for this state
                    const { name } = geo.properties;
                    const numberOneTopic = trendingByState.get(name) ? trendingByState.get(name)[0].topic : null;
                    const style = {
                      default: {
                        fill: "#D6D6DA",
                        outline: "none"
                      },
                      hover: {
                        fill: "#F53",
                        outline: "none"
                      },
                      pressed: {
                        fill: "#E42",
                        outline: "none"
                      }
                    };

                    if(numberOneTopic){
                      console.log("Set color for", numberOneTopic);
                      style.default.fill = colorsByTopic[numberOneTopic];
                    }

                    return style;
                  })()}
                />
              ))}
              {/* Build the annotations */}
              {geographies.map(geo => {
                const centroid = geoCentroid(geo);
                const cur = allStates.find(s => s.val === geo.id);

                console.log(centroid, geo)
                /*
                TODO: maybe instead of the state abbreviation, or along side it,
                show the trend # that is #1 trending in this state.
                
                For example, if trend # 2 is top trending in KY, show 2 there.
                */
              
                return (
                  <g key={geo.rsmKey + "-name"}>
                    {cur &&
                      centroid[0] > -160 &&
                      centroid[0] < -67 &&
                      (Object.keys(offsets).indexOf(cur.id) === -1 ? (
                        <Marker coordinates={centroid} style={labelStyle}>
                          <text x={5} fontSize={fontSize} textAnchor="middle">
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
                          <text x={4} fontSize={fontSize} alignmentBaseline="middle">
                            {cur.id}
                          </text>
                        </Annotation>
                      ))}
                  </g>
                );
              })}
              </>
            )}}
          </Geographies>
      </ComposableMap>
    </>
  );
};

export default memo(MapChart);
