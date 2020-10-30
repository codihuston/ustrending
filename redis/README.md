# WARNING: USE FOR DEVELOPMENT PURPOSES ONLY

AGAIN, DO NOT USE IN PRODUCTION!!!

This redis config file will configure the redis pod to:

1. Listen on ALL NETWORK INTERFACES

2. DISABLE protected mode

Since this container will listen to any network interfaces, you will be
able to connect to it from the docker host (your computer) via `localhost:6379`.
That is the only purpose of this configuration. This will allow you to work
on worker scripts from outside of the k8s / skaffold environment,
should you choose. Exposing this redis server to your host machine is helpful
for when you are working on a service that has not yet been integrated into the
k8s environment, but needs access to the redis server.