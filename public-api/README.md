# Purpose

This project was designed to sort of emulate a commonly useed
project structure for an MVC-like web API (without the Views).
The idea was to separate each `model` and `controller`
(and other services, such as `database` connectors) into their own `packages`.

The `public-api` is designed in a manner that allows the front-end `client` to
serve its users without deteriorating performance for the front-end `client`
as much as possible. This is done by separating the "hard work" done by
the back-end into the `trends-api` and `worker-trends` script, and delegating
the `read` operations primarily to the `public-api`.

This service will read from the `redis` cache, and query `mongodb` with
only read operations. Handling cases in which the `redis` cache
does not contain any of the information that the front-end `client` needs
is delegated to the `client` itself.