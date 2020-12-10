function getHighlightsData (props, title, key) {
  let items = {}
  switch (title) {
    case 'Headers':
      typeof props.highlights?.headers?.items === 'object' ? items = props.highlights.headers.items : items = {}
      break
    case 'Params':
      typeof props.highlights?.params?.items === 'object' ? items = props.highlights.params.items : items = {}
      break
    case 'Path Variables':
      typeof props.highlights?.pathVariables?.items === 'object' ? items = props.highlights.pathVariables.items : items = {}
      break
    case 'formData':
      typeof props.highlights?.body?.value?.items === 'object' ? items = props.highlights.body.value.items : items = {}
      break
    case 'x-www-form-urlencoded':
      typeof props.highlights?.body?.value?.items === 'object' ? items = props.highlights.body.value.items : items = {}
      break
    case 'sampleResponse':
      typeof props.highlights?.sampleResponse?.items === 'object' ? items = props.highlights.sampleResponse.items : items = {}
      break
  }
  return (key in items) ? items[key] : false
}

function willHighlight (props, title) {
  let result = false
  switch (title) {
    case 'Headers':
      result = typeof props.highlights?.headers?.isChanged === 'boolean' ? props.highlights.headers.isChanged : false
      break
    case 'Params':
      result = typeof props.highlights?.params?.isChanged === 'boolean' ? props.highlights.params.isChanged : false
      break
    case 'Path Variables':
      result = typeof props.highlights?.pathVariables?.isChanged === 'boolean' ? props.highlights.pathVariables.isChanged : false
      break
    case 'formData':
      result = typeof props.highlights?.body?.isChanged === 'boolean' ? props.highlights.body.isChanged : false
      break
    case 'x-www-form-urlencoded':
      result = typeof props.highlights?.body?.isChanged === 'boolean' ? props.highlights.body.isChanged : false
      break
    case 'sampleResponse':
      result = typeof props.highlights?.sampleResponse?.isChanged === 'boolean' ? props.highlights.sampleResponse.isChanged : false
      break
  }
  return result
}

export {
  getHighlightsData,
  willHighlight
}
