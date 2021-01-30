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
  const [realtimeTrendsByState, setRealtimeTrendsByState] = useState(new Map());
  const [places, setPlaces] = useState(new Map());
  const [twitterTrendsByPlace, setTwitterTrendsByPlace] = useState(new Map());
  // state => color
  const [colorsByTopic, setColorsByTopic] = useState(new Map());

  useEffect(() => {
    async function asyncFunction() {
      try {
        // fetch google daily trends
        let res = await fetch("/api/google/trends/daily");
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

        // TODO: fetch realtime trends

        /*
        Fetch all google realtime trends by state.
        This returns an object of STATE FULL NAME => [{topic,value,geocode}]
        */
        res = await fetch("/api/google/trends/daily/states");
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

        // fetch google realtime trends by state
        res = await fetch("/api/google/trends/realtime/states");
        if (res.ok) {
          const result = await res.json();
          const processed = new Map();

          if (result && !result.error) {
            result.map((state) => {
              processed.set(state.name, state.trends);
            });

            setRealtimeTrendsByState(processed);
            setError(false);
          } else {
            setError(true);
          }
        }

        // fetch all US places
        res = await fetch("/api/places/US");
        if (res.ok) {
          const result = await res.json();
          const temp = new Map();
          if (result && result.length > 0 && !result.error) {
            result.map((x, i) => {
              temp.set(x.woeid, x);
            });

            setPlaces(temp);
          } else {
            setError(true);
          }
        } else {
          throw new Error("Error fetching places trends from API.");
        }

        // fetch all twitter trends
        res = await fetch("/api/twitter/trends");
        if (res.ok) {
          const result = await res.json();
          const temp = new Map();
          const keys = Object.keys(result);

          if (keys && keys.length > 0 && !result.error) {
            Object.keys(result).map((x, i) => {
              temp.set(x, result[x][0]);
            });

            setTwitterTrendsByPlace(temp);
          } else {
            setError(true);
          }
        } else {
          throw new Error("Error fetching places trends from API.");
        }
      } catch (e) {
        console.error(e);
        setIsLoading(false);
        setError(true);
      }
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
      realtimeTrendsByState,
      colors,
      colorsByTopic,
      error,
      places,
      twitterTrendsByPlace,
    };

    if (React.isValidElement(child)) {
      return React.cloneElement(child, props);
    }
    return child;
  });

  return <>{childrenWithProps}</>;
}

export default TrendsContainer;
