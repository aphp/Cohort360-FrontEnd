import React from 'react'

import Typography from '@material-ui/core/Typography'

const FifthNews = () => {
  return (
    <>
      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelles fonctionnalités</b> - 26/10/2022
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • <b>La liste d'IPP</b> à été rajouté à la liste de critère dans le requêteur.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Il est possible d'afficher des éléments <b>ANABIO</b> associés au code <b>LOINC</b>.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Le champs <b>"Valeur de références"</b> a été ajouté dans l'onglet <b>"Biologie"</b> de l'exploration d'un
        patient
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • <b>Une page 404</b> à été ajoutée quand on se rend sur une page inexistante.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Diverses corrections ont étés apportées <b>aux filtres</b> ainsi que sur <b>les tris</b>.
      </Typography>
      <Typography color="textSecondary" style={{ paddingTop: 6 }}>
        <b>L'équipe Cohort360</b>
      </Typography>
    </>
  )
}

export default FifthNews
