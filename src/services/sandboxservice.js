const vm = require('vm')
const _ = require('lodash')

class Environment {
  constructor (env, setCallback) {
    this.environment = _.clone(env)
    this.originalEnv = _.clone(env)
    this.setCallback = setCallback
  }

  environment = {};

  set (variableName, variableValue) {
    if (_.isString(variableName)) {
      const trimmedKey = variableName.trim()
      if (trimmedKey.length) this.environment[trimmedKey] = variableValue
    }
  }

  unset (variableName) {
    if (this.has(variableName)) { delete this.environment[variableName] }
  }

  get (variableName) {
    return this.environment[variableName]
  }

  clear () {
    this.environment = {}
  }

  has (variableName) {
    if (this.environment[variableName]) { return true } else { return false }
  }

  updateCallback () {
    if (!_.isEqual(this.environment, this.originalEnv) && this.setCallback) {
      this.setCallback(this.environment)
    }
  }

  getEnvironment () {
    const environment = {}
    for (const [key, value] of Object.entries(this.environment)) {
      environment[key] = {
        initialValue: '',
        currentValue: value
      }
    }
    return environment
  }
}

class Request {
  constructor (request) {
    this.url = request.url
    this.headers = new HeaderList(request.headers)
    this.method = request.method
    this.body = request.body
  }

  getRequest () {
    return {
      url: this.url,
      headers: this.headers.getHeaders(),
      method: this.method,
      body: this.body
    }
  }
}

class Response {
  constructor (response) {
    this.status = response.status
    this.statusText = response.statusText
    this.headers = new HeaderList(response.headers)
    this.body = response.body
  }

  getResponse () {
    return {
      status: this.status,
      headers: this.headers.getHeaders(),
      statusText: this.statusText,
      body: this.body
    }
  }
}

class HeaderList {
  constructor (headers) {
    this.headers = _.clone(headers)
  }

  headers = {};

  add (key, value = '') {
    if (key) {
      const trimmedKey = key.toString().trim()
      if (trimmedKey.length) this.headers[trimmedKey] = value
    }
  }

  remove (headerName) {
    if (this.has(headerName)) {
      delete this.headers[headerName]
    }
  }

  has (headerName) {
    return !!(this.headers[headerName])
  }

  get (headerName) {
    return (this.headers[headerName])
  }

  getHeaders () {
    return this.headers
  }
}

class HitmanSandbox {
  constructor ({ request, environment, response }) {
    this.environment = environment
    this.request = request
    this.response = response
  }
}

export function run (code, sandbox) {
  const hm = sandbox
  const context = { hm, console: console }
  try {
    const script = new vm.Script(code)
    script.runInNewContext(context)
    sandbox.environment.updateCallback()
    const environment = context.hm.environment.getEnvironment()
    const request = context.hm.request.getRequest()
    return { success: true, data: { environment, request } }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export function initialize ({ request, environment, response }) {
  if (environment) environment = new Environment(environment.value, environment.callback)
  if (request) request = new Request(request.value)
  if (response) response = new Response(response.value)
  return new HitmanSandbox({ environment, request, response })
}

export default {
  run,
  initialize
}
