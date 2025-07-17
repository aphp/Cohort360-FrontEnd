import { QuerySnapshotInfo } from 'types'

export const getVersionName = (version: QuerySnapshotInfo) => {
  return version.name ?? `Version ${version.version}`
}
