import * as Sentry from '@sentry/react'
import Joi from 'joi-browser'
import { getProxyToken } from '../auth/authServiceV2'
// import history from '../../history'
import { initAmplitude } from '../../services/amplitude'
import { scripts } from './scripts'
import jwtDecode from 'jwt-decode'
import { cloneDeep } from 'lodash'
export const ADD_GROUP_MODAL_NAME = 'Add Page'
export const ADD_VERSION_MODAL_NAME = 'Add Version'
export const ADD_PAGE_MODAL_NAME = 'Add Parent Page'
export const DEFAULT_URL = 'https://'

// 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
const statesEnum = {
  PENDING_STATE: 0,
  REJECT_STATE: 3,
  APPROVED_STATE: 2,
  DRAFT_STATE: 1
}

const tokenKey = 'token'
const profileKey = 'profile'
const orgKey = 'organisation'
const orgListKey = 'organisationList'
const proxyUrl = process.env.REACT_APP_PROXY_URL

export function sentryIntegration() {
  Sentry.init({
    dsn: 'https://86101cad854954725647e4b1b405ba9b@o4506399919243264.ingest.sentry.io/4506399921143808',
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: [
          'localhost',
          'localhost:3000',
          'https://dev-techdoc.walkover.in/',
          'https://techdoc.walkover.in/',
          /^https:\/\/yourserver\.io\/api/
        ]
      }),
      new Sentry.Replay()
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  })
}

export function getDomainName(hostname) {
  const firstTLDs =
    'ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|be|bf|bg|bh|bi|bj|bm|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|cl|cm|cn|co|cr|cu|cv|cw|cx|cz|de|dj|dk|dm|do|dz|ec|ee|eg|es|et|eu|fi|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jo|jp|kg|ki|km|kn|kp|kr|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|na|nc|ne|nf|ng|nl|no|nr|nu|nz|om|pa|pe|pf|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|yt'.split(
      '|'
    )

  const secondTLDs =
    'com|edu|gov|net|mil|org|nom|sch|caa|res|off|gob|int|tur|ip6|uri|urn|asn|act|nsw|qld|tas|vic|pro|biz|adm|adv|agr|arq|art|ato|bio|bmd|cim|cng|cnt|ecn|eco|emp|eng|esp|etc|eti|far|fnd|fot|fst|g12|ggf|imb|ind|inf|jor|jus|leg|lel|mat|med|mus|not|ntr|odo|ppg|psc|psi|qsl|rec|slg|srv|teo|tmp|trd|vet|zlg|web|ltd|sld|pol|fin|k12|lib|pri|aip|fie|eun|sci|prd|cci|pvt|mod|idv|rel|sex|gen|nic|abr|bas|cal|cam|emr|fvg|laz|lig|lom|mar|mol|pmn|pug|sar|sic|taa|tos|umb|vao|vda|ven|mie|北海道|和歌山|神奈川|鹿児島|ass|rep|tra|per|ngo|soc|grp|plc|its|air|and|bus|can|ddr|jfk|mad|nrw|nyc|ski|spy|tcm|ulm|usa|war|fhs|vgs|dep|eid|fet|fla|flå|gol|hof|hol|sel|vik|cri|iwi|ing|abo|fam|gok|gon|gop|gos|aid|atm|gsm|sos|elk|waw|est|aca|bar|cpa|jur|law|sec|plo|www|bir|cbg|jar|khv|msk|nov|nsk|ptz|rnd|spb|stv|tom|tsk|udm|vrn|cmw|kms|nkz|snz|pub|fhv|red|ens|nat|rns|rnu|bbs|tel|bel|kep|nhs|dni|fed|isa|nsn|gub|e12|tec|орг|обр|упр|alt|nis|jpn|mex|ath|iki|nid|gda|inc'.split(
      '|'
    )

  const knownSubdomains =
    'www|studio|mail|remote|blog|webmail|server|ns1|ns2|smtp|secure|vpn|m|shop|ftp|mail2|test|portal|ns|ww1|host|support|dev|web|bbs|ww42|squatter|mx|email|1|mail1|2|forum|owa|www2|gw|admin|store|mx1|cdn|api|exchange|app|gov|2tty|vps|govyty|hgfgdf|news|1rer|lkjkui'

  const knownSubdomainsRegExp = new RegExp(`^(${knownSubdomains}).`, 'i')
  hostname = hostname.replace(knownSubdomainsRegExp, '')

  const parts = hostname.split('.')

  while (parts.length > 3) {
    parts.shift()
  }

  if (
    parts.length === 3 &&
    ((parts[1].length > 2 && parts[2].length > 2) || (secondTLDs.indexOf(parts[1]) === -1 && firstTLDs.indexOf(parts[2]) === -1))
  ) {
    parts.shift()
  }

  return parts[0] || ''
}
export const msgText = {
  publishPage: 'You are about to make these changes live on your Public API doc.',
  viewSwitch: 'Do you wish to set it as default view?',
  publishEndpoint: 'You are about to make these changes live on your Public API doc.',
  adminAccees: 'Admin access required'
}

