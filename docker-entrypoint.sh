#!/bin/sh
set -e

sed -i "s@{JWT_URL}@$JWT_URL@g" /etc/nginx/conf.d/nginx.conf
sed -i "s@{FHIR_URL}@$FHIR_URL@g" /etc/nginx/conf.d/nginx.conf
sed -i "s@{BACK_URL}@$BACK_URL@g" /etc/nginx/conf.d/nginx.conf
sed -i "s@{DISPOSE_URL}@$DISPOSE_URL@g" /etc/nginx/conf.d/nginx.conf

sed -i "s@{BACK_API_URL}@$BACK_API_URL@g" /app/build/static/js/*.js
sed -i "s@{REQUEST_API_URL}@$REQUEST_API_URL@g" /app/build/static/js/*.js
sed -i "s@{FHIR_API_URL}@$FHIR_API_URL@g" /app/build/static/js/*.js
sed -i "s/{CONTEXT}/$CONTEXT/g" /app/build/static/js/*.js
sed -i "s@{CLAIM_HIERARCHY}@$CLAIM_HIERARCHY@g" /app/build/static/js/*.js
sed -i "s@{CONDITION_HIERARCHY}@$CONDITION_HIERARCHY@g" /app/build/static/js/*.js
sed -i "s@{CONDITION_STATUS}@$CONDITION_STATUS@g" /app/build/static/js/*.js
sed -i "s@{PROCEDURE_HIERARCHY}@$PROCEDURE_HIERARCHY@g" /app/build/static/js/*.js
sed -i "s@{DEMOGRAPHIC_GENDER}@$DEMOGRAPHIC_GENDER@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_ADMISSION_MODE}@$ENCOUNTER_ADMISSION_MODE@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_ENTRY_MODE}@$ENCOUNTER_ENTRY_MODE@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_EXIT_MODE}@$ENCOUNTER_EXIT_MODE@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_VISIT_TYPE}@$ENCOUNTER_VISIT_TYPE@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_SEJOUR_TYPE}@$ENCOUNTER_SEJOUR_TYPE@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_FILE_STATUS}@$ENCOUNTER_FILE_STATUS@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_EXIT_TYPE}@$ENCOUNTER_EXIT_TYPE@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_DESTINATION}@$ENCOUNTER_DESTINATION@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_PROVENANCE}@$ENCOUNTER_PROVENANCE@g" /app/build/static/js/*.js
sed -i "s@{ENCOUNTER_ADMISSION}@$ENCOUNTER_ADMISSION@g" /app/build/static/js/*.js
sed -i "s@{MEDICATION_ATC}@$MEDICATION_ATC@g" /app/build/static/js/*.js
sed -i "s@{MEDICATION_PRESCRIPTION_TYPES}@$MEDICATION_PRESCRIPTION_TYPES@g" /app/build/static/js/*.js
sed -i "s@{MEDICATION_ADMINISTRATIONS}@$MEDICATION_ADMINISTRATIONS@g" /app/build/static/js/*.js
sed -i "s@{BIOLOGY_HIERARCHY_ITM_ANABIO}@$BIOLOGY_HIERARCHY_ITM_ANABIO@g" /app/build/static/js/*.js
sed -i "s@{BIOLOGY_HIERARCHY_ITM_LOINC}@$BIOLOGY_HIERARCHY_ITM_LOINC@g" /app/build/static/js/*.js
sed -i "s@{ODD_BIOLOGY}@$ODD_BIOLOGY@g" /app/build/static/js/*.js
sed -i "s@{ODD_COMPOSITION}@$ODD_COMPOSITION@g" /app/build/static/js/*.js
sed -i "s@{ODD_PROCEDURE}@$ODD_PROCEDURE@g" /app/build/static/js/*.js
sed -i "s@{ODD_CLAIM}@$ODD_CLAIM@g" /app/build/static/js/*.js
sed -i "s@{ODD_CONDITION}@$ODD_CONDITION@g" /app/build/static/js/*.js
sed -i "s@{ODD_OBSERVATION}@$ODD_OBSERVATION@g" /app/build/static/js/*.js
sed -i "s@{ODD_MEDICATION}@$ODD_MEDICATION@g" /app/build/static/js/*.js
sed -i "s@{ODD_CONTACT}@$ODD_CONTACT@g" /app/build/static/js/*.js

service nginx restart

sleep infinity