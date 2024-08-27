import apiRequest from "../main"

function addDomain(data) {
    return apiRequest.post(`/cookies`, data)
}

function getAllCookies() {
    return apiRequest.get(`/cookies`)
}

function deleteDomain(id) {
    return apiRequest.delete(`/cookies/${id}`)
}

function updateDomain(id, data) {
    return apiRequest.put(`/cookies/${id}`, data)
}

export default {
    addDomain,
    getAllCookies,
    deleteDomain,
    updateDomain
}

