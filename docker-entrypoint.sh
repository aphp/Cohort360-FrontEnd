#!/bin/sh
set -e

# Replace all URLs in nginx.conf by environment variables
sed -i "s@{FHIR_URL}@$FHIR_URL@g" /etc/nginx/conf.d/nginx.conf
sed -i "s@{BACK_URL}@$BACK_URL@g" /etc/nginx/conf.d/nginx.conf
sed -i "s@{DISPOSE_URL}@$DISPOSE_URL@g" /etc/nginx/conf.d/nginx.conf

# Replace all {MY_ENV_VAR} with the real MY_ENV_VAR defined in CI/CD.
sed -i "s@{REACT_APP_BACK_API_URL}@$REACT_APP_BACK_API_URL@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_REQUEST_API_URL}@$REACT_APP_REQUEST_API_URL@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_FHIR_API_URL}@$REACT_APP_FHIR_API_URL@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_CONTEXT}@$REACT_APP_CONTEXT@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_CLAIM_HIERARCHY}@$REACT_APP_VALUE_SET_URL_CLAIM_HIERARCHY@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_CONDITION_HIERARCHY}@$REACT_APP_VALUE_SET_URL_CONDITION_HIERARCHY@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_CONDITION_STATUS}@$REACT_APP_VALUE_SET_URL_CONDITION_STATUS@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_PROCEDURE_HIERARCHY}@$REACT_APP_VALUE_SET_URL_PROCEDURE_HIERARCHY@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_DEMOGRAPHIC_GENDER}@$REACT_APP_VALUE_SET_URL_DEMOGRAPHIC_GENDER@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_MODE}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_MODE@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_VISIT_TYPE}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_VISIT_TYPE@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_FILE_STATUS}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_FILE_STATUS@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_DESTINATION}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_DESTINATION@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_PROVENANCE}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_PROVENANCE@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION}@$REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_MEDICATION_ATC}@$REACT_APP_VALUE_SET_URL_MEDICATION_ATC@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES}@$REACT_APP_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS}@$REACT_APP_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_BIOLOGY_ANABIO}@$REACT_APP_VALUE_SET_URL_BIOLOGY_ANABIO@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_VALUE_SET_URL_BIOLOGY_LOINC}@$REACT_APP_VALUE_SET_URL_BIOLOGY_LOINC@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_ODD_BIOLOGY}@$REACT_APP_ODD_BIOLOGY@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_ODD_COMPOSITION}@$REACT_APP_ODD_COMPOSITION@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_ODD_PROCEDURE}@$REACT_APP_ODD_PROCEDURE@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_ODD_CLAIM}@$REACT_APP_ODD_CLAIM@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_ODD_CONDITION}@$REACT_APP_ODD_CONDITION@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_ODD_OBSERVATION}@$REACT_APP_ODD_OBSERVATION@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_ODD_MEDICATION}@$REACT_APP_ODD_MEDICATION@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_ODD_CONTACT}@$REACT_APP_ODD_CONTACT@g" /app/build/static/js/*.js
sed -i "s@{REACT_APP_ODD_EXPORT}@$REACT_APP_ODD_EXPORT@g" /app/build/static/js/*.js

# Restart nginx to apply changes
service nginx restart

# Sleep infinity so the container will run forever
sleep infinity