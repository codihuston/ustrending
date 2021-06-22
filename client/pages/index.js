import Head from "next/head";
import styles from "../styles/Home.module.css";

import Navigation from "../components/Navigation";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to US Trending!</h1>
        <Navigation />
      </main>
    </div>
  );
}
