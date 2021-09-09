FROM {{IMAGE_REPOSITORY_URL}}/nginx:{{ENVIR}}

WORKDIR /app
COPY package.json tsconfig.json docker/entry-point.sh ./
COPY src src
COPY public public
COPY build build

ENV REACT_APP_FHIR_API_URL /api/fhir
ENV REACT_APP_BACK_API_URL /api/back
ENV REACT_APP_REQUEST_API_URL /api/fhir
ENV REACT_APP_PORTAIL_API_URL /api/portail
ENV REACT_APP_CONTEXT aphp
ENV REACT_APP_JWT_URL /api/jwt

COPY docker/nginx.conf /etc/nginx/conf.d/
CMD ["bash", "/app/entry-point.sh"]
