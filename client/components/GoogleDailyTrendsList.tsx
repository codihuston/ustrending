import { Loading } from "../components/Loading";
import { useGoogleDailyTrends } from "../hooks";

export function GoogleDailyTrendsList() {
  const { status, data, error } = useGoogleDailyTrends();
  
  if(status === "loading"){
    return <Loading/>
  }

  if(status === "error"){
    return (<span>Error: { error.message }</span>)
  }

  return (<>
    Hello world!
    <ol>
      {data.map((x,i) => {
        return <li key={i}>
          {x.title.query}
        </li>
      })}
    </ol>
  </>)
}