import { Grid } from '@mui/material'
import GenderIcon from 'components/ui/GenderIcon'
import Paragraphs, { Paragraph } from 'components/ui/Paragraphs'
import StatusChip from 'components/ui/StatusChip'
import React from 'react'
import { Card } from 'types/card'
import { GenderStatus } from 'types/searchCriterias'
import { CellType, Status } from 'types/table'

type InfoCardProps = {
  value: Card
}

const InfoCard = ({ value }: InfoCardProps) => {
  return (
    <Grid
      container
      sx={{
        borderBottom: '1px solid #e3e3e3',
        cursor: value.url ? 'pointer' : 'default'
      }}
      padding="10px 16px"
      alignItems="center"
      justifyContent="space-between"
      onClick={() => value.url && window.open(value.url)}
      id="card"
    >
      {value.sections.map((section) => (
        <Grid item xs={section.size} key={section.id} container>
          {section.lines.map((line, index) => (
            <Grid key={index} container item xs={12} id={`line-${line.id}`}>
              {line.type == CellType.TEXT && <p>{line.value as string}</p>}
              {line.type === CellType.GENDER_ICON && <GenderIcon key={line.id} gender={line.value as GenderStatus} />}
              {line.type == CellType.PARAGRAPHS && <Paragraphs value={line.value as Paragraph[]} />}
              {line.type == CellType.STATUS_CHIP &&
                (() => {
                  const IconComponent = (line.value as Status).icon
                  const icon = IconComponent ? <IconComponent style={{ fill: 'white', fontSize: 25 }} /> : undefined
                  return (
                    <StatusChip
                      label={(line.value as Status).label}
                      status={(line.value as Status).status}
                      icon={icon}
                    />
                  )
                })()}
            </Grid>
          ))}
        </Grid>
      ))}
    </Grid>
  )
}

export default InfoCard
