FROM nginx:1.14

WORKDIR /app
COPY package.json package-lock.json ./
COPY src src
COPY public public
COPY build build

RUN apt-get update -y && apt-get install -y curl nginx