export function isDashboardRoute(props, sidebar = false) {
  if (
    
    props.match.path.includes('/dashboard') ||
    props.match.path.includes('/orgs/:orgId/dashboard') ||
    (sidebar === true && props.match.path.includes('/orgs/:orgId/admin/publish')) ||
    (sidebar === true && props.match.path.includes('/orgs/:orgId/admin/feedback'))
  ) {
    return true
  } else return false
}

export function redirectToDashboard(orgId) {
  if (isElectron()) {
    window.location.hash = `/orgs/${orgId}/dashboard`
    window.location.reload()
  } else {
    window.location = `/orgs/${orgId}/dashboard`
  }
}

export function isElectron() {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.indexOf(' electron/') !== -1
}

export function openExternalLink(link) {
  if (isElectron()) {
    window.require('electron').shell.openExternal(link)
  } else {
    window.open(link, '_blank')
  }
}

export function isSavedEndpoint(props) {
  const pathname = props.location.pathname
  if (pathname.split('/')[4] === 'endpoint' && pathname.split('/')[5] !== 'new') {
    return true
  } else return false
}

export function setTitle(title) {
  if (typeof title === 'string') {
    if (title.trim().length > 0) {
      document.title = title.trim() + ' API Documentation'
    } else {
      document.title = 'API Documentation'
    }
  }
}

function imageExists(url, exists) {
  const img = new window.Image()
  img.onload = function () {
    exists(true)
  }
  img.onerror = function () {
    exists(false)
  }
  img.src = url
}

