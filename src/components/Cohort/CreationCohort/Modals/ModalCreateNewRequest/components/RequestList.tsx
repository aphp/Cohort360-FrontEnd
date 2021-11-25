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
} from '@material-ui/core'

import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { RequestType, ProjectType } from 'types'

import useStyles from '../styles'

interface ProjectRowProps {
  project: ProjectType
  requestsList: RequestType[]
  selectedItem: string | null
  onSelectedItem: (value: string) => void
}

const ProjectRow: React.FC<ProjectRowProps> = ({ project, requestsList, selectedItem, onSelectedItem }) => {
  const classes = useStyles()
  const [open, setOpen] = useState(true)

  const folderRequestsList = requestsList.filter(({ parent_folder }) => parent_folder === project.uuid)

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
              <ExpandLessIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setOpen(!open)}>
              <ExpandMoreIcon />
            </IconButton>
          )}
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={open}>
        {folderRequestsList.length > 0 ? (
          folderRequestsList.map((request) => {
            return (
              <ListItem key={request.uuid} className={classes.requestItem}>
                <ListItemText onClick={() => onSelectedItem(request.uuid as string)}>
                  <Typography noWrap style={{ marginLeft: 8 }}>
                    {request.name}
                  </Typography>
                </ListItemText>

                <ListItemSecondaryAction>
                  <Radio
                    checked={selectedItem === request.uuid}
                    onChange={() => onSelectedItem(request.uuid as string)}
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
  const classes = useStyles()

  return (
    <>
      <Grid container direction="column" className={classes.inputContainer}>
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
