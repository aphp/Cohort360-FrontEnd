FROM nginx:1.14

WORKDIR /app
COPY package.json package-lock.json ./
COPY src src
COPY public public
COPY build build
