import { Place } from "../types";
import { Loading } from "./Loading";
import { useTwitterRealtimeTrends } from "../hooks";

type Props = {
  places: Place[]
};

export function TwitterRealtimeTrendsList({ places }: Props) {

  if (!places){
    return <span>Error: no places are provided!</span>
  }

  const { status, data, error } = useTwitterRealtimeTrends();
  
  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <>
      <ul>
        {Object.keys(data).map((woeid: string) => {
          const placeTrends = data[woeid];

          if (!placeTrends)
            return (
              <li key={woeid}>
                <span>No data for {woeid}</span>
              </li>
            );

          const place = places.find((place) => place.woeid === parseInt(woeid));

          return placeTrends.map((placeTrend) => {
            return (
              <>
                <li key={place._id}>{place.name}</li>
                <ol>
                  {placeTrend.trends.map((trend, i) => {
                    return <li key={i}>{trend.name}</li>;
                  })}
                </ol>
              </>
            );
          });
        })}
      </ul>
    </>
  );
}
