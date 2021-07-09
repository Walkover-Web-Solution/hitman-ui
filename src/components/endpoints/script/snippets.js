const Snippets = {
  getEnv: {
    key: 'Get an environment variable',
    value: 'hm.environment.get("variable_key");'
  },
  setEnv: {
    key: 'Set an environment variable',
    value: 'hm.environment.set("variable_key", "variable_value");'
  },
  unSetEnv: {
    key: 'unset an environment variable',
    value: 'hm.environment.unset("variable_name");'
  },
  clearEnv: {
    key: 'Clear all environment variables',
    value: 'hm.environment.clear();'
  },
  hasEnv: {
    key: 'Check whether the environment has a variable with the specified name',
    value: 'hm.environment.has("variable_name");'
  },
  reqUrl: {
    key: 'Get request Url',
    value: 'hm.request.url;'
  },
  reqHeaderAdd: {
    key: 'Add header to the current request',
    value: 'hm.request.headers.add("key","value");'
  },
  reqMethod: {
    key: 'Get HTTP request method',
    value: 'hm.request.method;'
  },
  reqBody: {
    key: 'Get list of headers for the current request',
    value: 'hm.request.body;'
  },
  reqHeaderRemove: {
    key: 'Delete the request header with the specified name',
    value: 'hm.request.headers.remove("header_name");'
  },
  hasHeader: {
    key: 'Check whether the header has a variable with the specified name',
    value: 'hm.request.headers.has("variable_name");'
  }
}

export default Snippets
