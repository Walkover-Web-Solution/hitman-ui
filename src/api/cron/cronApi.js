import apiRequest from "../main";

export const addCron = async ({ collectionId, cron_name, cron_expression, description, environmentId, emails, endpointIds, status }) => {
  return await apiRequest.post(`/cron`, { collectionId, cron_name, cron_expression, description, environmentId, emails, endpointIds, status });
};

export const updateCron = async (cron) => {
  const { id } = cron;
  await apiRequest.put(`/cron/${id}`, cron);
};

export const getCronByCollection = async (collectionId) => {
  const response = await apiRequest.get(`/cron/collection/${collectionId}`);
  return response;
};

export const cronStatus = async (cronId, status) => {
  await apiRequest.put(`/cron/status/${cronId}`, { status });
};

export const deleteCron = async (cronId) => {
  await apiRequest.delete(`/cron/${cronId}`);
};

export default {
  addCron,
  updateCron,
  getCronByCollection,
  deleteCron,
  cronStatus
};
