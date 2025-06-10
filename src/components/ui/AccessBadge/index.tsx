import React from 'react'
import { Chip, chipClasses, Skeleton, styled } from '@mui/material'
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'

export enum AccessLevel {
  NOMINATIVE = 'nominative',
  DEIDENTIFIED = 'deidentified'
}

type AccessBadgeProps = {
  accessLevel: AccessLevel
  loading?: boolean
}

const AccessBadgeChip = styled(Chip)(() => ({
  backgroundColor: '#FFF',
  padding: 4,
  [`&.${chipClasses.colorPrimary}`]: {
    color: '#153D8A'
  }
}))

const AccessBadge = ({ accessLevel, loading = false }: AccessBadgeProps) => {
  return loading ? (
    <Skeleton width={100} />
  ) : (
    <AccessBadgeChip
      color="primary"
      icon={
        accessLevel === AccessLevel.NOMINATIVE ? (
          <VisibilityOutlined fontSize="small" />
        ) : (
          <VisibilityOffOutlined fontSize="small" />
        )
      }
      label={`Accès ${accessLevel === AccessLevel.NOMINATIVE ? 'Nominatif' : 'Pseudonymisé'}`}
    />
  )
}

export default AccessBadge
