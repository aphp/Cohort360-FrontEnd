import React from 'react'
import { useDispatch } from 'react-redux'
import moment from 'moment'

import { Button, Collapse, IconButton, TableCell, TableRow, Typography, Tooltip } from '@material-ui/core'

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'

import RequestRow from '../RequestRow/RequestRow'

import { ProjectType, RequestType } from 'services/myProjects'

import { setSelectedProject } from 'state/project'
import { setSelectedRequest } from 'state/request'

import useStyles from '../styles'

type ProjectRowProps = {
  row: ProjectType
  requestOfProject: RequestType[]
}
const ProjectRow: React.FC<ProjectRowProps> = ({ row, requestOfProject }) => {
  const [open, setOpen] = React.useState(true)
  const classes = useStyles()
  const dispatch = useDispatch()

  const handleClickAddOrEditProject = (selectedProjectId: string | null) => {
    if (selectedProjectId) {
      dispatch<any>(setSelectedProject(selectedProjectId))
    } else {
      dispatch<any>(setSelectedProject(null))
    }
  }

  const handleAddRequest = () => {
    dispatch<any>(setSelectedRequest({ uuid: '', name: '', parent_folder: row.uuid }))
  }

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell />
        <TableCell className={classes.tdName}>
          <Typography style={{ fontWeight: 900, display: 'inline-table' }}>{row.name}</Typography>
          <Tooltip title={'Modifier le projet'}>
            <IconButton
              onClick={() => handleClickAddOrEditProject(row.uuid)}
              className={classes.editButon}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {requestOfProject && requestOfProject.length > 0 && (
            <Tooltip title={'Ajouter une requête'}>
              <IconButton onClick={handleAddRequest} className={classes.smallAddButon} size="small">
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
        <TableCell className={classes.dateCell} align="center">
          {moment(row.modified_at).format('DD/MM/YYYY [à] HH:mm')}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ padding: 0, borderBottomWidth: open ? 1 : 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%' }}>
            {requestOfProject && requestOfProject.length > 0 ? (
              requestOfProject.map((request) => <RequestRow key={request.uuid} row={request} />)
            ) : (
              <Typography className={classes.emptyRequestRow}>
                Aucune requête n'est associée à ce projet de recherche
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={handleAddRequest}
                  className={classes.addButton}
                  style={{ margin: 4 }}
                >
                  Ajouter une requête
                </Button>
              </Typography>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default ProjectRow
