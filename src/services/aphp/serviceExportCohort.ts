import { fetchExportTableInfo } from 'services/aphp/callApi'
import { getConfig } from 'config'

export const exportTablesInfo = () => {
  try {
    const response = fetchExportTableInfo({ tableNames: getConfig().features.export.exportTables })
    return response
  } catch (error) {
    console.log('une erreur est survenue:', error)
    return []
  }
}

export const exportTablesRelationsInfo = () => {
  console.log('le code pour obtenir les relations entre les tables')
  try {
    const lol = ''
    console.log(lol)
  } catch (error) {
    return error
  }
}
