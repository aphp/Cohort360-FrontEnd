import { Collapse, styled } from '@mui/material'

type CustomProps = {
  margin?: string
}

export const CollapseWrapper = styled(Collapse)<CustomProps>(({ margin }) => ({
  // '& div': {
  //   margin: margin
  // }
  '.MuiGrid-root': {
    // TODO: trouver un moyen pour qu'ici ça ne se disperse qu'au niveau du premier sous niveau
    // ou régler mes problèmes avec CalendarRange, l'outsider
    margin: '0 0 1em'
  }
}))
