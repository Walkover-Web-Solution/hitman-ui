import http from './httpService'
import { redirectToDashboard } from '../components/common/utility'
import { getOrgList, orgListKey, orgKey, getProxyToken } from "../components/auth/authServiceV2";
const apiBaseUrl = process.env.REACT_APP_API_URL

export function getOrgUpdatedAt(orgId) {
  return http.get(`${apiBaseUrl}/orgs/${orgId}/lastSync`)
}

export function updateOrgDataByOrgId(OrgId) {
  let data = getOrgList();
  const targetIndex = data.findIndex(obj => obj.id === OrgId);
  if (targetIndex > 0) {
    [data[0], data[targetIndex]] = [data[targetIndex], data[0]];
  }
  window.localStorage.setItem(orgListKey, JSON.stringify(data))
  window.localStorage.setItem(orgKey, JSON.stringify(data[0]))
}

export async function switchOrg(orgId) {
  try {
    const proxyUrl = process.env.REACT_APP_PROXY_URL
    http.post(proxyUrl + '/switchCompany', { company_ref_id: orgId })
    updateOrgDataByOrgId(orgId)
    redirectToDashboard(orgId)

  } catch (error) {
    console.error('Error while calling switchCompany API:', error)
  }
}

