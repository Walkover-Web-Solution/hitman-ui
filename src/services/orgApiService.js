import http from './httpService'
import { redirectToDashboard, getDataFromProxyAndSetDataToLocalStorage } from '../components/common/utility'
import { getOrgList, orgListKey, getCurrentOrg, currentOrgKey } from '../components/auth/authServiceV2'
import { toast } from 'react-toastify'
const apiBaseUrl = process.env.REACT_APP_API_URL
const proxyUrl = process.env.REACT_APP_PROXY_URL

export function getOrgUpdatedAt(orgId) {
  return http.get(`${apiBaseUrl}/orgs/${orgId}/lastSync`)
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
  try {
    const data = {
      user: {
        name: name,
        email: email
      }
    }
    const res = await http.post(proxyUrl + '/addUser', data)
    if (res.status !== 201) {
      throw new (res?.message ? res.message : 'Please enter message correctly')()
    }
    toast.success('User added successfully')
    return res
  } catch (e) {
    if (e.response.status !== 418) {
      toast.error(e?.response?.data?.message ? e?.response?.data?.message : 'Something went wrong')
    } else {
      toast.error('Not Registered user')
    }
    return false
  }
}
