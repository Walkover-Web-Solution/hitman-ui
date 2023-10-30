import React, { useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import http from '../../services/httpService'
import Cookies from 'universal-cookie'
// import fetch from 'node-fetch'
const tokenKey = 'token'
const profileKey = 'profile'
export const orgKey = 'organisation'
export const orgListKey = 'organisationList'
const uiURL = process.env.REACT_APP_UI_URL
const apiUrl = process.env.REACT_APP_API_URL

function useQuery () {
  return new URLSearchParams(useLocation().search)
}

function logout (redirectUrl1 = '/login') {
  const redirectUrl = '/login'
  // const isDesktop = process.env.REACT_APP_IS_DESKTOP
  http.get(apiUrl + '/logout').then(() => {
    console.log('get', redirectUrl)
    localStorageCleanUp()
    logoutRedirection(redirectUrl)
  }).catch(() => {
    console.log('in catch')
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
  // if (isElectron()) {
  //   history.push({ pathname: '/' })
  // } else {
  const redirectUri = uiURL + redirectUrl
  console.log('redirectUrl ==', redirectUri)
  window.location = redirectUri
  // }
}
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

function getProxyToken () {
  const cookies = new Cookies()
  const token = cookies.get('token')
  return token || window.localStorage.getItem(tokenKey)
}

function getData (data, proxyAuthToken) {
  if (!data) {
    data = {
      data: [
        {
          id: 71,
          name: 'Goutam Mehta',
          mobile: null,
          email: 'en19cs301125@medicaps.ac.in',
          client_id: 8,
          meta: null,
          created_at: '2023-10-26T05:00:43.000000Z',
          updated_at: '2023-10-26T05:00:43.000000Z',
          is_block: 0,
          c_companies: [
            {
              id: 71,
              name: 'Goutam Mehta',
              company_uname: 'f9f54613',
              mobile: null,
              email: 'en19cs301125@medicaps.ac.in',
              feature_configuration_id: 7,
              meta: null,
              created_at: '2023-10-26T05:00:43.000000Z',
              updated_at: '2023-10-26T05:00:43.000000Z',
              timezone: '+05:30'
            },
            {
              id: 76,
              name: 'testing',
              company_uname: '14e4cbe7',
              mobile: null,
              email: 'en19cs301125@medicaps.ac.in',
              feature_configuration_id: 7,
              meta: null,
              created_at: '2023-10-27T07:04:03.000000Z',
              updated_at: '2023-10-27T07:04:03.000000Z',
              timezone: '+5:30'
            }
          ]
        }
      ],
      status: 'success',
      hasError: false,
      errors: [],
      proxy_duration: '23ms'
    }
  }
  const userInfo = data.data[0]
  window.localStorage.setItem(tokenKey, proxyAuthToken)
  window.localStorage.setItem(profileKey, JSON.stringify(userInfo))
  window.localStorage.setItem(orgKey, JSON.stringify(userInfo.c_companies[0]))
  window.localStorage.setItem(orgListKey, JSON.stringify(userInfo.c_companies))
  http.setProxyToken(getProxyToken())
}

function AuthServiceV2 () {
  const query = useQuery()
  const history = useHistory()

  useEffect(() => {
    const proxyAuthToken = query.get('proxy_auth_token')
    // const userRefId = query.get('user_ref_id')
    const orgId = query.get('company_ref_id')

    if (!proxyAuthToken) {
      /* eslint-disable-next-line */
      fetch('https://routes.msg91.com/api/c/getDetails', {
        headers: {
          proxy_auth_token: proxyAuthToken
        }
      })
        .then(response => response.json())
        .then(data => {
          getData(data, proxyAuthToken)
        })
        .catch(error => console.error('Error:', error))
    } else {
      getData('', proxyAuthToken)
    }

    const reloadRoute = `/orgs/${orgId}/dashboard`
    history.push({
      pathname: reloadRoute
    })
  }, [history, query])

  return (
    <div>Redirecting...</div>
  )
}

export default AuthServiceV2
export { getCurrentUser, getCurrentOrg, getOrgList, getProxyToken, logout }
