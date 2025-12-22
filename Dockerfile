# =============================================================================
# PRODUCTION BUILD
# =============================================================================
FROM node:22 AS build

WORKDIR /app
COPY . .
RUN npm install
RUN bash ./scripts/createVersionJson.sh
RUN npm run build


# =============================================================================
# PRODUCTION TARGET
# =============================================================================
FROM nginx:1.25.1 AS prod

WORKDIR /app
COPY --from=build /app/build build
COPY --from=build /app/src/data/version.json build/data/version.json

# Configure the nginx inside the docker image
COPY .templates/nginx.conf /etc/nginx/conf.d/

# Entrypoint script is used to replace environment variables
COPY ./docker-entrypoint.sh /app
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