export function setFavicon(link) {
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

export function validate(data, schema) {
  const options = { abortEarly: false }
  const { error } = Joi.validate(data, schema, options)
  if (!error) return null
  const errors = {}
  for (const item of error.details) errors[item.path[0]] = item.message
  return errors
}

export function comparePositions(a, b) {
  if (parseInt(a.position) < parseInt(b.position)) return -1
  else if (parseInt(a.position) > parseInt(b.position)) return 1
  else return 0
}

export function getProfileName(currentUser) {
  let name = ''
  if (typeof currentUser.name === 'string') {
    name = currentUser.first_name.trim()
  }
  name = name.trim()
  if (name) {
    return name
  } else {
    return null
  }
}

export function onEnter(event, submitForm) {
  if (event.charCode === 13) {
    submitForm()
  }
}

export function toTitleCase(str) {
  if (!str) return str
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export function getOrgId() {
  // const path = history.location.pathname
  // if (path) { return path } else {
  let orgList = window.localStorage.getItem('organisationList')
  orgList = JSON.parse(orgList)
  return orgList?.[0]?.id
  // }
}

export function getParentIds(id, type, data) {
  let entities = {}
  const parentIds = { collectionId: '', versionId: '', groupId: '', pageId: '' }
  const { pages, endpoints, groups, versions } = data

  switch (type) {
    case 'page':
      entities = pages
      break
    case 'endpoint':
      entities = endpoints
      break
    default:
      entities = {}
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
  const pageId = ''
  if (pageId) {
    parentIds.pageId = pageId
    collectionId = pages[pageId]?.collectionId
  }

  if (collectionId) {
    parentIds.collectionId = collectionId
  }

  return parentIds
}

export function handleChangeInUrlField(data) {
  const inputValue = data
  const protocolRegex = /^(?:([a-z]+:\/\/))/i
  const protocol = inputValue.split('/')[0]
  /** Checks if there is two protocols one after one either by mean of pasting URL
   * or by appending by mistake, in that case first protocol from left is  removed */
  if (inputValue.match(protocolRegex)) {
    const domain = inputValue.substring(protocol.length + 2)
    if (domain.match(protocolRegex)) {
      data = domain
    }
  }
  return data
}

export function handleBlurInUrlField(data) {
  const inputValue = data
  const protocolRegex = /^(?:([a-z]+:\/\/))/i
  let protocol = inputValue.split('/')[0]
  protocol = inputValue.substring(0, protocol.length + 2)
  // Checks for inputValue has protocol or not, and if not then prefixes https:// with it
  if (!protocol.match(protocolRegex)) {
    data = `https://${inputValue}`
  }
  return data
}

/** Utility function to format size in Bytes to respective decimal places */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function isValidDomain() {
  const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
  const currentDomain = window.location.href.split('/')[2]
  const path = window.location.href.split('/')[3]
  return domainsList.includes(currentDomain) && path !== 'p'
}

export function addAnalyticsScripts() {
  if (isValidDomain() && process.env.REACT_APP_ENV === 'production') {
    Object.keys(scripts).forEach((script) => {
      script !== 'gtmBody'
        ? (document.getElementsByTagName('head')[0].innerHTML += scripts[script])
        : (document.getElementsByTagName('body')[0].innerHTML += scripts[script])
    })
    initAmplitude()
  }
}

export function isNotDashboardOrDocView(props, view) {
  return !isDashboardRoute(props) || view === 'doc'
}

export function isDashboardAndTestingView(props, view) {
  return isDashboardRoute(props) && (view === 'testing' || !isSavedEndpoint(props))
}

function checkVariableExist(id, entity) {
  if (entity && entity[id] && entity[id].state !== undefined && entity[id].state !== null) return true
  return false
}

export function isStateApproved(id, entity) {
  if (!checkVariableExist(id, entity)) return false
  return entity[id].state === statesEnum.APPROVED_STATE
}

export function isStatePending(id, entity) {
  if (!checkVariableExist(id, entity)) return false
  return entity[id].state === statesEnum.PENDING_STATE
}

export function isStateDraft(id, entity) {
  if (!checkVariableExist(id, entity)) return false
  return entity[id].state === statesEnum.DRAFT_STATE
}

export function isStateReject(id, entity) {
  if (!checkVariableExist(id, entity)) return false
  return entity[id].state === statesEnum.REJECT_STATE
}

export function hexToRgb(hex, opacity) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')' // return 23,14,45 -> reformat if needed
  }
  return null
}

export function sensitiveInfoFound(endpoint) {
  // check for sensitive info in request here
  let result = false
  // first check access_token in params
  if (typeof endpoint?.params?.access_token === 'object') {
    const value = typeof endpoint.params.access_token.value === 'string' ? endpoint.params.access_token.value : ''
    const authData = value.split(' ')
    if (authData.length === 1) {
      try {
        jwtDecode(authData[0])
        return true
      } catch (err) {
        result = false
      }
    }
  }
  // first check Authorization in headers
  if (typeof endpoint?.headers?.Authorization === 'object') {
    const value = typeof endpoint.headers.Authorization.value === 'string' ? endpoint.headers.Authorization.value : ''
    const authData = value.split(' ')
    if (authData.length === 1) {
      try {
        jwtDecode(authData[0])
        return true
      } catch (err) {
        result = false
      }
    }
    if (authData.length === 2) {
      switch (authData[0]) {
        case 'Basic':
          try {
            const string = authData[1]
            window.atob(string)
            return true
          } catch (err) {
            result = false
          }
          break
        case 'Bearer':
          try {
            jwtDecode(authData[1])
            return true
          } catch (err) {
            result = false
          }
          break
        default:
          result = false
      }
    }
  }
  // check for all params if theres any JWT token
  if (typeof endpoint.params === 'object') {
    Object.entries(endpoint.params).forEach((entry) => {
      const value = typeof entry[1].value === 'string' ? entry[1].value : ''
      const authData = value.split(' ')
      authData.forEach((item) => {
        try {
          jwtDecode(item)
          result = true
        } catch (err) {}
      })
    })
  }
  // check all headers if theres any JWT token
  if (typeof endpoint.headers === 'object') {
    Object.entries(endpoint.headers).forEach((entry) => {
      const value = typeof entry[1].value === 'string' ? entry[1].value : ''
      const authData = value.split(' ')
      authData.forEach((item) => {
        try {
          jwtDecode(item)
          result = true
        } catch (err) {}
      })
    })
  }
  return result
}

export function getEntityState(entityId, entity) {
  const isPublic = entity[entityId].isPublished
  if (isStatePending(entityId, entity)) return 'Pending'
  if (isStateReject(entityId, entity)) return 'Rejected'
  if (isStateApproved(entityId, entity)) return 'Approved'
  if (isStateDraft(entityId, entity) && isPublic) return 'Request Publish'
  if (isStateDraft(entityId, entity) && !isPublic) return 'Make Public'
}

export function validateEmail(email) {
  const emailIdValidationRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
  return emailIdValidationRegex.test(email)
}

export function getUserProfile() {
  let user = window.localStorage.getItem('profile')
  try {
    user = JSON.parse(user)
    return user
  } catch (e) {}
}

export function getCurrentUserSSLMode() {
  let sslModeData = window.localStorage.getItem('ssl-mode')
  const user = getUserProfile() || {}
  try {
    sslModeData = JSON.parse(sslModeData)
    const { identifier } = user
    return sslModeData?.[identifier]
  } catch (e) {}
}

export function setCurrentUserSSLMode(sslModeFlag) {
  let sslModeData = window.localStorage.getItem('ssl-mode') || '{}'
  const user = getUserProfile() || {}
  const { identifier } = user
  try {
    sslModeData = JSON.parse(sslModeData || '{}')
    const sslMode = { ...sslModeData, [identifier]: sslModeFlag }
    window.localStorage.setItem('ssl-mode', JSON.stringify(sslMode))
  } catch (e) {}
}

export function compareAlphabetically(a, b, data) {
  let order = 0
  const item1 = data[a].name.toLowerCase()
  const item2 = data[b].name.toLowerCase()
  if (item1 < item2) order = -1
  else if (item1 > item2) order = 1
  return order
}

export async function getDataFromProxyAndSetDataToLocalStorage(proxyAuthToken = null) {
  if (!proxyAuthToken) {
    proxyAuthToken = getProxyToken()
  }
  try {
    const response = await fetch(proxyUrl + '/getDetails', {
      headers: {
        proxy_auth_token: proxyAuthToken
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    const userInfo = data.data[0]
    window.localStorage.setItem(tokenKey, proxyAuthToken)
    window.localStorage.setItem(profileKey, JSON.stringify(userInfo))
    window.localStorage.setItem(orgKey, JSON.stringify(userInfo.c_companies[0]))
    window.localStorage.setItem(orgListKey, JSON.stringify(userInfo.c_companies))
  } catch (e) {
    console.log('error ', e)
    throw new Error(e?.message ? e.message : 'Something went wrong')
  }
}

const modifyEndpointContent = (endpointData, untitledData) => {
  const endpoint = cloneDeep(endpointData)
  const untitled = cloneDeep(untitledData)
  untitled.data.name = endpoint.name
  untitled.data.method = endpoint.requestType
  untitled.data.body = endpoint.body
  untitled.data.uri = endpoint.uri
  untitled.data.updatedUri = endpoint.uri
  untitled.authType = endpoint.authorizationType
  let headersData = []
  headersData = Object.keys(endpoint.headers).map((key) => {
    return { key, ...endpoint.headers[key] }
  })
  const paramsData = Object.keys(endpoint.params).map((key) => {
    return { key, ...endpoint.params[key] }
  })
  headersData.push({ checked: 'notApplicable', key: '', value: '', description: '' })
  paramsData.push({ checked: 'notApplicable', key: '', value: '', description: '' })
  untitled.originalHeaders = headersData
  untitled.originalParams = paramsData
  untitled.sampleResponseArray = endpoint.sampleResponse || []
  untitled.postScriptText = endpoint.postScript
  untitled.preScriptText = endpoint.preScript
  untitled.host['BASE_URL'] = endpoint.BASE_URL
  return { ...untitled }
}

export function getUrlPathById  (id, sidebar) {
  let path = [];
  let versionName = null;
  // not add invisible parent page name in path 
  while(sidebar?.[id]?.type > 0){
    if(sidebar[id].type == 2){
      versionName = sidebar[id].name
    }else{
      path.push(sidebar[id].name);
    }
    id = sidebar?.[id]?.parentId;
  }
  
  let actualPath  = path.reverse().join('/');
  if(versionName){
    actualPath =  `${actualPath}?versionName=${versionName}`
  }
  return actualPath;
}
export function isTechdocOwnDomain  () {
  const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
  const currentDomain = window.location.href.split('/')[2]
  return domainsList.includes(currentDomain)
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
  ADD_PAGE_MODAL_NAME,
  getParentIds,
  handleChangeInUrlField,
  handleBlurInUrlField,
  formatBytes,
  isValidDomain,
  addAnalyticsScripts,
  DEFAULT_URL,
  isNotDashboardOrDocView,
  isDashboardAndTestingView,
  isStateApproved,
  isStatePending,
  isStateDraft,
  isStateReject,
  sensitiveInfoFound,
  hexToRgb,
  msgText,
  getEntityState,
  validateEmail,
  getUserProfile,
  compareAlphabetically,
  sentryIntegration,
  modifyEndpointContent,
  isTechdocOwnDomain
}
