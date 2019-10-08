kubectl apply -f kubernetes/data-api.kube.yaml
kubectl rollout restart deployment/data-api-deployment
