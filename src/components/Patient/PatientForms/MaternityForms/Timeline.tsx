import React from 'react'
import { CircularProgress, Grid, Typography } from '@mui/material'
import { FormNames } from 'types/searchCriterias'
import HospitCard from './HospitCard'
import { CohortQuestionnaireResponse } from 'types'
import PregnancyCard from './PregnancyCard'
import { Questionnaire } from 'fhir/r4'

interface TimelineProps {
  loading: boolean
  questionnaireResponses: CohortQuestionnaireResponse[]
  questionnaires: Questionnaire[]
}

interface YearGroup {
  [year: string]: CohortQuestionnaireResponse[]
}

const groupEventsByYear = (data: CohortQuestionnaireResponse[]): YearGroup => {
  return data.reduce((acc, curr) => {
    const year = new Date(curr.authored ?? '').getFullYear().toString()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(curr)
    return acc
  }, {} as YearGroup)
}

const Timeline: React.FC<TimelineProps> = ({ loading, questionnaireResponses, questionnaires }) => {
  const yearGroups = groupEventsByYear(questionnaireResponses)
  const pregnancyFormId = questionnaires.find((form) => form.name === FormNames.PREGNANCY)?.id ?? ''

  const years = Object.keys(yearGroups).sort((a, b) => a.localeCompare(b))

  const render = () => {
    return (
      <>
        {questionnaireResponses.length === 0 ? (
          <Grid container justifyContent="center">
            <Typography variant="button">Aucun dossier de spécialité à afficher</Typography>
          </Grid>
        ) : (
          <div style={{ flexGrow: 1, marginLeft: '1em' }}>
            {years.reverse().map((year) => (
              <div key={year}>
                <Typography variant="h6" style={{ margin: '10px 0', fontSize: 15 }}>
                  {year}
                </Typography>
                {yearGroups[year].map((form) =>
                  form.questionnaire?.includes(pregnancyFormId) ? (
                    <PregnancyCard key={form.id} form={form} />
                  ) : (
                    <HospitCard key={form.id} form={form} />
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {loading ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : (
        render()
      )}
    </div>
  )
}

export default Timeline
