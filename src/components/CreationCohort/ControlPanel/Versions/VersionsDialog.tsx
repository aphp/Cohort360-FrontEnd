import React, { useCallback, useMemo, useState } from 'react'
import services from 'services/aphp'
import { setMessage } from 'state/message'
import { useAppDispatch } from 'state'

import Modal from 'components/ui/Modal'
import Table from 'components/ui/Table'

import { QuerySnapshotInfo } from 'types'
import { getVersionName } from 'mappers/versions'
import { getVersionsTable } from './utils'

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

  const handleStartEdit = useCallback((version: QuerySnapshotInfo) => {
    setEditingVersionId(version.uuid)
    setEditingName(getVersionName(version))
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingVersionId(null)
    setEditingName('')
  }, [])

  const handleSaveEdit = useCallback(
    async (versionUuid: string) => {
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
    },
    [editingName, versions, onVersionUpdate, dispatch]
  )

  const tableData = useMemo(() => {
    return getVersionsTable(versions, editingVersionId, editingName, isLoading, setEditingName, {
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit
    })
  }, [versions, editingVersionId, editingName, isLoading, handleStartEdit, handleCancelEdit, handleSaveEdit])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gestion des versions de la requête"
      width="100%"
      readonly
      cancelText="Fermer"
      disabled={isLoading}
      maxWidth="md"
    >
      <Table value={tableData} noMarginBottom />
    </Modal>
  )
}

export default VersionsDialog
