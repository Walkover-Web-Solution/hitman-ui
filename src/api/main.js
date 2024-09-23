import axios from 'axios';
import { getProxyToken } from '../components/auth/authServiceV2';
import { getOrgId } from '../components/common/utility';

const BASE_URL = process.env.REACT_APP_API_URL;

const apiRequest = {
    get: (path) => makeApiRequest('GET', path),
    post: (path, body) => makeApiRequest('POST', path, body),
    put: (path, body) => makeApiRequest('PUT', path, body),
    delete: (path) => makeApiRequest('DELETE', path),
    patch: (path, body) => makeApiRequest('PATCH', path, body),
    request: (config) => makeCustomApiRequest(config),
};

const makeApiRequest = async (method, path, body = null) => {
    const proxyToken = getProxyToken();
    const orgId = getOrgId();

    try {
        const response = await axios({
            method: method,
            url: `${BASE_URL}/orgs/${orgId}${path}`,
            headers: {
                proxy_auth_token: proxyToken,
                'Content-Type': 'application/json',
            },
            data: body,
        });
        return response;
    } catch (error) {
        console.error(`Error making ${method} request to ${path}:`, error.response || error.message);
        throw error;
    }
};


const makeCustomApiRequest = async (config) => {
    const proxyToken = getProxyToken();
    const orgId = getOrgId();

    config.url = config.url.includes(BASE_URL)
        ? config.url
        : `${BASE_URL}/orgs/${orgId}${config.url}`;

    config.headers = {
        ...config.headers,
        proxy_auth_token: proxyToken,
        'Content-Type': config.headers?.['Content-Type'] || 'application/json',
    };

    try {
        const response = await axios(config);
        return response;
    } catch (error) {
        console.error(`Error making custom request to ${config.url}:`, error.response || error.message);
        throw error;
    }
};

export default apiRequest;
