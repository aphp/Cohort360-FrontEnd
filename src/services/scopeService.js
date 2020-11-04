import api from './api'
import { CONTEXT } from '../constants'

export const getPerimeters = async (practitionerId) => {
  if (CONTEXT === 'aphp') {
    const practitionerRole = await api.get(
      `/PractitionerRole?practitioner=${practitionerId}&_elements=organization`
    )

    if (practitionerRole.data.entry) {
      const perimetersIds = practitionerRole.data.entry
        .map((e) => e.resource.organization.reference.substring(13))
        .join()

      const perimeters = await api.get(
        `/Group?managing-entity=${perimetersIds}&_elements=name,quantity,managingEntity`
      )

      return await perimeters.data.entry.map((e) => e.resource)
    }
  }
}

export const getSousGroups = async (perimeters) => {
  if (CONTEXT === 'aphp') {
    const perimetersGroupsIds = perimeters.map((e) =>
      e.managingEntity.display.substring(13)
    )

    const perimetersLength = perimetersGroupsIds.length

    let itemsProcessed = 0

    for (var i = 0; i < perimetersLength; i++) {
      itemsProcessed++

      const organization = await api.get(
        `/Organization?partof=${perimetersGroupsIds[i]}&_elements=id`
      )

      if (organization.data.entry) {
        const organizationIds = organization.data.entry.map(
          (e) => e.resource.id
        )

        const sousGroupsRequest = await api.get(
          `/Group?managing-entity=${organizationIds}&_elements=name,quantity,managingEntity`
        )

        if (sousGroupsRequest.data.entry) {
          const sousGroups = sousGroupsRequest.data.entry.map((e) => e.resource)

          sousGroups.forEach(async (element) => {
            element.parentId = perimeters[i].id
            perimeters.push(element)
          })

          const sousGroupsOrganizationsId = sousGroups.map((e) =>
            e.managingEntity.display.substring(13)
          )

          for (var j = 0; j < sousGroupsOrganizationsId.length; j++) {
            const sousOrganization = await api.get(
              `/Organization?partof=${sousGroupsOrganizationsId[j]}&_elements=id`
            )

            if (sousOrganization.data.entry) {
              const sousOrganizationIds = sousOrganization.data.entry.map(
                (e) => e.resource.id
              )

              const sousSousGroupsRequest = await api.get(
                `/Group?managing-entity=${sousOrganizationIds}&_elements=name,quantity,managingEntity`
              )

              if (sousSousGroupsRequest.data.entry) {
                const sousSousGroups = sousSousGroupsRequest.data.entry.map(
                  (e) => e.resource
                )

                sousSousGroups.forEach((element) => {
                  element.parentId = sousGroups[j].id
                  perimeters.push(element)
                })
              }
            }
          }
        }
      }

      if (itemsProcessed === perimetersLength) {
        perimeters.forEach((perimeter) => {
          perimeter.name = perimeter.name.replace('Patients passés par: ', '')
        })
        return perimeters
      }
    }
  }
}
