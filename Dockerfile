FROM nginx:1.21

WORKDIR /app
COPY package.json package-lock.json ./
COPY src src
COPY public public
COPY build build

# Proxy need to be setup for apt
ENV urn_proxy="proxym-inter.aphp.fr:8080"
ENV http_proxy=http://$urn_proxy
ENV HTTP_PROXY=http://$urn_proxy
ENV https_proxy=http://$urn_proxy
ENV HTTPS_PROXY=http://$urn_proxy
ENV no_proxy=localhost,127.0.0.1,0.0.0.0

# Curl is needed inside the pod to check liveness
RUN apt-get update -y && apt-get install -y curl

# Configure the nginx inside the docker image
COPY docker/nginx.conf /etc/nginx/conf.d/

# Entrypoint script is used to replace environment variables
COPY ./docker-entrypoint.sh /app
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]