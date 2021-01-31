import { GoogleDailyTrend } from "../types";

type Props = {
  googleDailyTrends: GoogleDailyTrend[]
}

export function GoogleDailyTrendsList({ googleDailyTrends }: Props) {
  
  if (!googleDailyTrends){
    return <span>Error: no google daily trends are provided!</span>
  }

  return (<>
    <ol>
      {googleDailyTrends.map((x,i) => {
        return <li key={i}>
          {x.title.query}
        </li>
      })}
    </ol>
  </>)
}