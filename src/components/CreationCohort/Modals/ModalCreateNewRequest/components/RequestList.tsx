import React, { useState } from 'react'

import {
  Collapse,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
  Radio
} from '@mui/material'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { RequestType, ProjectType } from 'types'

import useStyles from '../styles'

interface ProjectRowProps {
  project: ProjectType
  requestsList: RequestType[]
  selectedItem: string | null
  onSelectedItem: (value: string) => void
}

const ProjectRow: React.FC<ProjectRowProps> = ({ project, requestsList, selectedItem, onSelectedItem }) => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(true)

  const folderRequestsList = requestsList.filter(({ parent_folder }) => parent_folder?.uuid === project.uuid)

  return (
    <>
      <ListItem className={classes.requestItem}>
        <ListItemText>
          <Typography noWrap style={{ fontWeight: 'bold' }}>
            {project.name}
          </Typography>
        </ListItemText>
        <ListItemSecondaryAction>
          {!open ? (
            <IconButton onClick={() => setOpen(!open)}>
              <ExpandMoreIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setOpen(!open)}>
              <ExpandLessIcon />
            </IconButton>
          )}
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={open}>
        {folderRequestsList.length > 0 ? (
          folderRequestsList.map((request) => {
            return (
              <ListItem key={request.uuid} className={classes.requestItem}>
                <ListItemText onClick={() => onSelectedItem(request.uuid)}>
                  {request.shared_by ? (
                    <Typography noWrap style={{ marginLeft: 8 }}>
                      {request.name} - Envoyée par : {request.shared_by}
                    </Typography>
                  ) : (
                    <Typography noWrap style={{ marginLeft: 8 }}>
                      {request.name}
                    </Typography>
                  )}
                </ListItemText>

                <ListItemSecondaryAction>
                  <Radio
                    checked={selectedItem === request.uuid}
                    onChange={() => onSelectedItem(request.uuid as string)}
                    color="secondary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            )
          })
        ) : (
          <ListItem>Aucune requête</ListItem>
        )}
      </Collapse>
    </>
  )
}

interface RequestListProps {
  projectList: ProjectType[]
  requestsList: RequestType[]
  selectedItem: string | null
  onSelectedItem: (value: string) => void
}

const RequestList: React.FC<RequestListProps> = ({ projectList, requestsList, selectedItem, onSelectedItem }) => {
  const { classes } = useStyles()

  return (
    <>
      <Grid container direction="column" marginBottom={3}>
        <List className={classes.requestList}>
          {projectList.length > 0 ? (
            projectList.map((project) => (
              <ProjectRow
                key={project.uuid}
                project={project}
                requestsList={requestsList}
                selectedItem={selectedItem}
                onSelectedItem={onSelectedItem}
              />
            ))
          ) : (
            <ListItem>Aucune projet de recherche</ListItem>
          )}
        </List>
      </Grid>
    </>
  )
}

export default RequestList
