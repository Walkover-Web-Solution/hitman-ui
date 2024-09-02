import axios from "axios";
import { getProxyToken } from "./auth/authApiUtils";


const PROXY_URL = process.env.REACT_APP_PROXY_URL;
const proxyToken = getProxyToken()


const proxyRequest = {
  get: (path) => makeProxyApiRequest('GET', path),
  post: (path, body) => makeProxyApiRequest('POST', path, body),
  put: (path, body) => makeProxyApiRequest('PUT', path, body),
  delete: (path) => makeProxyApiRequest('DELETE', path),
  patch: (path, body) => makeProxyApiRequest('PATCH', path, body),
}

const makeProxyApiRequest = async (method, path, body = null) => {
  try {
    const response = await axios({
      method: method,
      url: `${PROXY_URL}${path}`,
      headers: {
        proxy_auth_token: proxyToken,
        'Content-Type': 'application/json',
      },
      data: body,
    });
    return response.data;
  } catch (error) {
    console.error(`Error making ${method} request to ${path}:`, error.response || error.message);
    throw error;
  }
};

export default proxyRequest;