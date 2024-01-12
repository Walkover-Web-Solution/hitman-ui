import http from './httpService'
import { redirectToDashboard, getDataFromProxyAndSetDataToLocalStorage } from '../components/common/utility'
import { getOrgList, orgListKey, orgKey, getCurrentOrg } from '../components/auth/authServiceV2'
import { toast } from 'react-toastify'
const apiBaseUrl = process.env.REACT_APP_API_URL
const proxyUrl = process.env.REACT_APP_PROXY_URL

export function getOrgUpdatedAt(orgId) {
  return http.get(`${apiBaseUrl}/orgs/${orgId}/lastSync`)
}

export function updateOrgDataByOrgId(OrgId) {
  const data = getOrgList()
  const targetIndex = data.findIndex((obj) => obj.id === OrgId)
  if (targetIndex > 0) {
    ;[data[0], data[targetIndex]] = [data[targetIndex], data[0]]
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

async function createOrganizationAndRunCode() {
  toast.success('Organization Successfully Created')
}

export async function createOrg(name) {
  try {
    const data = { company: { name: name } }
    await http.post(proxyUrl + '/createCompany', data)
    const org = getCurrentOrg()
    updateOrgDataByOrgId(org.id)
    await getDataFromProxyAndSetDataToLocalStorage()
    await createOrganizationAndRunCode()
    redirectToDashboard(org.id)
  } catch (e) {
    console.log(e)
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
    if (res.status !== 200) {
      throw new (res?.message ? res.message : 'Please enter message correctly')()
    }
    toast.success('User added successfully')
    return true
  } catch (e) {
    toast.error(e?.message ? e.message : 'Something went wrong')
    return false
  }
}
