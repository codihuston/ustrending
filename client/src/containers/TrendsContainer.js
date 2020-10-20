import React, { useState, useEffect } from "react";

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
function TrendsContainer({ children }) {
  const [error, setError] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTrends, setDailyTrends] = useState(new Map());
  // state => color
  const [colorsByTopic, setColorsByTopic] = useState(new Map());

  useEffect(() => {
    fetch("/api/daily-trends-by-state")
      .then((res) => res.json())
      .then((result) => {
        const processed = new Map();

        if (result) {
          result.map((x) => {
            processed.set(x[0], x[1]);
          });

          setDailyTrends(processed);
        } else {
          setError(true);
        }
      });

    fetch("/api/daily-trends")
      .then((res) => res.json())
      .then((result) => {
        const trendColorMap = new Map();

        if (result) {
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
        } else {
          setError(true);
        }
      });
  }, []);

  if (isLoading && !error) {
    return "Loading...";
  }

  /**
   * Clone children (shallow) and add custom props. This allows this
   * container to handle generic children that might rely on the same data
   * but render differently (such as a MapChart or TableChart)
   */
  const childrenWithProps = React.Children.map(children, (child) => {
    // checking isValidElement is the safe way and avoids a typescript error too
    const props = {
      dailyTrends,
      colors,
      colorsByTopic,
      error,
    };

    if (React.isValidElement(child)) {
      return React.cloneElement(child, props);
    }
    return child;
  });

  return <>{childrenWithProps}</>;
}

export default TrendsContainer;
