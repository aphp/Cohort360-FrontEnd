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
import { CONTEXT } from './../constants'
import servicesAphp, { IServiceAphp } from './contextAphp'

...

let services: IServiceAphp | ... = servicesAphp
switch (CONTEXT) {
	case 'aphp':
		services = servicesAphp;
		break;
	case '...':
		...
}

export default services
```

De la même manière que le service `servicesAphp`, vous devrez créer votre propre dossier `context...` qui contiendra l'ensemble des fonctions liés à la récupération de vos données et le lié au `switch/case` à la variable d’environement `CONTEXT`

> Pour le moment, toutes les fonctions sont obligatoires et aucune protection n'est effectuée. Nous vous conseillons donc de dupliquer le dossier `contextAphp` et de l'adapter à vos besoin.

### Dossier de context :

Dans votre dossier de context, vous allez avoir différents fichiers qui vont vous permettre de faire le lien entre l'application front, et les différents services (FHIR, back-end ...)
Nous trouvons donc :

##### index.ts

Dans ce fichier, nous allons définir un objets `service...` qui contiendra les propriétés `cohorts`, `patients`, `perimeters`, `practitioner` et `projects`. Chacune de ces propriétés contiendra une multitude de fonctions.

```
// Liste d'import de l'interface + type de l'interface
import servicesCohorts, { IServicesCohorts } from './servicesCohorts'
import servicePatients, { IServicesPatients } from './servicePatients'
import servicePerimeters, { IServicesPerimeters } from './servicePerimeters'
import servicePractitioner, { IServicesPractitioner } from './servicePractitioner'
import serviceProjects, { IServicesProjects } from './serviceProjects'

// Type de votre interface
export interface IService... {
	// Ensemble des fonctions liés à l'exploration d'une cohorte
	cohorts: IServicesCohorts

	// Ensemble des fonctions liés aux patients
	patients: IServicesPatients

	// Ensemble des fonctions liés aux périmètres
	perimeters: IServicesPerimeters

	// Ensemble des fonctions liés à l'utilisateur courant
	practitioner: IServicesPractitioner

	// Ensemble des fonctions liés aux projets de recherches
	projects: IServicesProjects
}

// Definition de votre service
const service...: IService... = {
	cohorts: servicesCohorts,
	patients: servicePatients,
	perimeters: servicePerimeters,
	practitioner: servicePractitioner,
	projects: serviceProjects
}

export default service...
```

##### callApi.ts

Pour un soucis de clarté dans le code, nous avons créé ce fichier `callApi.ts` qui nous permet d'avoir un ensemble de fonction permettant le lien avec FHIR. Les fonctions présentent sont les suivantes :

- fetchOrganization
- fetchGroup
- deleteGroup
- fetchPatient
- fetchEncounter
- fetchComposition
- fetchCompositionContent
- fetchPractitioner
- fetchPractitionerRole
- fetchProcedure
- fetchClaim
- fetchCondition
- fetchMedicationRequest
- fetchMedicationAdministration

> Ce fichier n'est pas obligatoire, dans votre service, vous pouvez très bien utiliser une autre méthode pour vos appels à votre FHIR.

##### servicePatients.ts

> Pour l'ensemble des fonctions définie dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définie dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définie l'ensemble des fonction lié à la récupération de donnée lié à un patient, et définie l'interface suivante :

```
export  interface  IServicesPatients {
	/*
	** Cette fonction permet de récupérer un nombre de patient totale lié à un utilisateur
	**
	** Elle ne prend aucun argument, et un nombre de patient
	*/
	fetchPatientsCount: () =>  Promise<
		number
	>

	/*
	** Cette fonction permet de récupérer l'ensemble des patients lié à un utilisateur
	**
	** Elle ne prend aucun argument, et retourne un object CohortData ou undefined en cas d'erreur
	*/
	fetchMyPatients: () =>  Promise<
		CohortData | undefined
	>

	/*
	** Cette fonction permet de récupérer les informations lié à un patient
	**
	** Arguement:
	**   - patientId: identifiant technique d'un patient
	**   - groupId: (optionnel) Périmètre auquel le patient est lié
	**
	** Retourne un objet PatientData ou undefined en cas d'erreur
	*/
	fetchPatient: (
		patientId: string,
		groupId?: string
	) =>  Promise<
		PatientData | undefined
	>

