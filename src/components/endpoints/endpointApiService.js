import http from '../../services/httpService'
import httpService from '../../services/endpointHttpService'
import indexedDbService from '../indexedDb/indexedDbService'
import qs from 'qs'

const apiUrl = process.env.REACT_APP_API_URL

function endpointUrl (groupId) {
  return `${apiUrl}/groups/${groupId}/endpoints`
}

export function apiTest (api, method, body, headers, bodyType) {
  if (api.indexOf('localhost') > 0) {
    return httpService.request({
      url: api,
      method: method,
      data: bodyType === 'urlEncoded' ? qs.stringify({ body }) : body,
      headers: headers
    })
  } else {
    const data = {
      url: api,
      method,
      data: bodyType === 'urlEncoded' ? qs.stringify({ body }) : body,
      headers
    }
    return httpService.post(`${apiUrl}/test-apis/run`, data)
  }
}

export function getAllEndpoints () {
  return http.get(`${apiUrl}/endpoints`)
}

export function getEndpoints (groupId) {
  return http.get(endpointUrl(groupId))
}

export function getEndpoint (endpointId) {
  return http.get(`${apiUrl}/endpoints/${endpointId}`)
}

export function saveEndpoint (groupId, endpoint) {
  return http.post(endpointUrl(groupId), endpoint)
}

export function updateEndpoint (endpointId, endpoint) {
  return http.put(`${apiUrl}/endpoints/${endpointId}`, endpoint)
}

export function deleteEndpoint (endpointId) {
  return http.delete(`${apiUrl}/endpoints/${endpointId}`)
}

export function duplicateEndpoint (endpointId) {
  return http.post(`${apiUrl}/duplicateEndpoints/${endpointId}`)
}

export function moveEndpoint (endpointId, body) {
  return http.patch(`${apiUrl}/endpoints/${endpointId}/move`, body)
}

export function updateEndpointOrder (
  sourceEndpointIds,
  sourceGroupId = null,
  destinationEndpointIds = null,
  destinationGroupId = null,
  endpointId = null
) {
  return http.patch(`${apiUrl}/updateEndpointsOrder`, {
    sourceEndpointIds,
    sourceGroupId,
    destinationEndpointIds,
    destinationGroupId,
    endpointId
  })
}

function makeParams (params, grantType, authData) {
  let finalHeaders = {}
  let finalParams = {}
  if (authData.clientAuthentication === 'Send as Basic Auth header') {
    if (grantType === 'passwordCredentials') {
      finalHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        client_id: params.client_id,
        client_secret: params.client_secret,
        username: params.username,
        password: params.password
      }
      finalParams = params
      delete finalParams.client_id
      delete finalParams.client_secret
      delete finalParams.username
      delete finalParams.password
    } else {
      finalHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        client_id: params.client_id,
        client_secret: params.client_secret
      }
      finalParams = params
      delete finalParams.client_id
      delete finalParams.client_secret
    }
  } else if (
    authData.clientAuthentication === 'Send client credentials in body'
  ) {
    finalHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    finalParams = params
  }
  const finalParamsandHeaders = []
  finalParamsandHeaders[0] = finalParams
  finalParamsandHeaders[1] = finalHeaders
  return finalParamsandHeaders
}

export async function authorize (
  requestApi,
  params,
  grantType,
  props,
  authData
) {
  if (
    grantType === 'passwordCredentials' ||
    grantType === 'clientCredentials' ||
    grantType === 'auth_code'
  ) {
    const finalParamsandHeaders = makeParams(params, grantType, authData)
    const finalParams = finalParamsandHeaders[0]
    const finalHeaders = finalParamsandHeaders[1]
    if (grantType === 'auth_code') params.grant_type = 'authorization_code'
    const { data: responseData } = await httpService.request({
      url: requestApi,
      method: 'POST',
      data: qs.stringify(finalParams),
      headers: finalHeaders
    })
    responseData.tokenName = authData.tokenName
    if (grantType === 'auth_code') {
      await indexedDbService.getDataBase()
      await indexedDbService.updateData(
        'responseData',
        responseData,
        'currentResponse'
      )
      const response = await indexedDbService.getValue(
        'responseData',
        'currentResponse'
      )
      const timer = setInterval(async function () {
        if (response) {
          clearInterval(timer)
          window.close()
        }
      }, 1000)
    } else {
      if (responseData && responseData.access_token) {
        if (props.groupId) await setResponse(props, responseData)
        props.set_access_token(responseData.access_token)
      }
    }
  } else {
    if (grantType === 'authorizationCode') {
      requestApi = requestApi + '&response_type=code'
    } else {
      requestApi = requestApi + '&response_type=token'
    }
    const openWindow = window.open(
      requestApi,
      'windowName',
      'width=400,height=600'
    )

    const timer = setInterval(async function () {
      if (openWindow.closed) {
        clearInterval(timer)
        await indexedDbService.getDataBase()
        const responseData = await indexedDbService.getValue(
          'responseData',
          'currentResponse'
        )
        await indexedDbService.deleteData('responseData', 'currentResponse')
        if (responseData && responseData.access_token) {
          responseData.tokenName = authData.tokenName
          if (props.groupId) await setResponse(props, responseData)
          props.set_access_token(responseData.access_token)
        }
      }
    }, 1000)
  }
}

export async function setResponse (props, responseData) {
  const versionId = props.groups[props.groupId].versionId
  const authResponses = props.versions[versionId].authorizationResponse
  authResponses.push(responseData)
  await props.set_authorization_responses(versionId, authResponses)
}

export function setAuthorizationType (endpointId, data) {
  return http.patch(
    `${apiUrl}/endpoints/${endpointId}/authorizationType`,
    data
  )
}

export default {
  saveEndpoint,
  getEndpoints,
  deleteEndpoint,
  apiTest,
  updateEndpoint,
  getEndpoint,
  getAllEndpoints,
  duplicateEndpoint,
  moveEndpoint,
  authorize,
  setAuthorizationType,
  updateEndpointOrder
}
