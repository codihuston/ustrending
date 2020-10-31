# USE FOR DEVELOPMENT PURPOSES ONLY

This service exists solely so that I can persist the location data that
the `worker-cities` service has processed. This container will copy in the
data dump from the `worker-cities` service (stored in `./dump` in this
directory) into the container at build time.

In order to seed `mongodb` with this location dumpfile, you must
run one of the provided `import` scripts, whichever suites your platform.

> NOTE: Since these scripts need run from your host machine, the `mongodb` container
will need to expose its ports to your host machine.

These scripts assume that you are using the out-of-box k8s configuration
alongside docker-desktop's provided `kubectl` service; this out-of-box
configuration already includes a load balancer that will expose the
`mongodb` container to your host computer.
See `k8s/examples/mongodb-ip-cluster.yml`

You only need to run this script once. The out-of-box configuration for
the `mongodb` service will create a persistent data volume on your host
machine See `k8s/examples/mongodb-deployment.yml`.

> NOTE: If you are using a linux-based OS, you will want to change the
value of the `hostPath` key in the aforementioned file accordingly.
