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
const colors = {
  "Tamar Braxton": "#e6194b", 
  "Discord": "#3cb44b",
  "Mary Trump": "#ffe119",
  "Ruth Bader Ginsburg": "#4363d8",
  "Portland": "#f58231",
  "Cursed": "#911eb4",
  "James Harden": "#46f0f0",
  "Gavin Newsom": "#f032e6",
  "Krispy Kreme": "#bcf60c",
  "Kayleigh McEnany": "#fabebe",
  "Princess Beatrice": "#008080",
  "Lucy Hale": "#e6beff",
  "Mortgage rates": "#9a6324",
  "Bryson DeChambeau": "#fffac8",
  "Hayden Panettiere": "#800000",
  "Eliot Engel": "#aaffc3",
  "The Chicks": "#808000",
  "Gaslighter": "#ffd8b1",
  "Karen": "#000075",
  "Dustin Honken": "#808080",
  "Kaia Gerber": "#ffffff"}

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
                      return `${i} - ${x.topic} - ${colors[x.topic]}`
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
                      style.default.fill = colors[numberOneTopic];
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
