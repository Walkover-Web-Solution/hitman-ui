import axios from 'axios';
import { getProxyToken } from '../components/auth/authServiceV2';
import { toast } from 'react-toastify'

var chatbotInstance = axios.create()
const apiBaseUrl = process.env.REACT_APP_API_URL;

function addProxyToken() {
  let proxyToken = getProxyToken();
  if (proxyToken) {
    chatbotInstance.defaults.headers.common.proxy_auth_token = proxyToken;
  }
  return chatbotInstance;
}
export async function inviteMember(name, query) {
  chatbotInstance = addProxyToken();
  const proxyToken = getProxyToken();
  const data = {
    query: query,
    proxy: proxyToken,
    name: name
  };

  try {
    await axios.post(`${apiBaseUrl}/chatbot`, data);
    toast.success('Added successfully')
    return true;
  } catch (error) {
    toast.error('Missing Fields')
    return false;
  }

}

export default {
  inviteMember
};
