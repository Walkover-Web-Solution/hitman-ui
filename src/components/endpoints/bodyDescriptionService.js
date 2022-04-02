import jQuery from 'jquery'

let originalBodyDescription = ''
const parseBody = (rawBody) => {
  let body = {}
  try {
    body = JSON.parse(rawBody)
    return body
  } catch (error) {
    return null
  }
}

function handleUpdate (isFirstTime, props, msg) {
  originalBodyDescription = jQuery.extend(
    true,
    {},
    props.body_description
  )
  const bodyDescription = updateBodyDescription(
    props.body,
    isFirstTime,
    msg
  )
  if (props.set_body_description) props.set_body_description(bodyDescription)
  return bodyDescription
}

function updateBodyDescription (body, isFirstTime, msg) {
  if (msg) { return msg }
  body = { payload: parseBody(body) }
  let bodyDescription = generateBodyDescription(body, isFirstTime)
  if (!isFirstTime) { bodyDescription = preserveDefaultValue(bodyDescription) }
  return bodyDescription
}

function generateBodyDescription (body, isFirstTime) {
  let bodyDescription = null
  let keys = []
  if (!body) {
    return null
  }
  if (Array.isArray(body)) {
    bodyDescription = []
    keys = ['0']
  } else {
    bodyDescription = {}
    keys = Object.keys(body)
  }

  for (let i = 0; i < keys.length; i++) {
    const value = body[keys[i]]
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      if (isFirstTime) {
        bodyDescription[keys[i]] = {
          value,
          type: typeof value,
          description: ''
        }
      } else {
        bodyDescription[keys[i]] = {
          value: null,
          type: typeof value,
          description: ''
        }
      }
    } else {
      if (Array.isArray(value)) {
        bodyDescription[keys[i]] = {
          value: generateBodyDescription(value, isFirstTime),
          type: 'array',
          description: '',
          default: generateBodyDescription(value, isFirstTime)[0]
        }
      } else {
        bodyDescription[keys[i]] = {
          value: generateBodyDescription(value, isFirstTime),
          type: 'object',
          description: ''
        }
      }
    }
  }
  return bodyDescription
}

function preserveDefaultValue (bodyDescription) {
  if (!originalBodyDescription) return bodyDescription
  const copiedOriginalBodyDescription = originalBodyDescription
  let updatedBodyDescription = jQuery.extend(true, {}, bodyDescription)
  updatedBodyDescription = compareDefaultValue(
    updatedBodyDescription,
    copiedOriginalBodyDescription
  )

  return updatedBodyDescription
}

function compareDefaultValue (updatedBodyDescription, originalBodyDescription) {
  if (!updatedBodyDescription) return
  const updatedKeys = Object.keys(updatedBodyDescription)
  for (let i = 0; i < updatedKeys.length; i++) {
    if (
      originalBodyDescription[updatedKeys[i]] &&
      updatedBodyDescription[updatedKeys[i]].type ===
      originalBodyDescription[updatedKeys[i]].type
    ) {
      switch (updatedBodyDescription[updatedKeys[i]].type) {
        case 'string':
        case 'number':
        case 'boolean':
          updatedBodyDescription[updatedKeys[i]].value =
            originalBodyDescription[updatedKeys[i]].value
          updatedBodyDescription[updatedKeys[i]].description =
            originalBodyDescription[updatedKeys[i]].description
          break
        case 'array':
          updatedBodyDescription[
            updatedKeys[i]
          ].value = compareDefaultValue(
            updatedBodyDescription[updatedKeys[i]].value,
            originalBodyDescription[updatedKeys[i]].value
          )
          updatedBodyDescription[
            updatedKeys[i]
          ].default = compareDefaultValue(
            updatedBodyDescription[updatedKeys[i]].value,
            originalBodyDescription[updatedKeys[i]].value
          )[0]
          updatedBodyDescription[updatedKeys[i]].description =
            originalBodyDescription[updatedKeys[i]].description
          break
        case 'object':
          updatedBodyDescription[
            updatedKeys[i]
          ].value = compareDefaultValue(
            updatedBodyDescription[updatedKeys[i]].value,
            originalBodyDescription[updatedKeys[i]].value
          )
          updatedBodyDescription[updatedKeys[i]].description =
            originalBodyDescription[updatedKeys[i]].description
          break
        default:
          break
      }
    }
  }
  return updatedBodyDescription
}

export default {
  parseBody,
  handleUpdate
}
