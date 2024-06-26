//WIP : work in progress
import React, { useState } from 'react'

import CriteriaLayout from 'components/ui/CriteriaLayout'
import { typeOfSelectedCriteria } from './utils'
import { BlockWrapper } from 'components/ui/Layout'
import { Autocomplete, FormLabel, TextField } from '@mui/material'
// import CalandarRange from 'components/ui/Inputs/CalendarRange'
// import NumericConditionInput from 'components/ui/Inputs/OccurencesWithFloats'
import OccurenceInput from 'components/ui/Inputs/Occurences'

import useStyles from './styles'
import { CriteriaDrawerComponentProps, DataJson } from 'types'
import { Comparators, CriteriaType, HospitDataType } from 'types/requestCriterias'
import PopulationCard from 'components/CreationCohort/DiagramView/components/PopulationCard/PopulationCard'

enum Error {
  EMPTY_FORM,
  EMPTY_DURATION_ERROR,
  INCOHERENT_AGE_ERROR,
  SEARCHINPUT_ERROR,
  NO_ERROR
}

type AutoFormulaGenerationProps = CriteriaDrawerComponentProps & {
  json: DataJson
}

const AutoFormulaGeneration: React.FC<AutoFormulaGenerationProps> = ({
  json,
  criteriaData,
  selectedCriteria,
  goBack,
  onChangeSelectedCriteria
}) => {
  const findCriteriaType = json.criteriaType
  const _selectedCriteriaType = 'HospitDataType'
  console.log('test selectedCriteriaType', _selectedCriteriaType)
  console.log('test findCriteriaType', findCriteriaType)
  const findCriteriaDefaultTitle = json.title
  console.log('test findCriteriaDefaultTitle', findCriteriaDefaultTitle)
  const findCriteriaName = json.name
  console.log('test findCriteriaName', findCriteriaName)
  const findCriteriaInputs = json.inputs
  console.log('test findCriteriaInputs', findCriteriaInputs)
  const criteria = selectedCriteria as HospitDataType
  const [title, setTitle] = useState(criteria?.title || findCriteriaDefaultTitle)
  const [isInclusive, setIsInclusive] = useState<boolean>(criteria?.isInclusive || true)
  const [occurrence, setOccurrence] = useState<number>(criteria?.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState<Comparators>(
    criteria?.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )
  const { classes } = useStyles()
  const isEdition = selectedCriteria !== null ? true : false
  const [error, setError] = useState(Error.NO_ERROR)

  const onSubmit = () => {
    return console.log('test onSubmit')
  }

  return (
    <>
      {findCriteriaInputs.map((input: any) => {
        console.log('test input', input)
        return (
          <>
            {input.field === 'CriteriaLayout' && (
              <CriteriaLayout
                criteriaLabel={`de ${findCriteriaName}`}
                title={title}
                onChangeTitle={setTitle}
                isEdition={isEdition}
                goBack={goBack}
                onSubmit={onSubmit}
                disabled={error === Error.INCOHERENT_AGE_ERROR || error === Error.EMPTY_FORM}
                isInclusive={isInclusive}
                onChangeIsInclusive={setIsInclusive}
                infoAlert={input.infoAlert}
                errorAlert={[
                  error === Error.EMPTY_FORM
                    ? "Merci de renseigner au moins un nombre d'occurrence supérieur ou égal à 1"
                    : ''
                ]}
              >
                {findCriteriaInputs.map((input: any) => {
                  return (
                    <>
                      {input.field === 'OccurenceInput' && (
                        <>
                          <BlockWrapper className={classes.inputItem}>
                            <FormLabel component="legend" className={classes.durationLegend}>
                              <BlockWrapper container justifyItems="center">
                                Nombre d'occurrences
                              </BlockWrapper>
                            </FormLabel>
                            <OccurenceInput
                              value={occurrence}
                              comparator={occurrenceComparator}
                              onchange={(newOccurence, newComparator) => {
                                setOccurrence(newOccurence)
                                setOccurrenceComparator(newComparator)
                              }}
                            />
                          </BlockWrapper>

                          {/* <BlockWrapper style={{ margin: '0 1em 1em' }}>
                            <PopulationCard
                              form={CriteriaName.VisitSupport}
                              label={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
                              title={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
                              executiveUnits={encounterService || []}
                              isAcceptEmptySelection={true}
                              isDeleteIcon={true}
                              onChangeExecutiveUnits={(newValue) => setEncounterService(newValue)}
                            />
                          </BlockWrapper> */}
                        </>
                      )}
                    </>
                  )
                })}
              </CriteriaLayout>
            )}
          </>
        )
      })}
    </>
  )
}

export default AutoFormulaGeneration
