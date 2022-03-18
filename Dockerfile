FROM nginx:1.14

WORKDIR /app
COPY package.json package-lock.json ./
COPY src src
COPY public public
COPY build build

ENV REACT_APP_FHIR_API_URL /api/fhir
ENV REACT_APP_BACK_API_URL /api/back
ENV REACT_APP_REQUEST_API_URL /api/fhir
ENV REACT_APP_CONTEXT aphp
ENV REACT_APP_JWT_URL /api/jwt
