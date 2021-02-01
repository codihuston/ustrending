import { GoogleRegionTrend } from "../types";

type Props = {
  googleDailyTrendsByState: GoogleRegionTrend[];
};

export function GoogleDailyTrendsByState({ googleDailyTrendsByState }: Props) {
  if (!googleDailyTrendsByState || !googleDailyTrendsByState.length) {
    return <span>Error: no google daily trends are provided!</span>;
  }

  return (
    <>
      <ol>
        {googleDailyTrendsByState.map((x, i) => {
          return (
            <li key={i}>
              {x.name} has [{x.trends.length}] trends
            </li>
          );
        })}
      </ol>
    </>
  );
}
