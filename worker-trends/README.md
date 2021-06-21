# Purpose

This is a worker script that is designed to do the following on a delta interval:

1. Process Daily Google Trends
   1. Gets the Daily Google Trends from `trends-api`
   2. Pushes them onto a queue for processing
   3. Pop off each trend, find and store its regional trending data
   4. Store this regional data for the `public-api` to query later
2. Process Realtime Google Trends
   1. Gets the Realtime Google Trends `trends-api`
   2. Pushes them onto a queue for processing
   3. Pop off each trend, find and store its regional trending data
   4. Store this regional data for the `public-api` to query later
3. Process Realtime Twitter Trends (DEPRECATED)
   1. Queries `trends-api` for all `Twitter Places`
   2. For each `Twitter Place`, query the `trends-api` for the Twitter trends at that place
   3. Store this regional data for the `public-api` to query later