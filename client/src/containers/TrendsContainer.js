import React, { useState, useEffect, useContext } from "react";

import ColorContext from "../context/ColorContext";

/**
 * Injects the processed respones from /daily-trends, /daily-trends-by-state
 * into a given component
 */
function TrendsContainer({ children }) {
  const colors = useContext(ColorContext);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTrends, setDailyTrends] = useState();
  const [dailyTrendsByState, setDailyTrendsByState] = useState(new Map());
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

          setDailyTrendsByState(processed);
          setError(false);
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

          setDailyTrends(result);
          setColorsByTopic(trendColorMap);
          setIsLoading(false);
          setError(false);
        } else {
          setError(true);
        }
      });
  }, [colors]);

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
      dailyTrendsByState,
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