	/*
	** Cette fonction permet de récupérer les élèments de PMSI lié à un patient
	**
	** Arguement:
	**   - deidentified: permet certaine anonymisation de la donnée
	**   - page: permet la pagination des éléments
	**   - patientId: identifiant technique d'un patient
	**   - selectedTab: permet de selectionner la collection Condition, Procedure, ou Claim
	**   - searchInput: permet la recherche textuelle
	**   - nda: permet de filtrer sur un NDA précis
	**   - code: permet de filtrer un code
	**   - diagnosticTypes: permet de filtrer par un type de diagnostic (uniquement pour les CIM10)
	**   - sortBy: permet le tri
	**   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
	**   - groupId: (optionnel) Périmètre auquel le patient est lié
	**   - startDate: (optionnel) permet le filtre par date
	**   - endDate: (optionnel) permet le filtre par date
	**
	** Retourne:
	**   - pmsiData: Liste de 20 éléments de PMSI lié au "selectedTab", donc soit un élément de Condition, Procedure ou Claim
	**   - pmsiTotal: Nombre d'élément totale par rapport au filtre indiqué
	*/
	fetchPMSI: (
		deidentified: boolean,
		page: number,
		patientId: string,
		selectedTab: 'CIM10' | 'CCAM' | 'GHM',
		searchInput: string,
		nda: string,
		code: string,
		diagnosticTypes: string[],
		sortBy: string,
		sortDirection: string,
		groupId?: string,
		startDate?: string | null,
		endDate?: string | null
	) =>  Promise<{
		pmsiData?: PMSIEntry<IClaim | ICondition | IProcedure>[]
		pmsiTotal?: number
	}>

	/*
	** Cette fonction permet de récupérer les élèments de Medication lié à un patient
	**
	** Arguement:
	**   - deidentified: permet certaine anonymisation de la donnée
	**   - page: permet la pagination des éléments
	**   - patientId: identifiant technique d'un patient
	**   - selectedTab: permet de selectionner la collection MedicationRequest ou MedicationAdministration
	**   - searchInput: permet la recherche textuelle
	**   - nda: permet de filtrer sur un NDA précis
	**   - sortBy: permet le tri
	**   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
	**   - groupId: (optionnel) Périmètre auquel le patient est lié
	**   - startDate: (optionnel) permet le filtre par date
	**   - endDate: (optionnel) permet le filtre par date
	**
	** Retourne:
	**   - medicationData: Liste de 20 éléments de Medication lié au "selectedTab", donc soit un élément de MedicationRequest ou MedicationAdministration
	**   - medicationTotal: Nombre d'élément totale par rapport au filtre indiqué
	*/
	fetchMedication: (
		deidentified: boolean,
		page: number,
		patientId: string,
		selectedTab: 'prescription' | 'administration',
		searchInput: string,
		nda: string,
		sortBy: string,
		sortDirection: string,
		groupId?: string,
		startDate?: string | null,
		endDate?: string | null
	) =>  Promise<{
		medicationData?: MedicationEntry<IMedicationAdministration | IMedicationRequest>[]
		medicationTotal?: number
    }>

	/*
	** Cette fonction permet de récupérer les élèments de Composition lié à un patient
	**
	** Arguement:
	**   - deidentified: permet certaine anonymisation de la donnée
	**   - sortBy: permet le tri
	**   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
	**   - page: permet la pagination des éléments
	**   - patientId: identifiant technique d'un patient
	**   - searchInput: permet la recherche textuelle
	**   - selectedDocTypes: permet de filtrer par un type de documents
	**   - nda: permet de filtrer sur un NDA précis
	**   - startDate: (optionnel) permet le filtre par date
	**   - endDate: (optionnel) permet le filtre par date
	**   - groupId: (optionnel) Périmètre auquel le patient est lié
	**
	** Retourne:
	**   - pmsiData: Liste de 20 éléments de Composition
	**   - pmsiTotal: Nombre d'élément totale par rapport au filtre indiqué
	*/
	fetchDocuments: (
		deidentified: boolean,
		sortBy: string,
		sortDirection: string,
		page: number,
		patientId: string,
		searchInput: string,
		selectedDocTypes: string[],
		nda: string,
		startDate?: string | null,
		endDate?: string | null,
		groupId?: string
	) =>  Promise<{
		docsList: CohortComposition[]
		docsTotal: number
	}>


	/*
	** Cette fonction permet de chercher un patient grâce à une barre de recherche
	**
	** Arguement:
	**   - nominativeGroupsIds: permet certaine anonymisation de la donnée
	**   - page: permet la pagination des éléments
	**   - sortBy: permet le tri
	**   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
	**   - input: permet la recherche d'un patient
	**   - searchBy: permet la recherche sur un élément précis (nom, prénom ou indeterminé)
	**
	** Retourne:
	**   - patientList: Liste de 20 patients
	**   - totalPatients: Nombre d'élément totale par rapport au filtre indiqué
	*/
	searchPatient: (
		nominativeGroupsIds: string[] | undefined,
		page: number,
		sortBy: string,
		sortDirection: string,
		input: string,
		searchBy: SearchByTypes
	) =>  Promise<{
		patientList: IPatient[]
		totalPatients: number
	}>
}
```
