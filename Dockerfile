FROM nginx:1.21

WORKDIR /app
COPY package.json package-lock.json ./
COPY src src
COPY public public
COPY build build

# Curl is needed inside the pod to check liveness
RUN apt-get update -y && apt-get install -y curl

# Configure the nginx inside the docker image
COPY .templates/nginx.conf /etc/nginx/conf.d/

# Entrypoint script is used to replace environment variables
COPY ./docker-entrypoint.sh /app
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
