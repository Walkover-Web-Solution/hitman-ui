import http from '../../services/httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function uploadLogoApi (collectionId, openApiObject) {
  return http.post(`${apiUrl}/collections/${collectionId}/favicon`, openApiObject)
}

export default {
  uploadLogoApi
}
