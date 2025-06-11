import React, { useRef, useState } from 'react'
import { Box, IconButton, MenuItem, Select, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import useStyles from './styles'
import ConfirmationDialog from 'components/ui/ConfirmationDialog/ConfirmationDialog'
import { CriteriaGroup, CriteriaGroupType } from 'types'
import CriteriaCount, { CriteriaCountType } from '../../../CriteriaCount'
import { useLogicalOperator } from './useLogicalOperator'
import { Comparators } from 'types/requestCriterias'
import { hasOptions } from './utils'
import IncludesIcon from 'assets/icones/includes.svg?react'
import ExcludesIcon from 'assets/icones/excludes.svg?react'

type LogicalOperatorItemProps = {
  itemId: number
  criteriaCount?: CriteriaCountType
}

type OperatorSelectorProps = {
  currentOperator: CriteriaGroup
  onChange: (value: CriteriaGroupType) => void
  onConfirm: (open: boolean) => void
}

type NumberSelectorProps = {
  currentOperator: Extract<CriteriaGroup, { type: CriteriaGroupType.N_AMONG_M }>
  onChange: (number: number) => void
}

type InclusiveSelectorProps = {
  currentOperator: CriteriaGroup
  isInclusive: boolean
  onChange: (value: boolean) => void
}

type LogicalOperatorDisplayProps = {
  value: CriteriaGroup
}

const LogicalOperatorDisplay = ({ value }: LogicalOperatorDisplayProps) => {
  const { classes } = useStyles()
  if (!value) return null
  const { type, isInclusive } = value
  if (hasOptions(value)) {
    if (type === CriteriaGroupType.OR_GROUP) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          {isInclusive ? (
            <Typography variant="h5" className={classes.textOperator}>
              OU
            </Typography>
          ) : (
            <Typography variant="h5" className={classes.textOperator}>
              NON OU
            </Typography>
          )}
        </Box>
      )
    }
    return (
      <Box display="flex" alignItems="center" gap={1}>
        {isInclusive ? <IncludesIcon /> : <ExcludesIcon />}
        {value.options.operator} {value.options.number}
      </Box>
    )
  }
  const label = type === CriteriaGroupType.OR_GROUP ? (isInclusive ? 'OU' : 'NON OU') : isInclusive ? 'ET' : 'NON ET'
  return (
    <Typography variant="h5" className={classes.textOperator}>
      {label}
    </Typography>
  )
}

const InclusiveSelector = ({ currentOperator, isInclusive, onChange }: InclusiveSelectorProps) => {
  const { classes } = useStyles()
  return (
    <Select
      id={`select-inclusive-${currentOperator.id}`}
      labelId="inclusive-simple-select-label"
      value={String(isInclusive)}
      classes={{ icon: classes.selectIcon }}
      className={classes.inputSelect}
      onChange={(event) => onChange(event.target.value === 'true')}
      style={{ color: 'currentColor', marginLeft: 8 }}
      variant="standard"
    >
      <MenuItem value="true">Inclure</MenuItem>
      <MenuItem value="false">Exclure</MenuItem>
    </Select>
  )
}

const NumberSelector = ({ currentOperator, onChange }: NumberSelectorProps) => {
  const numberOfCriteria = currentOperator.criteriaIds.length
  const { classes } = useStyles()
  return (
    <Select
      labelId="select-criteria-number"
      id={`select-value-${currentOperator.id}`}
      value={currentOperator.options.number ?? 0}
      type="number"
      classes={{ icon: classes.selectIcon }}
      className={classes.inputSelect}
      onChange={(event) => onChange(Number(event.target.value))}
      style={{ color: 'currentColor' }}
      variant="standard"
    >
      {numberOfCriteria > 0 ? (
        Array.from({ length: numberOfCriteria }, (_, i) => {
          const nb = i + 1
          return (
            <MenuItem key={nb} value={nb}>
              {nb}
            </MenuItem>
          )
        })
      ) : (
        <MenuItem key={0} value={0}>
          {0}
        </MenuItem>
      )}
    </Select>
  )
}

