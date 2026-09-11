# Manifests

This directory contains manifests, used to manage deployments of the BookClub application on OpenShift compatible Kubernetes clusters.

## The current setup

### Context
- Two environments: `staging` and `prod`. Their environment values are defined in a `configmaps.yaml`. [More info here](#Usage).
- Most files use a YAML document separator (`---`) to have both environments' configs in the same file

### Flow
1. GitHub Actions publish images with tags `bookclub:staging` and `bookclub:prod` to Docker Hub [here](https://hub.docker.com/r/lukutoukat/bookclub/tags).
2. `imagestreams.yaml` watches the above images for changes and creates image streams named `bookclub:staging` and `bookclub:prod`
3. `deployments.yaml` uses the image streams to provision new containers and trigger a redeployment if an image stream is updated
4. `services.yaml` uses the metadata labels of deployments above to select the correct pods to be a part of a single service
5. `routes.yaml` uses the services to externally expose pods to a URL. Currently, exposes them to University of Helsinkis test clusters.

## Usage

1. Create a `configmaps.yaml` file, and fill it with below template values:

`configmaps.yaml`
Contains the staging and production configs. This file is not committed to version control. Example with dummy values:
```yaml
# Staging config
apiVersion: v1
kind: ConfigMap
metadata:
  name: bookclub-staging-config
data:
  DATABASE_URL: postgresql://username:password@localhost:5432/clubdb
  SECRET: "putsomekindapasswordhere"

---

# Production config
apiVersion: v1
kind: ConfigMap
metadata:
  name: bookclub-prod-config
data:
  DATABASE_URL: postgresql://username:password@localhost:5432/clubdb
  SECRET: "putsomekindapasswordhere"
```

2. Apply the manifests with `oc apply -f manifests` from the project root directory.