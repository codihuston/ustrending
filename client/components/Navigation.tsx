import Link from "next/link";

export default function Navigation() {
  return (
    <>
      <ul>
        <li>
          <Link href={`/about`}>
            <a>About</a>
          </Link>
        </li>
        <li>
          <Link href={`/google/trending-nearby`}>
            <a>Trending Nearby</a>
          </Link>
        </li>
        <li>
          <Link href={`/google/daily`}>
            <a>Google Daily Trends</a>
          </Link>
        </li>
        <li>
          <Link href={`/google/realtime`}>
            <a>Google Realtime Trends</a>
          </Link>
        </li>
      </ul>
    </>
  );
}
