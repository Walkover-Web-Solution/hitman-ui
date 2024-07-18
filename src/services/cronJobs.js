import http from './httpService'
const apiUrl = process.env.REACT_APP_API_URL

export const addCron = async (cronScheduler) => {
  const { collectionId, cron_name, cron_expression, description, environmentId, emails, endpointIds, status } = cronScheduler;
  const body = {collectionId, cron_name, cron_expression, description, environmentId, emails, endpointIds, status};
  await http.post(apiUrl + `/cron_schedulers`, body, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export const updateCron = async (cron) => {
  const { cronId, cron_expression } = cron
  await http.get(apiUrl + `edit`, { params: { id: cronId, cron_expression: cron_expression } })
}

export const getCronByCollection = async (collectionId) => {
  return await http.get(`${apiUrl}/cron_schedulers/collection/${collectionId}`)
}

export const enableCron = async (cronId) => {
  await http.get(apiUrl + `enable`, { params: { id: cronId } })
}

export const disableCron = async (cronId) => {
  await http.get(apiUrl + `disable`, { params: { id: cronId } })
}

export const deleteCron = async (cronId) => {
  await http.get(apiUrl + `delete`, { params: { id: cronId } })
}

export default {
  addCron,
  updateCron,
  getCronByCollection,
  deleteCron,
  enableCron,
  disableCron
}
