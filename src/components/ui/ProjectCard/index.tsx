import React, { useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import { ProjectTitle, StyledCard } from './style'
import FolderIcon from 'assets/icones/folder.svg?react'
import OpenedFolderIcon from 'assets/icones/openedfolder.svg?react'
import { formatDate } from 'utils/formatDate'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

type ProjectCardProps = {
  title: string
  creationDate?: string
  requestNumber: number
  onclick: () => void
  onedit: () => void
  ondelete: () => void
}

//TODO: revoir l'UX/UI pour les actions

const ProjectCard: React.FC<ProjectCardProps> = ({ title, creationDate, requestNumber, onclick, onedit, ondelete }) => {
  const [hover, setHover] = useState(false)

  return (
    <StyledCard onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onclick}>
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
      {hover && (
        <Box display={'flex'} alignItems={'center'}>
          <IconButton
            onClick={(event) => {
              event.stopPropagation()
              onedit()
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={(event) => {
              event.stopPropagation()
              ondelete()
            }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      )}
    </StyledCard>
  )
}

export default ProjectCard
