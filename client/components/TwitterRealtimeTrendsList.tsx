import { Place, TwitterTrendsMap } from "../types";
import { Loading } from "./Loading";
import { useTwitterRealtimeTrends } from "../hooks";

type Props = {
  places: Place[];
  twitterRealtimeTrends: TwitterTrendsMap;
};

export function TwitterRealtimeTrendsList({
  places,
  twitterRealtimeTrends,
}: Props) {
  if (!places) {
    return <span>Error: no places are provided!</span>;
  }

  return (
    <>
      <ul>
        {Object.keys(twitterRealtimeTrends).map((woeid: string) => {
          const placeTrends = twitterRealtimeTrends[woeid];

          if (!placeTrends)
            return (
              <li key={woeid}>
                <span>No data for {woeid}</span>
              </li>
            );

          const place = places.find((place) => place.woeid === parseInt(woeid));

          return placeTrends.map((placeTrend) => {
            return (
              <li key={place._id}>
                {place.name}
                <ol>
                  {placeTrend.trends.map((trend, i) => {
                    return <li key={i}>{trend.name}</li>;
                  })}
                </ol>
              </li>
            );
          });
        })}
      </ul>
    </>
  );
}
