import React from 'react'

import {
  Breadcrumbs,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
  Radio
} from '@material-ui/core'

import { RequestType, ProjectType } from 'types'

import useStyles from '../styles'

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
        <Typography variant="h3">Liste de requête :</Typography>

        <List className={classes.requestList}>
          {requestsList.length > 0 ? (
            requestsList.map((request) => {
              const foundProject = projectList.find(({ uuid }) => uuid === request.parent_folder)
              return (
                <ListItem key={request.uuid} className={classes.requestItem}>
                  <ListItemText onClick={() => onSelectedItem(request.uuid as string)}>
                    <Breadcrumbs separator="›">
                      {[
                        foundProject ? (
                          <Typography noWrap key="1">
                            {foundProject.name}
                          </Typography>
                        ) : null,
                        <Typography noWrap key="2" style={{ fontWeight: 'bold' }}>
                          {request.name}
                        </Typography>
                      ].filter((elem) => elem !== null)}
                    </Breadcrumbs>
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
        </List>
      </Grid>
    </>
  )
}

export default RequestList
