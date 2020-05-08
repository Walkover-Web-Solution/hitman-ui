// import http from "../../services/http";
import httpService from "./endpointHttpService";
import http from "./httpService";

const herokuToken = "5bb3b4dd-c590-4b68-a337-4ba2ca78d180";
const appName = "socket-sample-app";

export function getConfigVars() {
  return http.request({
    url: `https://api.heroku.com/apps/${appName}/config-vars`,
    method: "GET",
    headers: {
      Accept: " application/vnd.heroku+json; version=3",
      Authorization: `Bearer ${herokuToken}`,
    },
  });
}

export function updateConfigVars(variablesJson) {
  return http.request({
    url: `https://api.heroku.com/apps/${appName}/config-vars`,
    method: "PATCH",
    data: variablesJson,
    headers: {
      "Content-Type": "application/json",
      Accept: " application/vnd.heroku+json; version=3",
      Authorization: `Bearer ${herokuToken}`,
    },
  });
}

export function createDomain(domainName) {
  return http.request({
    url: `https://api.heroku.com/apps/${appName}/domains`,
    method: "POST",
    data: { hostname: domainName },
    headers: {
      "Content-Type": "application/json",
      Accept: " application/vnd.heroku+json; version=3",
      Authorization: `Bearer ${herokuToken}`,
    },
  });
}

export function deleteDomain(domainName) {
  return http.request({
    url: `https://api.heroku.com/apps/${appName}/domains/${domainName}`,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: " application/vnd.heroku+json; version=3",
      Authorization: `Bearer ${herokuToken}`,
    },
  });
}

export default {
  getConfigVars,
  updateConfigVars,
  createDomain,
  deleteDomain,
};
