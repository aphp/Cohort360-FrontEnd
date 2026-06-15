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

#### Dev server (`npm run start`) — API proxy without Nginx

See [`.env.dev-proxy.example`](.env.dev-proxy.example) and [`vite-dev-proxy.ts`](vite-dev-proxy.ts). Use **`http://localhost:3000`** in the browser so relative API paths (`/api/back`, etc.) hit the Vite proxy.

## CI

A [gitlab-ci.yml](.templates/.gitlab-ci.yml) is available in the `.templates` folder, alongside
a [nginx configuration](.templates/nginx.conf) example (useful for deployment).

## Deployment

A docker image is available to build via the [Dockerfile](Dockerfile). You only need to update the location of your nginx conf.

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

## FHIR Terminology Loading Strategy

To avoid ambiguity between FHIR terminology resources, Cohort360 uses the following rules:

- Use `CodeSystem?url=` when a full, non-hierarchical code system is expected.
- Use `ValueSet?url=` when a business subset must be retrieved.
- Use `ValueSet/$expand` for hierarchical browsing or hierarchy-aware search.

Practical guidance:

- Maternity sub-domains should remain modeled as dedicated `ValueSet` URLs.
- Hierarchical terminologies (for example ATC, CIM-10, ANABIO, CCAM) should keep using `$expand` flows.
- Flat referentials should be loaded directly from `CodeSystem` when all codes are needed.

Main implementation entry points:

- `src/services/aphp/serviceValueSets.ts` for terminology loading strategy.
- `public/config.dev.json` for configured terminology URLs.
