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

```ts
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

```ts
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

```ts
export  interface  IServicesPatients {
	fetchPatientsCount: () =>  Promise<
		number
	>

	fetchMyPatients: () =>  Promise<
		CohortData | undefined
	>

	fetchPatient: (
		patientId: string,
		groupId?: string
	) =>  Promise<
		PatientData | undefined
	>

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

##### servicePerimeters.ts

> Pour l'ensemble des fonctions définie dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définie dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définie l'ensemble des fonction lié à la récupération de donnée lié à un périmètre, et définie l'interface suivante :

```ts
export  interface  IServicesPerimeters {
	fetchPerimetersInfos: (
		perimetersId: string
	) =>  Promise<
		CohortData | undefined
	>

	fetchPerimeterInfoForRequeteur: (
		perimeterId: string
	) =>  Promise<
		ScopeTreeRow | undefined
	>

	getPerimeters: (
		practitionerId: string
	) =>  Promise<
		IOrganization[]
	>

	getScopePerimeters: (
		practitionerId: string
	) =>  Promise<
		ScopeTreeRow[]
	>

	getScopeSubItems: (
		perimeter: ScopeTreeRow | null,
		getSubItem?: boolean
	) =>  Promise<
		ScopeTreeRow[]
	>

	fetchDeidentified: (
		practitionerId: string
	) =>  Promise<{
		deidentification: boolean;
		nominativeGroupsIds: any[]
	}>
}
```

##### servicePractitioner.ts

> Pour l'ensemble des fonctions définie dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définie dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définie l'ensemble des fonction lié à la récupération de donnée lié à un practitioner (utilisateur de cohort360), et définie l'interface suivante :

```ts
export  interface  IServicesPractitioner {
	authenticate: (
		username: string,
		password: string
	) =>  Promise<any>

	fetchPractitioner: (
		username: string
	) =>  Promise<{
		id: number
		userName: number
		displayName: string
		firstName: string
		lastName: string
	} | null>

	fetchPractitionerRole: (
		practionerId: string
	) =>  Promise<any>
}
```

##### serviceProjects.ts

> ⚠️ Cette interface est lié au back-end de Cohort360 et non à FHIR comme le reste des interfaces.

> Pour l'ensemble des fonctions définie dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définie dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définie l'ensemble des fonctions lié à la récupération de donnée lié aux projets de recherche, aux requêtes, et aux cohortes, et définie l'interface suivante :

```ts
export  interface  IServicesProjects {
	fetchProjectsList: (
		limit?: number,
		offset?: number
	) =>  Promise<{
		count: number
		next: string | null
		previous: string | null
		results: ProjectType[]
	}>
	addProject: (
		newProject: ProjectType
	) =>  Promise<
		ProjectType
	>
	editProject: (
		editedProject: ProjectType
	) =>  Promise<
		ProjectType
	>
	deleteProject: (
		deletedProject: ProjectType
	) =>  Promise<
		ProjectType
	>

	fetchRequestsList: (
		limit?: number,
		offset?: number
	) =>  Promise<{
		count: number
		next: string | null
		previous: string | null
		results: RequestType[]
	}>
	addRequest: (
		newRequest: RequestType
	) =>  Promise<
		RequestType
	>
	editRequest: (
		editedRequest: RequestType
	) =>  Promise<
		RequestType
	>
	deleteRequest: (
		deletedRequest: RequestType
	) =>  Promise<
		RequestType
	>

	fetchCohortsList: (
		providerId: string,
		limit?: number,
		offset?: number
	) =>  Promise<{
		count: number
		next: string | null
		previous: string | null
		results: CohortType[]
	}>
	addCohort: (
		newCohort: CohortType
	) =>  Promise<
		CohortType
	>
	editCohort: (
		editedCohort: CohortType
	) =>  Promise<
		CohortType
	>
	deleteCohort: (
		deletedCohort: CohortType
	) =>  Promise<
		CohortType
	>
}
```

##### servicesCohorts.ts

> Pour l'ensemble des fonctions définie dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définie dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définie l'ensemble des fonction lié à la récupération de donnée lié à une cohorte, et définie l'interface suivante :

```ts
export interface IServicesCohorts {
  fetchCohort: (
		cohortId: string
	) => Promise<
		CohortData | undefined
	>

  fetchPatientList: (
    page: number,
    searchBy: SearchByTypes,
    searchInput: string,
    gender: PatientGenderKind,
    age: [number, number],
    vitalStatus: VitalStatus,
    sortBy: string,
    sortDirection: string,
    groupId?: string,
    includeFacets?: boolean
  ) => Promise<
    | {
        totalPatients: number
        originalPatients: IPatient[] | undefined
        agePyramidData?: AgeRepartitionType
        genderRepartitionMap?: GenderRepartitionType
      }
    | undefined
  >

  fetchDocuments: (
    deidentifiedBoolean: boolean,
    sortBy: string,
    sortDirection: string,
    page: number,
    searchInput: string,
    selectedDocTypes: string[],
    nda: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => Promise<{
    totalDocs: number
    totalAllDocs: number
    documentsList: IComposition[]
  }>

  fetchDocumentContent: (
		compositionId: string
	) => Promise<
		IComposition_Section[]
	>

  fetchCohortExportRight: (
		cohortId: string,
		providerId: string
	) => Promise<
		boolean
	>

  createExport: (args: {
    cohortId: number
    motivation: string
    tables: string[]
    output_format?: string
  }) => Promise<any>
}
```
