import React, { useMemo } from 'react'
import { Grid, Typography } from '@mui/material'
import { FormNames } from 'types/searchCriterias'
import { CohortQuestionnaireResponse } from 'types'
import { Questionnaire } from 'fhir/r4'
import {
  formatHospitalisationDates,
  generateHospitDetails,
  generatePregnancyDetails,
  getBirthDeliveryDate,
  getDataFromForm
} from 'utils/formUtils'
import { pregnancyForm } from 'data/pregnancyData'
import FormCards from 'components/ui/FormCard'
import { DomainAdd, PregnantWoman } from '@mui/icons-material'
import labels from 'labels.json'
import { hospitForm } from 'data/hospitData'

interface TimelineProps {
  questionnaireResponses: CohortQuestionnaireResponse[]
  questionnaires: Questionnaire[]
}

const groupEventsByYear = (data: CohortQuestionnaireResponse[]) => {
  return data.reduce<Record<string, CohortQuestionnaireResponse[]>>((acc, curr) => {
    const year = new Date(curr.authored ?? '').getFullYear().toString()
    acc[year] = acc[year] || []
    acc[year].push(curr)
    return acc
  }, {})
}

const Timeline = ({ questionnaireResponses, questionnaires }: TimelineProps) => {
  const yearGroups = useMemo(() => groupEventsByYear(questionnaireResponses), [questionnaireResponses])
  const pregnancyFormId = useMemo(
    () => questionnaires.find((form) => form.name === FormNames.PREGNANCY)?.id ?? '',
    [questionnaires]
  )
  const years = useMemo(() => Object.keys(yearGroups).sort((a, b) => b.localeCompare(a)), [yearGroups])

  const generateFormInfo = (form: CohortQuestionnaireResponse) => {
    const isPregnancy = form.questionnaire?.includes(pregnancyFormId)
    const chipsInfo = isPregnancy
      ? [
          getDataFromForm(form, pregnancyForm.pregnancyType) ?? getDataFromForm(form, pregnancyForm.twinPregnancyType),
          `Début de grossesse : ${getDataFromForm(form, pregnancyForm.pregnancyStartDate)}`,
          `Unité exécutrice : ${form.serviceProvider}`
        ]
      : ([
          getBirthDeliveryDate(form, hospitForm),
          formatHospitalisationDates(form.hospitDates?.start, form.hospitDates?.end),
          `Unité exécutrice : ${form.serviceProvider}`
        ].filter(Boolean) as string[])

    const formDetails = isPregnancy ? generatePregnancyDetails(form) : generateHospitDetails(form)
    const cardColor = isPregnancy ? '#f194b4' : '#A8D178'
    const avatar = isPregnancy ? <PregnantWoman htmlColor="#F194B4" /> : <DomainAdd htmlColor="#A8D178" />
    const title = isPregnancy ? labels.formNames.pregnancy : labels.formNames.hospit
    return { chipsInfo, formDetails, cardColor, avatar, title }
  }

  return (
    <>
      {questionnaireResponses.length === 0 ? (
        <Grid container justifyContent="center">
          <Typography variant="button">Aucun formulaire à afficher</Typography>
        </Grid>
      ) : (
        <div style={{ flexGrow: 1, marginLeft: '1em' }}>
          {years.map((year) => (
            <div key={year}>
              <Typography variant="h6" sx={{ my: 1, fontSize: 15 }}>
                {year}
              </Typography>
              {yearGroups[year].map((form) => {
                const { chipsInfo, formDetails, cardColor, avatar, title } = generateFormInfo(form)
                return (
                  <FormCards
                    key={form.id}
                    cardColor={cardColor}
                    title={title}
                    chipsInfo={chipsInfo}
                    formDetails={formDetails}
                    avatar={avatar}
                  />
                )
              })}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Timeline
