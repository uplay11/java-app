# Happy Birthday Kush 🎉

A Spring Boot web app with a birthday greeting page for Kush — confetti animation, a live
countdown, and a guestbook where visitors can leave birthday wishes.

## Features

- 🎊 Celebrate button that triggers a confetti animation
- 🕛 Live countdown to midnight
- 💌 Guestbook — visitors can post a birthday wish via a small REST API, stored in memory
- ❤️ `/actuator/health` endpoint for Kubernetes liveness/readiness probes

## Run locally

```bash
mvn clean package
java -jar target/happy-birthday-kush.jar
```

Then open **http://localhost:8080**.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/wishes` | List all guestbook wishes (newest first) |
| POST | `/api/wishes` | Add a wish — JSON body `{ "name": "...", "message": "..." }` |
| GET | `/actuator/health` | Health check for probes |

## Project structure

```
happy-birthday-kush/
├── pom.xml
├── Dockerfile
├── src/main/java/com/kush/birthday/
│   ├── HappyBirthdayApplication.java
│   ├── controller/WishController.java
│   └── model/Wish.java, WishRequest.java
├── src/main/resources/
│   ├── static/ (index.html, css/, js/)
│   └── application.properties
├── k8s/ (namespace, deployment, service, kustomization)
├── argocd/application.yaml
└── .github/workflows/ci-cd.yml
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci-cd.yml`):
- **On every push/PR to `main`**: builds the project with Maven and uploads the jar as a build artifact.
- **On every push/PR to `main`**: runs CodeQL static analysis on the Java source; findings show up in the repo's **Security → Code scanning** tab.
- **On pushing a tag like `v1.0.0`**: builds the jar and publishes it as a GitHub Release automatically.
- **On push to `main`**: builds the Docker image, scans it with Trivy, and blocks the push to Docker Hub if any CRITICAL/HIGH vulnerabilities are found.

### Create a release

```bash
git tag v1.0.0
git push origin v1.0.0
```

This triggers the release job and attaches `happy-birthday-kush.jar` to a new GitHub Release.

### Security scanning

| Scan | Tool | Scope | Where results show up |
|---|---|---|---|
| Source code (SAST) | CodeQL | Java source | Security → Code scanning alerts |
| Container image | Trivy | OS packages + app dependencies in the built image | Security → Code scanning alerts, plus job logs |

The image scan runs **before** the Docker Hub push (`docker-build-scan` job) — if it finds a
CRITICAL or HIGH severity vulnerability, the job fails and `docker-hub` never runs, so a vulnerable
image never gets published.

## Docker

```bash
docker build -t happy-birthday-kush .
docker run -p 8080:8080 happy-birthday-kush
```
Then open **http://localhost:8080**.

## Deploy to Docker Hub

### 1. Create the repository (one-time)

Create a repo named `happy-birthday-kush` under your Docker Hub account (via the website, or it's
created automatically on first push).

### 2. Push manually

```bash
docker login
docker build -t <your-dockerhub-username>/happy-birthday-kush:latest .
docker push <your-dockerhub-username>/happy-birthday-kush:latest
```

### 3. Automatic push via GitHub Actions

The `docker-hub` job in `.github/workflows/ci-cd.yml` builds and pushes the image to Docker Hub
automatically on every push to `main`.

**Setup required:**

1. Create a Docker Hub [access token](https://hub.docker.com/settings/security) (Account Settings → Security → New Access Token).
2. Add these repository secrets in **GitHub → Settings → Secrets and variables → Actions**:
   - `DOCKERHUB_USERNAME` — your Docker Hub username
   - `DOCKERHUB_TOKEN` — the access token from step 1

Once those secrets are set, every push to `main` builds the image and pushes:
- `<your-dockerhub-username>/happy-birthday-kush:latest`
- `<your-dockerhub-username>/happy-birthday-kush:<git-sha>`

### 4. Run the pushed image

```bash
docker pull <your-dockerhub-username>/happy-birthday-kush:latest
docker run -p 8080:8080 <your-dockerhub-username>/happy-birthday-kush:latest
```

## GitOps (CD)

Deployment uses the GitOps pattern with **ArgoCD**:

```
push to main
   → build → docker-build-scan → docker-hub (image pushed with :<git-sha> tag)
      → gitops-update: bumps k8s/kustomization.yaml to the new image tag, commits to main
         → ArgoCD (running in-cluster) detects the Git change and auto-syncs the deployment
```

CI never talks to the cluster directly — it only updates the desired state in Git. ArgoCD is the
only thing with cluster access, and it continuously reconciles the live state to match what's in
`k8s/`.

### Files

- `k8s/namespace.yaml` — creates the `happy-birthday-kush` namespace
- `k8s/deployment.yaml` — the Deployment (2 replicas, readiness/liveness probes on `/actuator/health`)
- `k8s/service.yaml` — ClusterIP Service exposing port 80 → container port 8080
- `k8s/kustomization.yaml` — pins the image tag; CI edits only this file
- `argocd/application.yaml` — the ArgoCD `Application` that watches `k8s/` in this repo

### One-time setup

1. Install ArgoCD in your cluster (if not already):
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```
2. Edit `argocd/application.yaml` and set `spec.source.repoURL` to your actual repo URL.
3. Edit `k8s/kustomization.yaml`, replacing `__DOCKERHUB_USERNAME__` with your Docker Hub username
   (or leave it — CI's `gitops-update` job overwrites the image reference automatically on every
   push to `main`).
4. Register the app with ArgoCD:
   ```bash
   kubectl apply -f argocd/application.yaml
   ```
5. From then on, every push to `main` → new image on Docker Hub → manifest updated in Git →
   ArgoCD syncs the cluster automatically. No manual `kubectl apply` needed.

Check sync status any time with:
```bash
argocd app get happy-birthday-kush
```

To access the app once deployed, port-forward the Service:
```bash
kubectl port-forward -n happy-birthday-kush svc/happy-birthday-kush 8080:80
```
Then open **http://localhost:8080**.
