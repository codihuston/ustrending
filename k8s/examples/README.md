# Purpose of this Directory

When using the `Skaffold` workflow, you can configure
the development deployment of this project to your Kubernetes cluster here.
First, copy the contents of the `k8s-example` directory into here. Files in this
directory should not be committed to source, and will be `gitignored`
out-of-box. You may then configure these k8s objects to your liking.

> Note: The example files are configured such that they should work out of box.

## Changing Default Configurations

Reasons why you might not want to use the default configrations are as follows:

1. When changing environment variables for the services, you can do so in the
   following ways: - Update the deployment files that you have copied into your `k8s-dev` directory
   to your liking
