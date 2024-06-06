import http from './httpService'
const apiUrl = process.env.REACT_APP_API_URL

export const like = async (pageId) => {
  await http.post(apiUrl + `/feedback/positive`,{pageId})
}

export const dislike = async (feedback) => {
  const {pageId, comment, email} = feedback
  await http.post(apiUrl + `/feedback/negative`, {pageId, comment, email})
}

export default {
    like,
    dislike
}
