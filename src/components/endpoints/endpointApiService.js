
import httpService from '../../services/endpointHttpService'
import qs from 'qs'

function makeParams(params, grantType, authData) {
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
  } else if (authData.clientAuthentication === 'Send client credentials in body') {
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

export async function authorize(requestApi, params, grantType, props, authData) {
  if (grantType === 'passwordCredentials' || grantType === 'clientCredentials' || grantType === 'auth_code') {
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
      const timer = setInterval(async function () {
        clearInterval(timer)
        window.close()
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
    var options = "width=200,height=200,resizable=yes,scrollbars=yes,status=yes";
    const openWindow = window.open(requestApi, '_blank', options)


    // const timer = setInterval(async function () {
    //   if (openWindow.closed) {
    //     clearInterval(timer)
    //     window.removeEventListener('message')
    //   }
    // }, 1000)
  }
}

export async function setResponse(props, responseData) {
  const versionId = props.groups[props.groupId].versionId
  const authResponses = props.versions[versionId].authorizationResponse
  authResponses.push(responseData)
  await props.set_authorization_responses(versionId, authResponses)
}

export default { authorize }