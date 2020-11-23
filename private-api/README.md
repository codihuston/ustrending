# Purpose

This will not go into production. Its primary purpose was to:

1. Fetch "places" from twitter
1. Runs them against Yahoo API (to get geospatial information)
1. Attaches that geospatial data to the Twitter places
1. Stores them in `mongodb`

Since this results in data that will likely never change, there is no point
to keep this service running. If Twitter ever adds "new places" in the US
to their database, then this should be run again.

The final output data is to be manually exported from mongodb and should
replace the `mongodb/dump/places.json` file.