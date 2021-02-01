import { GoogleDailyTrend } from "../types";

type Props = {
  googleDailyTrends: GoogleDailyTrend[];
};

export function GoogleDailyTrendsList({ googleDailyTrends }: Props) {
  if (!googleDailyTrends || !googleDailyTrends.length) {
    return <span>Error: no google realtime trends are provided!</span>;
  }

  return (
    <>
      <ol>
        {googleDailyTrends.map((x, i) => {
          return <li key={i}>{x.title.query}</li>;
        })}
      </ol>
    </>
  );
}
