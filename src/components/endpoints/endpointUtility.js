const { bodyTypesEnums, rawTypesEnums } = require("../common/bodyTypeEnums")
const rawBodyTypes = Object.keys(rawTypesEnums)

function replaceVariables(str, customEnv, x) {
    let envVars = x
    if (customEnv) {
        envVars = customEnv
    }
    str = str?.toString() || ''
    const regexp = /{{((\w|-|\s)+)}}/g
    let match = regexp.exec(str)
    const variables = []
    if (match === null) return str

    if (!envVars) {
        const missingVariable = match[1]
        return `${missingVariable}`
    }

    do {
        variables.push(match[1])
    } while ((match = regexp.exec(str)) !== null)

    for (let i = 0; i < variables.length; i++) {
        const envVariable = envVars[variables[i]]
        if (!envVariable) continue
        const strToReplace = `{{${variables[i]}}}`
        if (envVariable?.currentValue) {
            str = str.replace(strToReplace, envVariable.currentValue)
        } else if (envVariable?.initialValue) {
            str = str.replace(strToReplace, envVariable.initialValue)
        } else {
            str = str.replace(strToReplace, '')
        }
    }

    return str
}

function replaceVariablesInJson(json, customEnv) {
    const keys = Object.keys(json)
    for (let i = 0; i < keys.length; i++) {
        json[keys[i]] = replaceVariables(json[keys[i]], customEnv)
        const updatedKey = replaceVariables(keys[i], customEnv)
        if (updatedKey !== keys[i]) {
            json[updatedKey] = json[keys[i]]
            delete json[keys[i]]
        }
    }
    return json
}
function replaceVariablesInBody(body, bodyType, customEnv) {
    if (bodyType === bodyTypesEnums['multipart/form-data'] || bodyType === bodyTypesEnums['application/x-www-form-urlencoded']) {
        body = replaceVariablesInJson(body, customEnv)
    } else if (rawBodyTypes?.includes(bodyType)) {
        body = replaceVariables(body, customEnv)
    }
    return body
}

module.exports = {
    replaceVariables,
    replaceVariablesInJson,
    replaceVariablesInBody,
};