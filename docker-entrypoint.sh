#!/bin/sh
set -e

sed -i "s@{BACK_API_URL}@$BACK_API_URL@g" /usr/share/nginx/html/js/*.js

sed -i "s@{REQUEST_API_URL}@$REQUEST_API_URL@g" /usr/share/nginx/html/js/*.js

sed -i "s@{FHIR_API_URL}@$FHIR_API_URL@g" /usr/share/nginx/html/js/*.js

sed -i "s@{JWT_URL}@$JWT_URL@g" /usr/share/nginx/html/js/*.js

sed -i "s@{CONTEXT}@$CONTEXT@g" /usr/share/nginx/html/js/*.js

sed -i "s@{CLAIM_HIERARCHY}@$CLAIM_HIERARCHY@g" /usr/share/nginx/html/js/*.js

sed -i "s@{CONDITION_HIERARCHY}@$CONDITION_HIERARCHY@g" /usr/share/nginx/html/js/*.js

sed -i "s@{CONDITION_STATUS}@$CONDITION_STATUS@g" /usr/share/nginx/html/js/*.js

sed -i "s@{PROCEDURE_HIERARCHY}@$PROCEDURE_HIERARCHY@g" /usr/share/nginx/html/js/*.js

sed -i "s@{DEMOGRAPHIC_GENDER}@$DEMOGRAPHIC_GENDER@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_ADMISSION_MODE}@$ENCOUNTER_ADMISSION_MODE@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_ENTRY_MODE}@$ENCOUNTER_ENTRY_MODE@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_EXIT_MODE}@$ENCOUNTER_EXIT_MODE@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_VISIT_TYPE}@$ENCOUNTER_VISIT_TYPE@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_SEJOUR_TYPE}@$ENCOUNTER_SEJOUR_TYPE@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_FILE_STATUS}@$ENCOUNTER_FILE_STATUS@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_EXIT_TYPE}@$ENCOUNTER_EXIT_TYPE@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_DESTINATION}@$ENCOUNTER_DESTINATION@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_PROVENANCE}@$ENCOUNTER_PROVENANCE@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ENCOUNTER_ADMISSION}@$ENCOUNTER_ADMISSION@g" /usr/share/nginx/html/js/*.js

sed -i "s@{MEDICATION_ATC}@$MEDICATION_ATC@g" /usr/share/nginx/html/js/*.js

sed -i "s@{MEDICATION_PRESCRIPTION_TYPES}@$MEDICATION_PRESCRIPTION_TYPES@g" /usr/share/nginx/html/js/*.js

sed -i "s@{MEDICATION_ADMINISTRATIONS}@$MEDICATION_ADMINISTRATIONS@g" /usr/share/nginx/html/js/*.js

sed -i "s@{BIOLOGY_HIERARCHY_ITM_ANABIO}@$BIOLOGY_HIERARCHY_ITM_ANABIO@g" /usr/share/nginx/html/js/*.js

sed -i "s@{BIOLOGY_HIERARCHY_ITM_LOINC}@$BIOLOGY_HIERARCHY_ITM_LOINC@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ODD_BIOLOGY}@$ODD_BIOLOGY@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ODD_COMPOSITION}@$ODD_COMPOSITION@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ODD_PROCEDURE}@$ODD_PROCEDURE@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ODD_CLAIM}@$ODD_CLAIM@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ODD_CONDITION}@$ODD_CONDITION@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ODD_OBSERVATION}@$ODD_OBSERVATION@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ODD_MEDICATION}@$ODD_MEDICATION@g" /usr/share/nginx/html/js/*.js

sed -i "s@{ODD_CONTACT}@$ODD_CONTACT@g" /usr/share/nginx/html/js/*.js

nginx -g "daemon off;"
