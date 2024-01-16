import http from './httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function getPageContent(orgId, pageId) {
  console.log('I am api also running')
  return http.get(apiUrl + `/orgs/${orgId}/pages/${pageId}/content`)
}

export default {
  getPageContent
}
