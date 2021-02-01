import { GoogleRegionTrend } from "../types";

type Props = {
  googleRealtimeTrendsByState: GoogleRegionTrend[];
};

export function GoogleRealtimeTrendsByStateList({
  googleRealtimeTrendsByState,
}: Props) {
  if (!googleRealtimeTrendsByState || !googleRealtimeTrendsByState.length) {
    return <span>Error: no google realtime trends are provided!</span>;
  }

  return (
    <>
      <ol>
        {googleRealtimeTrendsByState.map((x, i) => {
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
