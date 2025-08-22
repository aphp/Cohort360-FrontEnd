import React, { useCallback } from 'react'
import { Grid } from '@mui/material'

import isEqual from 'lodash/isEqual'

import ActionBar from './ActionBar'
import CheckboxGroup from 'components/ui/Inputs/CheckboxGroup'
import Modal from 'components/ui/Modal'
import MultiSelect from 'components/ui/Inputs/MultiSelect'
import NumberRange from 'components/ui/Inputs/NumberRange'
import { FilterKeys, FilterValue, SearchCriteriaKeys } from 'types/searchCriterias'
import { statusOptions } from 'utils/explorationUtils'
import useCohortListController from '../../hooks/researches/useCohortListController'
import { CohortsType, CohortsTypeLabel } from 'types/cohorts'

interface GenericCohortListViewProps<TItem, TTableProps> {
  controller: ReturnType<typeof useCohortListController<TItem>>
  itemLabel: 'cohorte' | 'échantillon'
  TableComponent: React.ComponentType<TTableProps>
  tableProps: Omit<
    TTableProps,
    'list' | 'total' | 'loading' | 'page' | 'setPage' | 'order' | 'onChangeOrderBy' | 'disabled'
  >
  actionBarProps: {
    totalSelected: number
    onDelete: () => void
    onMove?: () => void
    onAddRequest?: () => void
    onAddSample?: () => void
    filters?: {
      value: FilterValue
      category: FilterKeys | SearchCriteriaKeys
      label: string
      disabled?: boolean
    }[]
  }
  header?: React.ReactNode
  simplified?: boolean
}

const GenericCohortListView = <TItem, TTableProps = any>({
  controller,
  itemLabel,
  TableComponent,
  tableProps,
  actionBarProps,
  header,
  simplified = false
}: GenericCohortListViewProps<TItem, TTableProps>) => {
  const {
    list,
    total,
    loading,
    order,
    changeOrderBy,
    page,
    handlePageChange,
    maintenanceIsActive,
    openFiltersModal,
    setOpenFiltersModal,
    form,
    setForm,
    modalError,
    setModalError,
    removeFilterChip,
    applyFilters
  } = controller

  const handleStatusChange = useCallback(
    (value: typeof form.status) => {
      setForm((prev) => (isEqual(prev.status, value) ? prev : { ...prev, status: value }))
    },
    [setForm]
  )

  const handleFavoriteChange = useCallback(
    (values: typeof form.favorite) => {
      setForm((prev) => (isEqual(prev.favorite, values) ? prev : { ...prev, favorite: values }))
    },
    [setForm]
  )

  const handlePatientsChange = useCallback(
    (values: [string | undefined, string | undefined]) => {
      setForm((prev) => {
        const [min, max] = values
        return prev.minPatients === min && prev.maxPatients === max
          ? prev
          : { ...prev, minPatients: min, maxPatients: max }
      })
    },
    [setForm]
  )

  return (
    <Grid container gap={2} size={12}>
      {!simplified && (
        <>
          {header}

          <ActionBar
            loading={loading}
            total={total}
            label={itemLabel}
            totalSelected={actionBarProps.totalSelected ?? 0}
            onDelete={actionBarProps.onDelete}
            onMove={actionBarProps?.onMove}
            onAddRequest={actionBarProps?.onAddRequest}
            onAddSample={actionBarProps?.onAddSample}
            onFilter={() => setOpenFiltersModal(true)}
            filters={actionBarProps?.filters}
            onRemoveFilters={(k, v) => removeFilterChip(k as FilterKeys, v as string)}
            disabled={maintenanceIsActive}
          />
        </>
      )}

      <TableComponent
        list={list}
        total={total}
        loading={loading}
        page={page}
        setPage={handlePageChange}
        order={order}
        onChangeOrderBy={changeOrderBy}
        disabled={maintenanceIsActive}
        simplified={simplified}
        {...(tableProps as any)}
      />

      <Modal
        title="Filtrer par :"
        width="600px"
        open={openFiltersModal}
        onClose={() => setOpenFiltersModal(false)}
        onSubmit={() => applyFilters(form)}
        isError={modalError}
      >
        <MultiSelect
          value={form.status ?? []}
          label="Statut :"
          options={statusOptions}
          onChange={(value) => handleStatusChange(value)}
        />
        <CheckboxGroup
          value={form.favorite}
          onChange={(values) => {
            handleFavoriteChange(values)
          }}
          label="Favoris :"
          options={[
            { id: CohortsType.FAVORITE, label: CohortsTypeLabel.FAVORITE },
            { id: CohortsType.NOT_FAVORITE, label: CohortsTypeLabel.NOT_FAVORITE }
          ]}
        />
        <NumberRange
          type="patient(s)"
          values={[form.minPatients, form.maxPatients]}
          label="Nombre de patients"
          onChange={(values) => {
            handlePatientsChange(values as [string | undefined, string | undefined])
          }}
          onError={setModalError}
        />
      </Modal>
    </Grid>
  )
}

export default GenericCohortListView
