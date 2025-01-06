import { CohortJobStatus } from 'types'

export const projects = [
  { title: 'Projet Alpha', creationDate: '2024-01-15', requestNumber: 1 },
  { title: "Initiative de Recherche sur l'IA", creationDate: '2023-12-12', requestNumber: 2 },
  { title: 'Développement Web Application BETA', creationDate: '2024-02-05', requestNumber: 3 },
  { title: 'Planification des Ressources Humaines', creationDate: '2023-11-22', requestNumber: 4 },
  { title: "Mise à jour de l'ERP", creationDate: '2024-03-01', requestNumber: 5 },
  { title: 'Projet Génération 2030', creationDate: '2024-01-01', requestNumber: 6 },
  { title: 'Refonte totale du Système de Gestion', creationDate: '2023-12-20', requestNumber: 7 },
  { title: 'Audit de la Sécurité Informatique', creationDate: '2024-02-15', requestNumber: 8 },
  { title: 'Migration Cloud pour les Données', creationDate: '2024-03-10', requestNumber: 9 },
  { title: 'Analyse des Performances Mensuelles', creationDate: '2024-02-28', requestNumber: 10 },
  { title: 'Formation Interne des Employés', creationDate: '2024-03-12', requestNumber: 11 },
  { title: 'Support IT pour le Nouveau Bureau', creationDate: '2024-01-28', requestNumber: 12 },
  { title: 'Pilotage de Projet Agilité MAX', creationDate: '2023-11-30', requestNumber: 13 },
  { title: "Expérimentation sur l'Internet des Objets (IoT)", creationDate: '2024-02-10', requestNumber: 14 },
  { title: 'Optimisation des Procédures Financières', creationDate: '2024-03-05', requestNumber: 15 },
  { title: "Déploiement de l'Application Mobile", creationDate: '2024-01-22', requestNumber: 16 },
  { title: 'Tests et Validation des Logiciels', creationDate: '2023-12-18', requestNumber: 17 },
  { title: "Configuration d'un Réseau de Production", creationDate: '2024-02-20', requestNumber: 18 },
  { title: 'Modernisation des Infrastructures TI', creationDate: '2023-11-25', requestNumber: 19 },
  { title: "Amélioration de l'UX/UI sur les Produits Web", creationDate: '2024-03-15', requestNumber: 20 }
]

