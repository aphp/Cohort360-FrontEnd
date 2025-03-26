<div align="center">
  <img src="./public/logo_C360.png" alt="Cohort360 logo" width="300" height="114"/>
  <h2>Explore patient data 🔍, build cohorts 👥 and export data 📥📊 Works with FHIR 🔥</h2>

<br />

[![Actions Status](https://github.com/aphp/Cohort360-FrontEnd/workflows/cohort360-main-pipeline/badge.svg)](https://github.com/aphp/Cohort360-FrontEnd/actions)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=aphp_Cohort360&metric=alert_status)](https://sonarcloud.io/dashboard?id=aphp_Cohort360)

<br />

<a href="https://github.com/aphp/Cohort360-FrontEnd/issues/new">Report a bug</a>
·
<a href="CHANGELOG.md">What's new ?</a>
</div>

---


<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#overview">Overview</a>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#based-on-fhir">Based on FHIR</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#project-setup">Project Setup</a>
      <ul>
        <li><a href="#get-the-code">Get the code</a></li>
        <li><a href="#configuration">Configuration</a></li>
        <li><a href="#run-the-app">Run the app</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## Overview

### 🔑 Features

* Explore, visualize, and search patient data
* Run advanced search queries on textual documents
* Create patient cohorts using a dedicated, user-friendly query builder
* Build queries with data criteria, complexity, and temporal constraints
* Get insights into cohorts at a glance
* Export cohort data for in-depth analysis

### 🔥 Based on FHIR

Cohort360 accesses health data through a FHIR server.

[FHIR](https://www.hl7.org/fhir/) is the world’s most widely used standard for exposing health data via APIs.

### 🛠️ Built With

* React
* ...


## 🚀 Project setup

### 1. 💠 Requirements

To run Cohort360 locally, you'll need the following applications running:  
📌 [Cohort360-backend](https://github.com/aphp/Cohort360-Back-end/blob/enrich_repo_files/README.md)  
📌 A FHIR API to retrieve medical data

### 2.  📥 Get the code

```sh
git clone https://github.com/aphp/Cohort360-FrontEnd.git
```

### 3.  🔧 Configuration

> To do : specify what configuration is needed: env vars, extra files to create to hold special configurations

### 4.  ▶️ Run the app

Start development server

```shell
npm start
```

All set up 🎉 

Check the application running on [http://localhost:3000](http://localhost:3000)

<div align="right">
  ⬆️ <a href="#readme-top">back to top</a>
</div>


## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed process about contributing to this repository.

## 📜 License

**Cohort360** is licensed under the Apache License - see the [LICENSE](LICENSE) file for details.

## 💬 Contact

If you find this project useful, please consider starring the repository and report any encountered bugs or issues.  
Write to us at: **open-source@cohort360.org**