const OperatorSelector = ({ currentOperator, onChange, onConfirm }: OperatorSelectorProps) => {
  const { classes } = useStyles()

  const getDisplayType = (operator: CriteriaGroup): CriteriaGroupType => {
    if (hasOptions(operator)) {
      switch (operator.options.operator) {
        case Comparators.GREATER_OR_EQUAL:
          return CriteriaGroupType.AT_LEAST
        case Comparators.EQUAL:
          return CriteriaGroupType.EXACTLY
        case Comparators.GREATER:
          return CriteriaGroupType.AT_MOST
        default:
          return CriteriaGroupType.N_AMONG_M
      }
    }
    return operator.type
  }
  return (
    <Select
      labelId="inclusive-simple-select-label"
      id={`select-operator-${currentOperator.id}`}
      value={getDisplayType(currentOperator)}
      classes={{ icon: classes.selectIcon }}
      className={classes.inputSelect}
      onChange={(event) => {
        const newType = event.target.value as CriteriaGroupType
        if (newType !== CriteriaGroupType.AND_GROUP) onConfirm(true)
        onChange(newType)
      }}
      style={{ color: 'currentColor' }}
      variant="standard"
    >
      <MenuItem value={CriteriaGroupType.AND_GROUP}>tous les</MenuItem>
      <MenuItem value={CriteriaGroupType.OR_GROUP}>un des</MenuItem>
      <MenuItem value={CriteriaGroupType.AT_LEAST}>au moins</MenuItem>
      <MenuItem value={CriteriaGroupType.EXACTLY}>exactement</MenuItem>
      {/* <MenuItem value={CriteriaGroupType.AT_MOST}>au plus</MenuItem> */}
    </Select>
  )
}

const LogicalOperatorItem: React.FC<LogicalOperatorItemProps> = ({ itemId, criteriaCount }) => {
  const { classes } = useStyles()

  const timeout = useRef<NodeJS.Timeout | null>(null)

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState<boolean>(false)
  const {
    isMainOperator,
    currentOperator,
    handleChangeInclusive,
    handleChangeNumber,
    handleChangeOperator,
    deleteLogicalOperator,
    deleteInvalidConstraints
  } = useLogicalOperator(itemId)

  if (!currentOperator) return <></>
  return (
    <>
      <Box
        className={isMainOperator ? classes.mainLogicalOperator : classes.logicalOperator}
        id={`logical-operator-${itemId}`}
        style={{
          background: !currentOperator.isInclusive ? '#F2B0B0' : '#19235A',
          color: !currentOperator.isInclusive ? '#19235a' : 'white',
          padding: '0px 10px',
          width: 'fit-content'
        }}
        onMouseEnter={() => {
          setIsOpen(true)
          if (timeout.current) clearTimeout(timeout.current)
        }}
        onMouseLeave={() => (timeout.current = setTimeout(() => setIsOpen(false), 800))}
      >
        {itemId !== 0 ? <CriteriaCount criteriaCount={criteriaCount} /> : null}
        {isOpen && (
          <>
            <InclusiveSelector
              currentOperator={currentOperator}
              isInclusive={currentOperator.isInclusive ?? true}
              onChange={handleChangeInclusive}
            />
            <Typography variant="h5" className={classes.descriptionText}>
              les patients validant
            </Typography>
            <OperatorSelector
              currentOperator={currentOperator}
              onChange={handleChangeOperator}
              onConfirm={setOpenConfirmationDialog}
            />
            {hasOptions(currentOperator) && (
              <NumberSelector currentOperator={currentOperator} onChange={handleChangeNumber} />
            )}
            <Typography variant="h5" className={classes.descriptionText}>
              critère(s)
            </Typography>
            {!isMainOperator && (
              <IconButton className={classes.deleteButton} size="small" onClick={deleteLogicalOperator}>
                <DeleteIcon />
              </IconButton>
            )}
          </>
        )}
        {!isOpen && <LogicalOperatorDisplay value={currentOperator} />}
      </Box>

      <ConfirmationDialog
        open={openConfirmationDialog}
        onCancel={() => setOpenConfirmationDialog(false)}
        onClose={() => setOpenConfirmationDialog(false)}
        onConfirm={() => {
          deleteInvalidConstraints()
          handleChangeOperator(CriteriaGroupType.OR_GROUP)
        }}
        message={
          "L'ajout de contraintes temporelles n'étant possible que sur un groupe de critères ET, passer sur un groupe de critères OU vous fera perdre toutes les contraintes temporelles de ce groupe."
        }
      />
    </>
  )
}

export default LogicalOperatorItem
