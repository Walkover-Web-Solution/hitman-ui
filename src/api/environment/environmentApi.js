import apiRequest from "../main";


export function getEnvironments() {
  return apiRequest.get(`/environments`);
}

export function getEnvironment(environmentId) {
  return apiRequest.get(`/environments/${environmentId}`);
}

export function saveEnvironment(environment, type) {
  return apiRequest.post(`/environments`, environment, type);
}

export function updateEnvironment(environmentId, environment) {
  return apiRequest.put(`/environments/${environmentId}`, environment);
}

export function deleteEnvironment(environmentId) {
  return apiRequest.delete(`/environments/${environmentId}`);
}

export function importPostmanEnvironment(environment) {
  return apiRequest.post(`/import/environment`, environment);
}

export async function exportEnvironmentApi(environmentId) {
  try {
    const response = await apiRequest.post(`/export/environment/${environmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error calling export environment API:', error);
    throw error;
  }
}

export default {
  getEnvironments,
  getEnvironment,
  saveEnvironment,
  updateEnvironment,
  deleteEnvironment,
  importPostmanEnvironment,
  exportEnvironmentApi
};
