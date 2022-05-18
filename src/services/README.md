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
│   ├── serviceCohorts.ts
│   ├── serviceCohortCreation.ts
│   ├── serviceContact.ts
│   ├── servicePatients.ts
│   ├── servicePerimeters.ts
│   ├── servicePractitioner.ts
│   ├── serviceProjects.ts
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

Au départ du dossier de services, vous trouverez 4 fichiers TypeScript `apiBackend.ts`, `apiFhir.ts`, `apiPortail.ts`, `apiRequest.ts`.
Ces fichiers servent à faire le lien avec différents services et à régler les `Headers` et créer des `Interceptors`.

| Fichier       | Fonctionnalités                                                                                           | Variable d'environnement lié à l'URL |
|---------------|-----------------------------------------------------------------------------------------------------------|--------------------------------------|
| apiBackend.ts | Permet le lien avec `cohort-back`                                                                         | `BACK_API_URL`                       |
| apiFhir.ts    | Permet le lien avec `FHIR`                                                                                | `FHIR_API_URL`                       |
| apiRequest.ts | Permet le lien avec `FHIR` (uniquement pour les `ValueSet` présents dans la partie `Création de requête`) | `REQUEST_API_URL`                    |

### Point d'entrée :

À la racine du dossier `services`, vous trouverez le fichier `index.ts` qui va vous permettre de créer votre propre `context`, de la manière suivante :

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

De la même manière que le service `servicesAphp`, vous devrez créer votre propre dossier `context...` qui contiendra l'ensemble des fonctions liées à la récupération de vos données et le lier au `switch/case` à la variable d’environnement `CONTEXT`

> Pour le moment, toutes les fonctions sont obligatoires et aucune protection n'est effectuée. Nous vous conseillons donc de dupliquer le dossier `contextAphp` et de l'adapter à vos besoins.

### Dossier de context :

Dans votre dossier de context, vous allez avoir différents fichiers qui vont vous permettre de faire le lien entre l'application front, et les différents services (FHIR, back-end ...)
Nous trouvons donc :

##### index.ts

Dans ce fichier, nous allons définir un objet `service...` qui contiendra les propriétés `cohorts`, `contact`, `patients`, `perimeters`, `practitioner` et `projects`. Chacune de ces propriétés contiendra une multitude de fonctions.

```ts
// Liste d'import de l'interface + type de l'interface
import serviceCohorts, { IServiceCohorts } from './serviceCohorts'
import serviceCohortCreation, { IServiceCohortCreation } from './serviceCohortCreation'
import serviceContact, { IServiceContact } from './serviceContact'
import servicePatients, { IServicePatients } from './servicePatients'
import servicePerimeters, { IServicePerimeters } from './servicePerimeters'
import servicePractitioner, { IServicePractitioner } from './servicePractitioner'
import serviceProjects, { IServiceProjects } from './serviceProjects'

// Type de votre interface
export interface IService... {
	// Ensemble des fonctions liées à l'exploration d'une cohorte
	cohorts: IServiceCohorts

	// Ensemble des fonctions liées à l'utilisation du requêteur
	cohortCreation: IServiceCohortCreation

	// Ensemble des fonctions liées à la page de contact
	contact: IServiceContact

	// Ensemble des fonctions liées aux patients
	patients: IServicePatients

	// Ensemble des fonctions liées aux périmètres
	perimeters: IServicePerimeters

	// Ensemble des fonctions liées à l'utilisateur courant
	practitioner: IServicePractitioner

	// Ensemble des fonctions liées aux projets de recherches
	projects: IServiceProjects
}

// Definition de votre service
const service...: IService... = {
	cohorts: serviceCohorts,
	cohortCreation: serviceCohortCreation,
	contact: serviceContact,
	patients: servicePatients,
	perimeters: servicePerimeters,
	practitioner: servicePractitioner,
	projects: serviceProjects
}

export default service...
```

##### callApi.ts

Dans un souci de clarté de code, nous avons créé ce fichier `callApi.ts` qui nous permet d'avoir un ensemble de fonctions permettant le lien avec FHIR. Les fonctions présentes sont les suivantes :

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
- fetchObservation

> Ce fichier n'est pas obligatoire, dans votre service, vous pouvez très bien utiliser une autre méthode pour vos appels à votre FHIR.

##### servicePatients.ts

> Pour l'ensemble des fonctions définies dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définis dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définit l'ensemble des fonctions liées à la récupération de données liées à un patient, et définit l'interface suivante :

