import React, { ReactElement, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router'

import MenuBookIcon from '@mui/icons-material/MenuBook'

import HomeIcon from 'assets/icones/home-lg.svg?react'
import PatientIcon from 'assets/icones/user.svg?react'
import ResearchIcon from 'assets/icones/chart-bar.svg?react'

import { useAppSelector } from 'state'
import { AppConfig } from 'config'
import useOnboardingEnabled from 'hooks/onboarding/useOnboardingEnabled'
import { ONBOARDING_ROUTE, type OnboardingRouteState, type OnboardingSection } from 'views/Onboarding/route'

export type MenuChild = {
  id: string
  label: string
  visible?: boolean
  onClick?: () => void
  href?: string
}

export type MenuItem = MenuChild & {
  icon: ReactElement
  highlighted?: boolean
  children?: MenuChild[]
}

const isVisible = ({ visible = true }: MenuChild) => visible

const useMenuItems = (): MenuItem[] => {
  const navigate = useNavigate()
  const location = useLocation()
  const appConfig = useContext(AppConfig)
  const practitioner = useAppSelector((state) => state.me)
  const onboardingEnabled = useOnboardingEnabled()

  const identified = !practitioner?.deidentified
  const urlDoc = appConfig.system.urlDoc

  const openOnboardingSection = (section: OnboardingSection) => {
    navigate(ONBOARDING_ROUTE, {
      state: { from: location.pathname + location.search, section } satisfies OnboardingRouteState
    })
  }

  const items: MenuItem[] = [
    {
      id: 'accueil',
      label: 'Accueil',
      icon: <HomeIcon width="20px" fill="#FFF" />,
      onClick: () => navigate('/home')
    },
    {
      id: 'patients',
      label: 'Mes patients',
      icon: <PatientIcon width="20px" fill="#FFF" />,
      children: [
        {
          id: 'patientResearch-link',
          label: 'Rechercher un patient',
          visible: identified,
          onClick: () => navigate('/patient-search')
        },
        { id: 'myPatient-link', label: 'Tous mes patients', onClick: () => navigate('/my-patients') },
        { id: 'scoopeTree-link', label: 'Explorer un périmètre', onClick: () => navigate('/perimeter') }
      ]
    },
    {
      id: 'research',
      label: 'Mes recherches',
      icon: <ResearchIcon width="20px" fill="#FFF" />,
      children: [
        {
          id: 'exports-link',
          label: 'Mes exports',
          visible: identified && appConfig.features.export.enabled,
          onClick: () => navigate('/exports')
        },
        // {
        //   id: 'feasibility-reports-link',
        //   label: 'Mes rapports de faisabilité',
        //   onClick: () => navigate('/feasibility-reports')
        // },
        { id: 'myProjects-link', label: 'Mes projets', onClick: () => navigate('/researches/projects') },
        { id: 'myRequests-link', label: 'Mes requêtes', onClick: () => navigate('/researches/requests') },
        { id: 'myCohorts-link', label: 'Mes cohortes', onClick: () => navigate('/researches/cohorts') },
        { id: 'mySamples-link', label: 'Mes échantillons', onClick: () => navigate('/researches/samples') }
      ]
    },
    {
      id: 'about',
      label: 'À propos de Cohort360',
      icon: <MenuBookIcon width="20px" htmlColor="#FFF" />,
      visible: onboardingEnabled,
      children: [
        { id: 'myRights-link', label: 'Mes habilitations', onClick: () => openOnboardingSection('habilitations') },
        { id: 'myCommitments-link', label: 'Mes engagements', onClick: () => openOnboardingSection('engagements') },
        { id: 'myTutorials-link', label: 'Mes tutoriels', onClick: () => openOnboardingSection('tutoriels') },
        { id: 'documentation', label: 'Documentation', visible: !!urlDoc, href: urlDoc }
      ]
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: <MenuBookIcon width="20px" htmlColor="#FFF" />,
      visible: !onboardingEnabled && !!urlDoc,
      highlighted: true,
      href: urlDoc
    }
  ]

  return items.filter(isVisible).map((item) => ({ ...item, children: item.children?.filter(isVisible) }))
}

export default useMenuItems
