import { AppConfig } from 'config'
import { useContext } from 'react'
import { useAppSelector } from 'state'

// Resolves the onboarding feature flag for the current user. An empty allow-list means the flag is
// active for everyone; a non-empty list restricts it to the APH codes it contains. Editing the flag
// lives in the appConfig ConfigMap, so it toggles without redeploying the application.
const useOnboardingEnabled = () => {
  const appConfig = useContext(AppConfig)
  const aphCode = useAppSelector((state) => state.me?.userName)
  const { enabled, allowedAphCodes } = appConfig.features.onboarding

  return enabled && !!aphCode && (allowedAphCodes.length === 0 || allowedAphCodes.includes(aphCode))
}

export default useOnboardingEnabled
