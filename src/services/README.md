# Services

Dans le dossier `src` présent à la racine du projet, vous allez trouver un dossier `services` qui contient l'ensemble des fonctions qui servent à appeler les différents services d'API et récupérer vos données.

### Hiérarchie :

```
services
├── cohortCreation
│   ├── fetchClaim.ts
│   ├── fetchComposition.ts
│   ├── fetchCondition.ts
│   ├── fetchDemographic.ts
│   ├── fetchEncounter.ts
│   ├── fetchMedication.ts
│   ├── fetchProcedure.ts
│   └── index.ts
├── contextAphp
│   ├── callApi.ts
│   ├── servicePatients.ts
│   ├── servicePerimeters.ts
│   ├── servicePractitioner.ts
│   ├── serviceProjects.ts
│   ├── servicesCohorts.ts
│   ├── servicesContact.ts
│   └── index.ts
├── context...
│   └── ...
├── apiBackend.ts
├── apiFhir.ts
├── apiPortail.ts
├── apiRequest.ts
├── index.ts
└── README.md
```

### Différentes API:

Au départ du dossier de services, vous trouverez 4 fichier TypeScript `apiBackend.ts`, `apiFhir.ts`, `apiPortail.ts`, `apiRequest.ts`.
Ces fichiers servent à faire le lien avec différents services et à régler les `Headers` et créer des `Interceptors`.

| Fichier       | Fonctionnalités                                                                                           | Variable d'environnement lié à l'URL |
| ------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| apiBackend.ts | Permet le liens avec `cohort-back`                                                                        | `BACK_API_URL`                       |
| apiFhir.ts    | Permet le liens avec `FHIR`                                                                               | `FHIR_API_URL`                       |
| apiPortail.ts | Permet le liens avec `portail-back`                                                                       | `PORTAIL_API_URL`                    |
| apiRequest.ts | Permet le liens avec `FHIR` (uniquement pour les `ValueSet` présent dans la partie `Création de requête`) | `REQUEST_API_URL`                    |

### Point d'entré :

À la racine du dossier `services`, vous trouverez le fichier `index.ts` qui va vous permettre de créer votre propre `context`, de la même manière suivante :

##### index.ts

```
import { CONTEXT } from  './../constants'
import  servicesAphp, { IServiceAphp } from  './contextAphp'
...

let  services: IServiceAphp | ... = servicesAphp
switch (CONTEXT) {
	case  'aphp':
		services = servicesAphp;
		break;
	case  '...':
		...
}
export  default  services
```

> De la même manière que le service `servicesAphp`, vous devrez créer votre propre dossier `context...` qui contiendra l'ensemble des fonctions liés à la récupération de vos données et le lié au `switch/case` à la variable d’environement `CONTEXT`

### Dossier de context :

##### index.ts

```
// Liste d'import de l'interface + type de l'interface
import  servicesCohorts, { IServicesCohorts } from  './servicesCohorts'
import  servicePatients, { IServicesPatients } from  './servicePatients'
import  servicePerimeters, { IServicesPerimeters } from  './servicePerimeters'
import  servicePractitioner, { IServicesPractitioner } from  './servicePractitioner'
import  serviceProjects, { IServicesProjects } from  './serviceProjects'

// Type de votre interface
export  interface  IService... {
	// Ensemble des services liés à l'exploration d'une cohorte
	cohorts: IServicesCohorts

	// Ensemble des services liés aux patients
	patients: IServicesPatients

	// Ensemble des services liés aux périmètres
	perimeters: IServicesPerimeters

	// Ensemble des services liés à l'utilisateur courant
	practitioner: IServicesPractitioner

	// Ensemble des services liés aux projets de recherches
	projects: IServicesProjects
}

//
const  serviceAphp: IServiceAphp = {
	cohorts:  servicesCohorts,
	patients:  servicePatients,
	perimeters:  servicePerimeters,
	practitioner:  servicePractitioner,
	projects:  serviceProjects
}

export  default  serviceAphp
```
