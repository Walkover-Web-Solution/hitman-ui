import http from "./httpService";
// import { apiUrl } from "../config.json";

const apiUrl = "http://localhost:2000";

function EnvironmentsUrl() {
  return `${apiUrl}/environments`;
}

function EnvironmentUrl(EnvironmentId) {
  //   return `${apiUrl}/Environments/${EnvironmentId}`;
}

export function getEnvironments() {
  return http.get(EnvironmentsUrl());
}

export function getEnvironment(EnvironmentId) {
  //   return http.get(EnvironmentUrl( EnvironmentId));
}

export function saveEnvironment(environment) {
  return http.post(EnvironmentsUrl(), environment);
}

export function updateEnvironment(EnvironmentId, Environment) {
  //   return http.put(`${EnvironmentUrl(EnvironmentId)}`, Environment);
}

export function deleteEnvironment(EnvironmentId) {
  return http.delete(`${EnvironmentsUrl()}/${EnvironmentId}`);
}

export default {
  getEnvironments,
  getEnvironment,
  saveEnvironment,
  updateEnvironment,
  deleteEnvironment
};
