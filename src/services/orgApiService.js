import http from './httpService'
import { redirectToDashboard, getDataFromProxyAndSetDataToLocalStorage } from '../components/common/utility'
import { getOrgList, orgListKey, getCurrentOrg, currentOrgKey } from '../components/auth/authServiceV2'
import { toast } from 'react-toastify'
const apiBaseUrl = process.env.REACT_APP_API_URL
const proxyUrl = process.env.REACT_APP_PROXY_URL

export function getOrgUpdatedAt(orgId) {
  return http.get(`${apiBaseUrl}/orgs/${orgId}/lastSync`)
}

export async function fetchOrganizations() {
  try {
    const response = await http.get(`${proxyUrl}/getCompanies`);
    window.localStorage.setItem(orgListKey, JSON.stringify(response?.data?.data?.data));
  } catch (error) {
    console.error("Fetching organizations failed:", error);
  }
}

export async function leaveOrganization(orgId) {
  try {
    const response = await http.post(`${proxyUrl}/inviteAction/leave`, {company_id: orgId});
    if(response.status == '200') await fetchOrganizations()
  } catch (error) {
    console.error("Leaving organization failed:", error);
  }
}

export function updateOrgDataByOrgId(OrgId) {
  const data = getOrgList()
  let currentOrganisation;

  const targetIndex = data.findIndex((obj) => obj.id === OrgId)
  currentOrganisation = data[targetIndex]
  window.localStorage.setItem(currentOrgKey, JSON.stringify(currentOrganisation))
  window.localStorage.setItem(orgListKey, JSON.stringify(data))
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

async function createOrganizationAndRunCode() {
  toast.success('Organization Successfully Created')
}

export async function createOrg(name) {
  try {
    const data = { company: { name: name } }
    const newOrg = await http.post(proxyUrl + '/createCompany', data)
    const org = getCurrentOrg()
    updateOrgDataByOrgId(org.id)
    await getDataFromProxyAndSetDataToLocalStorage()
    await createOrganizationAndRunCode()
    await switchOrg(newOrg?.data?.data?.id)
  } catch (e) {
    toast.error(e?.response?.data?.message ? e?.response?.data?.message : "Something went wrong")
  }
}

export async function inviteMembers(name, email) {
  try{
    const data = {
      user: {
        name: name,
        email: email
      }
    }
    const res = await http.post(proxyUrl + '/addUser', data)
    toast.success('User added successfully')
    return res
  } catch (e) {
    console.error(e)
    toast.error('Cannot proceed at the moment. Please try again later')
  }
}
