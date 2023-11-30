import axios from 'axios';
import http from './httpService'
import { redirectToDashboard } from '../components/common/utility'
import { getOrgList, orgListKey, orgKey, getProxyToken } from "../components/auth/authServiceV2";
const apiBaseUrl = process.env.REACT_APP_API_URL
const proxyUrl = process.env.REACT_APP_PROXY_URL



var orgInstance = axios.create()
console.log(orgInstance, "orgInstance");
export function getOrgUpdatedAt(orgId) {
  return http.get(`${apiBaseUrl}/orgs/${orgId}/lastSync`)
}
function addProxyToken() {
  let proxyToken = getProxyToken();
  if (proxyToken) {
    orgInstance.defaults.headers.common.proxy_auth_token = proxyToken;
  }
  return orgInstance;
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
    
    await http.post(proxyUrl + '/switchCompany', { company_ref_id: orgId })
    updateOrgDataByOrgId(orgId)
    redirectToDashboard(orgId)

  } catch (error) {
    console.error('Error while calling switchCompany API:', error)
  }
}

export async function createOrg(name, timezone) {
  timezone = "+5:30"
  let data = {
    company: {
      name: name,
      timezone: timezone
    }
  }
   await http.post(`${proxyUrl}/createCompany`, data);
  //  updateOrgDataByOrgId(orgId)
  //  redirectToDashboard(orgId)
}


