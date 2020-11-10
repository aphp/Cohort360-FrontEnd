import apiRequest from './apiRequest'

const fetchAdmissionModes = async () => {
  const resp = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_type`)

  console.log(resp)
  return resp.data.entry[0].resource.compose.include[0].concept
}

export default fetchAdmissionModes
// export default [
//   {
//     admissionModeCode: '01',
//     label: 'Admission générale'
//   },
//   {
//     admissionModeCode: '02',
//     label: 'Admission réduite'
//   },
//   {
//     admissionModeCode: '03',
//     label: 'Emergency'
//   },
//   {
//     admissionModeCode: '04',
//     label: 'Institute'
//   },
//   {
//     admissionModeCode: '05',
//     label: 'Interface'
//   },
//   {
//     admissionModeCode: '06',
//     label: 'Legacy data'
//   },
//   {
//     admissionModeCode: '07',
//     label: 'Non renseigné'
//   },
//   {
//     admissionModeCode: '08',
//     label: 'Pre'
//   },
//   {
//     admissionModeCode: '09',
//     label: 'Web'
//   }
// ]
