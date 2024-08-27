import apiRequest from "../main";
import httpService from '../../services/endpointHttpService';
import qs from 'qs';
import { makeHttpRequestThroughAxios } from '../../services/coreRequestService';
import { grantTypesEnums } from "../../components/common/authorizationEnums";
import { introspectionQuery } from "../../components/endpoints/commonIntrospectionQuery";

const ENTITY_STATUS = {
  PENDING: 0,
  DRAFT: 1,
  APPROVED: 2,
  REJECT: 3
};

export function apiTest(api, method, body, headers, bodyType, cancelToken) {
  if (api.includes('localhost') || api.includes('127.0.0.1')) {
    return makeHttpRequestThroughAxios({ api, method, body, headers, bodyType, cancelToken });
  } else {
    const data = {
      url: api,
      method,
      data: bodyType === 'urlEncoded' ? qs.stringify({ body }) : body,
      headers,
    };
    return apiRequest.post(`/test-apis/run`, data, { cancelToken });
  }
}

export function getAllEndpoints(id) {
  return apiRequest.get(`/orgs/${id}/endpoints`);
}

export function getEndpoints(parentId) {
  return apiRequest.get(`/pages/${parentId}/endpoints`);
}

export async function getEndpoint(endpointId) {
  return await apiRequest.get(`/endpoints/${endpointId}`);
}

export function saveEndpoint(rootParentId, endpoint) {
  return apiRequest.post(`/pages/${rootParentId}/endpoints`, endpoint);
}

export function updateEndpoint(endpointId, endpoint) {
  return apiRequest.put(`/endpoints/${endpointId}`, endpoint);
}

export function deleteEndpoint(endpointId, endpoint) {
  return apiRequest.delete(`/endpoints/${endpointId}`, { data: endpoint });
}

export function duplicateEndpoint(endpointId) {
  return apiRequest.post(`/duplicateEndpoints/${endpointId}`);
}

export function moveEndpoint(endpointId, body) {
  return apiRequest.patch(`/endpoints/${endpointId}/move`, body);
}

export async function setResponse(props, responseData) {
  const versionId = props.groups[props.groupId].versionId;
  const authResponses = props.versions[versionId].authorizationResponse;
  authResponses.push(responseData);
  await props.set_authorization_responses(versionId, authResponses);
}

export async function getTokenAuthorizationCodeAndAuthorizationPKCE(accessTokenURL, code, data) {
  let body = {
    client_id: data.clientId,
    redirect_uri: data.callbackUrl,
    code: code,
    grant_type: 'authorization_code',
    client_secret: data.clientSecret,
  };

  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  if (data.selectedGrantType === grantTypesEnums.authorizationCodeWithPkce) {
    body.code_verifier = data.codeVerifier;
  }

  try {
    const { data: responseData } = await httpService.request({
      url: `/auth/token`,
      method: 'POST',
      data: { tokenBody: body, tokenHeaders: headers, accessTokenUrl: accessTokenURL },
    });
    return responseData.data;
  } catch (error) {
    throw error;
  }
}

export async function getTokenPasswordAndClientGrantType(accessTokenURL, data) {
  let body = {
    client_id: data.clientId,
    client_secret: data.clientSecret,
    scope: data.scope,
    grant_type: 'client_credentials',
  };

  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  if (data.selectedGrantType === grantTypesEnums.passwordCredentials) {
    body.grant_type = 'password';
    body.username = data.username;
    body.password = data.password;
  }

  try {
    const { data: responseData } = await httpService.request({
      url: `/auth/token`,
      method: 'POST',
      data: { tokenBody: body, tokenHeaders: headers, accessTokenUrl: accessTokenURL },
    });
    return responseData.data;
  } catch (error) {
    throw error;
  }
}

export async function getRefreshToken(singleTokenDetails) {
  let body = {
    client_id: singleTokenDetails.clientId,
    client_secret: singleTokenDetails.clientSecret,
    refresh_token: singleTokenDetails.refreshToken,
    grant_type: 'refresh_token',
  };

  try {
    const { data: responseData } = await httpService.request({
      url: `/auth/token`,
      method: 'POST',
      data: { tokenBody: body, tokenHeaders: {}, accessTokenUrl: singleTokenDetails?.refreshTokenUrl },
    });
    return responseData.data;
  } catch (error) {
    throw error;
  }
}

export async function getSchemaThroughIntrospectionQuery(graphQlAPI) {
  try {
    const { data: responseData } = await httpService.request({
      url: graphQlAPI,
      method: 'POST',
      data: { query: introspectionQuery },
    });
    return responseData.data;
  } catch (error) {
    throw error;
  }
}

export async function runAutomation(details) {
  return apiRequest.post(`/run/automation`, details);
}

export function approveEndpoint(endpointId, uniqueTabId) {
  return apiRequest.patch(`/endpoints/${endpointId}/state`, { state: ENTITY_STATUS.APPROVED, uniqueTabId })
}

export function pendingEndpoint(endpoint) {

  return apiRequest.patch(`/endpoints/${endpoint.id}/state`, { state: ENTITY_STATUS.PENDING })
}

export function draftEndpoint(endpoint, uniqueTabId) {

  return apiRequest.patch(`/endpoints/${endpoint.id}/state`, { state: ENTITY_STATUS.DRAFT, uniqueTabId })
}

export function rejectEndpoint(endpoint) {

  return apiRequest.patch(`/endpoints/${endpoint.id}/state`, { state: ENTITY_STATUS.REJECT })
}


export default {
  getEndpoints,
  deleteEndpoint,
  apiTest,
  updateEndpoint,
  getEndpoint,
  getAllEndpoints,
  duplicateEndpoint,
  moveEndpoint,
  saveEndpoint,
  getTokenAuthorizationCodeAndAuthorizationPKCE,
  getTokenPasswordAndClientGrantType,
  getRefreshToken,
  runAutomation,
  approveEndpoint,
  pendingEndpoint,
  draftEndpoint,
  rejectEndpoint
};
