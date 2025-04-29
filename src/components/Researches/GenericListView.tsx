import React from 'react'
import { Grid } from '@mui/material'

import ActionBar from './ActionBar'
import Modal from 'components/ui/Modal'
import CohortStatusFilter from 'components/Filters/CohortsStatusFilter'
import CohortsTypesFilter from 'components/Filters/CohortsTypeFilter'
import PatientsNbFilter from 'components/Filters/PatientsNbFilter'
import { FilterKeys, FilterValue } from 'types/searchCriterias'
import { statusOptions } from 'utils/explorationUtils'
import useCohortListController from '../../hooks/researches/useCohortListController'

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
      category: FilterKeys
      label: string
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
    page,
    maintenanceIsActive,
    openFiltersModal,
    setOpenFiltersModal,
    handlePageChange,
    changeOrderBy,
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
            onRemoveFilters={(k, v) => removeFilterChip(k, v as string)}
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
        onSubmit={applyFilters}
      >
        <CohortStatusFilter name={FilterKeys.STATUS} allStatus={statusOptions} value={controller.filters.status} />
        <CohortsTypesFilter name={FilterKeys.FAVORITE} value={controller.filters.favorite} />
        <PatientsNbFilter
          names={[FilterKeys.MIN_PATIENTS, FilterKeys.MAX_PATIENTS]}
          values={[controller.filters.minPatients, controller.filters.maxPatients]}
        />
      </Modal>
    </Grid>
  )
}

export default GenericCohortListView
