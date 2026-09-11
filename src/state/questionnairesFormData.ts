import { createSlice, createEntityAdapter, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import type { RootState } from 'state'
import { logout } from './me'
import type { FormItem } from 'utils/questionnaireFormData'

const questionnairesFormDataAdapter = createEntityAdapter<FormItem>()

const fetchQuestionnairesFormData = async (): Promise<FormItem[]> => {
  const [{ fetchQuestionnaires }, { getApiResponseResources }, { FormNames }, { extractFormItems }] = await Promise.all(
    [
      import('services/aphp/callApi'),
      import('utils/apiHelpers'),
      import('types/searchCriterias'),
      import('utils/questionnaireFormData')
    ]
  )

  const maternityQuestionnaires = `${FormNames.PREGNANCY},${FormNames.HOSPIT}`
  const response = await fetchQuestionnaires({
    name: maternityQuestionnaires,
    _elements: ['id', 'name', 'item']
  })
  const questionnaires = getApiResponseResources(response) ?? []
  return questionnaires.flatMap((questionnaire) =>
    questionnaire.name ? extractFormItems(questionnaire, questionnaire.name) : []
  )
}

export const initQuestionnairesFormData = createAsyncThunk('questionnairesFormData/init', async () => {
  return await fetchQuestionnairesFormData()
})

const questionnairesFormDataSlice = createSlice({
  name: 'questionnairesFormData',
  initialState: questionnairesFormDataAdapter.getInitialState({
    loading: false,
    error: false,
    loaded: false
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () =>
        questionnairesFormDataAdapter.getInitialState({ loading: false, error: false, loaded: false })
      )
      .addCase(initQuestionnairesFormData.pending, (state) => {
        state.loading = true
        state.error = false
      })
      .addCase(initQuestionnairesFormData.fulfilled, (state, action) => {
        questionnairesFormDataAdapter.setAll(state, action.payload)
        state.loading = false
        state.loaded = true
      })
      .addCase(initQuestionnairesFormData.rejected, (state) => {
        state.loading = false
        state.error = true
      })
  }
})

const selectors = questionnairesFormDataAdapter.getSelectors((state: RootState) => state.questionnairesFormData)

export const selectFormItemByName = createSelector(
  [
    selectors.selectAll,
    (_state: RootState, formName: string) => formName,
    (_state, _formName, linkId: string) => linkId
  ],
  (formItems, formName, linkId) => formItems.find((item) => item.formName === formName && item.linkId === linkId)
)

export const selectFormItemsByFormName = createSelector(
  [selectors.selectAll, (_state: RootState, formName: string) => formName],
  (formItems, formName) => formItems.filter((item) => item.formName === formName)
)

export default questionnairesFormDataSlice.reducer
