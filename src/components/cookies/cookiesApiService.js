import http from '../../services/httpService'

const apiUrl = process.env.REACT_APP_API_URL

function addDomain (data) {
  http.post(`${apiUrl}/cookies`, data)
}

function getAllCookies () {
  http.get(`${apiUrl}/cookies`)
}

function deleteDomain (id) {
  http.delete(`${apiUrl}/cookies/${id}`)
}

function updateDomain (id, data) {
  http.put(`${apiUrl}/cookies/${id}`, data)
}

export default {
  addDomain,
  getAllCookies,
  deleteDomain,
  updateDomain
}
