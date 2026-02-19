# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the MusicStream application.

## Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured to access your cluster
- Docker images built and available in your registry
- Supabase project with proper credentials

## Files Overview

- **configmap.yaml** - Configuration maps for environment variables
- **secret.yaml** - Secrets for sensitive data (API keys, database URLs)
- **frontend-deployment.yaml** - Frontend service deployment (3 replicas)
- **frontend-service.yaml** - Frontend service (LoadBalancer)
- **api-deployment.yaml** - API service deployment (2 replicas)
- **api-service.yaml** - API service (ClusterIP)
- **ingress.yaml** - Ingress configuration for routing
- **hpa.yaml** - Horizontal Pod Autoscaler for auto-scaling

## Deployment Steps

### 1. Update Secrets
Edit `secret.yaml` with your Supabase credentials:

```bash
kubectl apply -f k8s/secret.yaml
```

### 2. Update ConfigMap
Edit `configmap.yaml` if needed:

```bash
kubectl apply -f k8s/configmap.yaml
```

### 3. Build and Push Docker Images

```bash
# Frontend image
docker build -t music-app-frontend:latest .
docker tag music-app-frontend:latest your-registry/music-app-frontend:latest
docker push your-registry/music-app-frontend:latest

# API image
docker build -f supabase/functions/Dockerfile -t music-app-api:latest supabase/functions/
docker tag music-app-api:latest your-registry/music-app-api:latest
docker push your-registry/music-app-api:latest
```

### 4. Deploy to Kubernetes

```bash
# Create namespace (optional)
kubectl create namespace music-app

# Apply all manifests
kubectl apply -f k8s/

# Or deploy in specific order
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

### 5. Monitor Deployment

```bash
# Watch deployments
kubectl get deployments -w

# Check pod status
kubectl get pods

# View service status
kubectl get svc

# Check ingress
kubectl get ingress
```

## Accessing the Application

### Via LoadBalancer (Frontend Service)
```bash
kubectl get svc music-frontend-service
# Get the EXTERNAL-IP and access via http://EXTERNAL-IP
```

### Via Ingress
Update your /etc/hosts (or DNS):
```
<your-cluster-ip> music-app.local
```
Then access: http://music-app.local

## Scaling

Auto-scaling is configured via HPA. Pods will automatically scale based on CPU and memory usage:

- **Frontend**: 2-10 replicas (70% CPU, 80% memory threshold)
- **API**: 2-5 replicas (75% CPU threshold)

Manual scaling:
```bash
kubectl scale deployment music-frontend --replicas=5
kubectl scale deployment music-api --replicas=3
```

## Troubleshooting

### Check pod logs
```bash
kubectl logs -f pod/music-frontend-xxx
kubectl logs -f pod/music-api-xxx
```

### Describe pod for events
```bash
kubectl describe pod music-frontend-xxx
```

### Check events
```bash
kubectl get events --sort-by='.lastTimestamp'
```

### Delete and redeploy
```bash
kubectl delete -f k8s/
kubectl apply -f k8s/
```

## Cleanup

```bash
kubectl delete -f k8s/
```

## Notes

- Images must be pushed to a registry accessible from your cluster
- Update image references in deployment manifests if using different registry
- Ensure Supabase credentials are correctly configured in secrets
- The API requires network access to Supabase
