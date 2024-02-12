import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import { QuestionnaireResponse } from 'fhir/r4'
import ArrowWithYears from './ArrowWithYears'
import { getDataFromForm } from 'utils/formUtils'
import { pregnancyForm } from 'data/pregnancyData'
import moment from 'moment'

interface TimelineProps {
  questionnaireResponses: QuestionnaireResponse[]
}

interface YearGroup {
  [year: string]: QuestionnaireResponse[]
}

const groupEventsByYear = (data: QuestionnaireResponse[]): YearGroup => {
  return data.reduce((acc, curr) => {
    const year = new Date(curr.authored ?? '').getFullYear().toString()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(curr)
    return acc
  }, {} as YearGroup)
}

const Timeline: React.FC<TimelineProps> = ({ questionnaireResponses }) => {
  const yearGroups = groupEventsByYear(questionnaireResponses)

  console.log('yearGroups', yearGroups)
  const years = Object.keys(yearGroups).sort()

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <ArrowWithYears years={years} />
      <div style={{ flexGrow: 1 }}>
        {years.reverse().map((year) => (
          <div key={year}>
            <Typography variant="h6" style={{ margin: '10px 0' }}>
              {year}
            </Typography>
            {yearGroups[year].map((form) => (
              <Card key={form.id} style={{ margin: '10px 0' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom></Typography>
                  <Typography variant="body2" component="p">
                    {getDataFromForm(form, pregnancyForm.pregnancyType)}
                  </Typography>
                  <Typography variant="body2" component="p">
                    Début de grossesse :{' '}
                    {moment(getDataFromForm(form, pregnancyForm.pregnancyStartDate)).format('DD/MM/YYYY')}
                  </Typography>
                  <Typography variant="body2" component="p">
                    Unité exécutrice : todo
                  </Typography>
                  {/* <Button onClick={() => setTogglePregnancyDetails(form)}>+ de détails</Button> */}
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Timeline
