#!/bin/sh
set -e

: "${FHIR_URL:?FHIR_URL is required}"
: "${BACK_URL:?BACK_URL is required}"
: "${DATAMODEL_URL:?DATAMODEL_URL is required}"

sed -i "s@{FHIR_URL}@$FHIR_URL@g" /etc/nginx/conf.d/nginx.conf
sed -i "s@{BACK_URL}@$BACK_URL@g" /etc/nginx/conf.d/nginx.conf
sed -i "s@{DATAMODEL_URL}@$DATAMODEL_URL@g" /etc/nginx/conf.d/nginx.conf

sed -i "s@{VITE_CONFIG_URL}@$VITE_CONFIG_URL@g" /app/build/assets/*.js
sed -i "s@{VITE_CLARITY_APP_ID}@$VITE_CLARITY_APP_ID@g" /app/build/index.html

echo "=== Generated proxy_pass ==="
grep -n "proxy_pass" /etc/nginx/conf.d/nginx.conf

nginx -t

exec nginx -g 'daemon off;'