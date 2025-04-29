import React from 'react'

import { Dialog, DialogContent, DialogActions, Grid, Button, DialogTitle, TextField } from '@mui/material'

type QuestionChoiceProps = {
  isOpen: boolean
  handleClose: () => void
}

type QuestionChoiceData = {
  id: string
  label: string
}

const fakeDataPregnancy: QuestionChoiceData[] = [
  {
    id: 'F_MATER_004830',
    label: 'je suis une question grossesse'
  },
  {
    id: 'F_MATER_004831',
    label: 'je suis une question grossesse'
  },
  {
    id: 'F_MATER_004833',
    label: 'je suis une question grossesse'
  },
  {
    id: 'F_MATER_004359',
    label: 'je suis une question grossesse'
  },
  {
    id: 'F_MATER_004842',
    label: 'je suis une question grossesse'
  }
]

const fakeDataHospit: QuestionChoiceData[] = [
  {
    id: 'F_MATER_005030',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005031',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005033',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005059',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005051',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005052',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005053',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005054',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005055',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005056',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005057',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005058',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005033',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005059',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005051',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005052',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005053',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005054',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005055',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005056',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005057',
    label: "je suis une question d'hospitalisation"
  },
  {
    id: 'F_MATER_005058',
    label: "je suis une question d'hospitalisation"
  }
]

const QuestionChoice = (props: QuestionChoiceProps) => {
  const { isOpen, handleClose } = props

  const pregnancyData = fakeDataPregnancy
  const hospitData = fakeDataHospit

  return (
    // Faire un system de recherche comme dans les tableau qui actualise la liste un call qui montre les resultats presents dans les deux types de formulaire
    <Dialog open={isOpen} onClose={() => handleClose()}>
      <DialogTitle>Choix des questions des formulaire à exporter</DialogTitle>
      <DialogContent style={{ paddingBottom: 0 }}>
        {/* exemple de champs de recherche */}
        <TextField />
        <Grid container spacing={2}>
          <Grid item>
            <h3>Questions grossesse</h3>
            {pregnancyData.map((item) => (
              <div key={item.id}>
                <input type="checkbox" id={item.id} />
                <label htmlFor={item.id}>{item.label}</label>
              </div>
            ))}
          </Grid>
          <Grid item>
            <h3>Questions hospitalisation</h3>
            {hospitData.map((item) => (
              <div key={item.id}>
                <input type="checkbox" id={item.id} />
                <label htmlFor={item.id}>{item.label}</label>
              </div>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()}>OK</Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuestionChoice
