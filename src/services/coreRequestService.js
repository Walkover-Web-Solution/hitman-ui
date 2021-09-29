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
  console.log(url, method, data, headers)
  if (headers['content-type'] === 'multipart/form-data') {
    const bodyFormData = new FormData()
    for (let [key, value] of Object.entries(data)) {
      if (value.type === 'file') {
        const { app } = require('electron')
        let path = app.getPath('userData')
        path = path + '/fileUploads/' + value.id
        const fs = window.require('fs')
        try {
          value = fs.readFileSync(path)
        } catch (e) {
          console.log(e)
        }
      }
      console.log('xyz' + value)
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
