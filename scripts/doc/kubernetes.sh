kubectl create deployment data-api --image=easylancer/data-api:0.0.1
#
kubectl get pods
kubectl get events --sort-by='.metadata.creationTimestamp'
kubectl config view

kubectl expose deployment data-api --type=LoadBalancer --port=3003
#
kubectl get services

# See pod log
kubectl logs $POD

# BASH
kubectl exec -it $POD -- /bin/bash

# Delete
kubectl delete deploy/$DEPLOYMENT svc/$SERVICE

# Update image
kubectl set image deployment/data-api data-api=easylancer/data-api:0.0.1

# APPLY YAML
kubectl apply -f kubernetes/data-api.kube.yaml

# DELETE YAML
kubectl delete -f kubernetes/data-api.kube.yaml
