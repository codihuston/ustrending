import { Loading } from "./Loading";
import { useGoogleRealtimeTrends } from "../hooks";

export function GoogleRealtimeTrendsList() {
  const { status, data, error } = useGoogleRealtimeTrends();
  
  if(status === "loading"){
    return <Loading/>
  }

  if(status === "error"){
    return (<span>Error: { error.message }</span>)
  }

  return (<>
    <ol>
      {data.map((x,i) => {
        return <li key={i}>
          {x.title}
        </li>
      })}
    </ol>
  </>)
}