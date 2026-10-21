import moment from 'moment'

// Activation de la double authentification (story #3663), à minuit heure locale :
// les utilisateurs sont en France, l'heure locale est donc l'heure de Paris (RG3663.01)
const MFA_ACTIVATION = moment('2026-10-29')

export const MFA_HELP_URL =
  'https://id.pages.data.aphp.fr/design-et-produit/ipa/documentation/cohort360/connexion/login/'
export const MFA_SUPPORT_MAIL = 'id.recherche.support.dsn@aphp.fr'

export type MfaNoticePhase = 'none' | 'announcement' | 'activated' | 'help'

export const getMfaNoticePhase = (now: Date = new Date()): MfaNoticePhase => {
  const current = moment(now)
  if (current.isBefore(MFA_ACTIVATION.clone().subtract(7, 'days'))) return 'none'
  if (current.isBefore(MFA_ACTIVATION)) return 'announcement'
  if (current.isBefore(MFA_ACTIVATION.clone().add(14, 'days'))) return 'activated'
  return 'help'
}
