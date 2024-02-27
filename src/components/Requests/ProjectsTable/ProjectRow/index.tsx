import React, { useEffect, useState } from 'react'

import { Collapse, IconButton, TableRow, Typography, Table, Tooltip } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import RequestRow from '../RequestRow'

import { LoadingStatus, ProjectType } from 'types'

import { useAppSelector } from 'state'

import { FetchRequestsResponse, fetchRequestsFromProject } from 'services/requests/api'
import moment from 'moment'
import { Direction, Order } from 'types/searchCriterias'
import ProjectActions from 'components/Requests/ProjectActions'
import { MoreHoriz } from '@mui/icons-material'

type ProjectRowProps = {
  row: ProjectType
  fetchRequests: boolean
  searchInput?: string
  onUpdate: () => void
}
const ProjectRow: React.FC<ProjectRowProps> = ({ row, fetchRequests, searchInput, onUpdate }) => {
  const [openRequests, setOpenRequests] = React.useState(fetchRequests)
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const [requests, setRequests] = useState<FetchRequestsResponse | null>(null)
  const [toggleFetchRequests, setToggleFetchRequests] = useState(fetchRequests)
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(LoadingStatus.IDDLE)

  const handleFetchRequests = async (next?: string) => {
    setLoadingStatus(LoadingStatus.FETCHING)
    const response = await fetchRequestsFromProject(row.uuid, {
      limit: 2,
      orderBy: {
        orderBy: Order.MODIFIED,
        orderDirection: Direction.DESC
      },
      next
    })
    if (next) {
      setRequests({
        ...response,
        results: [...(requests?.results || []), ...response.results]
      })
    } else {
      setRequests(response)
    }
    setLoadingStatus(LoadingStatus.SUCCESS)
  }

  useEffect(() => {
    if (toggleFetchRequests) {
      handleFetchRequests()
      setOpenRequests(true)
    } else {
      setOpenRequests(false)
    }
  }, [toggleFetchRequests])

  return (
    <>
      <TableRow style={{ display: 'flex', width: '100%', color: '#00000099' }}>
        <TableCellWrapper style={{ width: '70px', height: '60px', textAlign: 'left' }}>
          <IconButton style={{ marginLeft: 4 }} aria-label="expand row" size="small">
            {openRequests ? (
              <KeyboardArrowUpIcon style={{ color: '#00000099' }} onClick={() => setToggleFetchRequests(false)} />
            ) : (
              <KeyboardArrowDownIcon style={{ color: '#00000099' }} onClick={() => setToggleFetchRequests(true)} />
            )}
          </IconButton>
        </TableCellWrapper>
        <TableCellWrapper style={{ width: '70px', height: '60px', textAlign: 'left' }}></TableCellWrapper>
        <TableCellWrapper
          style={{ width: '120px', height: '60px', textAlign: 'left', display: 'flex', alignItems: 'center' }}
        >
          <Typography> {moment(row.modified_at).format('DD/MM/YYYY')}</Typography>
        </TableCellWrapper>
        <TableCellWrapper
          align="left"
          style={{
            width: 'calc(100% - 70px - 70px - 120px - 160px)',
            height: '60px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography style={{ fontWeight: 900, display: 'inline-table' }}>{row.name}</Typography>
        </TableCellWrapper>
        <TableCellWrapper
          align="left"
          style={{ height: '60px', textAlign: 'left', display: 'flex', alignItems: 'center' }}
        >
          <ProjectActions project={row} onUpdate={onUpdate} disabled={maintenanceIsActive} />
        </TableCellWrapper>
      </TableRow>

      <Collapse in={openRequests} timeout="auto" unmountOnExit style={{ width: '100%', minHeight: 'fit-content' }}>
        {openRequests && loadingStatus === LoadingStatus.SUCCESS && requests?.count === 0 && (
          <TableRow style={{ display: 'flex', width: '100%' }}>
            <TableCellWrapper
              style={{
                width: '100%',
                height: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography fontWeight={700}>Aucune requête associée à ce projet</Typography>
            </TableCellWrapper>
          </TableRow>
        )}

        {requests && requests?.count > 0 && (
          <Table>
            {requests.results.map((request) => (
              <RequestRow
                key={request.uuid}
                request={request}
              />
            ))}
            {requests.results.length < requests.count && (
              <TableRow style={{ display: 'flex', width: '100%' }}>
                <TableCellWrapper
                  style={{
                    width: '100%',
                    height: 35,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgb(250, 249, 249)'
                  }}
                >
                  <Tooltip title={'Voir plus de requêtes'}>
                    <IconButton onClick={() => handleFetchRequests(requests?.next!)}>
                      <MoreHoriz />
                    </IconButton>
                  </Tooltip>
                </TableCellWrapper>
              </TableRow>
            )}
          </Table>
        )}
      </Collapse>
    </>
  )
}

export default ProjectRow
