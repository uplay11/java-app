# CI/CD Pipeline with GitHub Actions & GitOps

## Overview

This project demonstrates an automated **CI/CD pipeline for a Java application** using GitHub Actions, Docker, Kubernetes, and Argo CD.

The pipeline performs code scanning, application build, Docker image security scanning, image publishing, and GitOps-based Kubernetes deployment.

## Tech Stack

* GitHub Actions
* Java 17 & Maven
* CodeQL
* Docker
* Trivy
* Docker Hub
* Kubernetes
* Kustomize
* Argo CD

## CI/CD Flow

```text
Git Push
   ↓
CodeQL Scan
   ↓
Maven Build & Test
   ↓
Docker Build
   ↓
Trivy Scan
   ↓
Push Image to Docker Hub
   ↓
Update Kubernetes Manifest
   ↓
Argo CD
   ↓
Kubernetes
```

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── argocd/
│   └── application.yaml
├── k8s/
│   ├── deployment.yaml
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   └── service.yaml
├── src/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── pom.xml
└── README.md
```

## Key Features

* Automated CI/CD using GitHub Actions
* Code security scanning with CodeQL
* Docker image vulnerability scanning with Trivy
* Docker image publishing to Docker Hub
* Kubernetes deployment using Kustomize
* GitOps-based deployment with Argo CD
* Git SHA-based Docker image versioning

## Author

**Kush Yadav**
Aspiring DevOps Engineer
