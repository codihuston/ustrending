/**
 * NOTE: dev environment builds a docker image and uses it with skaffold/k8s.
 * In production, this will likely be deployed in a separate cluster/standalone
 * instance (it doesn't need to be replciated).
 * 
 * TODO: 
 * 1. [] connect to redis
 * 2. [] create cronjob, runs every X minutes
 *    2a. [] query google trends explorer (~20 requests) -> gets each trend
 *    2b. [] query google trends geocompare (~20 requests) -> gets trend ranking
 *        by state
 * 3. [] process trend/state rankings for clients to use
 * 4. [] store to redis
 */