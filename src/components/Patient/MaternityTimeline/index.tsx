import React, { useEffect, useMemo } from 'react'
import { Grid, Typography } from '@mui/material'
import { FormNames } from 'types/searchCriterias'
import { CohortQuestionnaireResponse } from 'types'
import { Questionnaire } from 'fhir/r4'
import {
  buildFormItemsByLinkId,
  formatHospitalisationDates,
  generateHospitDetails,
  generatePregnancyDetails,
  getBirthDeliveryDate,
  getDataFromForm
} from 'utils/formUtils'
import FormCards from 'components/ui/FormCard'
import { DomainAdd, PregnantWoman } from '@mui/icons-material'
import labels from 'labels.json'
import { useAppDispatch, useAppSelector } from 'state'
import { initQuestionnairesFormData, selectFormItemsByFormName } from 'state/questionnairesFormData'
import { PREGNANCY_LINK_IDS } from 'constants/maternityLinkIds'

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
  const dispatch = useAppDispatch()
  const questionnairesFormData = useAppSelector((state) => state.questionnairesFormData)
  const hospitFormItems = useAppSelector((state) => selectFormItemsByFormName(state, FormNames.HOSPIT))
  const pregnancyFormItems = useAppSelector((state) => selectFormItemsByFormName(state, FormNames.PREGNANCY))

  useEffect(() => {
    if (!questionnairesFormData.loading && !questionnairesFormData.loaded) {
      dispatch(initQuestionnairesFormData())
    }
  }, [dispatch, questionnairesFormData.loading, questionnairesFormData.loaded])

  const hospitItemsByLinkId = useMemo(() => buildFormItemsByLinkId(hospitFormItems), [hospitFormItems])
  const pregnancyItemsByLinkId = useMemo(() => buildFormItemsByLinkId(pregnancyFormItems), [pregnancyFormItems])

  const yearGroups = useMemo(() => groupEventsByYear(questionnaireResponses), [questionnaireResponses])
  const pregnancyFormId = useMemo(
    () => questionnaires.find((form) => form.name === FormNames.PREGNANCY)?.id ?? '',
    [questionnaires]
  )
  const years = useMemo(() => Object.keys(yearGroups).sort((a, b) => b.localeCompare(a)), [yearGroups])

  const generateFormInfo = (form: CohortQuestionnaireResponse) => {
    const isPregnancy = form.questionnaire?.includes(pregnancyFormId)
    const cardColor = isPregnancy ? '#f194b4' : '#A8D178'
    const avatar = isPregnancy ? <PregnantWoman htmlColor="#F194B4" /> : <DomainAdd htmlColor="#A8D178" />
    const title = isPregnancy ? labels.formNames.pregnancy : labels.formNames.hospit

    try {
      const pregnancyTypeItem = pregnancyItemsByLinkId[PREGNANCY_LINK_IDS.pregnancyType]
      const twinPregnancyTypeItem = pregnancyItemsByLinkId[PREGNANCY_LINK_IDS.twinPregnancyType]
      const pregnancyStartDateItem = pregnancyItemsByLinkId[PREGNANCY_LINK_IDS.pregnancyStartDate]

      const chipsInfo = isPregnancy
        ? [
            (pregnancyTypeItem && getDataFromForm(form, pregnancyTypeItem)) ||
              (twinPregnancyTypeItem ? getDataFromForm(form, twinPregnancyTypeItem) : undefined) ||
              'N/A',
            `Début de grossesse : ${pregnancyStartDateItem ? getDataFromForm(form, pregnancyStartDateItem) : 'N/A'}`,
            `Unité exécutrice : ${form.serviceProvider}`
          ].filter(Boolean)
        : ([
            getBirthDeliveryDate(form, hospitItemsByLinkId),
            formatHospitalisationDates(form.hospitDates?.start, form.hospitDates?.end),
            `Unité exécutrice : ${form.serviceProvider}`
          ].filter(Boolean) as string[])

      const formDetails = isPregnancy
        ? generatePregnancyDetails(form, pregnancyItemsByLinkId)
        : generateHospitDetails(form, hospitItemsByLinkId)
      return { chipsInfo, formDetails, cardColor, avatar, title }
    } catch (error) {
      console.error(`Erreur lors du rendu du formulaire maternité ${form.id}`, error)
      return {
        chipsInfo: [`Unité exécutrice : ${form.serviceProvider ?? 'N/A'}`],
        formDetails: [],
        cardColor,
        avatar,
        title
      }
    }
  }

  return (
    <>
      {questionnaireResponses.length === 0 ? (
        <Grid container sx={{ justifyContent: 'center' }}>
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
