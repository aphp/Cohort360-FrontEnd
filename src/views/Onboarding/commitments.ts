/** Libellés des 10 engagements, dans l'ordre du parcours (RG3429.02). */
export const COMMITMENTS: string[] = [
  'Vos accès sont personnels',
  "Vous n'accédez qu'aux données de votre périmètre",
  "Vous n'utilisez les données que pour les finalités prévues",
  'Vous ne croisez pas les données',
  'Vous respectez le secret médical',
  'Vous protégez les données que vous manipulez',
  "Vous alertez en cas d'incident",
  'Vous anticipez la modification ou la clôture de vos habilitations',
  "Vous supprimez les données à l'issue de votre mission",
  'Vous acceptez que vos actions soient enregistrées'
]

export const getCommitmentTag = (index: number): string => `Engagement ${index + 1}`
