#!/usr/bin/bash

declare -a UrlArray=("JWT_URL" "BACK_URL" "FHIR_URL" "DISPOSE_URL" "PORTAIL_URL")

for NAME in ${UrlArray[@]}; do
  ENV_VAR="${!NAME}"
  ENV_VAR=$(echo $ENV_VAR | sed "s/[^a-zA-Z0-9]/\\\\&/g");
  sed -i s/"{{"$NAME"}}"/$ENV_VAR/g /etc/nginx/conf.d/nginx.conf;
done

service nginx restart
sleep infinity