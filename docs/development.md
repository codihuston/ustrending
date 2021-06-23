# Getting Started

- [Getting Started](#getting-started)
  - [For Developers](#for-developers)
  - [Developing Using Skaffold](#developing-using-skaffold)
    - [System Requirements](#system-requirements)
    - [Prerequisites](#prerequisites)
    - [Starting the Project](#starting-the-project)
      - [For MacOS](#for-macos)
      - [For Windows](#for-windows)
    - [About Skaffold](#about-skaffold)
    - [How to View the Project](#how-to-view-the-project)
    - [How to Troubleshoot the Project](#how-to-troubleshoot-the-project)
  - [Cleanup](#cleanup)
    - [Notes](#notes)

## For Developers

This document will explain how to begin developing on this repo.
Documentation that details exactly either component in this project will be
contained in the `docs` directory of each respective component. This
document only serves as an entry point into developing the application(s)
themselves, and does not document each application individually.

Currently, you can develop in this project by starting it using the
following tooling:

1. Using `skaffold` (multi-container)

## Developing Using Skaffold

This method relies on Kubernetes to run this project in a multi-container
environment on any platform that supports Kubernetes in some form or fashion.
The benefit of this is, we take this straight to production at scale with a few
changes!

### System Requirements

1. CPU: at least 4 vCPUs
2. RAM: at least 8GB
3. Storage: ~1GB (for docker containers)

### Prerequisites

1. Kubernetes is installed:
   ([Docker Desktop](https://www.docker.com/products/docker-desktop)
   with Kubernetes Enabled). I am using version `3.3.3` for `Windows 10`
   (Kubernetes version: `v1.19.7`), and `3.4.0` for `MacOS`
   (Kubernetes version: `v1.21.1`)

   - **Important: if you are using Windows, you must enable `wsl2` for Windows
     10, and install a linux distro of your choice (I use `Ubuntu 20.04`)**.
     See: [Enable WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
   - Enable Kubernetes in Docker Desktop:
      - Windows: Docker > Settings > Kubernetes > Check, Enable Kubernetes > Apply & Restart
      - Mac: Docker > Preferences > Kubernetes > Check, Enable Kubernetes > Apply & Restart
   - *You will want to ensure that Docker says "Kubernetes is Running" before
     continuing. This can take awhile!*
      - If this takes "too long" for you (I'd say longer than 10 minutes), you
      can try hard-resetting the Docker Kubernetes to default and trying again.
      Or, you can try resetting the Docker Kubernetes Cluster itself. In Mac,
      these options are under the "Reset" tab

   > Note: a
   > [Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/) setup
   > with `kubectl` should suffice as well. Ultimately, `kubectl` needs to be
   > functioning and communicating with a Node or Cluster
1. Create a Docker account sign into Docker Desktop
1. If you have multiple Kubernetes contexts, you will want to ensure you
are using Docker Desktop's.

   ```bash
   kubectl config get-contexts

   # if you have more, then one context, run the following command. The docker
   # context may have a different name, be sure to use the one on-screen.
   kubectl config use-context docker-for-desktop
   ```

2. [Skaffold](https://skaffold.dev/) is installed. I am using version `v1.24.1`
   on Windows and `v1.26.1` on Mac

### Starting the Project

At a high level, the steps you need to follow in order to get the application(s)
running are as follows. **These steps will be explained in detail in a later
section!**

1. (Optional, if you already have one) Deploy a Traffic Controller
   [ingress-nginx](https://kubernetes.github.io/ingress-nginx/)
2. Copy/Paste the out-of-box Kubernetes configuration from `k8s/examples` to
   `k8s/dev`

   1. Configure `hostPath` for your OS `k8s-dev/mongo-deployment.yaml`

   > Note: this is used to persist the database between dev sessions.

3. Copy/Paste the out-of-box Kubernetes configuration from
   `skaffold/skaffold-example.yaml` to `skaffold/skaffold.yaml`
4. `cd` into the `skaffold` directory and run `skaffold dev`
5. Once the `mongodb` instance is accepting connections, run
   `mongodb/import.ps1|.bat` (Windows) or `mongodb/import.sh` (Mac)
6. Visit `localhost:8080` and explore the application

   1. If any Google Daily/Realtime Trends are not populating in the interface,
      see [How to Troubleshoot the Project](#how-to-troubleshoot-the-project).

   > Note: This worker script is designed to run once on start, and every 30
   > minutes thereafter. There is a caching layer built in that will prevent
   > repeated outgoing requests to the 3rd party servers, so re-running the
   > worker script is safe within this time window.

#### For MacOS

All of the steps will be the same as described in the
[For Windows](#for-windows) section, except for the following:

1. Configure `mongodb` to persist across reboots and skaffold sessions

   In the [k8s/examples/mongo-deployment.yml](../k8s/examples/mongo-deployment.yml)
   file, you need to update the `hostPath.path` under the `mongo-volume` volume
   key to a path that is writable by your user account. Comment out line 53,
   and uncomment line 59, and update the aforementioned key accordingly. The
   default value `/Users/your-username/ustrending-k8s` must be updated with your
   username. You can get that via the following command in bash:

   ```bash
   whoami
   ```

   For example, if your username is `codi`, you would update the
   `hostPath.path` under the `mongo-volume` volume key to
   `/Users/codi/ustrending-k8s`.

   > Note: I originally pointed this to `/tmp/ustrending-k8s` without avail.
   > So I recommend using the above path instead.

   Do not commit changes to this file. Once you complete this guide, you
   can revert these file changes (if you intend to develop further on the
   project), as the changes you made will be persisted in a .gitignored
   directory

1. In your `Docker Desktop for Mac`, you will want to delegate additional
   resources to your Kubernetes node, otherwise some containers will not start!
      - Docker > Preferences > Advanced; update the resources to your liking.
      Don't forget to click apply and restart
      - I am running with 6 CPUs, 16GB RAM, and 2.5GB Swap on my Macbook. You
      should be able to get away with the
      [aforementioned system requrements](#system-requirements)

After you have made the above changes, you can follow the steps in the
[Windows](#for-windows) section.

#### For Windows

1. In your terminal, `cd` into the root of this repository. You should see
   the `README.md` and `ustrending.code-workspace` in this directory. All
   commands hereafter will be relative to this directory.

2. Deploy [ingress-nginx](https://kubernetes.github.io/ingress-nginx/),
   a traffic controller that will delegate traffic into your cluster. It is
   possible that you may already have a traffic controller enabled in your
   local Kubernetes cluster. If that is the case, you may skip this setup.

   Otherwise, use the provided `ingress-nginx-example.yml` file as such:

   ```cmd
   # to init / update
   kubectl apply -f ./k8s/ingress-nginx-example.yml
   ```

   This will install the `ingress controller`, which we will later configure
   using an `ingress service`. The service will route traffic to the app(s)
   as per the rules defined in our `k8s-dev\ingress-service.yml` file.

   > Note: If you restart your computer, you may have to redeploy the ingress
   > controller, as well as the rest of the deployments.

3. Copy the contents of the `k8s/examples` directory to the `k8s/dev` directory

   Bash:

   ```bash
   mkdir k8s/dev && cp k8s/examples/*.yml k8s/dev/
   ```

   Powershell:

   ```powershell
   New-Item -ItemType directory -Path k8s/dev
   Copy-Item k8s/examples/*.yml k8s/dev/
   ```

   1. _Change the cpu/ram resource allocation in the deployment files to your
      liking. The out-of-box configuration might be very slow, especially for
      the client-deployment_ 

   > Note: the provided configuration should work for Windows out-of-box.
   > No environment variables need to be changed.

   > Note: `skaffold` is configured not to push to your container registry when
   > the images are built. It will simply keep them locally.

4. Copy `skaffold/skaffold-example.yml` to `skaffold/skaffold.yml`

   Bash:

   ```bash
   cp skaffold/skaffold-example.yml skaffold/skaffold.yml
   ```

   PowerShell:

   ```powershell
   Copy-Item skaffold/skaffold-example.yml skaffold/skaffold.yml
   ```

5. From the `skaffold` directory in the project root, run the `skaffold`
   (which uses the relative config file we just copied)

   ```cmd
   cd skaffold

   skaffold dev
   ```

   Skaffold will output logs from the kubernetes objects in this terminal.

   **Important: do not forget to populate the database in the next step!
   Read the rest of this step, before you do!**

   > Note: You may see an error printed by the API server(s) or the Worker script that
   > indicate a database error. This will be addressed in the next step.

   > Note: You can exit the `skaffold` via SIGINT (cmd|ctrl+c). Exiting `skaffold`
   > will destroy any Kubernetes Objects defined in `k8s-dev`. The Persistent
   > Volume Claims should persist between `skaffold` instances.

   You can run the following commands to get the status of the
   services/deployments/pods:

   ```cmd
   kubectl get ingress
   kubectl get services
   kubectl get deployments
   kubectl get pods

   kubectl describe service|deployment|pod <object_name>
   ```

   Read more about [skaffold](#about-skaffold).

6. Import data into the database

   This project uses a dataset for `zipcodes`. Import them by running either
   the `.bat`, `.ps1`, or `.sh` scripts from your kubernetes host environment
   You can find them here: [import.bat](./../mongodb/import.bat),
   [import.ps1](./../mongodb/import.ps1), [import.sh](./../mongodb/import.sh).

   > Important: only run these after the mongodb database is up and running!

   In a new terminal from the root of this project, run the following:

   Bash:

   ```bash
   . ./mongodb/import.sh
   ```

   PowerShell:

   ```powershell
   ./mongodb/import.ps1
   ```

7. See: [How to View the Project](#how-to-view-the-project) and
   [Troubleshooting the Project](#how-to-troubleshoot-the-project)

8. _(Optional)_ Install dependencies for each project. If you are developing on
   the project, you should do this so that your IDE doesn't complain.
   Otherwise, this can be skipped, as the dependencies are not used from your
   host system, as they will be installed when the `skaffold` builds the
   containers

   ```sh
   # assuming you are in the project root
   cd client
   npm install

   cd ../public-api
   go install

   cd ../trends-api
   go install

   cd ../worker-trends
   go install
   ```

   > Note: the `node_modules` directories are excluded during
   > the docker image process via `.dockerignore`, so you shouldn't see any
   > performance drops as as result of installing dependencies

### About Skaffold

`Skaffold` will deploy the Kubernetes config files from `k8s/k8s-dev`
into the kubernetes cluster. This process works like so:

1. Initialize the Kubernetes Objects as per their definitions
2. Builds a docker image locally from each of the `Dockerfile.dev` files
   (if any) for the services being developed on in this project
3. Skaffold will listen for file changes and attempt to apply them to the
   containers without having to re-build them (if possible) and automatically
   rollout the changes to each of the deployments. If an application requries
   recompiling, then hot-reloading is out of the question.

### How to View the Project

> IMPORTANT: know that Next.js will re-compile each page upon each request
> in development mode. You will notice load times when navigating pages.

There are currently no test runners for this project, as most of the
application logic is purely a matter of fetching data from the 3rd parties or
from the database or caching layer. In the future, this may change. You can,
however, view the app yourself at the following URLs:

The applications in this project are served on `localhost:8080` as follows:

1. Client / front-end app: `localhost:8080`

   > Note: These ports are configured by default using
   > `ingress-nginx-config.yml`. If you need to change those for any reason,
   > destroy that deployment in kubernetes, copy that file, make those changes,
   > then deploy your new configuration. Do not commit it to source
   > (the filename `ingress-nginx.yml` is excluded from this repo by default).
   >
   > The provide controller also opens port `:443`, but the ingress service
   > used to serve the application(s) does not have a tls/ssl cert configured
   > with it in the development environment, so I recommend you stick to the
   > aforementioned port over `http`.

2. API Server: `localhost:8080/api`
3. Private API Server: `localhost:8080/trends-api` (development only, this will
   not be accessible publically in production)
4. Redis Server: you can access it on your host at `localhost:6379` out-of-box,
   or via the k8s pod itself.
5. MongoDB Server: you can access it on your host `localhost:27017` out-of-box,
   or via the k8s pod itself.

> Note: For the Redis/MongoDB databases, the default out-of-box configuration
> exposes these ports using kubernetes `LoadBalancers` so that you can connect
> any GUI clients to them directly from your kubernetes host. This is just to
> improve the developer experience. If you have any services listening on these
> ports, you will not be able to connect to them, but it should not stop the
> containers from running.

See [How to Troubleshoot the Project](#how-to-troubleshoot-the-project) if there
are no trends rendered to the page.

### How to Troubleshoot the Project

Please view the screenshots provided in the
[Project Readme](../README.md#demo-in-place) for an example of what the
web application should be displaying.

> Note: If no (or only some) data is being rendered to the application pages,
> restart the worker process or redeploy the applications with `skaffold`!

Restarting the cache server and the worker process in another terminal while
`skaffold` is running. You will see the worker output streamed to the terminal
instance that `skaffold` is running within:

For Kubernetes version earlier than `v1.21.1`:

```powershell
kubectl rollout restart deployment worker-trends-deployment
```

For Kubernetes versions later than or equal to `v1.21.1`:

```powershell
kubectl scale deployment worker-trends-deployment --replicas=0
kubectl scale deployment worker-trends-deployment --replicas=1
```

Redeploying via Skaffold:

Restart skaffold by hitting `cmd|ctrl+c` in the terminal that you ran
`skaffold dev` in, followed by re-running `skaffold dev`.
If skaffold fails to spring up the containers for any
reason, give it a few moments before re-running the `skaffold dev` command.
Sometimes the database doesn't clean up quickly enough, which can cause the
subsequent skaffold re-deployment to fail.

Once the application is ready, it will re-load data as soon as you focus the
browser. I recommend starting at `localhost:8080` and then navigating to pages,
as this seems to have the most consistent UI experience. See [Notes](#notes).

> Note: sometimes the cache layer and the worker process can have a
> data "misalignment" due to how I've designed the cache to work in order to
> prevent as few repeated outgoing requests as possible
> (as to not spam google's servers). As a result, some trend data might
> render oddly. If this happens, it is best to restart everyting via `skaffold`
> as mentioned in the steps above rather than restarting the worker process.

> Note: since the database should be persisted as per the `mongo-deployment.yml`
> config file, you should never have to re-run the import scripts unless you've
> deliberately obliterated the database files from your disk.

## Cleanup

1. If `skaffold` is running in a terminal (via `skaffold dev`),
   pass a `SIGINT` to it (`cmd|ctrl+c`)
2. In the same terminal run `skaffold delete`
3. Delete the directory created by the the `mongo-deployment.yml` under the
   `hostPath.path` under the `mongo-volume` volume key
4. Delete all docker related docker images:

   Bash:

   ```bash
   docker rmi -f $(docker images codihuston/ustrending-client)
   docker rmi -f $(docker images codihuston/ustrending-mongodb)
   docker rmi -f $(docker images codihuston/ustrending-public-api)
   docker rmi -f $(docker images codihuston/ustrending-trends-api)
   docker rmi -f $(docker images codihuston/ustrending-worker-trends)
   ```

   PowerShell:

   ```powershell
   $(docker images) -like '*codihuston/ustrending*' | ForEach-Object {
       $id = ($_ -split '\s+')[2]
       docker rmi -f $id
   }
   ```
5. Delete the ingress traffic controller

   ```powershell
   # (takes time)
   kubectl delete -f ./k8s/ingress-nginx-example.yml
   ```
6. Delete the database volume that you specified in your `mongo-deployment.yml`
   file (see the `hostPath.path` under the `mongo-volume` volume key)

### Notes

Due to a mixture of `Next.js`, `Server-Side Rendering`,
`Material UI (React UI Framework)`, and `Skaffold`, there is a bit of an issue
with how CSS is compiled on the server and processed by the browser.
As a result, the CSS can be a bit funky at times. This is an ongoing issue that
I hope to resolve in the future.

For the best UI experience, begin using the application at `localhost:8080`.
Do not refresh the page at any of the sub-pages. If you happen to do that,
instead just return to `localhost:8080` and then navigate to the desired page.
