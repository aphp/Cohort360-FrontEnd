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

# start helm chart if not exist else rollout deploy
CHART_NAME="front"
if ! kubectl get deploy | grep -q -e "$ENVIRONMENT-$CHART_NAME"; then
  PROJECT_ID=$(echo $DEVOPS_PROJECT_ID)
  curl --request POST --form "token=$CI_JOB_TOKEN" --form "ref=$CI_COMMIT_BRANCH" --form "variables[SPECIFIC_CHART]=$CHART_NAME" "https://$GITLAB_URL/api/v4/projects/$PROJECT_ID/trigger/pipeline"
else
  ENVIRONMENT=${CI_COMMIT_BRANCH/_/-}
  kubectl create secret generic $ENVIRONMENT-$CHART_NAME-env --from-env-file=$ENV_FILE -o yaml --dry-run=client | kubectl apply -f -
  kubectl rollout restart deployment/$ENVIRONMENT-$CHART_NAME
fi