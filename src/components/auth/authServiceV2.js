import React, { useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import http from '../../services/httpService'
import Cookies from 'universal-cookie'
// import fetch from 'node-fetch'
const tokenKey = 'token'
const profileKey = 'profile'
export const orgKey = 'organisation'
export const orgListKey = 'organisationList'

function useQuery () {
  return new URLSearchParams(useLocation().search)
}

// function logout (redirectUrl = '/login') {
//   // const isDesktop = process.env.REACT_APP_IS_DESKTOP
//   http.get(apiUrl + '/logout').then(() => {
//     localStorageCleanUp()
//     logoutRedirection(redirectUrl)
//   }).catch(() => {
//     localStorageCleanUp()
//     logoutRedirection(redirectUrl)
//   })
// }

// function localStorageCleanUp () {
//   window.localStorage.removeItem(tokenKey)
//   window.localStorage.removeItem(profileKey)
//   window.localStorage.removeItem(orgKey)
//   window.localStorage.removeItem(orgListKey)
// }

// function logoutRedirection (redirectUrl) {
//   if (isElectron()) {
//     history.push({ pathname: '/' })
//   } else {
//     const redirectUri = encodeURIComponent(uiURL + redirectUrl)
//     window.location = `${ssoURL}/logout?redirect_uri=${redirectUri}&src=hitman`
//   }
// }
function getCurrentUser () {
  try {
    const profile = window.localStorage.getItem(profileKey)
    const parsedProfile = JSON.parse(profile)
    const desiredData = {
      id: parsedProfile.id,
      name: parsedProfile.name,
      email: parsedProfile.email,
      created_at: parsedProfile.created_at,
      updated_at: parsedProfile.updated_at,
      is_block: parsedProfile.is_block
    }
    return desiredData
  } catch (ex) {
    return null
  }
}

function getCurrentOrg () {
  try {
    const org = window.localStorage.getItem(orgKey)
    return JSON.parse(org)
  } catch (ex) {
    return null
  }
}

function getOrgList () {
  try {
    const orgs = window.localStorage.getItem(orgListKey)
    return JSON.parse(orgs)
  } catch (ex) {
    return null
  }
}

function getJwt () {
  const cookies = new Cookies()
  const token = cookies.get('token')
  return token || window.localStorage.getItem(tokenKey)
}

function AuthServiceV2 () {
  const query = useQuery()
  const history = useHistory()

  useEffect(() => {
    const proxyAuthToken = query.get('proxy_auth_token')
    // const userRefId = query.get('user_ref_id')
    const orgId = query.get('company_ref_id')

    if (proxyAuthToken) {
      /* eslint-disable-next-line */
      fetch('https://routes.msg91.com/api/c/getDetails', {
        headers: {
          proxy_auth_token: proxyAuthToken
        }
      })
        .then(response => response.json())
        .then(data => {
          const userInfo = data.data[0]
          window.localStorage.setItem(tokenKey, proxyAuthToken)
          window.localStorage.setItem(profileKey, JSON.stringify(userInfo))
          window.localStorage.setItem(orgKey, JSON.stringify(userInfo.c_companies[0]))
          window.localStorage.setItem(orgListKey, JSON.stringify(userInfo.c_companies))
          http.setJwt(`Bearer ${proxyAuthToken}`)
        })
        .catch(error => console.error('Error:', error))
    }

    const reloadRoute = new URLSearchParams(query).get('redirect_uri') || `/orgs/${orgId}/dashboard`
    history.push({
      pathname: reloadRoute
    })
  }, [history, query])

  return (
    <div>Redirecting...</div>
  )
}

export default AuthServiceV2
export { getCurrentUser, getCurrentOrg, getOrgList, getJwt }
