# Purpose

This document describes the purpose of this container, and how it should be
used in development and production.

The overall purpose of this container is to fetch city and population data from
the US Census, then feed that into the Yahoo Weather API to get the `long/lat`,
`woeid` (used for Twitter API), the `population` (to be used to determine which
locations to analyze with the Twitter API), and to persist this final result
somewhere that the other services in this product can access quickly.

## Development

This container is not intended to be ran in a scalable fashion, as its sole
purpose is to fetch mostly static data and persist it (as discussed above).
Therefore, to develop on this container, you should simply use the `launch.json`
configuration that is provided (simply run `index.js` with the debugger).

Before you do, you must configure the environment by copying `.env-example`
to `.env` and updating the file according to your development environment.
Be sure to include your API keys.

> NOTE: this container does expect to be able to access the k8s cluster,
specifically the Redis and MongoDB services!

***You will likely never have a need to actually run this container, because the
database should already be populated with data that I scraped from these APIs.***

For now, this container will:

1. Fetch all city data from US Census and Yahoo Weather API

    > NOTE: This does not care if a location exists in the database already;
    however, if a given location query to the Yahoo Weather API has been cached
    in Redis, it will not re-query the API. Out-of-box cache time (`TTL`) for these
    responses is `24 hours` (see `.env-example`). Meaning, if you've queried
    their API within that timeframe, that record will be cached ***(unless you
    destroy your environment using `skaffold delete`)***.

    > NOTE: If you do destroy your environment with the above `skaffold`
    command, know that the database will still persist on your file system
    as per your k8s configuration. See `k8s/examples/mongo-deployment.yml`

    1. Process it them neatly

    1. Persist it to a local `mongodb` instance

    1. Cache it in the form of a stringified JS Map in `redis` (for the other
    workers / services in this product to use)

1. After the data has been persisted, it will also be written to a file on your
localhost in the `/dump` directory

    1. The docker image for MongoDB is configured to import this dump file prior
    to springing up the database

    1. This means that you'll likely never need to actually run this script
    unless you want to update the set of cities as the US Census data is updated

    1. In production, if the database exists and can be connected to, rely on
    it instead; otherwise, fall back to this file (there are other
    implications to this method, such as disabling features like historical
    data--how to handle is TBD)

## Production

This container will not be deployed to production.  Since this data is largely
static and can only change when the US Census updates their data, there is no
point in deploying this application.

Ideally, the dumped data from this script would be imported manually into a
production database or served via a flat JSON file from the `public-api`
*if needed*. The place in which this data is stored in production depends
largely upon whether or not I want to invest in a cloud-based DBMS.