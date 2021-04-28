import React from 'react'
import moment from 'moment'

import { makeStyles } from '@material-ui/core/styles'

import Box from '@material-ui/core/Box'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'

import { ProjectType, RequestType } from 'services/myProjects'

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset'
    }
  }
})

function RequestRow(props: { row: RequestType }) {
  const { row } = props
  const [open, setOpen] = React.useState(false)
  const classes = useRowStyles()

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell />
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.name}
          </TableCell>
          <TableCell component="th" scope="row">
            {moment(row.created_at).fromNow()}
          </TableCell>
        </TableRow>

        <TableRow className={classes.root}>
          <TableCell style={{ padding: 0 }} colSpan={4}>
            <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%' }}>
              <Box margin={1}>
                <Typography variant="h6" gutterBottom component="div">
                  Versions
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Version</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Nombre de patient</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* {row.history.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align="right">{historyRow.amount}</TableCell>
                      <TableCell align="right">{Math.round(historyRow.amount * row.price * 100) / 100}</TableCell>
                    </TableRow>
                  ))} */}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

type ProjectRowProps = {
  row: ProjectType
  requestOfProject: RequestType[]
}
const ProjectRow: React.FC<ProjectRowProps> = ({ row, requestOfProject }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell />
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell component="th" scope="row" style={{ width: 300 }}>
          {moment(row.created_at).fromNow()}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%' }}>
            {requestOfProject.map((request) => (
              <RequestRow key={request.name} row={request} />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

type ProjectTableProps = {
  projectList: ProjectType[]
  requestList: RequestType[]
}
const ProjectTable: React.FC<ProjectTableProps> = ({ projectList, requestList }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="projects table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell>Titre</TableCell>
            <TableCell align="center">Date</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {projectList.map((project) => (
            <ProjectRow
              key={project.name}
              row={project}
              requestOfProject={requestList.filter(({ project_id }) => project_id === project.uuid)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ProjectTable
