import http from "./httpService";

export function getEnvVariables() {
    return http.request({
      url: `https://circleci.com/api/v2/context/${process.env.REACT_APP_CIRCLECI_CONTEXT_ID}/environment-variable`,
      method: "GET",
      headers: {
        "Circle-Token": process.env.REACT_APP_CIRCLECI_TOKEN,
      },
    });
  }

  export function addEnvVariable(envVarName,value) {
    return http.request({
      url: `https://circleci.com/api/v2/context/${process.env.REACT_APP_CIRCLECI_CONTEXT_ID}/environment-variable/${envVarName}`,
      method: "PUT",
      headers: {
        "Circle-Token": process.env.REACT_APP_CIRCLECI_TOKEN,
      },
      data: {value}
    });
  }

  export function deleteEnvVariable(envVarName) {
    return http.request({
      url: `https://circleci.com/api/v2/context/${process.env.REACT_APP_CIRCLECI_CONTEXT_ID}/environment-variable/${envVarName}`,
      method: "DELETE",
      headers: {
        "Circle-Token": process.env.REACT_APP_CIRCLECI_TOKEN,
      }
    });
  }

  export default {
    getEnvVariables,
    addEnvVariable,
    deleteEnvVariable
  };