import { ResourceType } from 'types/requestCriterias'

enum level {
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning'
}

export const infoMessages: { id: number; resourceType?: ResourceType; level: level; message: string }[] = [
  {
    id: 0,
    resourceType: ResourceType.ENCOUNTER,
    level: level.INFO,
    message:
      "Le critère de prise en charge se base sur tous les séjours et passages. Les consultations étant des prises en charge non clôturées, elles n'ont pas de date de fin. Indiquer une durée ou une date de prise en charge exclue ainsi les consultations."
  }
]