export const requests = [
  {
    name: 'Nouvelle requête 1',
    parentProject: 'Projet par défaut',
    modificationDate: '17/08/2024 à 14:42',
    cohortTotal: '5'
  },
  {
    name: 'Nouvelle requête 2',
    parentProject: 'Projet Alpha',
    modificationDate: '18/08/2024 à 10:15',
    cohortTotal: '12'
  },
  {
    name: 'Nouvelle requête 3',
    parentProject: "Initiative de Recherche sur l'IA",
    modificationDate: '19/08/2024 à 16:30',
    cohortTotal: '8'
  },
  {
    name: 'Nouvelle requête 4',
    parentProject: 'Développement Web Application BETA',
    modificationDate: '20/08/2024 à 11:00',
    cohortTotal: '15'
  },
  {
    name: 'Nouvelle requête 5',
    parentProject: 'Planification des Ressources Humaines',
    modificationDate: '21/08/2024 à 09:25',
    cohortTotal: '7'
  },
  {
    name: 'Nouvelle requête 6',
    parentProject: "Mise à jour de l'ERP",
    modificationDate: '22/08/2024 à 14:05',
    cohortTotal: '9'
  },
  {
    name: 'Nouvelle requête 7',
    parentProject: 'Projet Génération 2030',
    modificationDate: '23/08/2024 à 12:50',
    cohortTotal: '11'
  },
  {
    name: 'Nouvelle requête 8',
    parentProject: 'Refonte totale du Système de Gestion',
    modificationDate: '24/08/2024 à 13:35',
    cohortTotal: '10'
  },
  {
    name: 'Nouvelle requête 9',
    parentProject: 'Audit de la Sécurité Informatique',
    modificationDate: '25/08/2024 à 15:10',
    cohortTotal: '6'
  },
  {
    name: 'Nouvelle requête 10',
    parentProject: 'Migration Cloud pour les Données',
    modificationDate: '26/08/2024 à 10:20',
    cohortTotal: '14'
  },
  {
    name: 'Nouvelle requête 11',
    parentProject: 'Analyse des Performances Mensuelles',
    modificationDate: '27/08/2024 à 08:55',
    cohortTotal: '4'
  },
  {
    name: 'Nouvelle requête 12',
    parentProject: 'Formation Interne des Employés',
    modificationDate: '28/08/2024 à 14:45',
    cohortTotal: '10'
  },
  {
    name: 'Nouvelle requête 13',
    parentProject: 'Support IT pour le Nouveau Bureau',
    modificationDate: '29/08/2024 à 16:00',
    cohortTotal: '5'
  },
  {
    name: 'Nouvelle requête 14',
    parentProject: 'Pilotage de Projet Agilité MAX',
    modificationDate: '30/08/2024 à 11:35',
    cohortTotal: '8'
  },
  {
    name: 'Nouvelle requête 15',
    parentProject: "Expérimentation sur l'Internet des Objets (IoT)",
    modificationDate: '31/08/2024 à 14:00',
    cohortTotal: '9'
  },
  {
    name: 'Nouvelle requête 16',
    parentProject: 'Optimisation des Procédures Financières',
    modificationDate: '01/09/2024 à 15:25',
    cohortTotal: '6'
  },
  {
    name: 'Nouvelle requête 17',
    parentProject: "Déploiement de l'Application Mobile",
    modificationDate: '02/09/2024 à 13:10',
    cohortTotal: '12'
  },
  {
    name: 'Nouvelle requête 18',
    parentProject: 'Tests et Validation des Logiciels',
    modificationDate: '03/09/2024 à 10:45',
    cohortTotal: '7'
  },
  {
    name: 'Nouvelle requête 19',
    parentProject: "Configuration d'un Réseau de Production",
    modificationDate: '04/09/2024 à 09:30',
    cohortTotal: '10'
  },
  {
    name: 'Nouvelle requête 20',
    parentProject: 'Modernisation des Infrastructures TI',
    modificationDate: '05/09/2024 à 14:55',
    cohortTotal: '5'
  }
]

