import _ from 'lodash';
import moment from 'moment'
import { bodyTypesEnums, rawTypesEnums } from "../common/bodyTypeEnums";
const rawBodyTypes = Object.keys(rawTypesEnums);

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

export {
    replaceVariables,
    replaceVariablesInJson,
    replaceVariablesInBody,
    prepareBodyForSaving,
    prepareBodyForSending,
    prepareHeaderCookies
};