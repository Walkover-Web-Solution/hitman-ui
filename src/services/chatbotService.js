import axios from 'axios';
import { getProxyToken } from '../components/auth/authServiceV2';

var chatbotInstance = axios.create()
const apiBaseUrl = process.env.REACT_APP_API_URL;

function addProxyToken() {
  let proxyToken = getProxyToken();
  if (proxyToken) {
    chatbotInstance.defaults.headers.common.proxy_auth_token = proxyToken;
  }
  return chatbotInstance;
}
export function inviteMember(name, query) {
  chatbotInstance = addProxyToken();
  const proxyToken = getProxyToken();
  const data = {
    query: query,
    proxy: proxyToken,
    name: name
  };

  return axios.post(`${apiBaseUrl}/chatbot`, data);
}

export default {
  inviteMember
};
