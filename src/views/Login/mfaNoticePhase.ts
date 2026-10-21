// Bornes de la story #3663, comparées au jour calendaire à l'heure de Paris (RG3663.01)
const ANNOUNCEMENT_START = '2026-10-22'
const MFA_ACTIVATION = '2026-10-29'
const HELP_ONLY_START = '2026-11-12'

export const MFA_HELP_URL = 'https://id.pages.data.aphp.fr/design-et-produit/ipa/documentation/cohort360/connexion/login/'
export const MFA_SUPPORT_MAIL = 'id.recherche.support.dsn@aphp.fr'

export type MfaNoticePhase = 'none' | 'announcement' | 'activated' | 'help'

const parisDayFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const toParisDay = (date: Date) => {
  const parts = Object.fromEntries(parisDayFormatter.formatToParts(date).map(({ type, value }) => [type, value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export const getMfaNoticePhase = (now: Date = new Date()): MfaNoticePhase => {
  const day = toParisDay(now)
  if (day < ANNOUNCEMENT_START) return 'none'
  if (day < MFA_ACTIVATION) return 'announcement'
  if (day < HELP_ONLY_START) return 'activated'
  return 'help'
}
