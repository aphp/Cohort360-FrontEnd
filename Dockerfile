FROM nginx:1.14

WORKDIR /app
COPY package.json package-lock.json ./
COPY src src
COPY public public
COPY build build

# Proxy need to be setup for apt
ENV http_proxy="http://proxym-inter.aphp.fr:8080"

# Curl is needed inside the pod to check liveness
RUN apt-get update -y && apt-get install -y curl

# Configure the nginx inside the docker image
COPY docker/nginx.conf /etc/nginx/conf.d/
