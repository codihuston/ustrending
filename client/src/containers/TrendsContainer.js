import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";

import MapChart from "../components/MapChart";

const colors = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#ffffff",
  "#000000",
];

/**
 * Injects the processed respones from /daily-trends, /daily-trends-by-state
 * into a given component
 */
function TrendsContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [dailyTrends, setDailyTrends] = useState(new Map());
  // state => color
  const [colorsByTopic, setColorsByTopic] = useState(new Map());

  useEffect(() => {
    fetch("/api/daily-trends-by-state")
      .then((res) => res.json())
      .then((result) => {
        const processed = new Map();

        result.map((x) => {
          processed.set(x[0], x[1]);
        });

        setDailyTrends(processed);
      });

    fetch("/api/daily-trends")
      .then((res) => res.json())
      .then((result) => {
        const trendColorMap = new Map();
        result.map((x, i) => {
          if (x?.title?.query) {
            trendColorMap.set(x.title.query, colors[i]);
          } else {
            console.warn(
              "WARNING: Title.Query is missing, cannot assign color to:",
              x
            );
          }
        });
        setColorsByTopic(trendColorMap);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return "Loading...";
  }

  return (
    <>
      <MapChart
        setTooltipContent={setContent}
        dailyTrends={dailyTrends}
        colors={colors}
        colorsByTopic={colorsByTopic}
      />
      <ReactTooltip html={true} multiline={true}>
        {content}
      </ReactTooltip>
    </>
  );
}

export default TrendsContainer;
