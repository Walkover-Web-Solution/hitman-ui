import http from '../../services/httpService'
const apiEndpoint = process.env.REACT_APP_API_URL + '/profile'
const apiUrl = process.env.REACT_APP_API_URL
const signUpNotifierUrl = process.env.REACT_APP_SIGN_UP_NOTIFIER_URL
const tokenKey = 'token'
const profileKey = 'profile'
const orgKey = 'organisation'
http.setJwt(`Bearer ${getJwt()}`)

export function isAdmin () {
  let organisation = window.localStorage.getItem(orgKey)
  organisation = JSON.parse(organisation)
  const { org_user: orgUser } = organisation
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
  http.setJwt(`Bearer ${socketJwt}`)
  return userInfo
}
export function loginWithJwt (jwt) {
  window.localStorage.setItem(tokenKey, jwt)
}
export function logout () {
  http.get(apiUrl + '/logout')
  window.localStorage.removeItem(tokenKey)
  window.localStorage.removeItem(profileKey)
  window.localStorage.removeItem(orgKey)
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
    logout()
    window.location = '/'
    return null
  }
}

export function getJwt () {
  return window.localStorage.getItem(tokenKey)
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
  notifySignup
}
