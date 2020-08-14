import http from "./httpService";

const herokuToken = "0a1191f5-5ca0-4a88-a4c6-1e9a8b16cd77";
const appName = "hitman-ui";

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
