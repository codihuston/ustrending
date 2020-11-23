import React, { useState, useEffect, useContext } from "react";

import ColorContext, { colorPalettes } from "../context/ColorContext";

/**
 * Injects the processed respones from /daily-trends, /daily-trends-by-state
 * into a given component
 */
function TrendsContainer({ children }) {
  const colorPalette = useContext(ColorContext);
  const colors = colorPalettes[colorPalette];
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [dailyTrendsByState, setDailyTrendsByState] = useState(new Map());
  // state => color
  const [colorsByTopic, setColorsByTopic] = useState(new Map());

  useEffect(() => {
    async function asyncFunction() {
      try {
        // this returns an object of STATE FULL NAME => [{topic,value,geocode}]
        let res = await fetch("/api-go/google/trends/daily/states");
        if (res.ok) {
          const result = await res.json();
          const processed = new Map();

          if (result && !result.error) {
            result.map((state) => {
              processed.set(state.name, state.trends);
            });

            setDailyTrendsByState(processed);
            setError(false);
          } else {
            setError(true);
          }
        }

        res = await fetch("/api-go/google/trends/daily");
        if (res.ok) {
          const result = await res.json();
          const trendColorMap = new Map();
          if (result && result.length > 0 && !result.error) {
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
        } else {
          throw new Error("Error fetching daily trends from Google.");
        }
      } catch (e) {
        console.error(e);
        setIsLoading(false);
        setError(true);
      }
      // fetch("/api/google/trends/daily/states")
      //   .then((res) => res.json())
      //   .then((result) => {
      //     const processed = new Map();

      //     if (result && !result.error) {
      //       result.map((x) => {
      //         processed.set(x[0], x[1]);
      //       });

      //       setDailyTrendsByState(processed);
      //       setError(false);
      //       console.log("Set error false A");
      //     } else {
      //       setError(true);
      //     }
      //   });

      // fetch("/api-go/google/trends/daily")
      //   .then((res) => {
      //     if (res.ok) {
      //       return res.json();
      //     } else if (res.status === 404) {
      //       return Promise.reject(res);
      //     } else {
      //       return Promise.reject(res);
      //     }
      //   })
      //   .then((result) => {
      //     const trendColorMap = new Map();

      //     if (result && result.length > 0 && !result.error) {
      //       result.map((x, i) => {
      //         if (x?.title?.query) {
      //           trendColorMap.set(x.title.query, colors[i]);
      //         } else {
      //           console.warn(
      //             "WARNING: Title.Query is missing, cannot assign color to:",
      //             x
      //           );
      //         }
      //       });

      //       setDailyTrends(result);
      //       setColorsByTopic(trendColorMap);
      //       setIsLoading(false);
      //       console.log("Set error false B");
      //       setError(false);
      //     } else {
      //       setError(true);
      //     }
      //   })
      //   .catch((e) => {
      //     console.log("ERROR");
      //     console.error(e);
      //     setIsLoading(false);
      //     setError(true);
      //   });
    }

    asyncFunction();
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
