import { ScopeTreeRow, ScopeType } from 'types'
import React from 'react'
import ScopeTreeTableRow from './components/ScopeTreeTableRow'

type CareSiteHierarchyProps = {
  row: ScopeTreeRow
  level: number
  parentAccess: string
  openPopulation: number[]
  labelId: string
  onExpand: (rowId: number) => Promise<void>
  onSelect: (row: ScopeTreeRow) => Promise<ScopeTreeRow[]>
  isIndeterminate: (row: ScopeTreeRow) => boolean | undefined
  isSelected: (row: ScopeTreeRow) => boolean
  isSearchMode?: boolean
  executiveUnitType?: ScopeType
}

const ScopeTreeHierarchy = (props: CareSiteHierarchyProps) => {
  const {
    row,
    level,
    parentAccess,
    openPopulation,
    labelId,
    onExpand,
    onSelect,
    isIndeterminate,
    isSelected,
    isSearchMode,
    executiveUnitType
  } = props
  const displayScopeTreeTableRow = (
    row: ScopeTreeRow,
    level: number,
    parentAccess: string,
    openPopulation: number[],
    labelId: string,
    onExpand: (rowId: number) => Promise<void>,
    onSelect: (row: ScopeTreeRow) => Promise<ScopeTreeRow[]>,
    isIndeterminate: (row: ScopeTreeRow) => boolean | undefined,
    isSelected: (row: ScopeTreeRow) => boolean,
    isSearchMode?: boolean,
    executiveUnitType?: ScopeType
  ) => {
    return (
      <React.Fragment key={Math.random()}>
        <ScopeTreeTableRow
          row={row}
          level={level}
          parentAccess={parentAccess}
          openPopulation={openPopulation}
          labelId={labelId}
          onExpand={onExpand}
          onSelect={onSelect}
          isIndeterminate={isIndeterminate}
          isSelected={isSelected}
          isSearchMode={isSearchMode}
          executiveUnitType={executiveUnitType}
        />
        {openPopulation.find((id) => Number(row.id) === id) &&
          row.subItems &&
          row.subItems.map((subItem: ScopeTreeRow) =>
            displayScopeTreeTableRow(
              subItem,
              level + 1,
              parentAccess,
              openPopulation,
              labelId,
              onExpand,
              onSelect,
              isIndeterminate,
              isSelected,
              isSearchMode,
              executiveUnitType
            )
          )}
      </React.Fragment>
    )
  }

  return displayScopeTreeTableRow(
    row,
    level,
    parentAccess,
    openPopulation,
    labelId,
    onExpand,
    onSelect,
    isIndeterminate,
    isSelected,
    isSearchMode,
    executiveUnitType
  )
}
export default ScopeTreeHierarchy
