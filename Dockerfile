FROM nginx:1.14

WORKDIR /app
COPY package.json package-lock.json ./
COPY src src
COPY public public
COPY build build

ENV http_proxy="http://proxym-inter.aphp.fr:8080"
RUN apt-get update -y && apt-get install -y curl