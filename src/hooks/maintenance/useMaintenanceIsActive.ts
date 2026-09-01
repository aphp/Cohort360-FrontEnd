import { useAppSelector } from 'state'

// L'exemption, tenue côté back, ne vaut que pour la maintenance partielle.
const useMaintenanceIsActive = () => {
  const maintenance = useAppSelector((state) => state.me?.maintenance)
  const exempted = useAppSelector((state) => state.me?.maintenanceExempted ?? false)

  if (!maintenance?.active) return false
  return !(exempted && maintenance.type === 'partial')
}

export default useMaintenanceIsActive
