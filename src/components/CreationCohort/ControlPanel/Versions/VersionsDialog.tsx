import React, { useState } from 'react'
import services from 'services/aphp'
import { setMessage } from 'state/message'
import { useAppDispatch } from 'state'

import Modal from 'components/ui/Modal'
import Table from 'components/ui/Table'

import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

import { QuerySnapshotInfo } from 'types'
import { CellType, Row, Table as TableType, Action } from 'types/table'
import { format } from 'utils/numbers'
import { formatDate } from 'utils/formatDate'
import { getVersionName } from 'utils/versions'

type VersionsDialogProps = {
  open: boolean
  onClose: () => void
  versions: QuerySnapshotInfo[]
  onVersionUpdate: (updatedVersion: QuerySnapshotInfo) => void
}

const VersionsDialog: React.FC<VersionsDialogProps> = ({ open, onClose, versions, onVersionUpdate }) => {
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch()

  const handleStartEdit = (version: QuerySnapshotInfo) => {
    setEditingVersionId(version.uuid)
    setEditingName(getVersionName(version))
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
      dispatch(setMessage({ type: 'success', content: 'Le nom de la version a correctement été mis à jour' }))
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom de la version:', error)
      dispatch(setMessage({ type: 'error', content: "Erreur lors de l'édition du nom de la version" }))
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
              title: 'Annuler',
              icon: CancelIcon,
              color: '#ED6D91',
              onClick: handleCancelEdit,
              disabled: isLoading
            },
            {
              title: 'Valider',
              icon: CheckCircleIcon,
              color: '#1ca717',
              onClick: () => handleSaveEdit(version.uuid),
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
          type: isEditing ? CellType.TEXT_EDITION : CellType.TEXT,
          value: isEditing
            ? ({
                title: editingName,
                disabled: isLoading,
                onClick: (newName: string) => setEditingName(newName)
              } as Action)
            : getVersionName(version),
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
      disabled={isLoading}
    >
      <Table value={tableData} noMarginBottom />
    </Modal>
  )
}

export default VersionsDialog
