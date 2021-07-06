const querystring = require('querystring')
const FormData = require('form-data')
const axios = require('axios')

export async function makeHttpRequestThroughAxios ({ api: url, method, body: data, header: headers }) {
  headers = headers || {}

  const options = {
    method: method,
    url: encodeURI(url),
    headers,
    data,
    proxy: false
  }

  if (headers['content-type'] === 'multipart/form-data') {
    const bodyFormData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      bodyFormData.append(key, value)
    }
    options.data = bodyFormData
    options.headers = { ...headers, ...bodyFormData.getHeaders() }
  } else if (headers['content-type'] === 'application/x-www-form-urlencoded') {
    options.data = querystring.stringify(data)
  }

  return new Promise((resolve, reject) => {
    axios(options)
      .then(function (response) {
        resolve({
          status: 200,
          data: prepareResponse(response)
        })
      })
      .catch(function (error) {
        if (!error.response) {
          resolve({
            status: 200,
            data: { success: false, error }
          })
        } else {
          resolve({
            status: 200,
            data: prepareResponse(error.response)
          })
        }
      })
  })
}

function prepareResponse (data) {
  return {
    success: true,
    status: data.status,
    statusText: data.statusText,
    response: data.data,
    headers: data.headers
  }
}
