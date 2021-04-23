# Purpose

This project was designed to sort of emulate a commonly useed
project structure for an MVC-like web API (without the Views).
The idea was to separate each `model` and `controller`
(and other services, such as `database` connectors) into their own `packages`.

The `trends-api` is designed for use by the `worker-trends` script. The `trends-api`
was designed so that we could centralize all 3rd party operations under one point.
The `worker-trends` script will execute some tasks on a delta interval that will
utilize the 3rd party services wrapped by the `trends-api`.

Some benefits to the design choice of separating the `trends-api` and the
`public-api` are as follows:

1. The `public-api` cannot initialize any of the processes done by the `trends-api`
   or the `worker-trends` script. I didn't want the front-end to have any
   potential vulnerabilities that might allow end-users to spam the 3rd-party
   services with requests. While the `trends-api` does cache all outgoing requests
   and responses to/from the 3rd party services that would prevent outgoing calls
   in excess (in the aforementioned scenario), I had also had other plans
   for the `trends-api`
1. In the future, I might have the `trends-api` read live-feed data streams from
   some of the 3rd party services. That being said, I did not want this potential
   feature to bog down any services that served the front-end with unnecessary overhead.
   Decoupling this API from the `public-api` allows me to focus all of the "hard work"
   into one place without influcing performance of the front-end `client` or `public-api`
