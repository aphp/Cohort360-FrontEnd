<div align="center" style="display:flex;flex-direction:column;">
  <img src="./public/logo_c360.png" alt="Cohort360 logo" />
  <h3>A web application to find patients, build cohorts and visualize data.</h3>
</div>

# Cohort360

[![Actions Status](https://github.com/aphp/Cohort360-FrontEnd/workflows/cohort360-main-pipeline/badge.svg)](https://github.com/aphp/Cohort360-FrontEnd/actions)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=aphp_Cohort360&metric=alert_status)](https://sonarcloud.io/dashboard?id=aphp_Cohort360)

## Architecture

- [ ] Add Architecture schema

Cohort360 consists of a React front-end and a Django back-end (REST API).

This repository hosts the front-end, while the back-end will be available soon.

Both the front-end and the back-end depend on a third, possibly custom, party: an endpoint to query medical data and to create cohorts.
This third endpoint can be a FHIR API for example. This is the case for the first creators of Cohort360.

## Installation

### Requirements:

- A running back-end server
- A running third party endpoint (FHIR API for example)
- An authentication server
- Node.js (22 or higher) installed

### Running the front-end

1. First copy the `.env.example` file to `.env` and edit this file to match your configuration.
2. Run `npm install`
3. Run `npm audit fix`
4. Run `npm run build`

This will generate files in the `build` directory that can be exposed via a web server like Nginx, or a node server.

An example configuration with Nginx can be found [here](.templates/nginx.conf)

## CI

A [gitlab-ci.yml](.templates/.gitlab-ci.yml) is available in the `.templates` folder, alongside
a [nginx configuration](.templates/nginx.conf) example (useful for deployment).

## Deployment

A docker image is available to build via the [Dockerfile](Dockerfile). You only need to update the location of your nginx conf.

## Local Development with Vite Proxy

The recommended way to develop locally is using Vite's built-in dev server; it handles API proxying with automatic NSC_TMAS cookie injection:

```bash
# 1. Copy .env.example to .env (one-time setup)
cp .env.example .env

# 2. Get your NSC_TMAS cookie from browser DevTools → Application → Cookies
# 3. Start dev server with cookie injection

# Using qualif environment (default):
NSC_TMAS=your_cookie_value npm run start

# Or target a different environment:
NSC_TMAS=your_cookie_value BACKEND_ENV=develop npm run start
```

Available environments: `develop`, `qualif` (default), `preprod`, `prod`

Access: `http://localhost:3000`

The Vite proxy automatically:
- Proxies `/api/fhir`, `/api/back`, `/api/datamodel` to the backend
- Injects the NSC_TMAS cookie into all proxied requests
- Supports WebSocket connections for `/api/back/ws`

> **Note:** If you encounter TLS certificate errors with internal endpoints, run with:
> ```bash
> NODE_OPTIONS='--use-system-ca' NSC_TMAS=your_cookie npm run start
> ```

## Start Contributing

A contributing guide will be published soon.

## Partners

- AP-HP Clinical Data Warehouse
- Arkhn : [arkhn.org](https://arkhn.org/)
- Akimed : [www.akimed.io](https://www.akimed.io/)

## Contributors

Coming soon...

## License

Cohort360 is licensed under Apache License 2.
