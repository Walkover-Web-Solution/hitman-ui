import React, { useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import http from '../../services/httpService'
import Cookies from 'universal-cookie'

const tokenKey = 'token'
const profileKey = 'profile'
export const orgKey = 'organisation'
export const orgListKey = 'organisationList'
const uiURL = process.env.REACT_APP_UI_URL
const proxyUrl = process.env.REACT_APP_PROXY_URL

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

function isAdmin () {
 return {is_admin : true}
  }

function logout(redirectUrl = '/login') {
  // const isDesktop = process.env.REACT_APP_IS_DESKTOP
  http.get(proxyUrl + '/logout').then(() => {
    localStorageCleanUp()
    logoutRedirection(redirectUrl)
  }).catch(() => {
    localStorageCleanUp()
    logoutRedirection(redirectUrl)
  })
}

function localStorageCleanUp() {
  window.localStorage.removeItem(tokenKey)
  window.localStorage.removeItem(profileKey)
  window.localStorage.removeItem(orgKey)
  window.localStorage.removeItem(orgListKey)
}

function logoutRedirection(redirectUrl) {
  // if (isElectron()) {
  //   history.push({ pathname: '/' })
  // } else {
  const redirectUri = uiURL + redirectUrl
  window.location = redirectUri
  // }
}
function getCurrentUser() {
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

function getCurrentOrg() {
  try {
    const org = window.localStorage.getItem(orgKey)
    return JSON.parse(org)
  } catch (ex) {
    return null
  }
}

function getOrgList() {
  try {
    const orgs = window.localStorage.getItem(orgListKey)
    return JSON.parse(orgs)
  } catch (ex) {
    return null
  }
}

function getProxyToken() {
  const cookies = new Cookies()
  const token = cookies.get('token')
  return token || window.localStorage.getItem(tokenKey)
}


function AuthServiceV2() {
  const query = useQuery()
  const history = useHistory()

  useEffect(() => {
    const proxyAuthToken = query.get('proxy_auth_token')
    // const userRefId = query.get('user_ref_id')
    const orgId = query.get('company_ref_id')

    if (proxyAuthToken) {
      /* eslint-disable-next-line */
      fetch(proxyUrl + '/getDetails', {
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
          http.setProxyToken(getProxyToken())
          const reloadRoute = `/orgs/${orgId}/dashboard`
          history.push({
            pathname: reloadRoute
          })
        })
        .catch(error => console.error('Error:', error))
    }else if(getOrgList()){
      const redirectUrl = `/orgs/${orgId}/dashboard`
      history.push(redirectUrl)
    }else{
      const redirectUrl = '/login'
      history.push(redirectUrl)
    }
  }, [history, query])

  return (
    <div>Redirecting...</div>
  )
}

export default AuthServiceV2
export {isAdmin, getCurrentUser, getCurrentOrg, getOrgList, getProxyToken, logout }
