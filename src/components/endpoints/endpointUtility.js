import _ from 'lodash';
import { toast } from 'react-toastify'
import moment from 'moment'
import { bodyTypesEnums, rawTypesEnums } from "../common/bodyTypeEnums";
const rawBodyTypes = Object.keys(rawTypesEnums);

const makeOriginalParams = (keys, values, description, endpointContent) => {
    const originalParams = []
    for (let i = 0; i < endpointContent?.originalParams?.length; i++) {
        if (endpointContent?.originalParams[i].checked === 'false') {
            originalParams.push({
                checked: endpointContent?.originalParams[i].checked,
                key: endpointContent?.originalParams[i].key,
                value: endpointContent?.originalParams[i].value,
                description: endpointContent?.originalParams[i].description,
                type: endpointContent?.originalParams[i].type
            })
        }
    }
    for (let i = 0; i < keys.length; i++) {
        originalParams.push({
            checked: 'true',
            key: keys[i],
            value: values[i],
            description: description[i]
        })
    }
    originalParams.push({
        checked: 'notApplicable',
        key: '',
        value: '',
        description: '',
        type: ''
    })
    return originalParams
}

const makeHeaders = (headers) => {
    const processedHeaders = []
    for (let i = 0; i < Object.keys(headers)?.length; i++) {
        if (headers[Object.keys(headers)[i]].checked === 'true') {
            processedHeaders.push({
                name: headers[Object.keys(headers)[i]].key,
                value: headers[Object.keys(headers)[i]].value,
                comment: headers[Object.keys(headers)[i]].description === null ? '' : headers[Object.keys(headers)[i]].description,
                type: headers[Object.keys(headers)[i]].type
            })
        }
    }
    return processedHeaders
}

const makeParams = (params) => {
    const processedParams = []
    if (params) {
        for (let i = 0; i < Object.keys(params).length; i++) {
            if (params[Object.keys(params)[i]].checked === 'true') {
                processedParams.push({
                    name: params[Object.keys(params)[i]].key,
                    value: params[Object.keys(params)[i]].value,
                    comment: params[Object.keys(params)[i]].description,
                    type: params[Object.keys(params)[i]].type
                })
            }
        }
    }
    return processedParams
}

const makeFormData = (body) => {
    const formData = {}
    for (let i = 0; i < body.length; i++) {
        if (body[i].key.length !== 0 && body[i].checked === 'true') {
            if (body[i].type === 'file') {
                continue
            }
            formData[body[i].key] = body[i].value
        }
    }
    return formData
}

const formatBody = (body, headers) => {
    let finalBodyValue = null
    switch (body.type) {
        case bodyTypesEnums['raw']:
            finalBodyValue = parseBody(body?.raw?.value || '')
            return { body: finalBodyValue, headers }
        case bodyTypesEnums['multipart/form-data']: {
            const formData = makeFormData(body[bodyTypesEnums['multipart/form-data']])
            headers['content-type'] = bodyTypesEnums['multipart/form-data']
            return { body: formData, headers }
        }
        case bodyTypesEnums['application/x-www-form-urlencoded']: {
            const urlEncodedData = {}
            for (let i = 0; i < body?.[bodyTypesEnums['application/x-www-form-urlencoded']].length; i++) {
                if (
                    body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].key.length !== 0 &&
                    body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].checked === 'true'
                ) {
                    urlEncodedData[body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].key] =
                        body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].value
                }
            }
            return { body: urlEncodedData, headers }
        }
        default:
            return { body: body?.raw?.value, headers }
    }
}

const replaceVariables = (str, customEnv, x) => {
    let envVars = x;
    if (customEnv) {
        envVars = customEnv;
    }
    str = str?.toString() || '';
    const regexp = /{{((\w|-|\s)+)}}/g;
    let match = regexp.exec(str);
    const variables = [];
    if (match === null) return str;

    if (!envVars) {
        const missingVariable = match[1];
        return `${missingVariable}`;
    }

    do {
        variables.push(match[1]);
    } while ((match = regexp.exec(str)) !== null);

    variables.forEach(variable => {
        const envVariable = envVars[variable];
        if (!envVariable) return;
        const strToReplace = `{{${variable}}}`;
        str = str.replace(strToReplace, envVariable.currentValue || envVariable.initialValue || '');
    });

    return str;
};

