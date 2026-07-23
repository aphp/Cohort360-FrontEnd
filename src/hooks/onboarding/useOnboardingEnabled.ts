import { AppConfig } from 'config'
import { useContext } from 'react'
import { useAppSelector } from 'state'

// Resolves the onboarding feature flag for the current user. `enabled` turns the journey on for
// everyone; `allowedAphCodes` turns it on for the listed APH codes regardless of `enabled`, so a
// pilot runs with `enabled: false` and a filled list. Off for everyone is `enabled: false` with an
// empty list. The flag lives in the appConfig ConfigMap, so it toggles without redeploying the app.
const useOnboardingEnabled = () => {
  const appConfig = useContext(AppConfig)
  const aphCode = useAppSelector((state) => state.me?.userName)
  const { enabled, allowedAphCodes } = appConfig.features.onboarding

  return enabled || (!!aphCode && allowedAphCodes.includes(aphCode))
}

export default useOnboardingEnabled
