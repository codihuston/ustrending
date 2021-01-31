import Head from "next/head";

import {
  useQueryClient
} from 'react-query'
import { useGoogleDailyTrends } from "../../../hooks";

export default function GoogleDaily() {
  // Access the client
  const queryClient = useQueryClient()
  const { status, data, error } = useGoogleDailyTrends();
  
  if(status === "loading"){
    return "Loading..."
  }

  if(status === "error"){
    return (<span>Error: { error.message }</span>)
  }

  return (
    <>
      <Head>Google Daily Trends</Head>
      <div>
        Hello world!
        <ol>
          {data.map((x,i) => {
            return <li key={i}>
              {x.title.query}
            </li>
          })}
        </ol>
      </div>
    </>
  )
}
