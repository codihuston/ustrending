# Taking This to Production

Not all of the containers used at development will be used in production.
This is done in effort to reduce costs until I absolutely need to expand
my use of cloud services.

[Expected Services and Pricing](https://cloud.google.com/products/calculator#id=1bf3a88f-1271-4fd8-ac93-78fd304d5814)

For now, I expect to take the following services to a cloud provider:

1. Redis: using a very small instance for caching worker processes/data

1. Google/Twitter workers: stand-alone/non-replicated instances, these don't
need to scale

1. API / Client: these do need to scale, and will go into a kubernetes engine
