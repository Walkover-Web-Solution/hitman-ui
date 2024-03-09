import http from '../../services/httpService'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

function environmentsUrl() {
  return `${apiUrl}/environments`
}

function environmentUrl(environmentId) {
  return `${apiUrl}/environments/${environmentId}`
}

export function getEnvironments() {
  return http.get(environmentsUrl())
}

export function getEnvironment(environmentId) {
  return http.get(environmentUrl(environmentId))
}

export function saveEnvironment(environment) {
  return http.post(environmentsUrl(), environment)
}

export function updateEnvironment(environmentId, environment) {
  return http.put(`${environmentUrl(environmentId)}`, environment)
}

export function deleteEnvironment(environmentId) {
  return http.delete(`${environmentUrl(environmentId)}`)
}

export default {
  getEnvironments,
  getEnvironment,
  saveEnvironment,
  updateEnvironment,
  deleteEnvironment
}
