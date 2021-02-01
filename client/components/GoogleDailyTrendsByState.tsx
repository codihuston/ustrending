import { GoogleRegionTrend } from "../types";

type Props = {
  googleDailyTrendsByState: GoogleRegionTrend[];
  selectedRegion: string;
};

export function GoogleDailyTrendsByState({
  googleDailyTrendsByState,
  selectedRegion,
}: Props) {
  if (!googleDailyTrendsByState || !googleDailyTrendsByState.length) {
    return <span>Error: no google daily trends are provided!</span>;
  }

  const region = googleDailyTrendsByState.find(
    (x) => x.name === selectedRegion
  );

  if (!region) {
    return <span>Please select a region.</span>;
  } else if (!region.trends.length) {
    return <span>No regions found for {region}.</span>;
  }

  return (
    <>
      <ol>
        {region.trends.map((trend, i) => {
          return (
            <li key={i}>
              {trend.topic} | {trend.geoCode} | {trend.value}
            </li>
          );
        })}
      </ol>
    </>
  );
}
