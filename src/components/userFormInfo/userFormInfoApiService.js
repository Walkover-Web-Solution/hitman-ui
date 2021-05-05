import http from '../../services/httpService'

const eblApiUrl = process.env.REACT_APP_EBL_API_BASE_URL

export function updateOrganization (orgId, orgObject) {
  return http.put(`${eblApiUrl}/orgs/${orgId}.json`, orgObject)
}

export function sendUserFormInfo (formObject) {
  return http.post('https://sokt.io/app/zxHCHFLoFoYtMo8ZqabW/user-data', formObject)
}

export default {
  updateOrganization,
  sendUserFormInfo
}
