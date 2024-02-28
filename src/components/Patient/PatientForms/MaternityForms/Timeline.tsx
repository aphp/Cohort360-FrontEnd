import React from 'react'
import { CircularProgress, Typography } from '@mui/material'
import ArrowWithYears from './ArrowWithYears'
import { FormNames } from 'types/searchCriterias'
import HospitCard from './HospitCard'
import { CohortQuestionnaireResponse } from 'types'
import PregnancyCard from './PregnancyCard'
import { Questionnaire } from 'fhir/r4'

interface TimelineProps {
  loading: boolean
  questionnaireResponses: CohortQuestionnaireResponse[]
  maternityFormNamesIds: Questionnaire[]
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

const Timeline: React.FC<TimelineProps> = ({ loading, questionnaireResponses, maternityFormNamesIds }) => {
  const yearGroups = groupEventsByYear(questionnaireResponses)
  const pregnancyFormId = maternityFormNamesIds.find((form) => form.name === FormNames.PREGNANCY)?.id ?? ''

  console.log('yearGroups', yearGroups)
  const years = Object.keys(yearGroups).sort()

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <ArrowWithYears years={years} />
          <div style={{ flexGrow: 1 }}>
            {years.reverse().map((year) => (
              <div key={year}>
                <Typography variant="h6" style={{ margin: '10px 0' }}>
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
        </>
      )}
    </div>
  )
}

export default Timeline
