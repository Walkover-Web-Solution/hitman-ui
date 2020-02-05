import http from "./httpService";
// import { apiUrl } from "../config.json";

const apiUrl = "http://localhost:2000";

function variablesUrl(environmentId) {
  return `${apiUrl}/environments/${environmentId}/variables`;
}

function variableUrl(variableId) {
  return `${apiUrl}/variables/${variableId}`;
}

export function getVariables(environmentId) {
  return http.get(variablesUrl(environmentId));
}

export function getVariable(variableId) {
  return http.get(variableUrl(variableId));
}

export function saveVariable(environmentId, variable) {
  return http.post(variablesUrl(environmentId), variable);
}

export function updateVariable(variableId, variable) {
  return http.put(`${variableUrl(variableId)}`, variable);
}

export function deleteVariable(variableId) {
  return http.delete(`${variableUrl(variableId)}`);
}

export default {
  getVariables,
  getVariable,
  saveVariable,
  updateVariable,
  deleteVariable
};
