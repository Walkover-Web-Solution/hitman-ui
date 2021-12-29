import Joi from 'joi-browser'
import history from '../../history'
import { sendAmplitudeData } from '../../services/amplitude'

export const ADD_GROUP_MODAL_NAME = 'Add Group'
export const ADD_VERSION_MODAL_NAME = 'Add Version'

export function isDashboardRoute (props, sidebar = false) {
  if (
    props.match.path.includes('/dashboard') ||
    props.match.path.includes('/orgs/:orgId/dashboard') ||
    (sidebar === true && props.match.path.includes('/orgs/:orgId/admin/publish'))
  ) { return true } else return false
}

export function isElectron () {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.indexOf(' electron/') !== -1
}

export function openExternalLink (link) {
  sendAmplitudeData('Download')
  if (isElectron()) { window.require('electron').shell.openExternal(link) } else { window.open(link, '_blank') }
}

export function isSavedEndpoint (props) {
  const pathname = props.location.pathname
  if (
    pathname.split('/')[4] === 'endpoint' &&
    pathname.split('/')[5] !== 'new'
  ) { return true } else return false
}

export function setTitle (title) {
  if (typeof title === 'string') {
    if (title.trim().length > 0) {
      document.title = title.trim() + ' API Documentation'
    } else {
      document.title = 'API Documentation'
    }
  }
}

function imageExists (url, exists) {
  const img = new window.Image()
  img.onload = function () { exists(true) }
  img.onerror = function () { exists(false) }
  img.src = url
}

export function setFavicon (link) {
  if (typeof link === 'string') {
    if (link.trim().length > 0) {
      imageExists(link.trim(), function (exists) {
        if (exists) {
          document.getElementById('favicon').href = link.trim()
        }
      })
    }
  }
}

export function validate (data, schema) {
  const options = { abortEarly: false }
  const { error } = Joi.validate(data, schema, options)
  if (!error) return null
  const errors = {}
  for (const item of error.details) errors[item.path[0]] = item.message
  return errors
};

export function comparePositions (a, b) {
  if (parseInt(a.position) < parseInt(b.position)) return -1
  else if (parseInt(a.position) > parseInt(b.position)) return 1
  else return 0
}

export function getProfileName (currentUser) {
  let name = ''
  if (typeof currentUser.first_name === 'string') {
    name = currentUser.first_name.trim()
  }
  if (typeof currentUser.last_name === 'string') {
    name = name + ' ' + currentUser.last_name.trim()
  }
  name = name.trim()
  if (name) {
    return name
  } else {
    return null
  }
}

export function onEnter (event, submitForm) {
  if (event.charCode === 13) {
    submitForm()
  }
}

export function toTitleCase (str) {
  if (!str) return str
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export function getOrgId () {
  const path = history.location.pathname.split('/')?.[2]
  if (path) { return path } else {
    let orgList = window.localStorage.getItem('organisationList')
    orgList = JSON.parse(orgList)
    return orgList?.[0]?.identifier
  }
}

export function getParentIds (id, type, data) {
  let entities = {}
  const parentIds = { collectionId: '', versionId: '', groupId: '' }
  const { pages, endpoints, groups, versions } = data

  switch (type) {
    case 'page': entities = pages
      break
    case 'endpoint': entities = endpoints
      break
    default: entities = {}
  }

  const entity = entities[id]
  if (!entity) {
    return parentIds
  }

  const groupId = entity.groupId
  let versionId = ''

  if (groupId) {
    parentIds.groupId = groupId
    versionId = groups[entity.groupId]?.versionId
  } else if (entity.versionId) {
    versionId = entity.versionId
  }

  let collectionId = ''

  if (versionId) {
    parentIds.versionId = versionId
    collectionId = versions[versionId]?.collectionId
  }

  if (collectionId) {
    parentIds.collectionId = collectionId
  }

  return parentIds
}

export default {
  isDashboardRoute,
  isElectron,
  isSavedEndpoint,
  setTitle,
  setFavicon,
  getProfileName,
  onEnter,
  toTitleCase,
  getOrgId,
  ADD_GROUP_MODAL_NAME,
  ADD_VERSION_MODAL_NAME,
  getParentIds
}
