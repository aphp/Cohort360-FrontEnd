// components/Header.tsx
import React from 'react'
import { Box, Typography, Tabs, Tab, Chip, IconButton } from '@mui/material'
import { FC } from 'react'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

type HeaderType = 'cohorte' | 'mes-patients' | 'perimetre' | 'patient' | 'recherche'

interface HeaderProps {
  type: HeaderType
  title: string
  subtitle?: string
  chips?: string[]
  showBackButton?: boolean
  showStar?: boolean
  infoLines?: string[]
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  accessType?: 'nominatif' | 'pseudonymisé'
}

const Header: FC<HeaderProps> = ({
  type,
  title,
  subtitle,
  chips,
  showBackButton,
  showStar,
  infoLines,
  tabs,
  activeTab,
  onTabChange,
  accessType
}) => {
  return (
    <Box sx={{ backgroundColor: '#e8f0fa', padding: 2 }}>
      {/* Back button */}
      {showBackButton && (
        <IconButton size="small" sx={{ mb: 1 }}>
          <ArrowBackIcon fontSize="small" />
          <Typography variant="caption" sx={{ ml: 1 }}>
            Retour vers la cohorte
          </Typography>
        </IconButton>
      )}

      {/* Title line */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h1" fontWeight={700}>
          {title}
        </Typography>
        {accessType && (
          <Chip
            label={`Accès ${accessType === 'nominatif' ? 'Nominatif' : 'Pseudonymisé'}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        )}
      </Box>

      {/* Subtitle */}
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}

      {/* Chips */}
      {chips && (
        <Box sx={{ my: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {chips.map((chip, index) => (
            <Chip key={index} label={chip} size="small" />
          ))}
        </Box>
      )}

      {/* Info lines */}
      {infoLines && (
        <Box sx={{ mt: 1 }}>
          {infoLines.map((line, index) => (
            <Typography key={index} variant="body2">
              {line}
            </Typography>
          ))}
        </Box>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => onTabChange(val)}
        sx={{ mt: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.map((tab) => (
          <Tab key={tab} label={tab} value={tab} />
        ))}
      </Tabs>
    </Box>
  )
}

export default Header
