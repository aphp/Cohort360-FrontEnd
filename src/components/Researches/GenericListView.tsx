import React from 'react'
import { Grid } from '@mui/material'

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

  return (
    <Grid container gap={2}>
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

      {/* {form && ( */}
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
          onChange={(value) => setForm({ ...form, status: value })}
        />
        <CheckboxGroup
          value={form.favorite}
          onChange={(values) => {
            setForm({ ...form, favorite: values })
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
            setForm({ ...form, minPatients: values[0], maxPatients: values[1] })
          }}
          onError={setModalError}
        />
      </Modal>
      {/* )} */}
    </Grid>
  )
}

export default GenericCohortListView