export const cohorts = [
  {
    fav: true,
    name: 'Cohorte 1',
    status: CohortJobStatus.LONG_PENDING,
    totalPatients: '1234567',
    aphpEstimation: '78526 - 89975',
    creationDate: '18/08/2024',
    samples: 5,
    parentRequest: 'Requete 1'
  },
  {
    fav: false,
    name: 'Cohorte 2',
    status: CohortJobStatus.NEW,
    totalPatients: '345678',
    aphpEstimation: '10234 - 20985',
    creationDate: '19/08/2024',
    samples: 3,
    parentRequest: 'Requete 1'
  },
  {
    fav: true,
    name: 'Cohorte 3',
    status: CohortJobStatus.FAILED,
    totalPatients: '456789',
    aphpEstimation: '20456 - 30567',
    creationDate: '20/08/2024',
    samples: 4
  },
  {
    fav: false,
    name: 'Cohorte 4',
    status: CohortJobStatus.PENDING,
    totalPatients: '567890',
    aphpEstimation: '30578 - 40890',
    creationDate: '21/08/2024',
    samples: 2
  },
  {
    fav: true,
    name: 'Cohorte 5',
    status: CohortJobStatus.STARTED,
    totalPatients: '678901',
    aphpEstimation: '40901 - 51234',
    creationDate: '22/08/2024',
    samples: 6
  },
  {
    fav: false,
    name: 'Cohorte 6',
    status: CohortJobStatus.FAILED,
    totalPatients: '789012',
    aphpEstimation: '51235 - 61567',
    creationDate: '23/08/2024',
    samples: 1
  },
  {
    fav: true,
    name: 'Cohorte 7',
    status: CohortJobStatus.FINISHED,
    totalPatients: '890123',
    aphpEstimation: '61568 - 71890',
    creationDate: '24/08/2024',
    samples: 8
  },
  {
    fav: false,
    name: 'Cohorte 8',
    status: CohortJobStatus.SUSPENDED,
    totalPatients: '901234',
    aphpEstimation: '71891 - 82012',
    creationDate: '25/08/2024',
    samples: 4
  },
  {
    fav: true,
    name: 'Cohorte 9',
    status: CohortJobStatus.LONG_PENDING,
    totalPatients: '123456',
    aphpEstimation: '82013 - 92345',
    creationDate: '26/08/2024',
    samples: 7
  },
  {
    fav: false,
    name: 'Cohorte 10',
    status: CohortJobStatus.FINISHED,
    totalPatients: '234567',
    aphpEstimation: '92346 - 102567',
    creationDate: '27/08/2024',
    samples: 3
  },
  {
    fav: true,
    name: 'Cohorte 11',
    status: CohortJobStatus.PENDING,
    totalPatients: '345678',
    aphpEstimation: '102568 - 112789',
    creationDate: '28/08/2024',
    samples: 2
  },
  {
    fav: false,
    name: 'Cohorte 12',
    status: CohortJobStatus.PENDING,
    totalPatients: '456789',
    aphpEstimation: '112790 - 122901',
    creationDate: '29/08/2024',
    samples: 5
  },
  {
    fav: true,
    name: 'Cohorte 13',
    status: CohortJobStatus.STARTED,
    totalPatients: '567890',
    aphpEstimation: '122902 - 132345',
    creationDate: '30/08/2024',
    samples: 6
  },
  {
    fav: false,
    name: 'Cohorte 14',
    status: CohortJobStatus.NEW,
    totalPatients: '678901',
    aphpEstimation: '132346 - 142678',
    creationDate: '31/08/2024',
    samples: 3
  },
  {
    fav: true,
    name: 'Cohorte 15',
    status: CohortJobStatus.PENDING,
    totalPatients: '789012',
    aphpEstimation: '142679 - 152345',
    creationDate: '01/09/2024',
    samples: 4
  },
  {
    fav: false,
    name: 'Cohorte 16',
    status: CohortJobStatus.SUSPENDED,
    totalPatients: '890123',
    aphpEstimation: '152346 - 162567',
    creationDate: '02/09/2024',
    samples: 2
  },
  {
    fav: true,
    name: 'Cohorte 17',
    status: CohortJobStatus.FAILED,
    totalPatients: '901234',
    aphpEstimation: '162568 - 172678',
    creationDate: '03/09/2024',
    samples: 8
  },
  {
    fav: false,
    name: 'Cohorte 18',
    status: CohortJobStatus.FINISHED,
    totalPatients: '123456',
    aphpEstimation: '172679 - 182345',
    creationDate: '04/09/2024',
    samples: 1
  },
  {
    fav: true,
    name: 'Cohorte 19',
    status: CohortJobStatus.LONG_PENDING,
    totalPatients: '234567',
    aphpEstimation: '182346 - 192789',
    creationDate: '05/09/2024',
    samples: 5
  },
  {
    fav: false,
    name: 'Cohorte 20',
    status: CohortJobStatus.FINISHED,
    totalPatients: '345678',
    aphpEstimation: '192790 - 202345',
    creationDate: '06/09/2024',
    samples: 3
  }
]

