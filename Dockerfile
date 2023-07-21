FROM harbor.eds.aphp.fr/cohort360/nginx:1.21

WORKDIR /app
COPY package.json package-lock.json ./
COPY src src
COPY public public
COPY build build

# Configure the nginx inside the docker image
COPY .templates/nginx.conf /etc/nginx/conf.d/

# Entrypoint script is used to replace environment variables
COPY ./docker-entrypoint.sh /app
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
