# Getting Started

## For Developers

This document will tell you how to begin developing on this boilerplate.
Documentation that details exactly either component in this project will be
contained in the `docs` directory of each respective component. This only
serves as an entry point into developing the application itself; that is,
how to start the application(s).

Currently, you can develop in this project by starting it using the
following tooling:

1. Using `skaffold` (multi-container)

In the future, there may be more ways to develop on this project.

## Developing Using Skaffold

This method relies on Kubernetes to run this project in a multi-container
environment on any platform that supports Kubernetes in some form or fashion. The benefit of this is, we take this straight to production at
scale with a few changes!

### Prerequisites

1. Kubernetes is installed ([Docker Desktop](https://www.docker.com/products/docker-desktop) with Kubernetes Enabled). I am using version `3.3.3` for `Windows 10`

   - **Important: if you are using Windows, you must enable wsl2 for Windows 10,
     and install a linux distro of your choice (I use `Ubuntu 20.04`)**.
     See: [Enable WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

   - Enable Kubernetes in Docker Desktop: Docker > Settings > Kubernetes > Check, Enable Kubernetes > Apply & Restart
   - A [Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/) setup with `kubectl` should suffice as well
   - Ultimately, `kubectl` needs to be functioning and communicating with a Node or Cluster

2. [Skaffold](https://skaffold.dev/) is installed. I am using version `v1.24.1`

### Starting the Project

1.  In order to begin, we must set up [ingress-nginx](https://kubernetes.github.io/ingress-nginx/).
    It is possible that you may already have a traffic controller enabled in your local Kubernetes cluster.
    If that is the case, you may skip this setup. Otherwise, use the provided `ingress-nginx-example.yml`
    file as such:

        ```cmd
        # to init / update
        kubectl apply -f ./k8s/ingress-nginx-example.yml

        # to delete (takes time)
        kubectl delete -f ./k8s/ingress-nginx-example.yml
        ```

        This will install the `ingress controller`, which we will later configure
        using an `ingress service`. The service will route traffic to the app(s)
        as per the rules defined in our `k8s-dev\ingres-service.yml` file.

        > Note: Once you restart your computer, you may have to restart this
        controller in order to view your web app via your browser

1.  Copy the contents of the `k8s/examples` directory to the `k8s/dev` directory

    > Note: You must configure the environment variables as needed, see the example
    > config files.
    >
    > Aside from the additional configuration mentioned in the next few steps, the
    > defaults work out-of-box for `Windows w/ Docker Desktop Kubernetes`.
    >
    > If you are operating in a different environment, you will need to make
    > changes to the `hostPath` key in the `mongodb-deployment.yml`. See that file
    > for additional instructions

    1. Change the resource allocation in the deployment files to your liking.
       The out-of-box configuration might be very slow.

    1. Replace the `codihuston` token in that file with
       your name (if you want to use your own dockerhub). Not a strict requirement,
       but it will tag the docker images more accordingly when built.

    > Note: `Skaffold` is configured not to push to your container registry when the
    > images are built. It will simply keep them locally

1.  Copy `skaffold/skaffold-example.yml` to `skaffold/skaffold.yml`; replace the
    `codihuston` in this file as well

1.  _(Optional)_ Install dependencies for each project. If you are developing on the
    project, you should do this so that your IDE doesn't argue with you. Otherwise,
    this can be skipped, as the dependencies are not used from your host system, as they
    will be installed when the `Skaffold` builds the containers

    ```sh
    cd client
    yarn install

    # this is to resolve any golang compiler warnings/errors
    cd public-api
    go install

    cd trends-api
    go install

    cd worker-trends
    go install
    ```

    > Note that the `node_modules` directories are excluded during
    > the docker image process via `.dockerignore`, so you shouldn't see any
    > performance drops as as result of installing dependencies

1.  From the `skaffold` directory in the project root, run the `Skaffold` config
    file

        ```cmd
        skaffold dev
        ```

    **Important: do not forget to populate the database after this step! Read on, before
    you do!**

    > Note: You may see an error printed by the API server indicating a database error. This will be addressed in the next step

    > Note: You can exit the `Skaffold` via SIGINT (ctrl+c). Exiting `Skaffold`
    > will destroy any Kubernetes Objects defined in `k8s-dev`. The Persistent
    > Volume Claims should persist between `Skaffold` instances

    You can run the following commands to get the status of the
    services/deployments/pods:

    ```cmd
    kubectl get ingress
    kubectl get services
    kubectl get deployments
    kubectl get pods

    kubectl describe service|deployment|pod <object_name>
    ```

    This step will apply the Kubernetes config files from `k8s-dev` into the
    kubernetes cluster. This process works like so:

    1. Initialize the Kubernetes Objects as per their definitions
    1. Builds a docker image locally from each of the `Dockerfile.dev` files (if any) for the services being developed on in this project
    1. Skaffold will listen for file changes and attempt to apply them to the containers without having to re-build them (if possible) and automatically rollout the changes to each of the deployments.

    After the deployments are ready, the Kubernetes cluster is served at `localhost` on port `:8080` or `:443` (`WARNING:` no tls/ssl cert is used in development!). These ports are configured by default using `ingress-nginx-config.yml`. If you need to change those for any reason, make those changes to a new file locally named `ingress-nginx.yml`, and do not commit it to source (that filename is excluded from this repo by default). See [Testing the Project](#testing-the-project).

1.  Import data into the database

    This project uses datasets for `locations`, `places`, and `zipcodes`. Import
    them by running either the `.bat`, `.ps1`, or `.sh` scripts in your environment.
    You can find them here: [import.bat](./../mongodb/import.bat),
    [import.ps1](./../mongodb/import.ps1), [import.sh](./../mongodb/import.sh).

    > Important: only run these after the mongodb database is up and running!

    For good measure, restart skaffold by hitting `ctrl+c`, and re-running `skaffold dev`.
    If skaffold fails to spring up the containers for any reason, give it a few moments
    before re-running the `skaffold dev` command. Sometimes the database doesn't clean
    up quickly enough, which can cause the subsequent skaffold re-deployment to fail.

1.  If no data is being rendered to the application pages
    (See [Testing the Project](#testing-the-project)), restart the worker process

    ```powershell
    kubectl rollout restart deployment worker-trends-deployment
    ```

### Testing the Project

There are currently no test runners for this project, as most of the application logic is
purely a matter of fetching data from the 3rd parties or from the database or caching
layer. In the future, this may change. You can, however, view the app yourself at
the following URLs:

The applications in this project are served on `localhost:8080` as follows:

1. Client / front-end app: `localhost:8080`
1. API Server: `localhost:8080/api`
1. API Server: `localhost:8080/trends-api` (development only, this will not be accessible publically in production)
1. Redis Server: you can access it on `localhost:6379` out-of-box, or
   via the k8s pod itself. You can change this in your k8s deployment file
1. MongoDB Server: you can access it on `localhost:27017` out-of-box, or
   via the k8s pod itself. You can change this in your k8s deployment file
