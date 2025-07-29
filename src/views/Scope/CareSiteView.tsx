import React, { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { closeAllOpenedPopulation } from 'state/scope'
import ScopeTree from 'components/ScopeTree'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement, SourceType } from 'types/scope'
import HeaderLayout from 'components/ui/Header'
import Button from 'components/ui/Button'
import PageContainer from 'components/ui/PageContainer'

const CareSiteView = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const population = useAppSelector((state) => state.scope.rights)
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<ScopeElement>[]>([])

  const handleNavigation = () => {
    const perimetresIds = selectedCodes.map((code) => code.cohort_id ?? null).filter(Boolean)
    const searchParams = new URLSearchParams({ groupId: perimetresIds.join(',') }).toString()
    navigate(`/perimeters?${searchParams}`)
  }

  useEffect(() => {
    dispatch(closeAllOpenedPopulation())
  }, [])

  return (
    <PageContainer direction="row" justifyContent={'center'} height="100vh">
      <HeaderLayout title="Explorer un périmètre" />
      <Grid size={11} sx={{ alignItems: 'center', height: 'calc(100vh - 175px)' }}>
        <ScopeTree
          selectedNodes={[]}
          baseTree={population}
          onSelect={(items) => setSelectedCodes(items)}
          sourceType={SourceType.ALL}
          sx={{ backgroundColor: '#FFF' }}
        />
        <Grid
          container
          size={12}
          sx={{
            justifyContent: 'center',
            position: 'fixed',
            bottom: 20,
            right: 0,
            backgroundColor: '#FFF'
          }}
        >
          <Grid container size={{ xs: 11 }} sx={{ justifyContent: 'flex-end' }}>
            <Button
              customVariant="secondary"
              disabled={!selectedCodes.length}
              onClick={handleNavigation}
              width="fit-content"
            >
              Valider
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default CareSiteView
