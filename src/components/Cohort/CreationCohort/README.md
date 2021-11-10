# Requêteur - Cohort Creation

Dans ce README, je vais vous donner les informations pour utiliser le Requêteur de Cohort360. Dans un premier temps on va voir l'organisation des fichiers, puis les composants Reacts primaires, une description total du store Redux ainsi que les appels effectués au back-end et pour finir une description de la partie `utils/cohortCreation`

## Organisation:

Les différents fichiers utiles au Requêteur se trouve :

- Dans ce répertoire `components/Cohort/CreationCohort`, c'est ici que ce trouve tous les composants React.JS pour l'affichage.

- Dans le répertoire `state`, il existe 2 fichiers :

  - `state/criteria.tsx` qui gère les données des `ValueSet` ainsi que l'arborescences qui se trouve dans le composant `CriteriaRightPanel`

  - `state/cohortCreation.tsx` qui gère les données utiles pour le Requêteur

- Dans le répertoire `utils`, il y a un fichier `cohortCreation.ts` qui gère les fonctions utiles au Requêteur

## Composant React:

##### Requeteur.tsx

Le point d'entré du Requeteur se trouve dans ce fichier. Il permet l'appel des composants `DiagramView`, `ControlPanel` et `ModalCreateNewRequest`, ainsi que les différents appels vers Redux tels que :

| Nom              | Fonction                                                                                                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_fetchRequest`  | - récupérer les informations d'une requête si l'URL contient un ID de requête et peut également contenir un ID de snapshot <br> - Initialiser le Requêteur afin d'afficher la modal `ModalCreateNewRequest` |
| `_fetchCriteria` | Permet l'appel de la fonction `constructCriteriaList` qui va nous construire la liste présente dans `CriteriaRightPanel` ainsi que la récupération des `ValueSet` pour les différents formulaires           |
| `_onExecute`     | Permet la création de la cohorte avec la population source, l'ensemble des critères, ainsi que des contraintes temporelles                                                                                  |
| `_onUndo`        | Lorsque l'utilisateur appuie sur le bouton `Annuler`, nous allons récupérer l'état précédent (si disponible) grâce au information présent dans le store Redux                                               |
| `_onRedo`        | Lorsque l'utilisateur appuie sur le bouton `Rétablir`, nous allons récupérer l'état suivant (si disponible) grâce au information présent dans le store Redux                                                |

> Ce composant n'a pas de props. (propriétés), l'appel de ce composant ce fait de la manière suivante :

```jsx
import Requeteur from 'components/Cohort/CreationCohort/Requeteur';

...

return (
  ...
  <Requeteur />
  ...
)
```

##### ControlPanel.tsx

Ce composant React permet de gérer le panneau latéral sur la droite du Requêteur contenant les boutons `Créer la cohorte`, `Annuler`, `Rétablir` et `Réinitialiser`. Il permet aussi de voir si l'accès est en nominatif ou en pseudonymiser. le nombre de patient et en cas de nécessité d'afficher l'erreur.

Ce composant contient les propriétés suivantes :

| Nom       | Type                                                                     | Fonction                                                                                                                                             |
| --------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| onExecute | `(cohortName: string, cohortDescription: string) => void` ou `undefined` | Lorsque l'utilisateur appuie sur `Créer une cohorte`, cette fonction est appelé <br /> Si la valeur est égale à `undefined`, le bouton est `disable` |
| onUndo    | `() => void` ou `undefined`                                              | Lorsque l'utilisateur appuie sur `Annuler`, cette fonction est appelé <br /> Si la valeur est égale à `undefined`, le bouton est `disable`           |
| onRedo    | `() => void` ou `undefined`                                              | Lorsque l'utilisateur appuie sur `Rétablir`, cette fonction est appelé <br /> Si la valeur est égale à `undefined`, le bouton est `disable`          |

L'appel de ce composant ce fait de la manière suivante :

```jsx
import ControlPanel from 'components/Cohort/CreationCohort/ControlPanel/ControlPanel';

...

return (
  ...
  <ControlPanel
    onExecute={...}
    onUndo={...}
    onRedo={...} />
  ...
)
```

##### DiagramView.tsx

Ce composant permet d'appeler les composant suivant : `CohortCreationBreadcrumbs`, `PopulationCard`, `TemporalConstraintCard` et `LogicalOperator`. Il n'a pas d'aspect fonctionnel, juste de dispatcher les differents composant.

> Ce composant n'a pas de props. (propriétés), l'appel de ce composant ce fait de la manière suivante :

```jsx
import DiagramView from 'components/Cohort/CreationCohort/DiagramView/DiagramView';

...

return (
  ...
  <DiagramView />
  ...
)
```

##### CohortCreationBreadcrumbs.tsx

Ce composant permet d'afficher le dossier, la requête ainsi que le numero de snapshot.

> TODO: Rendre cliquable les éléments afin de changer le dossier, la requête ou de snapshot.

```jsx
import CohortCreationBreadcrumbs from 'components/Cohort/CreationCohort/DiagramView/components/Breadcrumbs/Breadcrumbs'

...

return (
  ...
  <CohortCreationBreadcrumbs />
  ...
)
```

##### PopulationCard.tsx

Ce composant contient 2 états :

- Lorsque la population source n'est pas sélectionnée, il affiche un bouton `Choisir une population source`
- Lorsque la population source est sélectionnée, il affiche un encart avec la (ou les) population(s) source(s) d'affichée(s)

En plus de ça il y a un lien vers le composant `PopulationRightPanel` qui permet d'ouvrir un panneau latéral contenant la liste des périmètres de l’utilsateur.

> Ce composant n'a pas de props. (propriétés), l'appel de ce composant ce fait de la manière suivante :

```jsx
import PopulationCard from 'components/Cohort/CreationCohort/DiagramView/components/PopulationCard/PopulationCard';

