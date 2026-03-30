# Liste des URLs de recherche ValueSet dans Cohort360

Ce document répertorie les modèles d'URLs utilisés par l'application pour interroger les ressources `ValueSet` via l'API FHIR R4.

## 1. Modèles de requêtes API FHIR

L'application effectue principalement trois types de requêtes sur la ressource `ValueSet` :

### A. Recherche par référence
Utilisée pour récupérer les informations d'un ValueSet à partir de son URL canonique.
- **Modèle :** `[BASE_FHIR]/ValueSet?reference=[URL_VALUESET]`
- **Exemple d'utilisation :** Récupération de la liste complète des codes d'un système simple.

### B. Recherche des racines de hiérarchie
Utilisée pour les terminologies hiérarchiques afin de n'afficher que les éléments de premier niveau.
- **Modèle :** `[BASE_FHIR]/ValueSet?only-roots=true&reference=[URL_VALUESET]&_sort=code`
- **Paramètres spécifiques :** 
    - `only-roots=true` : Extension personnalisée APHP pour filtrer les racines.
    - `_sort=code` : Tri par code.

### C. Expansion de ValueSet ($expand)
Utilisée pour la recherche textuelle (auto-complétion) et le filtrage dynamique.
- **Modèle (GET) :** `[BASE_FHIR]/ValueSet/$expand?url=[URL_VALUESET]&filter=[RECHERCHE]&offset=[OFFSET]&count=[COUNT]`
- **Paramètres :**
    - `url` : URL(s) du ou des ValueSets à étendre (séparées par des virgules pour des recherches multi-terminologies).
    - `filter` : Texte saisi par l'utilisateur.
- **Modèle (POST) :** `[BASE_FHIR]/ValueSet/$expand`
    - Utilisé pour les recherches de descendance hiérarchique (paramètre `is-a`) via une ressource `Parameters`.

---

## 2. Liste complète des ValueSets configurés

Les URLs réelles (`[URL_VALUESET]`) sont injectées dynamiquement via le fichier de configuration de l'application. Voici la liste exhaustive des clés de configuration correspondant à des ValueSets :

### Terminologies de base (Core)
| Clé de configuration | Usage / Description |
| :--- | :--- |
| `core.valueSets.demographicGender` | Genre / Sexe du patient |
| `core.valueSets.encounterStatus` | Statut de la visite (Encounter) |
| `core.valueSets.encounterAdmission` | Mode d'admission |
| `core.valueSets.encounterAdmissionMode` | Type d'admission |
| `core.valueSets.encounterEntryMode` | Mode d'entrée |
| `core.valueSets.encounterExitMode` | Mode de sortie |
| `core.valueSets.encounterExitType` | Type de sortie |
| `core.valueSets.encounterDestination` | Destination après sortie |
| `core.valueSets.encounterProvenance` | Provenance du patient |
| `core.valueSets.encounterSejourType` | Type de séjour |
| `core.valueSets.encounterVisitType` | Type de visite |
| `core.valueSets.encounterFileStatus` | Statut du dossier patient |

### Terminologies par domaine médical (Features)
| Domaine | Clé de configuration | Description (Exemple) |
| :--- | :--- | :--- |
| **Biologie** | `features.observation.valueSets.biologyHierarchyAnabio` | Hiérarchie ANABIO |
| | `features.observation.valueSets.biologyHierarchyLoinc` | Hiérarchie LOINC |
| **Médicaments** | `features.medication.valueSets.medicationAtc` | Classification ATC |
| | `features.medication.valueSets.medicationUcd` | Codes UCD |
| | `features.medication.valueSets.medicationAdministrations` | Voies d'administration |
| | `features.medication.valueSets.medicationPrescriptionTypes` | Types de prescription |
| **Diagnostics** | `features.condition.valueSets.conditionHierarchy` | Hiérarchie CIM-10 |
| | `features.condition.valueSets.conditionStatus` | Statut du diagnostic |
| **Actes** | `features.procedure.valueSets.procedureHierarchy` | Hiérarchie CCAM |
| **Facturation** | `features.claim.valueSets.claimHierarchy` | Hiérarchie GHM |
| **Imagerie** | `features.imaging.valueSets.imagingModalities` | Modalités d'imagerie |

### Terminologies des Questionnaires (Formulaires de recherche)
L'application utilise de nombreux ValueSets pour les critères de recherche spécifiques aux formulaires (ex: Dossier Obstétrical) :
- `analgesieType`, `birthDeliveryWay`, `cSectionModality`, `childBirthMode`, `hospitReason`, `chirurgicalGesture`, `conditionPerineum`, `exitDiagnostic`, `exitFeedingMode`, `exitPlaceType`, `feedingType`, `imgIndication`, `instrumentType`, `laborOrCesareanEntry`, `maternalRisks`, `maturationModality`, `maturationReason`, `obstetricalGestureDuringLabor`, `pathologyDuringLabor`, `pregnancyMode`, `presentationAtDelivery`, `risksOrComplicationsOfPregnancy`, `risksRelatedToObstetricHistory`.

---

## 3. Paramètres de recherche spécifiques mentionnés

Conformément à votre demande, voici le focus sur le paramètre `reference` :
- Utilisé dans `src/services/aphp/serviceValueSets.ts`.
- Permet de cibler un `ValueSet` spécifique sur l'API FHIR de l'APHP pour en extraire les codes.
- Les URLs typiques rencontrées dans ce paramètre (basé sur les tests) incluent :
    - `https://terminology.eds.aphp.fr/atc`
    - `https://terminology.eds.aphp.fr/smt-medicament-ucd`
    - `https://terminology.eds.aphp.fr/aphp-itm-anabio`
    - `https://terminology.eds.aphp.fr/aphp-orbis-ghm`
