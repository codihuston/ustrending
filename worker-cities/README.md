# Purpose

This document describes the purpose of this container, and how it should be
used in development and production.

The overall purpose of this container is to fetch city and population data from
the US Census, then feed that into the Yahoo API to get the long/lat + woeid
(used for Twitter API), and to persist this final result somewhere.

This resulting data will then be used by the `worker-twitter` container.

## Development

For now, this container should:

1. Fetch all city data, persist it to a local `mongodb` instance

1. Also write that data to a file

    1. I will then manually copy this file into the
    containers that need it and use it accordingly

    1. In production, if the database exists and can be connected to, rely on
    it instead; otherwise, fall back to this file (there are other
    implications to this method, such as disabling features like historical
    data--how to handle is TBD)

## Production

This container will not be deployed to production, as the data that it fetches
should be mostly static, and only needs to be updated yearly (census data).

In effort to reduce the need for a cloud-based managed DBMS, I will initially
forego that service in favor of deploying a JSON file containg the completed
city data alongside the containers that need it. Right now,
it seems that perhaps the `worker-twitter` container is the only one that
will need access to it, aside from maybe the `server` API container.

If I ever implement a "historical data" feature, where end-users can ask to view
trending data by date / time, I'll need to implement a master database, by then
I would probaby use MongoDB. So to be forward thinking, I will need to initially
develop the containers that need this data in a manner that would make it easy
to swap to using a database rather than a static file system store.