```ts
export interface IServicePatients {
  fetchPatientsCount: () => Promise<number>

  fetchMyPatients: () => Promise<CohortData | undefined>

  fetchPatient: (patientId: string, groupId?: string) => Promise<PatientData | undefined>

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
  ) => Promise<{
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
  ) => Promise<{
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
  ) => Promise<{
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
  ) => Promise<{
    patientList: IPatient[]
    totalPatients: number
  }>
}
```

##### servicePerimeters.ts

> Pour l'ensemble des fonctions définies dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définis dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définit l'ensemble des fonction liées à la récupération de données liées à un périmètre, et définit l'interface suivante :

```ts
export interface IServicePerimeters {
  fetchPerimetersInfos: (perimetersId: string) => Promise<CohortData | undefined>

  fetchPerimeterInfoForRequeteur: (perimeterId: string) => Promise<ScopeTreeRow | undefined>

  getPerimeters: (practitionerId: string) => Promise<IOrganization[]>

  getScopePerimeters: (practitionerId: string) => Promise<ScopeTreeRow[]>

  getScopeSubItems: (perimeter: ScopeTreeRow | null, getSubItem?: boolean) => Promise<ScopeTreeRow[]>

  fetchDeidentified: (practitionerId: string) => Promise<{
    deidentification: boolean
    nominativeGroupsIds: any[]
  }>
}
```

##### servicePractitioner.ts

> Pour l'ensemble des fonctions définies dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définis dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définit l'ensemble des fonctions liées à la récupération de données liées à un practitioner (utilisateur de cohort360), et définit l'interface suivante :

```ts
export interface IServicePractitioner {
  authenticate: (username: string, password: string) => Promise<any>

  fetchPractitioner: (username: string) => Promise<{
    id: number
    userName: number
    displayName: string
    firstName: string
    lastName: string
  } | null>

  fetchPractitionerRole: (practionerId: string) => Promise<any>
}
```

##### serviceProjects.ts

> ⚠️ Cette interface est liée au back-end de Cohort360 et non à FHIR comme le reste des interfaces.

> Pour l'ensemble des fonctions définies dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définis dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définit l'ensemble des fonctions liées à la récupération de donnéees liées aux projets de recherche, aux requêtes, et aux cohortes, et définit l'interface suivante :

```ts
export interface IServiceProjects {
  fetchProjectsList: (
    limit?: number,
    offset?: number
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: ProjectType[]
  }>
  addProject: (newProject: ProjectType) => Promise<ProjectType>
  editProject: (editedProject: ProjectType) => Promise<ProjectType>
  deleteProject: (deletedProject: ProjectType) => Promise<ProjectType>

  fetchRequestsList: (
    limit?: number,
    offset?: number
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: RequestType[]
  }>
  addRequest: (newRequest: RequestType) => Promise<RequestType>
  editRequest: (editedRequest: RequestType) => Promise<RequestType>
  deleteRequest: (deletedRequest: RequestType) => Promise<RequestType>

  fetchCohortsList: (
    providerId: string,
    limit?: number,
    offset?: number
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: Cohort[]
  }>
  addCohort: (newCohort: Cohort) => Promise<Cohort>
  editCohort: (editedCohort: Cohort) => Promise<Cohort>
  deleteCohort: (deletedCohort: Cohort) => Promise<Cohort>
}
```

##### serviceCohorts.ts

> Pour l'ensemble des fonctions définies dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définis dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définit l'ensemble des fonctions liées à la récupération de donnéees liées à une cohorte, et définit l'interface suivante :

```ts
export interface IServiceCohorts {
  fetchCohort: (cohortId: string) => Promise<CohortData | undefined>

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

  fetchDocumentContent: (compositionId: string) => Promise<IComposition_Section[]>

  fetchCohortExportRight: (cohortId: string) => Promise<boolean>

  createExport: (args: {
    cohortId: number
    motivation: string
    tables: string[]
    output_format?: string
  }) => Promise<any>
}
```

##### serviceContact.ts

> Pour l'ensemble des fonctions définies dans l'interface, nous utilisons TypeScript, nous vous demandons de bien vouloir vous adapter aux types définis dans un premier temps pour éviter tous problèmes de typage.

Ce fichier définit l'ensemble des fonctions liées à la fonctionnalité de prise de contact, et définit l'interface suivante :

```ts
export interface IServiceContact {
  postIssue: (contactSubmitForm: ContactSubmitForm) => Promise<boolean>
}
```
