#!/usr/bin/bash

mkdir -p /root/.kube
cat $KUBE_CONFIG > /root/.kube/config

if [[ "$CI_COMMIT_BRANCH" =~ ^($STANDARD_CD_BRANCHES)$ ]] || [[ "$CI_COMMIT_BRANCH" =~ ^($PROTECTED_CD_BRANCHES)$ ]]; then
  ENV_FILE=$(cat $(printenv | grep -E "\b""$CI_COMMIT_BRANCH""_ENV""\b" | cut -d '=' -f 2-) | xxd -p | tr -d '\n')

  CHART_NAME="front"
  PROJECT_ID=$(echo $DEVOPS_CD_PROJECT_ID)
  curl --request POST --form "token=$CI_JOB_TOKEN" \
    --form "ref=$CI_COMMIT_BRANCH" \
    --form "variables[SPECIFIC_CHART]=$CHART_NAME" \
    --form "variables[DISABLE_RESTART]=true" \
    --form "variables[ENV_FILE]=$ENV_FILE" \
    "https://$GITLAB_URL/api/v4/projects/$PROJECT_ID/trigger/pipeline"
fi