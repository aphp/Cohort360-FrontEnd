import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'

import { QuerySnapshotInfo } from 'types'
import { Action, CellType, Row } from 'types/table'
import { plural } from 'utils/string'
import { getVersionName } from 'mappers/versions'
import { format } from 'utils/numbers'
import { formatDate } from 'utils/dates'

export const getVersionsTable = (
  versions: QuerySnapshotInfo[],
  editingVersionId: string | null,
  editingName: string,
  isLoading: boolean,
  setEditingName: (name: string) => void,
  handlers: {
    handleStartEdit: (version: QuerySnapshotInfo) => void
    handleCancelEdit: () => void
    handleSaveEdit: (versionUuid: string) => Promise<void>
  }
) => {
  const { handleStartEdit, handleCancelEdit, handleSaveEdit } = handlers
  const columns = [
    { label: '' },
    { label: 'Nom' },
    { label: 'Nb de patients' },
    { label: 'Date de création' },
    { label: '' }
  ]
  const rows = versions.map((version): Row => {
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
        type: version.cohorts_count > 0 ? CellType.TEXT : CellType.ICON,
        value:
          version.cohorts_count > 0
            ? ''
            : {
                icon: SupervisedUserCircleIcon,
                style: { color: '#f7a600b3', fontSize: '1.25rem' },
                tooltip: `${version.cohorts_count} cohorte${plural(version.cohorts_count)} créée${plural(
                  version.cohorts_count
                )} à partir de cette version.`
              },
        align: 'center',
        sx: {
          width: '40px'
        }
      },
      {
        id: `name-${version.uuid}`,
        type: isEditing ? CellType.TEXT_EDITION : CellType.TEXT,
        value: isEditing
          ? ({
              title: editingName,
              disabled: isLoading,
              onClick: (newName: string) => setEditingName(newName),
              color: '#303030'
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
          width: '60px'
        }
      }
    ]

    return row
  })

  return { columns, rows }
}
