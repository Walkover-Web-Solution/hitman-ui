import axios from 'axios'
import logger from './logService'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import history from '../history'
import { logout,getProxyToken } from '../components/auth/authServiceV2'

axios.defaults.baseURL = process.env.REACT_APP_API_URL

var instance = axios.create()
instance.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500

  if (error.response.config.method === 'get' && error.response.status === 404) {
    history.push({
      pathname: '/404_PAGE',
      error: error
    })
  }

  if (error.response.config.method === 'get' && error.response.status === 403) {
    history.push({
      pathname: '/403_PAGE',
      error: error
    })
  }

  if (!expectedError) {
    logger.log(!error)
    toast.error('An unexpected error occur')
  }
  if (error?.response?.status === 401) {
    toast.error('Session Expired')
    logout(window.location.pathname)
  }
  return Promise.reject(error)
})

function setProxyToken (jwt) {
  instance.defaults.headers.common.proxy_auth_token = jwt
}

function addProxyToken(){
  let proxyToken = getProxyToken();
  if (proxyToken) {
    instance.defaults.headers.common.proxy_auth_token = proxyToken;
  }
  return instance;
}

function getMethod() {
  instance = addProxyToken();
  return instance.get
}
function postMethod() {
  instance = addProxyToken();
  return instance.post
}

function putMethod() {
  instance = addProxyToken();
  return instance.put
}

function deleteMethod() {
  instance = addProxyToken();
  return instance.delete
}

function requestMethod(){
  instance = addProxyToken();
  return instance.request
}

function patchMethod(){
  instance = addProxyToken();
  return instance.patch
}

export default {
  get:getMethod(),
  post:postMethod(),
  put:putMethod(),
  delete: deleteMethod(),
  request:requestMethod(),
  patch:patchMethod(),
  setProxyToken
}