import http from '../../services/httpService'
import authService from '../auth/authService'

const apiUrl = process.env.REACT_APP_API_URL

export function importApi (openApiObject) {
  const user = authService.getCurrentUser()
  const userId = user.user.identifier
  return http.post(`${apiUrl}/import/openApi/${userId}`, openApiObject)
}

export default {
  importApi
}
