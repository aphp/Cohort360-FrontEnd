import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import MaterialTable from 'material-table'
import useStyles, { itemStyles } from './styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'

import { useSelector } from 'react-redux'
import { getPerimeters, getSousGroups } from '../../services/scopeService'

const ScopeTree = ({ valid }) => {
  const classes = useStyles()

  const [scope, setScope] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState(new Set())

  const practitioner = useSelector((state) => state.practitioner)

  useEffect(() => {
    setLoading(true)
    fetchData()
      .then((res) => setScope(res))
      .then(() => setLoading(false))
  }, [])

  const fetchData = async () => {
    const perimeters = await getPerimeters(practitioner.practitionerID)

    const sousGroups = await getSousGroups(perimeters)

    return await sousGroups
  }

  return (
    <div className={classes.container}>
      {loading ? (
        <Grid container justify="center">
          <CircularProgress className={classes.loadingSpinner} size={50} />
        </Grid>
      ) : (
        <MaterialTable
          columns={[
            { title: 'Nom', field: 'name' },
            {
              title: 'Nombre de patients',
              field: 'quantity',
              searchable: false
            }
          ]}
          data={scope}
          parentChildData={(child, items) =>
            items.find((item) => item.id === child.parentId)
          }
          options={{
            showTitle: false,
            draggable: false,
            paging: false,
            actionsColumnIndex: -1,
            selection: true,
            toolbar: false,
            headerStyle: {
              height: '42px',
              backgroundColor: '#D1E2F4',
              textTransform: 'uppercase',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#0063af'
            },
            rowStyle: (rowData) => {
              switch (rowData.type) {
                case 'group':
                  return itemStyles.group
                case 'hospital':
                  return itemStyles.hospital
                case 'service':
                  return itemStyles.service
                default:
                  return itemStyles.unit
              }
            }
          }}
          onSelectionChange={(rows) => setSelectedItems(new Set(rows))}
        />
      )}
      <div className={classes.buttons}>
        <Button
          variant="contained"
          disableElevation
          disabled={!selectedItems.size}
          onClick={fetchData}
          className={classes.cancelButton}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!selectedItems.size}
          onClick={() => {
            valid(selectedItems)
          }}
          className={classes.validateButton}
        >
          Valider
        </Button>
      </div>
    </div>
  )
}

ScopeTree.propTypes = {
  title: PropTypes.string,
  valid: PropTypes.func.isRequired
}

export default ScopeTree
