import React, { useMemo, useState } from 'react'

import useStyles from './styles'
import { Box } from '@mui/material'
import { TimelineOutput } from './types'
import HospitItem from './HospitItem'
import { getConfig } from 'config'
import PmsiItem from './PmsiItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { CohortComposition } from 'types'
import { mapToTable } from 'components/ExplorationBoard/config/documents'
import Modal from 'components/ui/Modal'
import Table from 'components/ui/Table'

type TimelineTypes = {
  timeline: TimelineOutput
  deidentified: boolean
  groupId?: string
}

const Timeline = ({ timeline, deidentified, groupId }: TimelineTypes) => {
  const { classes } = useStyles({})
  const [openHospitDialog, setOpenHospitDialog] = useState(false)
  const [currentDocuments, setCurrentDocuments] = useState<CohortComposition[]>([])
  const documentsTable = useMemo(
    () =>
      mapToTable(
        { list: currentDocuments, total: 0, totalAllPatients: 0, totalAllResults: 0, totalPatients: 0 },
        deidentified,
        true,
        groupId ? [groupId] : [],
        false
      ),
    [currentDocuments, deidentified, groupId]
  )

  const handleClickDocuments = (documents: CohortComposition[]) => {
    setOpenHospitDialog(true)
    setCurrentDocuments(documents)
  }

  return (
    <>
      <Modal
        open={openHospitDialog}
        width="fit-content"
        readonly
        color="secondary"
        onClose={() => setOpenHospitDialog(false)}
      >
        <Table value={documentsTable} />
      </Modal>
      <Box className={classes.verticalBar}>
        {timeline.map((period, index) => {
          const [year, months] = Object.entries(period)[0]
          return (
            <Box key={`timeline-${year}`} textAlign="left">
              {months && months.length > 0 ? (
                months.map((monthObj) => {
                  const [month, content] = Object.entries(monthObj)[0]
                  return (
                    <Box display="flex" key={month} flexDirection="column">
                      {content.hospit &&
                        content.hospit.map((hospit, index) => (
                          <Box
                            zIndex={1}
                            display="flex"
                            flexDirection="row"
                            key={`encounter ${hospit.data.id ?? index}`}
                            marginBottom={1}
                            marginTop={1}
                          >
                            <Box flex="0 0 calc(50% + 7.5px)">
                              <HospitItem
                                data={hospit.data}
                                onClick={handleClickDocuments}
                                isPeriod={hospit.end !== hospit.start}
                              />
                            </Box>
                          </Box>
                        ))}
                      {content.pmsi &&
                        content.pmsi.map((pmsi, index) => {
                          const code =
                            pmsi.data.resourceType === 'Procedure'
                              ? pmsi.data.code?.coding?.find(
                                  (code) => !getConfig().core.fhir.selectedCodeOnly || code.userSelected
                                )
                              : pmsi.data.code?.coding?.[0]
                          const description = code?.display && code?.code ? `${code?.display} (${code?.code})` : ''
                          const date =
                            (pmsi.data.resourceType === 'Procedure'
                              ? pmsi.data.performedDateTime
                              : pmsi.data.recordedDate) ?? pmsi.data.meta?.lastUpdated
                          const status = pmsi.data.resourceType === 'Procedure' ? pmsi.data.status : null
                          if (pmsi.data.resourceType === 'Procedure')
                            return (
                              <Box
                                zIndex={1}
                                display="flex"
                                flexDirection="row"
                                key={
                                  pmsi.data.resourceType === 'Procedure' ? `procedure ${index}` : `condition ${index}`
                                }
                                marginBottom={2}
                                marginTop={2}
                              >
                                <Box flex="0 0 calc(50% - 7.5px)"></Box>
                                <Box flex="1">
                                  <PmsiItem date={date} description={description} status={status} />
                                </Box>
                              </Box>
                            )
                        })}
                    </Box>
                  )
                })
              ) : (
                <>
                  {index !== 0 && (
                    <Box className={classes.collapsedYear}>
                      <MoreVertIcon />
                    </Box>
                  )}
                </>
              )}
              <span className={classes.timelabel}>{year}</span>
            </Box>
          )
        })}
      </Box>
    </>
  )
}

export default Timeline
