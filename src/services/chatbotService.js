import axios from 'axios'
import { getProxyToken } from '../components/auth/authServiceV2'
import { toast } from 'react-toastify'

let chatbotInstance = axios.create()
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

function addProxyToken() {
  const proxyToken = getProxyToken()
  if (proxyToken) {
    chatbotInstance.defaults.headers.common.proxy_auth_token = proxyToken
  }
  return chatbotInstance
}
export async function inviteMember(name, query) {
  chatbotInstance = addProxyToken()
  const proxyToken = getProxyToken()
  const data = {
    query: query,
    proxy: proxyToken,
    name: name
  }

  try {
    const res = await axios.post(`${apiBaseUrl}/chatbot`, data)
    if (res.status !== 200) {
      throw new (res?.message ? res.message : 'Please enter message correctly')()
    }
    toast.success('User added successfully')
    return true
  } catch (e) {
    toast.error(e?.message ? e.message : 'Something went wrong')
    return false
  }
}

export default {
  inviteMember
}
