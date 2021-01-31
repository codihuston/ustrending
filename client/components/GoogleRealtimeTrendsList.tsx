import { GoogleRealtimeTrend } from "../types";

type Props = {
  googleRealtimeTrends: GoogleRealtimeTrend[]
};

export function GoogleRealtimeTrendsList({ googleRealtimeTrends }: Props) {
  
  if (!googleRealtimeTrends){
    return <span>Error: no google realtime trends are provided!</span>
  }

  return (<>
    <ol>
      {googleRealtimeTrends.map((x,i) => {
        return <li key={i}>
          {x.title}
        </li>
      })}
    </ol>
  </>)
}