...

return (
  ...
  <PopulationCard />
  ...
)
```

##### LogicalOperator.tsx

Ce composant est un composant relativement important pour le Requêteur, il permet de créer les groupes de critères avec le composant `OperatorItem` mais également le composant `CriteriaRightPanel` qui permet quand a lui d'avoir le panneau latéral contenant la liste des types de critères ainsi que des formulaires.

> Ces groupes de critères sont générés de manière récursive, donc les groupes de critères crée les carte des critères, mais également des groupes de critères.

> Ce composant n'a pas de props. (propriétés), l'appel de ce composant ce fait de la manière suivante :

```jsx
import LogicalOperator from 'components/Cohort/CreationCohort/DiagramView/components/LogicalOperator/LogicalOperator';

...

return (
  ...
  <LogicalOperator />
  ...
)
```

##### CriteriaCard.tsx

Ce composant permet de créer les cartes pour un critère. Il gère l'affichage du nom du critère, des boutons d'edition et de suppression et fait appelle au composant `CriteriaCardContent`, qui lui gère l'affichage des arguments du critère.

Ce composant contient les propriétés suivantes :

| Nom            | Type                                       | Fonction                                                                             |
| -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| itemId         | `number`                                   | Identifiant du critère que l'on souhaite affiché                                     |
| deleteCriteria | `(criteriaId: number) => void`             | Lorsque l'utilisateur appuie sur le bouton de suppression, cette fonction est appelé |
| editCriteria   | `(criteria: SelectedCriteriaType) => void` | Lorsque l'utilisateur appuie sur le bouton d'édition, cette fonction est appelé      |

L'appel de ce composant ce fait de la manière suivante :

```jsx
import CriteriaCard from 'components/Cohort/CreationCohort/DiagramView/components/CriteriaCard/CriteriaCard';

...

return (
  ...
  <CriteriaCard
    itemId={...}
    deleteCriteria={...}
    editCriteria={...} />
  ...
)
```

##### CriteriaCardContent.tsx

Ce composant permet d'afficher les bulle que compose les cartes de critères. Il se base sur le critère passé en paramètre et passe dans une fonction `_displayCardContent` qui va contenir un switch/case pour afficher correctement chaque critère.

Ce composant contient les propriétés suivantes :

| Nom             | Type                   | Fonction                                   |
| --------------- | ---------------------- | ------------------------------------------ |
| currentCriteria | `SelectedCriteriaType` | Objet du critère que l'on souhaite affiché |

L'appel de ce composant ce fait de la manière suivante :

```jsx
import CriteriaCardContent from 'components/Cohort/CreationCohort/DiagramView/components/CriteriaCard/compontents/CriteriaCardContent/CriteriaCardContent';

...

return (
  ...
  <CriteriaCardContent
    currentCriteria={...} />
  ...
)
```

##### CriteriaRightPanel.tsx

Au meme titre que le composant `LogicalOperator`, ce composant est un composant primaire du requêteur. Il permet l'affichage du panneau latéral lors d'ajout et de modification d'un critère. Lorsque vous appuyer sur le bouton `Ajouter un critère` ou sur le bouton d'édition d'un critère, un panneau lateral s'affiche, c'est ce composant qui permet cet affichage.

Il est composé de deux états :

- Lors d'un ajout de critère, une liste est affiché. Cette liste est la liste de type de critère (Démographie, Prise en charge, Documents cliniques etc ...)
- Lorsqu'un type de critère est selectionné, ou lors d'une édition de critère, le panneau lateral affiche un formulaire.

Ce composant contient les propriétés suivantes :

| Nom                      | Type                                   | Fonction                                                                                                                   |
| ------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| criteria                 | `CriteriaItemType[]`                   | Liste de critère présent dans `state.cohortCreation.criteria`                                                              |
| selectedCriteria         | `SelectedCriteriaType` ou `null`       | Dans le cas d'une édition, `selectedCriteria` correspond au critère que nous souhaitons éditer, vaut `null` en cas d'ajout |
| onChangeSelectedCriteria | `(item: SelectedCriteriaType) => void` | Fonction qui permet l'ajout ou l'édition d'un critère                                                                      |
| open                     | `boolean`                              | Determine si le panneau lateral est ouvert ou non                                                                          |
| onClose                  | `() => void`                           | Fonction qui permet de fermer le panneau lateral                                                                           |

L'appel de ce composant ce fait de la manière suivante :

```jsx
import CriteriaCardContent from 'components/Cohort/CreationCohort/DiagramView/components/CriteriaCard/compontents/CriteriaCardContent/CriteriaCardContent';

...

return (
  ...
  <CriteriaRightPanel
    criteria={...}
    selectedCriteria={...}
    onChangeSelectedCriteria={...}
    open={...}
    onClose={...} />
  ...
)
```

##### TemporalConstraint.tsx

Ce composant est le composant qui permet l'affichage des contraintes temporelles, elle se trouve à coté de la population source. Elle contient un `<Select />` qui permet de changer de contrainte temporelle.

> Ce composant n'a pas de props. (propriétés), l'appel de ce composant ce fait de la manière suivante :

```jsx
import TemporalConstraint from 'components/Cohort/CreationCohort/DiagramView/components/TemporalConstraint/TemporalConstraint';

...

return (
  ...
  <TemporalConstraint />
  ...
)
```
