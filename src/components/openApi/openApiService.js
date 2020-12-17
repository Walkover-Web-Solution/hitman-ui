import http from '../../services/httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function importApi (openApiObject) {
  return http.post(`${apiUrl}/import/openApi/`, openApiObject)
}

export function importPostmanCollection (collection, website) {
  return http.post(`${apiUrl}/import/postman?website=${website}`, collection)
}

export default {
  importApi,
  importPostmanCollection
}
