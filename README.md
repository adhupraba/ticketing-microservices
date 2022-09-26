## Generate generic kubernetes secret

---

```
kubectl create secret generic <secret_name> --from-literal=<key>=<value>
```

example:

```
kubectl create secret generic jwt-secret --from-literal=JWT_SECRET=12345
```

## Note on gateway service

---

Gateway service is used only for development purpose which is used in place of kubernetes for faster development process which acts like ingress service

## Kubernetes port forward to pod

---

```
kubectl port-forward <pod-name> <local-port>:<pod-port>
```

## Stripe local webhook testing

---

1. install [stripe cli](https://stripe.com/docs/stripe-cli)
2. place the stripe webhook secret in .env or k8s file
3. `stripe listen --forward-to localhost:{{port}}/{{webhook_endpoint}}`