const replaceVariablesInJson = (json, customEnv) => {
    Object.keys(json).forEach(key => {
        const updatedKey = replaceVariables(key, customEnv);
        if (updatedKey !== key) {
            json[updatedKey] = json[key];
            delete json[key];
        }
        json[updatedKey] = replaceVariables(json[updatedKey], customEnv);
    });
    return json;
};

const replaceVariablesInBody = (body, bodyType, customEnv) => {
    if ([bodyTypesEnums['multipart/form-data'], bodyTypesEnums['application/x-www-form-urlencoded']].includes(bodyType)) {
        return replaceVariablesInJson(body, customEnv);
    } else if (rawBodyTypes.includes(bodyType)) {
        return replaceVariables(body, customEnv);
    }
    return body;
};

const prepareBodyForSaving = (body) => {
    const data = _.cloneDeep(body);
    if (data?.type === bodyTypesEnums['multipart/form-data']) {
        data[bodyTypesEnums['multipart/form-data']].forEach(item => {
            if (item.type === 'file') item.value = {};
        });
    }
    return data;
};

const prepareBodyForSending = (body) => {
    const data = _.cloneDeep(body);
    if (data.type === bodyTypesEnums['multipart/form-data']) {
        data[bodyTypesEnums['multipart/form-data']].forEach(item => {
            if (item.type === 'file') item.value.srcPath = '';
        });
    }
    return data;
};

const prepareHeaderCookies = (url, cookiess) => {
    if (!url) return null
    const domainUrl = url.split('/')[2]
    let cookies
    Object.values(cookiess || {}).forEach((domain) => {
        if (domain.domain === domainUrl) {
            cookies = domain?.cookies
        }
    })
    if (cookies) {
        let cookieString = ''
        Object.values(cookies || {}).forEach((cookie) => {
            let time
            const expires = cookie.split(';')[2]
            if (expires.split('=')[1]) {
                time = expires.split('=')[1]
            }
            time = moment(time)
            if (!(time && moment(time).isBefore(moment().format()))) {
                cookieString += cookie.split(';')[0] + '; '
            }
        })
        return cookieString
    }
    return null
}

const parseBody = (rawBody) => {
    let body = {}
    try {
        body = JSON.parse(rawBody)
        return body
    } catch (error) {
        toast.error('Invalid Body')
        return body
    }
}

const identifyBodyType = (bodyType) => {
    switch (bodyType) {
        case bodyTypesEnums['application/x-www-form-urlencoded']:
            return bodyTypesEnums['application/x-www-form-urlencoded']
        case bodyTypesEnums['multipart/form-data']:
            return bodyTypesEnums['multipart/form-data']
        case rawTypesEnums.TEXT:
            return 'text/plain'
        case rawTypesEnums.JSON:
            return 'application/json'
        case rawTypesEnums.HTML:
            return 'text/HTML'
        case rawTypesEnums.XML:
            return 'application/XML'
        case rawTypesEnums.JavaScript:
            return 'application/JavaScript'
        default:
            break
    }
}

const isBase64=(response)=> {
    if (typeof response !== 'string') {
      return false
    }
    const base64Pattern = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
    return base64Pattern.test(response)
  }

export {
    replaceVariables,
    replaceVariablesInJson,
    replaceVariablesInBody,
    prepareBodyForSaving,
    prepareBodyForSending,
    prepareHeaderCookies,
    makeOriginalParams,
    makeParams,
    makeHeaders,
    formatBody,
    makeFormData,
    parseBody,
    identifyBodyType,
    isBase64
};