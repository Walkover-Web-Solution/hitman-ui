import http from './httpService'
const apiUrl = process.env.REACT_APP_API_URL

export const addCron = async (cronScheduler) => {
  const { collectionId, cron_name, cron_expression, description, environmentId, emails, endpointIds, status } = cronScheduler;
  const body = {collectionId, cron_name, cron_expression, description, environmentId, emails, endpointIds, status};
  return await http.post(apiUrl + `/cron_schedulers`, body);
}

export const updateCron = async (cron) => {
  const { cronId, cron_expression } = cron
  await http.put(`${apiUrl}/cron_schedulers/${cronId}`, cron)
}

export const getCronByCollection = async (collectionId) => {
  const response = await http.get(`${apiUrl}/cron_schedulers/collection/${collectionId}`)
  // console.log(response)
  // if (!response.ok) {
  //   throw new Error('Network response was not ok');
  // }
  return response?.data;
}

export const cronStatus = async (cronId, status) => {
  await http.put(`${apiUrl}/cron_schedulers/status/${cronId}`, {status: status})
}

export const deleteCron = async (cronId) => {
  await http.delete(apiUrl + `/cron_schedulers/${cronId}`)
}

export const addWebhook = async (inputString) => {
  return await http.post(apiUrl + `/createWebhookToken`, {inputString: inputString});
}

export default {
  addCron,
  updateCron,
  getCronByCollection,
  deleteCron,
  cronStatus,
  addWebhook
}
