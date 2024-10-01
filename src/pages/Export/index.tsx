import React from 'react'

import { Grid, CssBaseline } from '@mui/material'

import HeaderPage from 'components/ui/HeaderPage'
import DataTable from 'components/DataTable/DataTable'
import Tables from 'components/Tables'

import { useAppSelector } from 'state'

import sideBarTransition from 'styles/sideBarTransition'

const exportColumnsTable = [
  { label: 'N° de cohorte' },
  { label: 'Nom de la cohorte' },
  { label: 'Nombre de patient' },
  { label: "Nom de l'export" },
  { label: 'Date de l’export' },
  { label: 'Statut' },
  { label: 'Actions' }
]

const Export: React.FC = () => {
  const { classes, cx } = sideBarTransition()
  const openDrawer = useAppSelector((state) => state.drawer)

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: openDrawer
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <HeaderPage id="export-page-title" title="Mes exports" />
          <DataTable columns={exportColumnsTable}>
            <p>salut</p>
          </DataTable>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Export
