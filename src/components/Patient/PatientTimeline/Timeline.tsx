import React, { useMemo, useState } from 'react'

import useStyles from './styles'
import { Box } from '@mui/material'
import { TimelineOutput, TimelineType } from './types'
import HospitItem from './HospitItem'
import { getConfig } from 'config'
import PmsiItem from './PmsiItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { CohortComposition, CohortEncounter, PMSIEntry } from 'types'
import { mapToTable } from 'components/ExplorationBoard/config/documents'
import Modal from 'components/ui/Modal'
import Table from 'components/ui/Table'
import { Condition, Procedure } from 'fhir/r4'

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
        maxWidth="lg"
        open={openHospitDialog}
        width="fit-content"
        readonly
        color="secondary"
        title="Documents"
        onClose={() => setOpenHospitDialog(false)}
      >
        <Table value={documentsTable} noMarginBottom />
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
                      {content?.map((item, index) => (
                        <Box
                          zIndex={1}
                          display="flex"
                          flexDirection="row"
                          key={`encounter ${item.data.id ?? index}`}
                          marginBottom={1}
                          marginTop={1}
                        >
                          {item.type === TimelineType.HOSPIT && (
                            <Box flex="0 0 calc(50% + 7.5px)">
                              <HospitItem
                                data={item.data as CohortEncounter}
                                onClick={handleClickDocuments}
                                isPeriod={item.end !== item.start}
                              />
                            </Box>
                          )}
                          {(item.type === TimelineType.CONDITION || item.type === TimelineType.PROCEDURE) && (
                            <>
                              <Box flex="0 0 calc(50% - 7.5px)"></Box>
                              <Box flex="1">
                                {item.type === TimelineType.CONDITION &&
                                  (() => {
                                    const condition = item.data as PMSIEntry<Condition>
                                    const code = condition.code?.coding?.[0]
                                    const description =
                                      code?.display && code?.code ? `${code.display} (${code.code})` : ''
                                    const date = condition.recordedDate ?? condition.meta?.lastUpdated
                                    return <PmsiItem date={date} description={description} status={null} />
                                  })()}
                                {item.type === TimelineType.PROCEDURE &&
                                  (() => {
                                    const procedure = item.data as PMSIEntry<Procedure>
                                    const code = procedure.code?.coding?.find(
                                      (c) => !getConfig().core.fhir.selectedCodeOnly || c.userSelected
                                    )
                                    const description =
                                      code?.display && code?.code ? `${code.display} (${code.code})` : ''
                                    const date = procedure.performedDateTime ?? procedure.meta?.lastUpdated
                                    const status = procedure.status
                                    return <PmsiItem date={date} description={description} status={status} />
                                  })()}
                              </Box>
                            </>
                          )}
                        </Box>
                      ))}
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
