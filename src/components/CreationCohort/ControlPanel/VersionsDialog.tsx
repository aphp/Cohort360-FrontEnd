import React, { useState } from 'react'

import { TextField } from '@mui/material'
import Modal from 'components/ui/Modal'
import Table from 'components/ui/Table'

import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CancelIcon from '@mui/icons-material/Cancel'

import { QuerySnapshotInfo } from 'types'
import { CellType, Row, Table as TableType, Action } from 'types/table'
import { format } from 'utils/numbers'
import { formatDate } from 'utils/formatDate'
import services from 'services/aphp'

interface VersionsDialogProps {
  open: boolean
  onClose: () => void
  versions: QuerySnapshotInfo[]
  onVersionUpdate: (updatedVersion: QuerySnapshotInfo) => void
}

const VersionsDialog: React.FC<VersionsDialogProps> = ({ open, onClose, versions, onVersionUpdate }) => {
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleStartEdit = (version: QuerySnapshotInfo) => {
    setEditingVersionId(version.uuid)
    setEditingName(version.name ?? `Version ${version.version}`)
  }

  const handleCancelEdit = () => {
    setEditingVersionId(null)
    setEditingName('')
  }

  const handleSaveEdit = async (versionUuid: string) => {
    if (!editingName.trim()) return

    setIsLoading(true)
    try {
      await services.cohortCreation.updateSnapshotName(versionUuid, editingName.trim())

      const versionToUpdate = versions.find((v) => v.uuid === versionUuid)
      if (versionToUpdate) {
        const updatedVersion: QuerySnapshotInfo = {
          ...versionToUpdate,
          name: editingName.trim()
        }
        onVersionUpdate(updatedVersion)
      }

      setEditingVersionId(null)
      setEditingName('')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom de la version:', error)
      // TODO: Ajouter une gestion d'erreur utilisateur (toast, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  const tableData: TableType = {
    columns: [
      { label: '' },
      { label: 'Nom' },
      { label: 'Nb de patients' },
      { label: 'Date de création' },
      { label: '' }
    ],
    rows: versions.map((version): Row => {
      const isEditing = editingVersionId === version.uuid

      const editActions: Action[] = isEditing
        ? [
            {
              title: 'Valider',
              icon: CheckIcon,
              onClick: () => handleSaveEdit(version.uuid),
              disabled: isLoading
            },
            {
              title: 'Annuler',
              icon: CancelIcon,
              onClick: handleCancelEdit,
              disabled: isLoading
            }
          ]
        : [
            {
              title: 'Éditer cette version',
              icon: EditIcon,
              onClick: () => handleStartEdit(version)
            }
          ]

      const row: Row = [
        {
          id: `cohortTotal-${version.uuid}`,
          type: CellType.HAS_COHORTS,
          value: version.cohorts_count,
          align: 'center',
          sx: {
            width: '60px'
          }
        },
        {
          id: `name-${version.uuid}`,
          type: CellType.TEXT,
          value: isEditing ? (
            <TextField
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit(version.uuid)
                } else if (e.key === 'Escape') {
                  handleCancelEdit()
                }
              }}
              autoFocus
              fullWidth
              size="small"
              variant="outlined"
              disabled={isLoading}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '14px'
                }
              }}
            />
          ) : (
            version.name ?? `Version ${version.version}`
          ),
          sx: {
            width: '300px',
            maxWidth: '300px',
            whiteSpace: isEditing ? 'normal' : 'nowrap',
            overflow: isEditing ? 'visible' : 'hidden',
            textOverflow: isEditing ? 'clip' : 'ellipsis'
          }
        },
        {
          id: `patients-${version.uuid}`,
          type: CellType.TEXT,
          value: format(version.patients_count),
          sx: {
            width: '120px'
          }
        },
        {
          id: `date-${version.uuid}`,
          type: CellType.TEXT,
          value: formatDate(version.created_at, true),
          sx: {
            width: '140px',
            whiteSpace: 'nowrap'
          }
        },
        {
          id: `actions-${version.uuid}`,
          type: CellType.ACTIONS,
          value: editActions,
          align: 'center',
          sx: {
            width: isEditing ? '120px' : '60px'
          }
        }
      ]

      return row
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gestion des versions de la requête"
      width="100%"
      readonly
      cancelText="Fermer"
    >
      <Table value={tableData} />
    </Modal>
  )
}

export default VersionsDialog
