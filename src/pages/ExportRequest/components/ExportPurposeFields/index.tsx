import React from 'react'

import { Grid, MenuItem, TextField, Typography } from '@mui/material'

import DateInput from 'components/ui/Inputs/DateInput'
import { ExportProjectDetails, ExportPurpose } from 'types/export'
import { DATE_ERROR_MESSAGES, isEndBeforeStart } from 'utils/dates'

import { PURPOSE_OPTIONS } from './purposes'

type DateField = 'start_date' | 'end_date'

type ExportPurposeFieldsProps = {
  purpose: ExportPurpose | null
  projectDetails: ExportProjectDetails
  onChangePurpose: (purpose: ExportPurpose) => void
  onChangeProjectDetails: (changes: Partial<ExportProjectDetails>) => void
  onIncompleteDate: (field: DateField, isIncomplete: boolean) => void
}

const PROJECT_TEXT_MAX_LENGTH = 255

const ExportPurposeFields = ({
  purpose,
  projectDetails,
  onChangePurpose,
  onChangeProjectDetails,
  onIncompleteDate
}: ExportPurposeFieldsProps) => {
  const selectedOption = PURPOSE_OPTIONS.find((option) => option.value === purpose)
  const endBeforeStart = isEndBeforeStart(projectDetails.start_date, projectDetails.end_date)

  return (
    <Grid container size={12} direction="column" gap="16px" style={{ marginTop: '20px' }}>
      <TextField
        id="export-purpose"
        select
        required
        fullWidth
        label="Finalité de l'export"
        value={purpose ?? ''}
        onChange={(event) => onChangePurpose(event.target.value as ExportPurpose)}
        helperText={selectedOption?.definition}
        style={{ backgroundColor: 'white' }}
        slotProps={{
          select: { renderValue: () => selectedOption?.label },
          formHelperText: { style: { backgroundColor: 'transparent', margin: '4px 0 0' } }
        }}
      >
        {PURPOSE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value} style={{ display: 'block', whiteSpace: 'normal' }}>
            <Typography>{option.label}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.definition}
            </Typography>
          </MenuItem>
        ))}
      </TextField>

      {purpose === ExportPurpose.INTERNAL_RESEARCH && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="export-project-title"
              required
              fullWidth
              label="Titre du projet, acronyme ou identifiant"
              value={projectDetails.title}
              onChange={(event) => onChangeProjectDetails({ title: event.target.value })}
              slotProps={{ htmlInput: { maxLength: PROJECT_TEXT_MAX_LENGTH } }}
              style={{ backgroundColor: 'white' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="export-project-leader"
              required
              fullWidth
              label="Porteur du projet"
              value={projectDetails.project_leader}
              onChange={(event) => onChangeProjectDetails({ project_leader: event.target.value })}
              slotProps={{ htmlInput: { maxLength: PROJECT_TEXT_MAX_LENGTH } }}
              style={{ backgroundColor: 'white' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DateInput
              label="Date de début du projet"
              defaultValue={projectDetails.start_date}
              onChange={(date) => onChangeProjectDetails({ start_date: date })}
              onIncomplete={(isIncomplete) => onIncompleteDate('start_date', isIncomplete)}
              clearable
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DateInput
              label="Date de fin du projet"
              defaultValue={projectDetails.end_date}
              onChange={(date) => onChangeProjectDetails({ end_date: date })}
              onIncomplete={(isIncomplete) => onIncompleteDate('end_date', isIncomplete)}
              error={endBeforeStart ? DATE_ERROR_MESSAGES.endBeforeStart : undefined}
              clearable
            />
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}

export default ExportPurposeFields
