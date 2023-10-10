#!/bin/sh
set -e

# Replace all URLs in nginx.conf by environment variables
sed -i "s@{FHIR_URL}@$FHIR_URL@g" /etc/nginx/conf.d/nginx.conf
sed -i "s@{BACK_URL}@$BACK_URL@g" /etc/nginx/conf.d/nginx.conf
sed -i "s@{DISPOSE_URL}@$DISPOSE_URL@g" /etc/nginx/conf.d/nginx.conf

# Replace all {MY_ENV_VAR} with the real MY_ENV_VAR defined in CI/CD.
sed -i "s@{VITE_BACK_API_URL}@$VITE_BACK_API_URL@g" /app/build/assets/*.js
sed -i "s@{VITE_REQUEST_API_URL}@$VITE_REQUEST_API_URL@g" /app/build/assets/*.js
sed -i "s@{VITE_FHIR_API_URL}@$VITE_FHIR_API_URL@g" /app/build/assets/*.js
sed -i "s@{VITE_OIDC_PROVIDER_URL}@$VITE_OIDC_PROVIDER_URL@g" /app/build/assets/*.js
sed -i "s@{VITE_OIDC_REDIRECT_URI}@$VITE_OIDC_REDIRECT_URI@g" /app/build/assets/*.js
sed -i "s@{VITE_OIDC_RESPONSE_TYPE}@$VITE_OIDC_RESPONSE_TYPE@g" /app/build/assets/*.js
sed -i "s@{VITE_OIDC_CLIENT_ID}@$VITE_OIDC_CLIENT_ID@g" /app/build/assets/*.js
sed -i "s@{VITE_OIDC_SCOPE}@$VITE_OIDC_SCOPE@g" /app/build/assets/*.js
sed -i "s@{VITE_OIDC_STATE}@$VITE_OIDC_STATE@g" /app/build/assets/*.js
sed -i "s@{VITE_AUTH_API_URL}@$VITE_AUTH_API_URL@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_CLAIM_HIERARCHY}@$VITE_VALUE_SET_URL_CLAIM_HIERARCHY@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_CONDITION_HIERARCHY}@$VITE_VALUE_SET_URL_CONDITION_HIERARCHY@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_CONDITION_STATUS}@$VITE_VALUE_SET_URL_CONDITION_STATUS@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_PROCEDURE_HIERARCHY}@$VITE_VALUE_SET_URL_PROCEDURE_HIERARCHY@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_DEMOGRAPHIC_GENDER}@$VITE_VALUE_SET_URL_DEMOGRAPHIC_GENDER@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE}@$VITE_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE}@$VITE_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_EXIT_MODE}@$VITE_VALUE_SET_URL_ENCOUNTER_EXIT_MODE@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_VISIT_TYPE}@$VITE_VALUE_SET_URL_ENCOUNTER_VISIT_TYPE@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE}@$VITE_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_FILE_STATUS}@$VITE_VALUE_SET_URL_ENCOUNTER_FILE_STATUS@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE}@$VITE_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_DESTINATION}@$VITE_VALUE_SET_URL_ENCOUNTER_DESTINATION@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_PROVENANCE}@$VITE_VALUE_SET_URL_ENCOUNTER_PROVENANCE@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_ENCOUNTER_ADMISSION}@$VITE_VALUE_SET_URL_ENCOUNTER_ADMISSION@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_MEDICATION_ATC}@$VITE_VALUE_SET_URL_MEDICATION_ATC@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_MEDICATION_UCD}@$VITE_VALUE_SET_URL_MEDICATION_UCD@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES}@$VITE_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS}@$VITE_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_BIOLOGY_ANABIO}@$VITE_VALUE_SET_URL_BIOLOGY_ANABIO@g" /app/build/assets/*.js
sed -i "s@{VITE_VALUE_SET_URL_BIOLOGY_LOINC}@$VITE_VALUE_SET_URL_BIOLOGY_LOINC@g" /app/build/assets/*.js
sed -i "s@{VITE_ODD_BIOLOGY}@$VITE_ODD_BIOLOGY@g" /app/build/assets/*.js
sed -i "s@{VITE_ODD_COMPOSITION}@$VITE_ODD_COMPOSITION@g" /app/build/assets/*.js
sed -i "s@{VITE_ODD_PROCEDURE}@$VITE_ODD_PROCEDURE@g" /app/build/assets/*.js
sed -i "s@{VITE_ODD_CLAIM}@$VITE_ODD_CLAIM@g" /app/build/assets/*.js
sed -i "s@{VITE_ODD_CONDITION}@$VITE_ODD_CONDITION@g" /app/build/assets/*.js
sed -i "s@{VITE_ODD_OBSERVATION}@$VITE_ODD_OBSERVATION@g" /app/build/assets/*.js
sed -i "s@{VITE_ODD_MEDICATION}@$VITE_ODD_MEDICATION@g" /app/build/assets/*.js
sed -i "s@{VITE_ODD_CONTACT}@$VITE_ODD_CONTACT@g" /app/build/assets/*.js
sed -i "s@{VITE_ODD_EXPORT}@$VITE_ODD_EXPORT@g" /app/build/assets/*.js

# Restart nginx to apply changes
service nginx restart

# Sleep infinity so the container will run forever
sleep infinity