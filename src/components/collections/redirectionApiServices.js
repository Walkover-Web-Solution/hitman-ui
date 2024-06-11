import http from '../../services/httpService'
import httpService from '../../services/endpointHttpService'
import { getOrgId } from '../common/utility'

const apiUrl = process.env.REACT_APP_API_URL

export function deleteUrl(id) {
    const orgId = getOrgId()
    return http.delete(apiUrl + `/orgs/${orgId}/urlMappings/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting URL:', error);
      throw error; 
    });
}

export function createUrl(pageId, collectionId, oldUrl) {
    const orgId = getOrgId()

    const body = {
      pageId,
      collectionId,
      oldUrl
  };
    return http.post(apiUrl + `/orgs/${orgId}/urlMappings`, body)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting URL:', error);
      throw error; 
    });
}

export function updateUrl(id) {
    const orgId = getOrgId()
    return http.put(apiUrl + `/orgs/${orgId}/urlMappings/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting URL:', error);
      throw error; 
    });
}