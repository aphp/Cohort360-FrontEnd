import { ResourceType } from 'types/requestCriterias'

enum level {
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning'
}

export const infoMessages: { id: number; resourceType?: ResourceType; level: level; message: string }[] = [
  {
    id: 0,
    level: level.ERROR,
    message:
      " Du fait d'un problème de pseudonymisation des documents, le requêtage et la visualisation des documents ont été temporairement désactivés"
  },
  {
    id: 1,
    level: level.INFO,
    message:
      "Suite à l'incident ayant eu lieu début août 2024, la saisie de certaines données de soin a posteriori dans leur application source peut prendre du délai. Elles seront donc manquantes dans Cohort360, et rattrapées au fil de l'eau."
  },
  {
    id: 2,
    resourceType: ResourceType.ENCOUNTER,
    level: level.INFO,
    message:
      "Le critère de prise en charge se base sur tous les séjours et passages. Les consultations étant des prises en charge non clôturées, elles n'ont pas de date de fin. Indiquer une durée ou une date de fin de prise en charge exclue ainsi les consultations."
  }
]
