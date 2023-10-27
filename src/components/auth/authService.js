import http from '../../services/httpService'
import history from '../../history'
import Cookies from 'universal-cookie'
import { isElectron } from '../common/utility'
const apiEndpoint = process.env.REACT_APP_API_URL + '/profile'
const apiUrl = process.env.REACT_APP_API_URL
const signUpNotifierUrl = process.env.REACT_APP_SIGN_UP_NOTIFIER_URL
const tokenKey = 'token'
const profileKey = 'profile'
export const orgKey = 'organisation'
export const orgListKey = 'organisationList'
const ssoURL = process.env.REACT_APP_SOCKET_SSO_URL
const uiURL = process.env.REACT_APP_UI_URL

http.setJwt(`Bearer ${getJwt()}`)

export function isAdmin () {
  let organisation = window.localStorage.getItem(orgKey)
  let profile = window.localStorage.getItem(profileKey)
  organisation = JSON.parse(organisation)
  profile = JSON.parse(profile)
  const { org_user: orgUser } = organisation
  if (profile.admin) { return true }
  if (orgUser.is_admin) { return true } else if (!orgUser.is_admin) {
    const { product_roles: productRoles } = orgUser
    if (productRoles?.hitman?.is_product_admin) {
      return true
    } else {
      return false
    }
  }
}

export async function login (socketJwt) {
  const { data: userInfo } = await http.request({
    url: apiEndpoint,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${socketJwt}`
    }
  })
  window.localStorage.setItem(tokenKey, socketJwt)
  window.localStorage.setItem(profileKey, JSON.stringify(userInfo.profile))
  window.localStorage.setItem(orgKey, JSON.stringify(userInfo.orgs[0]))
  window.localStorage.setItem(orgListKey, JSON.stringify(userInfo.orgs))
  http.setJwt(`Bearer ${socketJwt}`)
  return userInfo
}
export function loginWithJwt (jwt) {
  window.localStorage.setItem(tokenKey, jwt)
}
export function logout (redirectUrl = '/login') {
  // const isDesktop = process.env.REACT_APP_IS_DESKTOP
  http.get(apiUrl + '/logout').then(() => {
    localStorageCleanUp()
    logoutRedirection(redirectUrl)
  }).catch(() => {
    localStorageCleanUp()
    logoutRedirection(redirectUrl)
  })
}

function localStorageCleanUp () {
  window.localStorage.removeItem(tokenKey)
  window.localStorage.removeItem(profileKey)
  window.localStorage.removeItem(orgKey)
  window.localStorage.removeItem(orgListKey)
}

function logoutRedirection (redirectUrl) {
  if (isElectron()) {
    history.push({ pathname: '/' })
  } else {
    const redirectUri = encodeURIComponent(uiURL + redirectUrl)
    window.location = `${ssoURL}/logout?redirect_uri=${redirectUri}&src=hitman`
  }
}

export function getCurrentUser () {
  try {
    const profile = window.localStorage.getItem(profileKey)
    return JSON.parse(profile)
  } catch (ex) {
    return null
  }
}

export function getCurrentOrg () {
  try {
    const org = window.localStorage.getItem(orgKey)
    return JSON.parse(org)
  } catch (ex) {
    return null
  }
}

export function getOrgList () {
  try {
    const orgs = window.localStorage.getItem(orgListKey)
    return JSON.parse(orgs)
  } catch (ex) {
    return null
  }
}

export function getJwt () {
  // window.localStorage.setItem(tokenKey,
  //   'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoidmVkYW50QHdhbGtvdmVyLmluIiwiaWRlbnRpZmllciI6IlduN0ROaUJjRENVem5pV3h6b0MyIn0sImlzcyI6InZpYXNvY2tldC5jb20iLCJpYXQiOjE2OTY0MDI1NTR9.lvpyJEc7-AGdoaeBW-BEHybOpwNTxiuoPRSfZ9AcMVg')
  const cookies = new Cookies()
  const token = cookies.get('token')
  return token || window.localStorage.getItem(tokenKey)
}

export async function notifySignup (UserInfo) {
  try {
    await http.request({
      url: signUpNotifierUrl,
      method: 'POST',
      data: UserInfo
    })
  } catch (e) {
    return false
  }
}

export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getCurrentOrg,
  getJwt,
  isAdmin,
  notifySignup,
  orgKey,
  orgListKey,
  getOrgList
}
