import { ScopeTreeRow, ScopeType } from 'types'
import React from 'react'
import CareSiteRow from './components/CareSiteRow'

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

const CareSiteHierarchy = (props: CareSiteHierarchyProps) => {
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
  return (
    <React.Fragment key={Math.random()}>
      <CareSiteRow
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
      {openPopulation.find((id) => +row.id === id) &&
        row.subItems &&
        row.subItems.map((subItem: ScopeTreeRow) => (
          <CareSiteRow
            key={Math.random()}
            row={subItem}
            level={level + 1}
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
        ))}
    </React.Fragment>
  )
}
export default CareSiteHierarchy
