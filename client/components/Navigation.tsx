import Link from "next/link";

export default function Navigation(){
  return (<>
  <Link href={`/about`}>
    <a>About</a>
  </Link>
  <Link href={`/google/daily`}>
    <a>Google Daily Trends</a>
  </Link>
  <Link href={`/google/realtime`}>
    <a>Google Realtime Trends</a>
  </Link>
  <Link href={`/twitter/realtime`}>
    <a>Twitter Realtime Trends</a>
  </Link>
  </>)
}