import http from "./httpService";

const herokuToken = "adfa5eee-ca81-45bf-a856-0f782562b2a5";
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
