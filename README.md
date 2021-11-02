![cohort360-front](https://github.com/aphp/Cohort360/actions/workflows/app.yml/badge.svg)

<div align="center" style="display:flex;flex-direction:column;">
  <img src="./public/logo_c360.png" alt="Cohort360 logo" />
  <h3>A web application to find patients, build cohorts and visualize data.</h3>
</div>

# Cohort360

Cohort360 is a web application for knowledge discovery in clinical data warehouses. It provides tools for clinicians and researchers to find patients, build cohorts and visualize data. Cohort360 has been initiated by Greater Paris University Hospital (AP-HP) and it is now an open-source project being developed collaboratively by a community of contributors and partners, working together to unleash research on clinical data.

## Architecture 

Cohort360 consists of a React front-end and a Django back-end (REST API).

This repository hosts the front-end, while the back-end is available here: [github.com/aphp/Cohort360-Back-end](https://github.com/aphp/Cohort360-Back-end).

Both the front-end and the back-end depend on a third, possibly custom, party: an endpoint to query medical data and to create cohorts.
This third endpoint can be a FHIR API for example. This is the case for the first creators of Cohort360.

## Installation of the front-end

### Requirements:

* A running back-end server
* A running third party endpoint (FHIR API for example)
* An authentication server

* Node.js installed (tested with version>=14)

### Running the front-end

1. First copy the `.env.example` file to `.env` and edit this file to match your configuration.
2. Run `npm install`
3. Run `npm audit fix`
4. Run `npm run build`

This will generate files in the `build` directory that can be exposed via a web server like Nginx, or a node server.

An example configuration with Nginx would be: 

```nginx
server {
    server_name cohort360.myinstance.org;
    listen 80;
    listen [::]:80;

    ...

    location / {
        root /path/to/build;
        index index.html;

        add_header Last-Modified $date_gmt;
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        if_modified_since off;
        expires off;
        etag off;

        if (!-e $request_filename){
            rewrite ^(.*)$ /index.html break;
        }

    }

    location /static/ {
        alias /path/to/build/static/;
        add_header Last-Modified $date_gmt;
        if_modified_since before;
        expires 1d;

        add_header Pragma public;
        add_header Cache-Control "public";
        etag on;
    }
    ...
}
```



## Start Contributing

A contributing guide will be published soon.

## Partners

* AP-HP Clinical Data Warehouse
* Arkhn : arkhn.org
* Akimed : akimed.io

## Contributors

Coming soon...

## License
Cohort360 is licensed under Apache License 2.
