import http from "../../services/httpService";
import httpService from "../../services/endpointHttpService";
import indexedDbService from "../indexedDb/indexedDbService";
import { apiUrl } from "../../config.json";
import qs from "qs";

function endpointUrl(groupId) {
  return `${apiUrl}/groups/${groupId}/endpoints`;
}

export function apiTest(api, method, body, headers, bodyType) {
  return httpService.request({
    url: api,
    method: method,
    data: bodyType === "urlEncoded" ? qs.stringify({ body }) : body,
    headers: headers,
  });
}

export function getAllEndpoints() {
  return http.get(`${apiUrl}/endpoints`);
}

export function getEndpoints(groupId) {
  return http.get(endpointUrl(groupId));
}

export function getEndpoint(endpointId) {
  return http.get(`${apiUrl}/endpoints/${endpointId}`);
}

export function saveEndpoint(groupId, endpoint) {
  return http.post(endpointUrl(groupId), endpoint);
}

export function updateEndpoint(endpointId, endpoint) {
  return http.put(`${apiUrl}/endpoints/${endpointId}`, endpoint);
}

export function deleteEndpoint(endpointId) {
  return http.delete(`${apiUrl}/endpoints/${endpointId}`);
}

export function duplicateEndpoint(endpointId) {
  return http.post(`${apiUrl}/duplicateEndpoints/${endpointId}`);
}

export function moveEndpoint(endpointId, body) {
  return http.patch(`${apiUrl}/endpoints/${endpointId}/move`, body);
}

export async function authorize(
  requestApi,
  params,
  grantType,
  props,
  tokenName
) {
  if (
    grantType === "passwordCredentials" ||
    grantType === "clientCredentials" ||
    grantType === "auth_code"
  ) {
    if (grantType === "auth_code") params.grant_type = "authorization_code";
    let responseData = httpService.request({
      url: requestApi,
      method: "POST",
      data: qs.stringify({ params }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    responseData["tokenName"] = tokenName;
    if (responseData && responseData.access_token) {
      if (props.groupId) await setResponse(props, responseData);
      props.set_access_token(responseData.access_token);
    }
  } else {
    let openWindow = window.open(
      requestApi,
      "windowName",
      "width=400,height=600"
    );

    let timer = setInterval(async function () {
      if (openWindow.closed) {
        clearInterval(timer);
        await indexedDbService.getDataBase();
        let responseData = await indexedDbService.getValue(
          "responseData",
          "currentResponse"
        );
        await indexedDbService.deleteData("responseData", "currentResponse");
        if (responseData && responseData.access_token) {
          responseData["tokenName"] = tokenName;
          if (props.groupId) await setResponse(props, responseData);
          props.set_access_token(responseData.access_token);
        }
      }
    }, 1000);
  }
}

async function setResponse(props, responseData) {
  let versionId = props.groups[props.groupId].versionId;
  let authResponses = props.versions[versionId].authorizationResponse;
  authResponses.push(responseData);
  await props.set_authorization_responses(versionId, authResponses);
}

export function setAuthorizationType(endpointId, data) {
  return http.patch(
    `${apiUrl}/endpoints/${endpointId}/authorizationType`,
    data
  );
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
};
