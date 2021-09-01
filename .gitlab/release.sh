#!/usr/bin/bash

if [ "$CI_COMMIT_BRANCH" = "fakedata" ]; then
  ENV_FILE=$(echo $FAKEDATA_ENV)
elif [ "$CI_COMMIT_BRANCH" = "dev" ]; then
  ENV_FILE=$(echo $DEV_ENV)
elif [ "$CI_COMMIT_BRANCH" = "qualif" ]; then
  ENV_FILE=$(echo $QUA_ENV)
elif [ "$CI_COMMIT_BRANCH" = "prod_a" ]; then
  ENV_FILE=$(echo $PROD_A_ENV)
elif [ "$CI_COMMIT_BRANCH" = "prod_b" ]; then
  ENV_FILE=$(echo $PROD_B_ENV)
fi

# connect to remote k8s server
mkdir /root/.kube
cat $KUBE_CONFIG > /root/.kube/config

# rollout k8s deploy
SUFFIX="-front"
ENVIRONMENT=${CI_COMMIT_BRANCH/_/-}
kubectl create secret generic $ENVIRONMENT$SUFFIX-env --from-env-file=$ENV_FILE -o yaml --dry-run=client | kubectl apply -f -
kubectl rollout restart deployment/$ENVIRONMENT$SUFFIX