export const samples = [
  {
    fav: true,
    name: 'Cohorte 1',
    status: CohortJobStatus.LONG_PENDING,
    totalPatients: '1234567',
    percentage: '50%',
    creationDate: '18/08/2024',
    parentCohort: 'Cohorte 1'
  },
  {
    fav: false,
    name: 'Cohorte 2',
    status: CohortJobStatus.NEW,
    totalPatients: '345678',
    percentage: '50%',
    creationDate: '19/08/2024',
    parentCohort: 'Cohorte 1'
  },
  {
    fav: true,
    name: 'Cohorte 3',
    status: CohortJobStatus.FAILED,
    totalPatients: '456789',
    percentage: '50%',
    creationDate: '20/08/2024'
  },
  {
    fav: false,
    name: 'Cohorte 4',
    status: CohortJobStatus.PENDING,
    totalPatients: '567890',
    percentage: '50%',
    creationDate: '21/08/2024'
  },
  {
    fav: true,
    name: 'Cohorte 5',
    status: CohortJobStatus.STARTED,
    totalPatients: '678901',
    percentage: '50%',
    creationDate: '22/08/2024'
  },
  {
    fav: false,
    name: 'Cohorte 6',
    status: CohortJobStatus.FAILED,
    totalPatients: '789012',
    percentage: '50%',
    creationDate: '23/08/2024'
  },
  {
    fav: true,
    name: 'Cohorte 7',
    status: CohortJobStatus.FINISHED,
    totalPatients: '890123',
    percentage: '50%',
    creationDate: '24/08/2024'
  },
  {
    fav: false,
    name: 'Cohorte 8',
    status: CohortJobStatus.SUSPENDED,
    totalPatients: '901234',
    percentage: '50%',
    creationDate: '25/08/2024'
  },
  {
    fav: true,
    name: 'Cohorte 9',
    status: CohortJobStatus.LONG_PENDING,
    totalPatients: '123456',
    percentage: '50%',
    creationDate: '26/08/2024'
  },
  {
    fav: false,
    name: 'Cohorte 10',
    status: CohortJobStatus.FINISHED,
    totalPatients: '234567',
    percentage: '50%',
    creationDate: '27/08/2024'
  },
  {
    fav: true,
    name: 'Cohorte 11',
    status: CohortJobStatus.PENDING,
    totalPatients: '345678',
    percentage: '50%',
    creationDate: '28/08/2024'
  },
  {
    fav: false,
    name: 'Cohorte 12',
    status: CohortJobStatus.PENDING,
    totalPatients: '456789',
    percentage: '50%',
    creationDate: '29/08/2024'
  },
  {
    fav: true,
    name: 'Cohorte 13',
    status: CohortJobStatus.STARTED,
    totalPatients: '567890',
    percentage: '50%',
    creationDate: '30/08/2024'
  },
  {
    fav: false,
    name: 'Cohorte 14',
    status: CohortJobStatus.NEW,
    totalPatients: '678901',
    percentage: '50%',
    creationDate: '31/08/2024'
  },
  {
    fav: true,
    name: 'Cohorte 15',
    status: CohortJobStatus.PENDING,
    totalPatients: '789012',
    percentage: '50%',
    creationDate: '01/09/2024'
  },
  {
    fav: false,
    name: 'Cohorte 16',
    status: CohortJobStatus.SUSPENDED,
    totalPatients: '890123',
    percentage: '50%',
    creationDate: '02/09/2024'
  },
  {
    fav: true,
    name: 'Cohorte 17',
    status: CohortJobStatus.FAILED,
    totalPatients: '901234',
    percentage: '50%',
    creationDate: '03/09/2024'
  },
  {
    fav: false,
    name: 'Cohorte 18',
    status: CohortJobStatus.FINISHED,
    totalPatients: '123456',
    percentage: '50%',
    creationDate: '04/09/2024'
  },
  {
    fav: true,
    name: 'Cohorte 19',
    status: CohortJobStatus.LONG_PENDING,
    totalPatients: '234567',
    percentage: '50%',
    creationDate: '05/09/2024'
  },
  {
    fav: false,
    name: 'Cohorte 20',
    status: CohortJobStatus.FINISHED,
    totalPatients: '345678',
    percentage: '50%',
    creationDate: '06/09/2024'
  }
]
