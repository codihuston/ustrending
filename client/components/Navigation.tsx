import Link from "next/link";

export function Navigation() {
  return (
    <>
      <ul>
        <li>
          <Link href={`/about`}>
            <a>About</a>
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
        <li>
          <Link href={`/twitter/realtime`}>
            <a>Twitter Realtime Trends</a>
          </Link>
        </li>
      </ul>
    </>
  );
}
