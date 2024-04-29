import http from './httpService'

const apiUrl = process.env.REACT_APP_API_URL

export const getPageContent = async (orgId, pageId) => {
  const data = await http.get(apiUrl + `/orgs/${orgId}/pages/${pageId}/content`)
   return {
    contents: data?.data?.contents || '',
    updatedAt: data?.data?.updatedAt || ''
  }
}

export default {
  getPageContent
}
