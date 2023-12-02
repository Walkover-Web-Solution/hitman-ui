import axios from 'axios'
import logger from './logService'
import 'react-toastify/dist/ReactToastify.css'
import { getProxyToken } from '../components/auth/authServiceV2'

// axios.defaults.baseURL = process.env.REACT_APP_API_URL;
var endpointInstance = axios.create()

endpointInstance.interceptors.response.use(null, (error) => {
  const expectedError =
    (error.response &&
    error.response.status >= 400 &&
    error.response.status < 500) || axios.isCancel(error)
  if (!expectedError) {
    logger.log(!error)
  }
  return Promise.reject(error)
})

function setProxyToken (jwt) {
  endpointInstance.defaults.headers.common.proxy_auth_token = jwt
}

function addProxyToken(){
  let proxyToken = getProxyToken();
  if (proxyToken) {
    endpointInstance.defaults.headers.common.proxy_auth_token = proxyToken;
  }
  return endpointInstance;
}

function getMethod(url) {
  endpointInstance = addProxyToken();
  return endpointInstance.get(url)
}
function postMethod(url, data = null) {
  endpointInstance = addProxyToken();
  return endpointInstance.post(url, data)
}

function putMethod(url, data) {
  endpointInstance = addProxyToken();
  return endpointInstance.put(url, data)
}

function deleteMethod(url) {
  endpointInstance = addProxyToken();
  return endpointInstance.delete(url)
}

function requestMethod(){
  endpointInstance = addProxyToken();
  return endpointInstance.request
}

function patchMethod(url, data){
  endpointInstance = addProxyToken();
  return endpointInstance.patch(url, data)
}

export default {
  get: getMethod,
  post: postMethod,
  put: putMethod,
  delete: deleteMethod,
  request: requestMethod(),
  patch: patchMethod,
  setProxyToken
}