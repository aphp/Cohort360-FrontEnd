import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { ProjectTitle, StyledCard } from './style'
import FolderIcon from 'assets/icones/folder.svg?react'
import OpenedFolderIcon from 'assets/icones/openedfolder.svg?react'
import { formatDate } from 'utils/formatDate'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ActionMenu from 'components/Exploration/components/ActionMenu'

type ProjectCardProps = {
  title: string
  creationDate?: string
  requestNumber: number
  onclick: () => void
  onedit: () => void
  ondelete: () => void
  disabled: boolean
}

//TODO: revoir l'UX/UI pour les actions

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  creationDate,
  requestNumber,
  onclick,
  onedit,
  ondelete,
  disabled
}) => {
  const [hover, setHover] = useState(false)

  const actions = [
    {
      icon: <EditIcon />,
      label: 'Éditer',
      onclick: () => onedit(),
      tooltip: '',
      disabled: disabled
    },
    {
      icon: <DeleteOutlineIcon />,
      label: 'Supprimer',
      onclick: () => ondelete(),
      tooltip: '',
      disabled: disabled
    }
  ]

  return (
    <StyledCard onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onclick}>
      <Box position={'absolute'} right={8} top={12}>
        <ActionMenu actions={actions} />
      </Box>
      <Box>{!hover ? <FolderIcon /> : <OpenedFolderIcon />}</Box>
      <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
        <ProjectTitle>{title}</ProjectTitle>
        <Typography fontSize={'12px'} fontFamily={"'Montserrat', sans-serif"} color={'#6d6d6d'}>
          Créé le {formatDate(creationDate)}
        </Typography>
      </Box>
      <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignContent={'center'}>
        <Typography variant="h3" align="center" fontWeight={600}>
          {requestNumber}
        </Typography>
        <Typography color={'#6d6d6d'}>requête{requestNumber > 1 ? 's' : ''}</Typography>
      </Box>
    </StyledCard>
  )
}

export default ProjectCard
