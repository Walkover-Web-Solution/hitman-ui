import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Dropdown, ButtonGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import store from '../../store/store'
import { isDashboardRoute, isElectron, isSavedEndpoint, isStateDraft, isStateReject, isStatePending, isStateApproved, sensitiveInfoFound, msgText, getEntityState, getCurrentUserSSLMode, setCurrentUserSSLMode } from '../common/utility'
import tabService from '../tabs/tabService'
import { closeTab, updateTab } from '../tabs/redux/tabsActions'
import tabStatusTypes from '../tabs/tabStatusTypes'
import CodeTemplate from './codeTemplate'
import SaveAsSidebar from './saveAsSidebar'
import BodyContainer from './displayBody'
import DisplayDescription from './displayDescription'
import DisplayResponse from './displayResponse'
import SampleResponse from './sampleResponse'
import { getCurrentUser, isAdmin } from '../auth/authServiceV2'

import endpointApiService from './endpointApiService'
import './endpoints.scss'
import GenericTable from './genericTable'
import HostContainer from './hostContainer'
import PublicBodyContainer from './publicBodyContainer'


import {
  addEndpoint,
  updateEndpoint,
  setAuthorizationType
} from './redux/endpointsActions'
import {
  setAuthorizationResponses,
  setAuthorizationData
} from '../collectionVersions/redux/collectionVersionsActions'
import { addHistory } from '../history/redux/historyAction'
import collectionsApiService from '../collections/collectionsApiService'
import indexedDbService from '../indexedDb/indexedDbService'
import Authorization from './displayAuthorization'
import LoginSignupModal from '../main/loginSignupModal'
import PublicSampleResponse from './publicSampleResponse'
import bodyDescriptionService from './bodyDescriptionService'
import { moveToNextStep } from '../../services/widgetService'
import CookiesModal from '../cookies/cookiesModal'
import moment from 'moment'
import { updateEnvironment } from '../environments/redux/environmentsActions'
import { run, initialize } from '../../services/sandboxservice'
import Script from './script/script'
import * as _ from 'lodash'
import { openModal } from '../modals/redux/modalsActions'
import Axios from 'axios'
import { sendAmplitudeData } from '../../services/amplitude'
import { SortableHandle, SortableContainer, SortableElement } from 'react-sortable-hoc'
import ConfirmationModal from '../common/confirmationModal'
import { ReactComponent as DragHandleIcon } from '../../assets/icons/drag-handle.svg'
import { pendingEndpoint, approveEndpoint, rejectEndpoint } from '../publicEndpoint/redux/publicEndpointsActions'
import WarningModal from '../common/warningModal'
import DeleteIcon from '../../assets/icons/delete-icon.svg'
import { onToggle } from '../common/redux/toggleResponse/toggleResponseActions'
import PlusIcon from '../../assets/icons/plus.svg'
import ApiDocReview from '../apiDocReview/apiDocReview'
import { ApproveRejectEntity, PublishEntityButton, UnPublishEntityButton } from '../common/docViewOperations'
import Tiptap from '../tiptapEditor/tiptap'
import ChatbotsideBar from './chatbotsideBar'

const shortid = require('shortid')

const status = require('http-status')
const URI = require('urijs')

const SortableItem = SortableElement(({ children }) => {
  return (
    <>{children}</>
  )
})

const SortableList = SortableContainer(({ children }) => {
  return (
    <>{children}</>
  )
})

const DragHandle = SortableHandle(() => <div className='dragIcon'><DragHandleIcon /></div>)

const defaultDocViewData = [
  { type: 'host' },
  { type: 'body' },
  { type: 'params' },
  { type: 'pathVariables' },
  { type: 'headers' },
  { type: 'sampleResponse' }
]

const mapStateToProps = (state) => {
  return {
    groups: state.groups,
    versions: state.versions,
    endpoints: state.endpoints,
    environment: state.environment.environments[
      state.environment.currentEnvironmentId
    ] || { id: null, name: 'No Environment' },
    currentEnvironmentId: state.environment.currentEnvironmentId,
    environments: state.environment.environments,
    historySnapshots: state.history,
    collections: state.collections,
    cookies: state.cookies,
    responseView: state.responseView
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_endpoint: (newEndpoint, groupId, callback) =>
      dispatch(addEndpoint(ownProps.history, newEndpoint, groupId, callback)),
    update_endpoint: (editedEndpoint, stopSave) =>
      dispatch(updateEndpoint(editedEndpoint, stopSave)),
    set_authorization_responses: (versionId, authResponses) =>
      dispatch(setAuthorizationResponses(versionId, authResponses)),
    set_authorization_type: (endpointId, authData) =>
      dispatch(setAuthorizationType(endpointId, authData)),
    set_authorization_data: (versionId, data) =>
      dispatch(setAuthorizationData(versionId, data)),
    // generate_temp_tab: (id) => dispatch(generateTempTab(id))
    close_tab: (id) => dispatch(closeTab(id)),
    add_history: (data) => dispatch(addHistory(data)),
    update_environment: (data) => dispatch(updateEnvironment(data)),
    update_tab: (id, data) => dispatch(updateTab(id, data)),
    open_modal: (modal, data) => dispatch(openModal(modal, data)),
    pending_endpoint: (endpoint) => dispatch(pendingEndpoint(endpoint)),
    approve_endpoint: (endpoint, callback) => dispatch(approveEndpoint(endpoint, callback)),
    set_response_view: (view) => dispatch(onToggle(view)),
    reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint))
  }
}

class DisplayEndpoint extends Component {
  constructor(props) {
    super(props)
    this.handleRemovePublicEndpoint = this.handleRemovePublicEndpoint.bind(this);
    this.myRef = React.createRef()
    this.sideRef = React.createRef()
    this.scrollDiv = React.createRef()
    this.state = {
      data: {
        name: '',
        method: 'GET',
        body: { type: 'none', value: '' },
        uri: '',
        updatedUri: ''
      },
      pathVariables: [],
      methodList: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      environment: {},
      startTime: '',
      timeElapsed: '',
      response: {},
      endpoint: {},
      groupId: null,
      title: '',
      flagResponse: false,
      originalHeaders: [
        {
          checked: 'notApplicable',
          key: '',
          value: '',
          description: ''
        }
      ],
      originalParams: [
        {
          checked: 'notApplicable',
          key: '',
          value: '',
          description: ''
        }
      ],
      authType: null,
      oldDescription: '',
      headers: [],
      publicBodyFlag: true,
      params: [],
      bodyDescription: {},
      fieldDescription: {},
      sampleResponseArray: [],
      sampleResponseFlagArray: [],
      theme: '',
      loader: false,
      saveLoader: false,
      codeEditorVisibility: true,
      showCookiesModal: false,
      preScriptText: '',
      postScriptText: '',
      preReqScriptError: '',
      postReqScriptError: '',
      host: {},
      draftDataSet: false,
      runSendRequest: null,
      requestKey: null,
      docOptions: false,
      sslMode: getCurrentUserSSLMode(),
      showAskAiSlider: false,
      parseHeaders: '',
      method: ''
    }

    this.uri = React.createRef()
    this.paramKey = React.createRef()

    this.structueParamsHeaders = [
      {
        checked: 'notApplicable',
        key: '',
        value: '',
        description: ''
      }
    ]
    this.setCurrentReponseView()
  }

  async componentDidMount() {
    this.extractEndpointName()
    this.endpointId = this.props.endpointId
      ? this.props.endpointId
      : isDashboardRoute(this.props)
        ? this.props.location.pathname.split('/')[5]
        : this.props.location.pathname.split('/')[4]
    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
    if (window.innerWidth < '1400') {
      this.setState({ codeEditorVisibility: false })
    }

    const { endpointId } = this.props.match.params
    console.log(endpointId, "endpointId: ");
    if (endpointId === 'new') {
      this.setUnsavedTabDataInIDB()
    }

    this.setEndpointData()

    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  handleHeadersValue = (value) => {
    console.log(value, "value in handle input value");
    this.setState({ parseHeaders: value.header }) 
    this.setState({method: value.method})

    console.log(value.method, "parse method");
    console.log(this.state.parseHeaders, "parse headerssssss");
    console.log(value.header, "valueeeeeeeeee");
  }

  handleMethodChange = (newMethod) => {
    console.log(newMethod.method, "newMethoddddd");
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        method: newMethod.method
      }
    }));
  }

  handleShortcuts = (event, data) => {
    const { activeTabId } = this.props.tabs
    const { id: endpointId } = this.props.tab

    if (activeTabId === endpointId) {
      switch (data) {
        case 'TRIGGER_ENDPOINT': this.handleSend()
          break
        case 'SAVE_AS': this.setState({ saveAsFlag: true }, () => { this.openEndpointFormModal() })
          break
        case 'SAVE': this.handleSave()
          break
        case 'ASK AI': this.handleSave()
          break
        default:
      }
    }
  }

  componentWillUnmount() {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.removeListener('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.location.pathname !== prevProps.location.pathname && this.scrollDiv.current) {
      this.scrollDiv.current.scrollIntoView({ block: 'center' })
      this.extractEndpointName()
    }
    if (this.props.endpointId !== prevProps.endpointId && this.scrollDiv.current) {
      this.scrollDiv.current.scrollIntoView({ block: 'center' })
    }
    if (!isDashboardRoute(this.props)) {
      if (
        this.state.data !== prevState.data ||
        this.state.originalParams !== prevState.originalParams ||
        this.state.originalHeaders !== prevState.originalHeaders ||
        this.state.host !== prevState.host
      ) {
        this.prepareHarObject()
      }
    }
    if (this.state.endpoint.id !== prevState.endpoint.id &&
      !this.props.location.pathname.includes('history')
    ) {
      this.setState({ flagResponse: false })
    }
    this.setEndpointData()
  }

  setSslMode() {
    this.setState({ sslMode: !this.state.sslMode }, () => {
      setCurrentUserSSLMode(this.state.sslMode)
    })
  }

  setCurrentReponseView() {
    const currentView = window.localStorage.getItem('response-view')
    this.props.set_response_view(currentView || 'bottom')
  }

  setEndpointData() {
    const { tab, historySnapshots, endpoints, match: { params: { endpointId, historyId } } } = this.props
    const { historySnapshotId, endpoint, draftDataSet } = this.state

    if (tab && endpointId) {
      if (!draftDataSet) {
        if (tab.isModified) {
          this.setState({ ...tab.state, draftDataSet: true })
        } else if (endpointId !== 'new' && endpoint.id !== tab.id && endpoints[tab.id]) {
          this.fetchEndpoint(0, tab.id)
        } else if (tab.status === 'NEW') this.setState({ draftDataSet: true })
      }
    }

    if (tab && historyId) {
      if (!draftDataSet) {
        if (tab.isModified) {
          this.setState({ ...tab.state, draftDataSet: true })
        } else if (historyId !== 'new' && historySnapshotId !== historyId && historySnapshots[tab.id]) {
          this.fetchHistorySnapshot()
        } else if (historyId === 'new') this.setState({ draftDataSet: true })
      }
    }
  }

  extractEndpointName() {
    if (!isDashboardRoute(this.props, true) && this.props.endpoints) {
      const endpointName = this.props.endpoints[this.props.match.params.endpointId]?.name
      if (endpointName) this.props.fetch_entity_name(endpointName)
      else this.props.fetch_entity_name()
    }
  }

  async fetchPublicCollection(collectionId) {
    const collection = await collectionsApiService.getCollection(collectionId)
    if (collection.data.environment != null) {
      this.setState({
        publicCollectionEnvironmentId: collection.data.environment.id,
        originalEnvironmentReplica: collection.data.environment
      })
    }
    if (collection.data.environment == null) {
      this.setState({
        publicCollectionEnvironmentId: null,
        originalEnvironmentReplica: null
      })
    }
  }

  fetchEndpoint(flag, endpointId) {
    let endpoint = {}
    let originalParams = []
    let originalHeaders = []
    let pathVariables = []
    let originalBody = {}
    const { endpoints } = store.getState()
    const { groups } = store.getState()
    const { versions } = store.getState()
    if (this.props.location.pathname.split('/')[5] === 'new' && !this.title) {
      originalParams = [
        {
          checked: 'notApplicable',
          key: '',
          value: '',
          description: ''
        }
      ]
      originalHeaders = [
        {
          checked: 'notApplicable',
          key: '',
          value: '',
          description: ''
        }
      ]

      this.setState({
        originalParams,
        originalHeaders
      })
    } else if (
      Object.keys(groups).length !== 0 &&
      Object.keys(versions).length !== 0 &&
      Object.keys(endpoints).length !== 0 &&
      endpointId &&
      flag === 0
    ) {
      flag = 1
      endpoint = {}
      if (this.props.rejectedEndpointId) {
        this.setState({ publicEndpointId: this.props.rejectedEndpointId })
        endpoint = endpoints[endpointId].publishedEndpoint
      } else { endpoint = endpoints[endpointId] }
      let authType = {}
      if (endpoint.authorizationType !== null) {
        authType = {
          type: endpoint.authorizationType.type,
          value: endpoint.authorizationType.value
        }
      } else {
        authType = endpoint.authorizationType
      }

      const groupId = endpoints[endpointId].groupId

      // To fetch originalParams from Params
      originalParams = this.fetchoriginalParams(endpoint.params)
      const params = this.fetchoriginalParams(endpoint.params)

      // To fetch originalHeaders from Headers
      originalHeaders = this.fetchoriginalHeaders(endpoint.headers)
      const headers = this.fetchoriginalHeaders(endpoint.headers)
      // To fetch Path Variables
      if (endpoint.pathVariables.length !== 0) {
        pathVariables = this.fetchPathVariables(endpoint.pathVariables)
        this.setState({ pathVariables })
      }
      const fieldDescription = this.getFieldDescription(
        endpoint.bodyDescription
      )

      const sampleResponseFlagArray = this.getSampleResponseFlagArray(
        endpoint.sampleResponse
      )

      originalBody = endpoint.body
      const currentView = this.getCurrentView()
      const docViewData = this.getDocViewData(endpoint)
      this.setState({
        data: {
          method: endpoint.requestType,
          uri: endpoint.uri,
          updatedUri: endpoint.uri,
          name: endpoint.name,
          body: endpoint.body
        },
        params,
        headers,
        originalParams,
        originalHeaders,
        originalBody,
        endpoint,
        sampleResponseArray: endpoint.sampleResponse || [],
        sampleResponseFlagArray,
        groupId,
        oldDescription: endpoint.description,
        title: 'update endpoint',
        bodyDescription: endpoint.bodyDescription,
        authType,
        fieldDescription,
        publicBodyFlag: true,
        bodyFlag: true,
        response: {},
        preScriptText: endpoint.preScript || '',
        postScriptText: endpoint.postScript || '',
        draftDataSet: true,
        currentView,
        docViewData
      }, () => {
        if (isDashboardRoute(this.props)) this.setUnsavedTabDataInIDB()
      })
      this.setAccessToken()
    }
  }

  fetchHistorySnapshot() {
    let originalParams = []
    let originalHeaders = []
    let originalBody = {}
    let pathVariables = []
    const { historyId } = this.props.match.params
    const history = this.props.historySnapshots[historyId]
    const params = this.fetchoriginalParams(history.endpoint.params)
    originalParams = [...params]
    const headers = this.fetchoriginalHeaders(history.endpoint.headers)
    originalHeaders = [...headers]
    let authType = {}
    if (history.endpoint.authorizationType !== null) {
      authType = {
        type: history.endpoint.authorizationType.type,
        value: history.endpoint.authorizationType.value
      }
    } else {
      authType = history.endpoint.authorizationType
    }
    if (history.endpoint.pathVariables.length !== 0) {
      pathVariables = this.fetchPathVariables(history.endpoint.pathVariables)
    }
    const fieldDescription = this.getFieldDescription(
      history.endpoint.bodyDescription
    )
    originalBody = history.endpoint.body
    this.setState({
      historySnapshotId: history.id,
      data: {
        method: history.endpoint.requestType,
        uri: history.endpoint.uri,
        updatedUri: history.endpoint.uri,
        name: history.endpoint.name,
        body: history.endpoint.body
      },
      params,
      headers,
      originalParams,
      originalHeaders,
      originalBody,
      authType,
      endpoint: history.endpoint,
      title: '',
      saveAsFlag: true,
      bodyDescription: history.endpoint.bodyDescription,
      response: history.response,
      pathVariables,
      fieldDescription,
      timeElapsed: history.timeElapsed,
      publicBodyFlag: true,
      bodyFlag: true,
      flagResponse: true,
      draftDataSet: true
    }, () => {
      if (isDashboardRoute(this.props)) this.setUnsavedTabDataInIDB()
    })
  }

  getFieldDescription(bodyDescription) {
    const keys = Object.keys(bodyDescription)
    const fieldDescription = {}
    for (let i = 0; i < keys.length; i++) {
      fieldDescription[keys[i]] = bodyDescription[keys[i]].description
    }
    return fieldDescription
  }

  handleChange = (e) => {
    const data = { ...this.state.data }
    console.log(data, "dataaa in handle change");
    console.log(e.currentTarget.name,"nameee");
    console.log(e.currentTarget.value, "e.currentTarget.value");
    console.log(data, "data in handle change");
    data[e.currentTarget.name] = e.currentTarget.value
    data.uri = e.currentTarget.value
    if (e.currentTarget.name === 'updatedUri') {
      console.log("inside if condition", e.currentTarget.name);
      const keys = []
      const values = []
      const description = []
      const headerKeys = []
      const headerValues = []
      const headerDescription = []
      let originalParams = this.state.originalParams
      let originalHeaders = this.state.parseHeaders
      console.log(originalParams, "original params");
      console.log(originalHeaders, "original Headers");
      const updatedUri = e.currentTarget.value.split('?')[1]
      console.log(e.currentTarget.value, "current value");
      let path = new URI(e.currentTarget.value)
      path = path.pathname()
      console.log(path, "pathhhhhhhhhhh");
      const pathVariableKeys = path.split('/')
      console.log(pathVariableKeys,"path variable keys");
      const pathVariableKeysObject = {}
      for (let i = 0; i < pathVariableKeys.length; i++) {
        pathVariableKeysObject[pathVariableKeys[i]] = false
      }
      this.setPathVariables(pathVariableKeys, pathVariableKeysObject)
      const result = URI.parseQuery(updatedUri)
      console.log(result, "result actual");
      for (let i = 0; i < Object.keys(result).length; i++) {
        console.log(Object.keys(result),"result of objectss");
        keys.push(Object.keys(result)[i])
      }
      for (let i = 0; i < keys.length; i++) {
        values.push(result[keys[i]])
        if (originalParams[i]) {
          for (let k = 0; k < originalParams.length; k++) {
            if (
              originalParams[k].key === keys[i] &&
              originalParams[k].checked === 'true'
            ) {
              description[i] = originalParams[k].description
              break
            } else if (k === originalParams.length - 1) {
              description[i] = ''
            }
          }
        }
      }
      originalParams = this.makeOriginalParams(keys, values, description)
      console.log(originalParams, "params in make original params");

      for (let i = 0; i < Object.keys(originalHeaders).length; i++) {
        headerKeys.push(Object.keys(originalHeaders)[i]);
      }

      for (let i = 0; i < headerKeys.length; i++) {
        console.log(headerKeys, "keyss in for loop headers");
        headerValues.push(originalHeaders[headerKeys[i]])
        if (originalHeaders[i]) {
          for (let k = 0; k < originalHeaders.length; k++) {
            if (
              originalHeaders[k].key === headerKeys[i] &&
              originalHeaders[k].checked === 'true'
            ) {
              description[i] = originalHeaders[k].description
              break
            } else if (k === originalHeaders.length - 1) {
              description[i] = ''
            }
          }
        }
      }
      originalHeaders = this.makeOriginalHeaders(headerKeys, headerValues, headerDescription)
      console.log(originalHeaders, "Headers in make original Headers");
      this.setState({ originalParams })
      this.setState({ originalHeaders })
      // this.setState({method})
    }
    this.setState({ data })
  };

  setUnsavedTabDataInIDB() {
    if (this.props.tab.id === this.props.tabs.activeTabId) {
      clearTimeout(this.saveTimeOut)
      this.saveTimeOut = setTimeout(() => {
        const state = _.cloneDeep(this.state)

        /** clean unnecessary items from state before saving */
        const unnecessaryStateItems = ['loader', 'draftDataSet', 'saveLoader', 'codeEditorVisibility', 'showCookiesModal', 'methodList', 'theme', 'runSendRequest', 'requestKey']
        unnecessaryStateItems.forEach((item) => delete state[item])
        this.props.update_tab(this.props.tab.id, { state })
      }, 1000)
    }
  }

  setPathVariables(pathVariableKeys, pathVariableKeysObject) {
    const pathVariables = []
    for (let i = 1; i < pathVariableKeys.length; i++) {
      if (
        pathVariableKeys[i][0] === ':' &&
        pathVariableKeysObject[pathVariableKeys[i]] === false
      ) {
        pathVariableKeysObject[pathVariableKeys[i]] = true
        if (pathVariableKeys[i].slice(1).trim() !== '') {
          pathVariables.push({
            checked: 'notApplicable',
            key: pathVariableKeys[i].slice(1),
            value: this.state.pathVariables[i - 1]
              ? this.state.pathVariables[i - 1].key === pathVariableKeys[i]
                ? this.state.pathVariables[i - 1].value
                : ''
              : '',
            description: this.state.pathVariables[i - 1]
              ? this.state.pathVariables[i - 1].key === pathVariableKeys[i]
                ? this.state.pathVariables[i - 1].description
                : ''
              : ''
          })
        }
      }
    }

    this.setState({ pathVariables })
  }

  getSampleResponseFlagArray(sampleResponse) {
    const sampleResponseFlagArray = []
    if (sampleResponse) {
      let index = 0
      while (index < sampleResponse.length) {
        sampleResponseFlagArray.push(!isDashboardRoute(this.props))
        index++
      }
    }
    return sampleResponseFlagArray
  }

  makeOriginalParams(keys, values, description) {
    const originalParams = []
    for (let i = 0; i < this.state.originalParams.length; i++) {
      if (this.state.originalParams[i].checked === 'false') {
        originalParams.push({
          checked: this.state.originalParams[i].checked,
          key: this.state.originalParams[i].key,
          value: this.state.originalParams[i].value,
          description: this.state.originalParams[i].description
        })
      }
    }
    for (let i = 0; i < keys.length; i++) {
      console.log("inside for loop");
      originalParams.push({
        checked: 'true',
        key: keys[i],
        value: values[i],
        description: description[i]
      })
    }
    originalParams.push({
      checked: 'notApplicable',
      key: '',
      value: '',
      description: ''
    })
    return originalParams
  }

  makeOriginalHeaders(keys, values, description) {
    const originalHeaders = []
    for (let i = 0; i < this.state.originalHeaders.length; i++) {
      if (this.state.originalHeaders[i].checked === 'false') {
        originalHeaders.push({
          checked: this.state.originalHeaders[i].checked,
          key: this.state.originalHeaders[i].key,
          value: this.state.originalHeaders[i].value,
          description: this.state.originalHeaders[i].description
        })
      }
    }
    for (let i = 0; i < keys.length; i++) {
      console.log("inside for loop");
      originalHeaders.push({
        checked: 'true',
        key: keys[i],
        value: values[i],
        description: description[i]
      })
    }
    originalHeaders.push({
      checked: 'notApplicable',
      key: '',
      value: '',
      description: ''
    })
    return originalHeaders
  }

  replaceVariables(str, customEnv) {
    let envVars = this.props.environment.variables
    if (customEnv) {
      envVars = customEnv
    }
    str = str.toString()
    const regexp = /{{((\w|-)+)}}/g
    let match = regexp.exec(str)
    const variables = []
    if (match === null) return str

    if (isDashboardRoute(this.props)) {
      if (!envVars) return str.replace(regexp, '')

      do {
        variables.push(match[1])
      } while ((match = regexp.exec(str)) !== null)

      for (let i = 0; i < variables.length; i++) {
        const envVariable = envVars[variables[i]]
        const strToReplace = `{{${variables[i]}}}`
        if (envVariable?.currentValue) {
          str = str.replace(strToReplace, envVariable.currentValue)
        } else if (envVariable?.initialValue) {
          str = str.replace(strToReplace, envVariable.initialValue)
        } else {
          str = str.replace(strToReplace, '')
        }
      }
    }
    return str
  }

  replaceVariablesInJson(json, customEnv) {
    const keys = Object.keys(json)
    for (let i = 0; i < keys.length; i++) {
      json[keys[i]] = this.replaceVariables(json[keys[i]], customEnv)
      const updatedKey = this.replaceVariables(keys[i], customEnv)
      if (updatedKey !== keys[i]) {
        json[updatedKey] = json[keys[i]]
        delete json[keys[i]]
      }
    }
    return json
  }

  replaceVariablesInBody(body, bodyType, customEnv) {
    switch (bodyType) {
      case 'multipart/form-data':
      case 'application/x-www-form-urlencoded':
        body = this.replaceVariablesInJson(body, customEnv)
        break
      case 'TEXT':
      case 'JSON':
      case 'HTML':
      case 'XML':
      case 'JavaScript':
        body = this.replaceVariables(body, customEnv)
        break
      default: break
    }
    return body
  }

  parseBody(rawBody) {
    let body = {}
    try {
      body = JSON.parse(rawBody)
      return body
    } catch (error) {
      toast.error('Invalid Body')
      return body
    }
  }

  handleErrorResponse(error) {
    if (error.response) {
      const response = {
        status: error.response.status,
        statusText: status[error.response.status],
        data: error.response.data
      }
      this.setState({ response, flagResponse: true })
    } else {
      const timeElapsed = new Date().getTime() - this.state.startTime
      const response = {
        data: error.message || 'ERROR:Server Connection Refused'
      }
      this.setState({ response, timeElapsed, flagResponse: true })
    }
  }

  async handleApiCall({ url: api, body, headers: header, bodyType, method, cancelToken, keyForRequest }) {
    let responseJson = {}
    try {
      if (isElectron()) {
        // Handle API through Electron Channel
        const { ipcRenderer } = window.require('electron')
        const { sslMode } = this.state
        responseJson = await ipcRenderer.invoke('request-channel', { api, method, body, header, bodyType, keyForRequest, sslMode })
      } else {
        // Handle API through Backend
        responseJson = await endpointApiService.apiTest(api, method, body, header, bodyType, cancelToken)
      }

      if (responseJson.data.success) {
        /** request creation was successfull */
        const currentEnvironment = this.props.environment
        const request = { url: api, body, headers: header, method }
        const code = this.state.postScriptText

        this.processResponse(responseJson)

        /** Run Post-Request Script */
        const result = this.runScript(code, currentEnvironment, request, responseJson)
        if (!result.success) { this.setState({ postReqScriptError: result.error }) } else { this.setState({ tests: [...this.state.tests, ...result.data.tests] }) }
      } else {
        /** error occured while creating the request */
        this.handleErrorResponse(responseJson.data.error, this.state.startTime)
      }
    } catch (error) {
      /** if our service fails */
      this.handleErrorResponse(error, this.state.startTime)
    }
  }

  processResponse(responseJson) {
    let response
    if (responseJson?.data?.status) {
      const {
        status,
        statusText,
        response: data,
        headers
      } = responseJson.data
      response = { status, statusText, data, headers }
    } else {
      response = { ...responseJson }
    }
    if (responseJson.status === 200) {
      const timeElapsed = new Date().getTime() - this.state.startTime
      this.setState({ response, timeElapsed, flagResponse: true })
    }
  }

  setPathVariableValues() {
    let uri = new URI(this.state.data.updatedUri)
    uri = uri.pathname()
    const pathParameters = uri.split('/')
    let path = ''
    let counter = 0
    const uniquePathparameters = {}
    for (let i = 0; i < pathParameters.length; i++) {
      if (pathParameters[i][0] === ':' && pathParameters[i].slice(1).trim()) {
        if (uniquePathparameters[pathParameters[i].slice(1)] || uniquePathparameters[pathParameters[i].slice(1)] === '') {
          pathParameters[i] = uniquePathparameters[pathParameters[i].slice(1)]
        } else {
          pathParameters[i] = this.state.pathVariables[counter]?.value
          uniquePathparameters[this.state.pathVariables[counter]?.key] = this.state.pathVariables[counter]?.value
          counter++
        }
      }
    }
    path = pathParameters.join('/')
    return path
  }

  setData = async () => {
    let body = this.state.data.body
    if (this.state.data.body.type === 'raw') {
      body.value = this.parseBody(body.value)
    }
    body = this.prepareBodyForSending(body)
    const headersData = this.doSubmitHeader('save')
    const updatedParams = this.doSubmitParam()
    const pathVariables = this.doSubmitPathVariables()
    const endpoint = {
      uri: this.state.data.updatedUri,
      name: this.state.data.name,
      requestType: this.state.data.method,
      body: body,
      id: this.state.endpoint.id || null,
      status: this.props.tab?.status || tabStatusTypes.NEW,
      headers: headersData,
      params: updatedParams,
      pathVariables: pathVariables,
      BASE_URL: this.state.host.BASE_URL,
      bodyDescription:
        this.state.data.body.type === 'JSON' ? this.state.bodyDescription : {},
      authorizationType: this.state.authType
    }
    const response = { ...this.state.response }
    const createdAt = new Date()
    const timeElapsed = this.state.timeElapsed
    delete response.request
    delete response.config
    const obj = {
      id: shortid.generate(),
      endpoint: { ...endpoint },
      response,
      timeElapsed,
      createdAt
    }
    this.props.add_history(obj)
  };

  checkValue(param, originalParams) {
    let valueFlag = false
    const originalParam = originalParams.find((o) => o.key === param.key)
    if ((originalParam.value === null || originalParam.value === '')) {
      valueFlag = true
    }
    return valueFlag
  }

  checkEmptyParams() {
    const params = this.state.params
    const originalParams = this.state.originalParams
    let isEmpty = false
    params.forEach((param) => {
      if (param.checked !== 'notApplicable' && param.checked === 'true' && this.checkValue(param, originalParams)) {
        isEmpty = true
        param.empty = true
      } else {
        param.empty = false
      }
    })
    this.setState({ params })
    return isEmpty
  }

  addhttps(url) {
    if (url) {
      if (this.state.data.updatedUri.includes('localhost') && !(url.includes('localhost'))) { url = 'localhost:' + url }
      if (!/^(?:f|ht)tps?:\/\//.test(url)) {
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          url = 'http://' + url
        } else {
          url = 'https://' + url
        }
      }
    }
    return url
  }

  prepareHeaderCookies(url) {
    if (!url) return null
    const domainUrl = url.split('/')[2]
    let cookies
    Object.values(this.props.cookies || {}).forEach((domain) => {
      if (domain.domain === domainUrl) {
        cookies = domain?.cookies
      }
    })
    if (cookies) {
      let cookieString = ''
      Object.values(cookies || {}).forEach((cookie) => {
        let time
        const expires = cookie.split(';')[2]
        if (expires.split('=')[1]) {
          time = expires.split('=')[1]
        }
        time = moment(time)
        if (!(time && moment(time).isBefore(moment().format()))) {
          cookieString += cookie.split(';')[0] + '; '
        }
      })
      return cookieString
    }
    return null
  }

  handleSend = async () => {
    const keyForRequest = shortid.generate()
    const runSendRequest = Axios.CancelToken.source()
    const startTime = new Date().getTime()
    const response = {}
    this.setState({ startTime, response, preReqScriptError: '', postReqScriptError: '', tests: null, loader: true, requestKey: keyForRequest, runSendRequest })

    if (!isDashboardRoute(this.props, true) && this.checkEmptyParams()) {
      this.setState({ loader: false })
      return
    }

    /** Prepare Headers */
    const headersData = this.doSubmitHeader('send')
    const headerJson = {}
    Object.keys(headersData).forEach((header) => {
      headerJson[header] = headersData[header].value
    })

    /** Prepare URL */
    const BASE_URL = this.state.host.BASE_URL || ''
    const uri = new URI(this.state.data.updatedUri)
    const queryparams = uri.search()
    const path = this.setPathVariableValues()
    const url = BASE_URL + path + queryparams
    if (!url) {
      toast.error('Request URL is empty')
      setTimeout(() => { this.setState({ loader: false }) }, 500)
      return
    }

    /** Prepare Body & Modify Headers */
    let { body, headers } = this.formatBody(this.state.data.body, headerJson)

    /** Add Cookie in Headers */
    const cookiesString = this.prepareHeaderCookies(BASE_URL)
    if (cookiesString) {
      headers.cookie = cookiesString.trim()
    }

    const method = this.state.data.method
    /** Set Request Options */
    let requestOptions = null
    const cancelToken = runSendRequest.token
    requestOptions = { url, body, headers, method, cancelToken, keyForRequest }

    const currentEnvironment = this.props.environment

    const code = this.state.preScriptText

    /** Run Pre Request Script */
    const result = this.runScript(code, currentEnvironment, requestOptions)
    if (result.success) {
      let { environment, request: { url, headers }, tests } = result.data
      this.setState({ tests })
      /** Replace Environemnt Variables */
      url = this.replaceVariables(url, environment)
      url = this.addhttps(url)
      headers = this.replaceVariablesInJson(headers, environment)
      const bodyType = this.state.data.body.type
      body = this.replaceVariablesInBody(body, bodyType, environment)
      requestOptions = { ...requestOptions, body, headers, url, bodyType }
      /** Steve Onboarding Step 5 Completed */
      moveToNextStep(5)
      sendAmplitudeData('API called', {
        url: url,
        endpointId: this.props.match.params.endpointId
      })
      /** Handle Request Call */
      await this.handleApiCall(requestOptions)
      this.setState({
        loader: false,
        runSendRequest: null,
        requestKey: null
      })
      /** Scroll to Response */
      this.myRef.current && this.myRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      /** Add to History */
      isDashboardRoute(this.props) && this.setData()
    } else {
      this.setState({ preReqScriptError: result.error, loader: false })
    }
  }

  runScript(code, environment, request, responseJson) {
    let response
    if (responseJson) {
      const {
        status,
        statusText,
        response: body,
        headers
      } = responseJson.data
      response = { status, statusText, body, headers }
      response = { value: response }
    }

    if (code.trim().length === 0 || !isDashboardRoute(this.props, true)) {
      return { success: true, data: { environment: environment.variables, request, response, tests: [] } }
    }

    const env = {}
    if (environment?.variables) {
      for (const [key, value] of Object.entries(environment.variables)) {
        env[key] = value.currentValue
      }
    }

    environment = { value: env, callback: this.envCallback }
    request = { value: request }

    return run(code, initialize({ environment, request, response }))
  }

  envCallback = (variablesObj) => {
    const currentEnv = { ...this.props.environment }
    const variables = {}
    const getInitalValue = (key) => {
      return currentEnv?.variables?.[key]?.initialValue || ''
    }
    if (currentEnv.id) {
      for (const [key, value] of Object.entries(variablesObj)) {
        variables[key] = { initialValue: getInitalValue(key), currentValue: value }
      }
      this.props.update_environment({ ...currentEnv, variables })
    }
  }

  extractPosition(groupId) {
    let count = -1
    for (let i = 0; i < Object.keys(this.props.endpoints).length; i++) {
      if (
        groupId ===
        this.props.endpoints[Object.keys(this.props.endpoints)[i]].groupId
      ) {
        count = count + 1
      }
    }
    return count + 1
  }

  extractCollectionId(groupId) {
    const group = this.props.groups[groupId]
    const versionId = group.versionId
    const version = this.props.versions[versionId]
    return version?.collectionId
  }

  prepareBodyForSaving(body) {
    const data = _.cloneDeep(body)
    if (data.type === 'multipart/form-data') {
      data.value.forEach((item) => {
        if (item.type === 'file') item.value = {}
      })
    }
    return data
  }

  prepareBodyForSending(body) {
    const data = _.cloneDeep(body)
    if (data.type === 'multipart/form-data') {
      data.value.forEach((item) => {
        if (item.type === 'file') item.value.srcPath = ''
      })
    }
    return data
  }

  handleSave = async (groupId, endpointObject) => {
    const { endpointName, endpointDescription } = endpointObject || {}
    if (!getCurrentUser()) {
      this.setState({
        showLoginSignupModal: true
      })
    }
    if (!(this.state.groupId || groupId)) {
      this.openEndpointFormModal()
    } else {
      const body = this.prepareBodyForSaving(this.state.data.body)
      const bodyDescription = bodyDescriptionService.handleUpdate(false, {
        body_description: this.state.bodyDescription,
        body: body.value
      })
      if (this.state.data.body.type === 'raw') {
        body.value = this.parseBody(body.value)
      }
      const headersData = this.doSubmitHeader('save')
      const updatedParams = this.doSubmitParam()
      const pathVariables = this.doSubmitPathVariables()
      const endpoint = {
        uri: this.state.data.updatedUri,
        name: endpointName || this.state.data.name,
        requestType: this.state.data.method,
        body: body,
        headers: headersData,
        params: updatedParams,
        pathVariables: pathVariables,
        BASE_URL:
          this.state.host.selectedHost === 'customHost'
            ? this.state.host.BASE_URL
            : null,
        bodyDescription:
          this.state.data.body.type === 'JSON'
            ? bodyDescription
            : {},
        authorizationType: this.state.authType,
        notes: this.state.endpoint.notes,
        preScript: this.state.preScriptText,
        postScript: this.state.postScriptText,
        docViewData: this.state.docViewData
      }
      if (endpoint.name === '') toast.error('Please enter Endpoint name')
      else if (this.props.location.pathname.split('/')[5] === 'new') {
        endpoint.requestId = this.props.tab.id
        endpoint.description = endpointDescription || ''
        this.setState({ saveAsLoader: true })
        this.props.add_endpoint(endpoint, groupId || this.state.groupId, ({ closeForm, stopLoader }) => {
          if (closeForm) this.closeEndpointFormModal()
          if (stopLoader) this.setState({ saveAsLoader: false })
        })
        tabService.removeTab(this.props.tabs.activeTabId, { ...this.props })
        moveToNextStep(4)
      } else {
        if (this.state.saveAsFlag) {
          endpoint.description = endpointDescription || ''
          delete endpoint.state
          delete endpoint.isPublished
          this.setState({ saveAsLoader: true })
          this.props.add_endpoint(endpoint, groupId || this.state.groupId, ({ closeForm, stopLoader }) => {
            if (closeForm) this.closeEndpointFormModal()
            if (stopLoader) this.setState({ saveAsLoader: false })
          })
          moveToNextStep(4)
        } else if (this.state.title === 'update endpoint') {
          endpoint.isPublished = this.props.endpoints[this.endpointId]?.isPublished
          endpoint.state = this.props.endpoints[this.endpointId]?.state
          this.setState({ saveLoader: true })
          this.props.update_endpoint({
            ...endpoint,
            id: this.state.endpoint.id,
            groupId: groupId || this.state.groupId
          }, () => { this.setState({ saveLoader: false }) })
          tabService.markTabAsSaved(this.props.tab.id)
        }
      }
    }
  };

  doSubmitPathVariables() {
    const updatedPathVariables = {}
    if (this.state.pathVariables) {
      const pathVariables = [...this.state.pathVariables]
      for (let i = 0; i < pathVariables.length; i++) {
        if (pathVariables[i].key === '') {
          continue
        } else {
          updatedPathVariables[pathVariables[i].key] = {
            checked: pathVariables[i].checked,
            value: pathVariables[i].value,
            description: pathVariables[i].description
          }
        }
      }
      const endpoint = { ...this.state.endpoint }
      endpoint.pathVariables = { ...updatedPathVariables }
      this.setState({
        pathVariables,
        endpoint
      })
    }
    return updatedPathVariables
  }

  doSubmitHeader(title) {
    const originalHeaders = [...this.state.originalHeaders]
    const updatedHeaders = {}
    for (let i = 0; i < originalHeaders.length; i++) {
      if (originalHeaders[i].key === '') {
        continue
      } else if (originalHeaders[i].checked === 'true' || title === 'save') {
        updatedHeaders[originalHeaders[i].key] = {
          checked: originalHeaders[i].checked,
          value: originalHeaders[i].value,
          description: originalHeaders[i].description
        }
      }
    }
    const endpoint = { ...this.state.endpoint }
    endpoint.headers = { ...updatedHeaders }
    this.setState({
      originalHeaders,
      endpoint
    })
    return updatedHeaders
  }

  setMethod(method) {
    const response = {}
    const data = { ...this.state.data }
    data.method = method
    this.setState({ response, data }, () => this.setModifiedTabData())
  }

  setModifiedTabData() {
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id)
      this.setUnsavedTabDataInIDB()
    }
  }

  propsFromChild(name, value) {
    if (name === 'Params') {
      this.handleUpdateUri(value)
      this.setState({ originalParams: value }, () => this.setModifiedTabData())
    }

    if (name === 'Headers') {
      this.setState({ originalHeaders: value }, () => this.setModifiedTabData())
    }

    if (name === 'Path Variables') {
      this.setState({ pathVariables: value }, () => this.setModifiedTabData())
    }

    if (name === 'HostAndUri') this.setModifiedTabData()
  }

  setPublicBody(body) {
    const json = body
    const data = { ...this.state.data }
    data.body = { type: 'JSON', value: json }

    this.setState({ data, publicBodyFlag: false })
  }

  handleUpdateUri(originalParams) {
    if (originalParams.length === 0) {
      const updatedUri = this.state.data.updatedUri.split('?')[0]
      const data = { ...this.state.data }
      data.updatedUri = updatedUri
      this.setState({ data })
      return
    }
    const originalUri = this.state.data.uri.split('?')[0] + '?'
    const parts = {}
    for (let i = 0; i < originalParams.length; i++) {
      if (
        originalParams[i].key.length !== 0 &&
        originalParams[i].checked === 'true'
      ) {
        parts[originalParams[i].key] = originalParams[i].value
      }
    }
    URI.escapeQuerySpace = false
    let updatedUri = URI.buildQuery(parts)
    updatedUri = originalUri + URI.decode(updatedUri)
    const data = { ...this.state.data }
    if (Object.keys(parts).length === 0) {
      data.updatedUri = updatedUri.split('?')[0]
    } else {
      data.updatedUri = updatedUri
    }
    this.setState({ data })
  }

  doSubmitParam() {
    const originalParams = [...this.state.originalParams]
    const updatedParams = {}
    for (let i = 0; i < originalParams.length; i++) {
      if (originalParams[i].key === '') {
        continue
      } else {
        updatedParams[originalParams[i].key] = {
          checked: originalParams[i].checked,
          value: originalParams[i].value,
          description: originalParams[i].description
        }
      }
    }
    const endpoint = { ...this.state.endpoint }
    endpoint.params = { ...updatedParams }
    this.setState({
      originalParams,
      endpoint
    })
    return updatedParams
  }

  fetchoriginalParams(params) {
    const originalParams = []
    let i = 0
    for (i = 0; i < Object.keys(params).length; i++) {
      originalParams[i] = {
        checked: params[Object.keys(params)[i]].checked,
        key: Object.keys(params)[i],
        value: params[Object.keys(params)[i]].value,
        description: params[Object.keys(params)[i]].description
      }
    }
    originalParams[i] = {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: ''
    }

    return originalParams
  }

  fetchoriginalHeaders(headers) {
    const originalHeaders = []
    let i = 0
    for (i = 0; i < Object.keys(headers).length; i++) {
      originalHeaders[i] = {
        checked: headers[Object.keys(headers)[i]].checked,
        key: Object.keys(headers)[i],
        value: headers[Object.keys(headers)[i]].value,
        description: headers[Object.keys(headers)[i]].description
      }
    }
    originalHeaders[i] = {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: ''
    }
    return originalHeaders
  }

  fetchPathVariables(pathVariables) {
    const originalPathVariables = []
    let i = 0
    for (i = 0; i < Object.keys(pathVariables).length; i++) {
      originalPathVariables[i] = {
        checked: pathVariables[Object.keys(pathVariables)[i]].checked,
        key: Object.keys(pathVariables)[i],
        value: pathVariables[Object.keys(pathVariables)[i]].value,
        description: pathVariables[Object.keys(pathVariables)[i]].description
      }
    }
    return originalPathVariables
  }

  openEndpointFormModal() {
    this.setState({ showEndpointFormModal: true })
  }

  closeEndpointFormModal() {
    this.setState({ showEndpointFormModal: false, saveAsFlag: false })
  }
  closeChatBotModal = () =>  {
    this.setState({ showAskAiSlider: false })
  }
  setGroupId(groupId, { endpointName, endpointDescription }) {
    this.setState({ groupId }, () => { this.handleSave(groupId, { endpointName, endpointDescription }) })
  }

  updateArray(updatedArray) {
    this.setState({ updatedArray })
  }

  makeHeaders(headers) {
    const processedHeaders = []
    for (let i = 0; i < Object.keys(headers).length; i++) {
      if (headers[Object.keys(headers)[i]].checked === 'true') {
        processedHeaders.push({
          name: headers[Object.keys(headers)[i]].key,
          value: headers[Object.keys(headers)[i]].value,
          comment:
            headers[Object.keys(headers)[i]].description === null
              ? ''
              : headers[Object.keys(headers)[i]].description
        })
      }
    }
    return processedHeaders
  }

  makeParams(params) {
    const processedParams = []
    for (let i = 0; i < Object.keys(params).length; i++) {
      if (params[Object.keys(params)[i]].checked === 'true') {
        processedParams.push({
          name: params[Object.keys(params)[i]].key,
          value: params[Object.keys(params)[i]].value,
          comment: params[Object.keys(params)[i]].description
        })
      }
    }
    return processedParams
  }

  async makePostData(body) {
    const params = []
    let paramsFlag = false
    let postData = {}
    if (
      (body.type === 'application/x-www-form-urlencoded' ||
        body.type === 'multipart/form-data') &&
      body.value
    ) {
      paramsFlag = true
      for (let i = 0; i < body.value.length; i++) {
        if (body.value[i].checked === 'true' && body.value[i].key !== '') {
          params.push({
            name: body.value[i].key,
            value: body.value[i].value,
            fileName: null,
            contentType: null
          })
        }
      }
      postData = {
        mimeType: body.type,
        params: params,
        comment: ''
      }
    } else {
      postData = {
        mimeType: body.type,
        params: params,
        text: paramsFlag === false ? body.value : '',
        comment: ''
      }
    }
    return postData
  }

  async prepareHarObject() {
    console.log("inside prepareHarObject");
    try {
      const BASE_URL = this.state.host.BASE_URL
      const uri = new URI(this.state.data.updatedUri)
      const queryparams = uri.search()
      const path = this.setPathVariableValues()
      let url = BASE_URL + path + queryparams
      url = this.replaceVariables(url)
      const { method, body } = this.state.data
      const { originalHeaders, originalParams } = this.state
      const harObject = {
        method,
        url: url,
        httpVersion: 'HTTP/1.1',
        cookies: [],
        headers: this.makeHeaders(originalHeaders),
        postData: body.type === 'none' ? null : await this.makePostData(body),
        queryString: this.makeParams(originalParams)
      }
      console.log(harObject,"harobject")
      if (!harObject.url.split(':')[1] || harObject.url.split(':')[0] === '') {
        harObject.url = 'https://' + url
      }
      this.setState({ harObject }, () => { })
    } catch (error) {
      toast.error(error)
    }
  }

  openCodeTemplate(harObject) {
    this.setState({
      showCodeTemplate: true,
      harObject
    })
  }

  showCodeTemplate() {
    return (
      <CodeTemplate
        show
        onHide={() => {
          this.setState({ showCodeTemplate: false })
        }}
        harObject={this.state.harObject}
        title='Generate Code Snippets'
      />
    )
  }

  setBaseUrl(BASE_URL, selectedHost) {
    console.log(BASE_URL, selectedHost, "inside setBaseURL");
    this.setState({ host: { BASE_URL, selectedHost } })
  }

  setBody(bodyType, body) {
    const data = { ...this.state.data }
    data.body = { type: bodyType, value: body }
    isDashboardRoute(this.props) && this.setHeaders(bodyType, 'content-type')
    this.setState({ data }, () => this.setModifiedTabData())
  }

  setBodyDescription(type, value) {
    const data = {}
    try {
      if (value.trim() === '') {
        data.bodyDescription = {}
        return data
      }
      const body = JSON.parse(value)
      const keys = Object.keys(body)
      const bodyDescription = {}
      for (let i = 0; i < keys.length; i++) {
        if (typeof body[keys[i]] !== 'object') {
          bodyDescription[keys[i]] = {
            default: body[keys[i]],
            description: this.state.fieldDescription[keys[i]]
              ? this.state.fieldDescription[keys[i]]
              : '',
            dataType: typeof body[keys[i]]
          }
        } else {
          if (
            typeof body[keys[i]] === 'object' &&
            Array.isArray(body[keys[i]])
          ) {
            if (body[keys[i]].length !== 0) {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]]
                  ? this.state.fieldDescription[keys[i]]
                  : '',
                dataType: 'Array of ' + typeof body[keys[i]][0]
              }
            } else {
              bodyDescription[keys[i]] = {
                default: [''],
                description: this.state.fieldDescription[keys[i]]
                  ? this.state.fieldDescription[keys[i]]
                  : '',
                dataType: 'Array of string'
              }
            }
          } else if (typeof body[keys[i]] === 'object') {
            const bodyField = body[keys[i]]
            const key = Object.keys(bodyField)
            if (key.length > 0 && typeof bodyField[key[0]] === 'object') {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]]
                  ? this.state.fieldDescription[keys[i]]
                  : '',
                dataType: 'Object of objects'
              }
            } else {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]]
                  ? this.state.fieldDescription[keys[i]]
                  : '',
                dataType: typeof body[keys[i]]
              }
            }
          }
        }
      }
      data.bodyDescription = bodyDescription
      return data
    } catch (error) {
      data.error = error
      return data
    }
  }

  setDescription(bodyDescription) {
    this.setState({ bodyDescription })
  }

  setFieldDescription(fieldDescription, bodyDescription) {
    this.setState({ fieldDescription, bodyDescription })
  }

  setParams(value, title, authorizationFlag) {
    const originalParams = this.state.originalParams
    const updatedParams = []
    const emptyParam = {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: ''
    }
    for (let i = 0; i < originalParams.length; i++) {
      if (originalParams[i].key === title || originalParams[i].key === '') {
        continue
      } else {
        updatedParams.push(originalParams[i])
      }
    }
    if (title === 'access_token' && !authorizationFlag) {
      updatedParams.push({
        checked: 'true',
        key: title,
        value: value,
        description: ''
      })
    }
    updatedParams.push(emptyParam)
    this.setState({ originalParams: updatedParams })
  }

  setHeaders(value, title, authorizationFlag = undefined) {
    const originalHeaders = this.state.originalHeaders
    const updatedHeaders = []
    const emptyHeader = {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: ''
    }
    for (let i = 0; i < originalHeaders.length; i++) {
      if (originalHeaders[i].key === '' || originalHeaders[i].key === title.split('.')[0]) {
        continue
      } else if (originalHeaders[i].key.toLowerCase() === title.split('.')[0]) {
        originalHeaders[i].value = this.identifyBodyType(value)
        this.setState({ originalHeaders })
        return
      } else {
        updatedHeaders.push(originalHeaders[i])
      }
    }
    if (value === 'none') {
      updatedHeaders.push(emptyHeader)
      this.setState({ originalHeaders: updatedHeaders })
      return
    }
    if (value !== 'noAuth' && !authorizationFlag) {
      updatedHeaders.push({
        checked: 'true',
        key: title === 'content-type' ? 'content-type' : 'Authorization',
        value:
          title.split('.')[0] === 'Authorization'
            ? title.split('.')[1] === 'oauth_2'
              ? 'Bearer ' + value
              : 'Basic ' + value
            : '',
        description: ''
      })
    }
    if (title === 'content-type') {
      updatedHeaders[updatedHeaders.length - 1].value = this.identifyBodyType(
        value
      )
    }

    updatedHeaders.push(emptyHeader)
    this.setState({ originalHeaders: updatedHeaders })
  }

  identifyBodyType(bodyType) {
    switch (bodyType) {
      case 'application/x-www-form-urlencoded':
        return 'application/x-www-form-urlencoded'
      case 'multipart/form-data':
        return 'multipart/form-data'
      case 'TEXT':
        return 'text/plain'
      case 'JSON':
        return 'application/JSON'
      case 'HTML':
        return 'text/HTML'
      case 'XML':
        return 'application/XML'
      case 'JavaScript':
        return 'application/JavaScript'
      default:
        break
    }
  }

  propsFromDescription(title, data) {
    if (title === 'data') {
      this.setState({ data: data }, () => this.setModifiedTabData())
    }
    if (title === 'endpoint') this.setState({ endpoint: data })
    if (title === 'oldDescription') this.setState({ oldDescription: data })
  }

  propsFromSampleResponse(sampleResponseArray, sampleResponseFlagArray) {
    this.setState({ sampleResponseArray, sampleResponseFlagArray })
    this.props.update_endpoint({
      id: this.state.endpoint.id,
      sampleResponse: sampleResponseArray
    })
  }

  makeFormData(body) {
    const formData = {}
    for (let i = 0; i < body.value.length; i++) {
      if (
        body.value[i].key.length !== 0 &&
        body.value[i].checked === 'true'
      ) {
        if (!isElectron() && body.value[i].type === 'file') {
          continue
        }
        formData[body.value[i].key] = body.value[i].value
      }
    }
    return formData
  }

  formatBody(body, headers) {
    let finalBodyValue = null
    switch (body.type) {
      case 'raw':
        finalBodyValue = this.parseBody(body.value)
        return { body: finalBodyValue, headers }
      case 'multipart/form-data': {
        const formData = this.makeFormData(body)
        headers['content-type'] = 'multipart/form-data'
        return { body: formData, headers }
      }
      case 'application/x-www-form-urlencoded': {
        const urlEncodedData = {}
        for (let i = 0; i < body.value.length; i++) {
          if (
            body.value[i].key.length !== 0 &&
            body.value[i].checked === 'true'
          ) {
            urlEncodedData[body.value[i].key] = body.value[i].value
          }
        }
        return { body: urlEncodedData, headers }
      }
      default:
        return { body: body.value, headers }
    }
  }

  async setAccessToken() {
    const url = window.location.href
    const hashVariables = isElectron() ? url.split('#')[2] : url.split('#')[1]
    const response = URI.parseQuery('?' + hashVariables)
    if (hashVariables) {
      await indexedDbService.getDataBase()
      await indexedDbService.updateData(
        'responseData',
        response,
        'currentResponse'
      )
      const responseData = await indexedDbService.getValue(
        'responseData',
        'currentResponse'
      )
      const timer = setInterval(async function () {
        if (responseData) {
          clearInterval(timer)
          window.close()
        }
      }, 1000)
    }
    if (url.split('?')[1]) {
      await indexedDbService.getDataBase()
      const authData = await indexedDbService.getValue(
        'authData',
        'currentAuthData'
      )
      const resposneAuthCode = URI.parseQuery('?' + url.split('?')[1])
      const code = resposneAuthCode.code
      const paramsObject = {}
      paramsObject.code = code
      paramsObject.client_id = authData.clientId
      paramsObject.client_secret = authData.clientSecret
      paramsObject.redirect_uri = authData.callbackUrl
      await endpointApiService.authorize(
        authData.accessTokenUrl,
        paramsObject,
        'auth_code',
        this.props,
        authData
      )
    }
  }

  setAuthType(type, value) {
    let authType = {}
    if (type === '') {
      authType = null
    } else {
      authType = {
        type,
        value
      }
    }
    this.setState({ authType })
  }

  addSampleResponse(response) {
    const { data, status } = response
    const sampleResponseFlagArray = [...this.state.sampleResponseFlagArray]
    const description = ''
    const title = ''
    const sampleResponse = { data, status, description, title }
    const sampleResponseArray = [
      ...this.state.sampleResponseArray,
      sampleResponse
    ]
    sampleResponseFlagArray.push(false)
    this.setState({ sampleResponseArray, sampleResponseFlagArray })
    this.props.update_endpoint({
      id: this.state.endpoint.id,
      sampleResponse: sampleResponseArray
    })
  }

  openBody(index) {
    const sampleResponseFlagArray = [...this.state.sampleResponseFlagArray]
    sampleResponseFlagArray[index] = true
    this.setState({ sampleResponseFlagArray })
  }

  closeBody(index) {
    const sampleResponseFlagArray = [...this.state.sampleResponseFlagArray]
    sampleResponseFlagArray[index] = false
    this.setState({ sampleResponseFlagArray })
  }

  closeLoginSignupModal() {
    this.setState({
      showLoginSignupModal: false
    })
  }

  handleCancel() {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.invoke('request-cancel', this.state.requestKey)
    } else {
      const CUSTOM_REQUEST_CANCELLATION = 'Request was cancelled'
      this.state.runSendRequest.cancel(CUSTOM_REQUEST_CANCELLATION)
    }
    this.setState({
      loader: false,
      runSendRequest: null,
      requestKey: null
    })
  }

  displayResponse() {
    if (this.isNotDashboardOrDocView() && this.state.flagResponse) {
      return (
        <div ref={this.myRef} className='hm-panel endpoint-public-response-container public-doc'>
          <DisplayResponse
            {...this.props}
            loader={this.state.loader}
            timeElapsed={this.state.timeElapsed}
            response={this.state.response}
            flagResponse={
              this.state.flagResponse
            }
            add_sample_response={this.addSampleResponse.bind(this)}
            handleCancel={() => { this.handleCancel() }}
            tests={this.state.tests}
            sample_response_array={this.state.sampleResponseArray}
            sample_response_flag_array={this.state.sampleResponseFlagArray}
            props_from_parent={this.propsFromSampleResponse.bind(this)}
          />
        </div>
      )
    }
  }

  displayPublicSampleResponse() {
    if (this.state.sampleResponseArray.length) {
      return (
        <div className='mt-3'>
          <PublicSampleResponse
            highlights={this.props.highlights}
            sample_response_array={this.state.sampleResponseArray}
            publicCollectionTheme={this.props.publicCollectionTheme}
          />
        </div>
      )
    }
  }

  handletoggle(type) {
    const currentView = type
    window.localStorage.setItem('response-view', currentView)
    this.props.set_response_view(currentView)
  }

  renderToggle(type) {
    return (
      <div className={`icon-set ${this.props.responseView === type ? 'active' : ''}`} onClick={() => this.handletoggle(type)}>
        <OverlayTrigger
          overlay={<Tooltip id='tooltip-disabled'>Doc to {type}</Tooltip>}
        >
          <div className='icon-bx' />
        </OverlayTrigger>
      </div>
    )
  }

  toggleChatbotModal = () => {
    this.setState(prevState => ({
      showAskAiSlider: !prevState.showAskAiSlider
    }));
  };

  displayResponseAndSampleResponse() {
    return (
      <>
        <div className='custom-tabs clear-both response-container' ref={this.myRef}>
          <div className='d-flex justify-content-between align-items-center'>
            <ul className='nav nav-tabs respTabsListing' id='myTab' role='tablist'>
              <li className='nav-item'>
                <a
                  className='nav-link active'
                  id='pills-response-tab'
                  data-toggle='pill'
                  href={
                    this.isDashboardAndTestingView()
                      ? `#response-${this.props.tab.id}`
                      : '#response'
                  }
                  role='tab'
                  aria-controls={
                    this.isDashboardAndTestingView()
                      ? `response-${this.props.tab.id}`
                      : 'response'
                  }
                  aria-selected='true'
                >
                  Response
                </a>
              </li>
              {getCurrentUser() && (
                <li className='nav-item'>
                  <a
                    className='nav-link'
                    id='pills-sample-tab'
                    data-toggle='pill'
                    href={
                      this.isDashboardAndTestingView()
                        ? `#sample-${this.props.tab.id}`
                        : '#sample'
                    }
                    role='tab'
                    aria-controls={
                      this.isDashboardAndTestingView()
                        ? `sample-${this.props.tab.id}`
                        : 'sample'
                    }
                    aria-selected='false'
                  >
                    Sample Response
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className='tab-content responseTabWrapper' id='pills-tabContent'>
            <div
              className='tab-pane fade show active'
              id={
                this.isDashboardAndTestingView()
                  ? `response-${this.props.tab.id}`
                  : 'response'
              }
              role='tabpanel'
              aria-labelledby='pills-response-tab'
            >
              <div className='hm-panel endpoint-public-response-container '>
                <DisplayResponse
                  {...this.props}
                  loader={this.state.loader}
                  timeElapsed={this.state.timeElapsed}
                  response={this.state.response}
                  tests={this.state.tests}
                  flagResponse={
                    this.state.flagResponse
                  }
                  sample_response_array={this.state.sampleResponseArray}
                  sample_response_flag_array={this.state.sampleResponseFlagArray}
                  add_sample_response={this.addSampleResponse.bind(this)}
                  props_from_parent={this.propsFromSampleResponse.bind(this)}
                  handleCancel={() => { this.handleCancel() }}
                />
              </div>
            </div>
            {
              getCurrentUser() &&
              <div
                className='tab-pane fade'
                id={
                  this.isDashboardAndTestingView()
                    ? `sample-${this.props.tab.id}`
                    : 'sample'
                }
                role='tabpanel'
                aria-labelledby='pills-sample-tab'
              >
                {this.renderSampleResponse()}
              </div>
            }
          </div>
        </div>
      </>
    )
  }

  renderSampleResponse() {
    return (
      <SampleResponse
        {...this.props}
        timeElapsed={this.state.timeElapsed}
        response={this.state.response}
        flagResponse={this.state.flagResponse}
        sample_response_array={this.state.sampleResponseArray}
        sample_response_flag_array={this.state.sampleResponseFlagArray}
        open_body={this.openBody.bind(this)}
        close_body={this.closeBody.bind(this)}
        props_from_parent={this.propsFromSampleResponse.bind(this)}
        currentView={this.state.currentView}
      />
    )
  }

  displayPublicResponse() {
    return (
      <>
        <div className='response-container endpoint-public-response-container endPointRes'>
          <h4>Response</h4>
          <DisplayResponse
            {...this.props}
            loader={this.state.loader}
            tests={this.state.tests}
            timeElapsed={this.state.timeElapsed}
            response={this.state.response}
            flagResponse={this.state.flagResponse}
            handleCancel={() => { this.handleCancel() }}
          />
        </div>
      </>
    )
  }

  setHostUri(host, uri, selectedHost) {
    console.log(host,"host",uri, "uri", selectedHost, "setHostUri in display endpoint");
    if (uri !== this.state.data.updatedUri){
      console.log("inside if set host uri");
      this.handleChange({ currentTarget: { name: 'updatedUri', value: uri } })
      this.setBaseUrl(host, selectedHost)
    }
    else{
      this.handleChange({currentTarget: { name: 'updatedUri', value: host}})
    }
    // else{
    //   console.log("inside else condition");
    //   console.log(this.state.data.updatedUri,"inside else condition ....");
    //   // this.handleChange({ currentTarget: { name: 'updatedUri', value: host } })
    //   // this.setBaseUrl(host, selectedHost)
    //   if (!this.state.data.updatedUri.includes(host)) {
    //     console.log("inside if condition for else condition", this.state.data.updatedUri );
    //     console.log(this.state.data.updatedUri + host, "value for concatttt");
    //     this.handleChange({ currentTarget: { name: 'updatedUri', value: this.state.data.updatedUri + host } })

    //     console.log(selectedHost, "selected host in if condition");
    //     this.setBaseUrl(host, selectedHost)
    //   }
    // }
  }
  // setHostUri(host, uri, selectedHost) {
  //   if (uri !== this.state.data.updatedUri) this.handleChange({ currentTarget: { name: 'updatedUri', value: uri } })
  //   this.setBaseUrl(host, selectedHost)
  // }

  alterEndpointName(name) {
    if (name) {
      const obj = this.state.data
      obj.name = name
      this.setState({ data: obj })
    }
  }

  renderCookiesModal() {
    return (
      this.state.showCookiesModal &&
      <CookiesModal
        show={this.state.showCookiesModal}
        onHide={() => this.setState({ showCookiesModal: false })}
      />
    )
  }

  handleScriptChange(text, type) {
    let preScriptText = this.state.preScriptText || ''
    let postScriptText = this.state.postScriptText || ''
    if (type === 'Pre-Script') {
      preScriptText = text
    } else {
      postScriptText = text
    }

    this.setState({ preScriptText, postScriptText }, () => this.setModifiedTabData())
  }

  renderScriptError() {
    return (
      <>
        {this.state.postReqScriptError ? <div className='script-error'>{`There was an error in evaluating the Post-request Script: ${this.state.postReqScriptError}`}</div> : null}
        {this.state.preReqScriptError ? <div className='script-error'>{`There was an error in evaluating the Pre-request Script: ${this.state.preReqScriptError}`}</div> : null}
      </>
    )
  }

  switchView = (currentView) => {
    if (this.state.currentView !== currentView) {
      this.setState({ currentView })
      // this.setState({ showViewConfirmationModal: true })
    }
  }

  renderDefaultViewConfirmationModal() {
    return this.state.showViewConfirmationModal &&
      <ConfirmationModal
        show={this.state.showViewConfirmationModal}
        onHide={() => this.setState({ showViewConfirmationModal: false })}
        proceed_button_callback={this.setDefaultView.bind(this)}
        title={msgText.viewSwitch}
      />
  }

  setDefaultView() {
    const endpointView = { [getCurrentUser().identifier]: this.state.currentView }
    window.localStorage.setItem('endpointView', JSON.stringify(endpointView))
  }

  removePublicItem(item, index) {
    const showRemoveButton = !['body', 'host', 'params', 'pathVariables', 'headers', 'sampleResponse'].includes(item.type)
    const handleOnClick = () => {
      const docData = _.cloneDeep(this.state.docViewData)
      docData.splice(index, 1)
      this.setState({ docViewData: docData })
    }
    return showRemoveButton && <div className='' onClick={handleOnClick.bind(this)}> <img src={DeleteIcon} alt='' /> </div>
  }

  renderDocView = () => {
    if (!this.state.docViewData) return
    if (isDashboardRoute(this.props)) {
      return (
        <SortableList lockAxis='y' useDragHandle onSortEnd={({ oldIndex, newIndex }) => { this.onSortEnd(oldIndex, newIndex) }}>
          <div>
            {this.state.docViewData.map((item, index) =>
              <SortableItem key={index} index={index}>
                <div className='doc-secs-container mb-3'>
                  <div className='doc-secs'>
                    {this.renderPublicItem(item, index)}
                  </div>
                  <div className='addons'>
                    {this.renderDragHandle(item)}
                    {this.removePublicItem(item, index)}
                  </div>
                </div>
              </SortableItem>
            )}
          </div>
        </SortableList>
      )
    } else {
      return this.state.docViewData?.map((item, index) =>
        <div key={index}>
          {this.renderPublicItem(item, index)}
        </div>
      )
    }
  }

  renderDragHandle(item) {
    if (item.type === 'pathVariables') {
      if (this.state.pathVariables && this.state.pathVariables.length) return <DragHandle />
      return
    }
    return <DragHandle />
  }

  onSortEnd = (oldIndex, newIndex) => {
    const { docViewData } = this.state
    if (newIndex !== oldIndex) {
      const newData = []
      docViewData.forEach((data, index) => {
        index !== oldIndex && newData.push(data)
      })
      newData.splice(newIndex, 0, docViewData[oldIndex])
      this.setState({ docViewData: newData })
    }
  };

  renderTiptapEditor(item, index) {
    return (
      <Tiptap
        initial={item.data}
        onChange={(e) => {
          const docData = _.cloneDeep(this.state.docViewData)
          docData[index].data = e
          this.setState({ docViewData: docData })
        }}
        match={this.props.match}
        isInlineEditor
        disabled={!isDashboardRoute(this.props)}
        key={index}
      />
    )
  }

  renderPublicItem = (item, index) => {
    switch (item.type) {
      case 'textArea': {
        if (isDashboardRoute(this.props) || (!isDashboardRoute(this.props) && item.data)) {
          return (
            <div>{this.renderTiptapEditor(item, index)}</div>
          )
        }
        break
      }
      case 'textBlock': {
        if (isDashboardRoute(this.props) || (!isDashboardRoute(this.props) && item.data)) {
          return (
            <div className='pub-notes' style={{ borderLeftColor: this.state.theme }}>
              {this.renderTiptapEditor(item, index)}
            </div>
          )
        }
        break
      }
      case 'host': {
        if (!isDashboardRoute(this.props)) return this.renderPublicHost()
        else return <div className='endpoint-url-container'> {this.renderHost()} </div>
      }
      case 'body': {
        if (!isDashboardRoute(this.props)) return this.renderPublicBodyContainer()
        else return this.renderBodyContainer()
      }
      case 'headers': {
        if (!isDashboardRoute(this.props)) return this.renderPublicHeaders()
        else return <div className='mb-3'>{this.renderHeaders()}</div>
      }
      case 'params': {
        if (!isDashboardRoute(this.props)) return this.renderPublicParams()
        else return <div className='mb-3'>{this.renderParams()}</div>
      }
      case 'pathVariables': {
        if (!isDashboardRoute(this.props)) return this.renderPublicPathVariables()
        else return this.renderPathVariables()
      }
      case 'sampleResponse': {
        if (!isDashboardRoute(this.props)) return this.displayPublicSampleResponse()
        else return this.renderSampleResponse()
      }
    }
  }

  isNotDashboardOrDocView() {
    return !isDashboardRoute(this.props) || this.state.currentView === 'doc'
  }

  isDashboardAndTestingView() {
    return isDashboardRoute(this.props) && (this.state.currentView === 'testing' || !isSavedEndpoint(this.props))
  }

  getCurrentView() {
    const { endpoints, collections } = this.props
    const endpoint = endpoints[this.endpointId]
    const collectionId = this.extractCollectionId(endpoint.groupId)
    const collectionView = collections[collectionId]?.defaultView
    if (window.localStorage.getItem('endpointView') && getCurrentUser()) {
      const userId = getCurrentUser().identifier
      const currentView = JSON.parse(window.localStorage.getItem('endpointView'))
      if (currentView[userId]) return currentView[userId]
      return collectionView
    }
    return collectionView
  }

  getDocViewData(endpoint) {
    if (endpoint) {
      if (!endpoint.docViewData || endpoint.docViewData.length === 0) {
        const docViewData = [...defaultDocViewData]
        if (endpoint.description && endpoint.description.length) docViewData.splice(0, 0, { type: 'textArea', data: endpoint.description })
        if (endpoint.notes && endpoint.notes.length) docViewData.splice(docViewData.length - 1, 0, { type: 'textBlock', data: endpoint.notes })
        return docViewData
      }
      return endpoint.docViewData
    }
  }

  renderToggleView() {
    if (isSavedEndpoint(this.props)) {
      return (
        <ButtonGroup className='btn-group-custom mb-3' aria-label='Basic example'>
          <Button className={'mr-1 ' + (this.state.currentView === 'testing' ? 'active' : '')} onClick={() => this.switchView('testing')}>Testing</Button>
          <Button className={this.state.currentView === 'doc' ? 'active' : ''} onClick={() => this.switchView('doc')}>Doc</Button>
        </ButtonGroup>
      )
    }
  }

  renderDocViewOptions() {
    if (isDashboardRoute(this.props) && this.state.currentView === 'doc') {
      return (
        <div>
          <Dropdown>
            <Dropdown.Toggle variant='' id='dropdown-basic' className='doc-plus'>
              <img src={PlusIcon} className='mr-2 cursor-pointer' onClick={() => this.showDocOptions()} alt='' />
            </Dropdown.Toggle>
            <Dropdown.Menu id='bg-nested-dropdown' className='d-flex doc-plus-menu'>
              <Dropdown.Item onClick={() => this.addBlock('textArea')}>Text Area</Dropdown.Item>
              <Dropdown.Item onClick={() => this.addBlock('textBlock')}>Text Block</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )
    }
  }

  addBlock(blockType) {
    const docViewData = [...this.state.docViewData]
    docViewData.push({
      type: blockType,
      data: ''
    })
    this.setState({ docViewData })
  }

  renderBodyContainer() {
    return (
      <BodyContainer
        {...this.props}
        set_body={this.setBody.bind(this)}
        set_body_description={this.setDescription.bind(this)}
        body={
          this.state.bodyFlag === true ? this.state.data.body : ''
        }
        Body={this.state.data.body}
        endpoint_id={this.props.tab.id}
        body_description={this.state.bodyDescription}
        field_description={this.state.fieldDescription}
        set_field_description={this.setFieldDescription.bind(
          this
        )}
      />
    )
  }

  renderPublicBodyContainer() {
    return this.state.data.body && this.state.originalBody &&
      this.state.data.body.value !== null && (
        <PublicBodyContainer
          {...this.props}
          set_body={this.setBody.bind(this)}
          set_body_description={this.setDescription.bind(this)}
          body={this.state.data.body}
          original_body={this.state.originalBody}
          public_body_flag={this.state.publicBodyFlag}
          set_public_body={this.setPublicBody.bind(this)}
          body_description={this.state.bodyDescription}
        />
      )
  }

  renderHeaders() {
    return (
      <GenericTable
        {...this.props}
        title='Headers'
        dataArray={this.state.originalHeaders}
        props_from_parent={this.propsFromChild.bind(this)}
        original_data={[...this.state.headers]}
        // open_modal={this.props.open_modal}
        currentView={this.state.currentView}
      />
    )
  }

  renderPublicHeaders() {
    return this.state.headers.length > 1 && (
      <GenericTable
        {...this.props}
        title='Headers'
        dataArray={this.state.originalHeaders}
        props_from_parent={this.propsFromChild.bind(this)}
        original_data={[...this.state.headers]}
        open_modal={this.props.open_modal}
        currentView={this.state.currentView}
      />
    )
  }

  renderParams() {
    return (
      <GenericTable
        {...this.props}
        title='Params'
        dataArray={this.state.originalParams}
        props_from_parent={this.propsFromChild.bind(this)}
        original_data={[...this.state.params]}
        open_modal={this.props.open_modal}
        currentView={this.state.currentView}
      />
    )
  }

  renderPublicParams() {
    return this.state.params.length > 1 && (
      <div>
        <GenericTable
          {...this.props}
          title='Params'
          dataArray={this.state.originalParams}
          props_from_parent={this.propsFromChild.bind(this)}
          original_data={[...this.state.params]}
          currentView={this.state.currentView}
        />
      </div>
    )
  }

  renderPathVariables() {
    return this.state.pathVariables &&
      this.state.pathVariables.length !== 0 && (
        <GenericTable
          {...this.props}
          title='Path Variables'
          dataArray={this.state.pathVariables}
          props_from_parent={this.propsFromChild.bind(this)}
          original_data={[...this.state.pathVariables]}
          currentView={this.state.currentView}
        />
      )
  }

  renderPublicPathVariables() {
    return this.state.pathVariables &&
      this.state.pathVariables.length !== 0 && (
        <div>
          <GenericTable
            {...this.props}
            title='Path Variables'
            dataArray={this.state.pathVariables}
            props_from_parent={this.propsFromChild.bind(this)}
            original_data={[...this.state.pathVariables]}
            currentView={this.state.currentView}
          />
        </div>
      )
  }

  renderPublicHost() {
    return (
      <div>
        {/* do not remove this code */}
        {/* <h3 className='heading-2'>Endpoint Name</h3> */}
        <div className='hm-endpoint-header'>
          <div className='input-group'>
            <div className='input-group-prepend'>
              <span
                className={`api-label api-label-lg input-group-text ${this.state.data.method}`}
              >
                {this.state.data.method}
              </span>
            </div>
            <HostContainer
              {...this.props}
              // handleHeadersValue={this.handleHeadersValue}
              // handleMethodChange={this.handleMethodChange}
              groupId={this.state.groupId}
              versionHost={this.props.versions[this.props.groups[this.state.groupId]?.versionId]?.host || ''}
              environmentHost={this.props.environment?.variables?.BASE_URL?.currentValue || this.props.environment?.variables?.BASE_URL?.initialValue || ''}
              updatedUri={this.state.data.updatedUri}
              set_base_url={this.setBaseUrl.bind(this)}
              customHost={this.state.endpoint.BASE_URL || ''}
              endpointId={this.state.endpoint.id}
              set_host_uri={this.setHostUri.bind(this)}
              props_from_parent={this.propsFromChild.bind(this)}
            />
          </div>
          {(this.props.highlights?.uri ? <i className='fas fa-circle' /> : null)}
        </div>
        <input
          ref={this.uri}
          type='hidden'
          value={this.state.data.updatedUri}
          name='updatedUri'
        />
      </div>
    )
  }

  renderHost() {
    return (
      <div className='input-group-prepend'>
        <div className='dropdown'>
          <button
            className={`api-label ${this.state.data.method} dropdown-toggle`}
            type='button'
            id='dropdownMenuButton'
            data-toggle='dropdown'
            aria-haspopup='true'
            aria-expanded='false'
            disabled={isDashboardRoute(this.props) ? null : true}
          >
            {this.state.data.method}
          </button>
          <div
            className='dropdown-menu'
            aria-labelledby='dropdownMenuButton'
          >
            {this.state.methodList.map((methodName) => (
              <button
                className='dropdown-item'
                onClick={() => this.setMethod(methodName)}
                key={methodName}
              >
                {methodName}
              </button>
            ))}
          </div>
        </div>
        <div className='d-flex w-100 dashboard-url'>
          <HostContainer
            {...this.props}
            handleHeadersValue={this.handleHeadersValue}
            handleMethodChange={this.handleMethodChange}
            groupId={this.state.groupId}
            endpointId={this.state.endpoint.id}
            customHost={this.state.endpoint.BASE_URL || ''}
            environmentHost={this.props.environment?.variables?.BASE_URL?.currentValue || this.props.environment?.variables?.BASE_URL?.initialValue || ''}
            versionHost={this.props.versions[this.props.groups[this.state.groupId]?.versionId]?.host || ''}
            updatedUri={this.state.data.updatedUri}
            set_host_uri={this.setHostUri.bind(this)}
            set_base_url={this.setBaseUrl.bind(this)}
            props_from_parent={this.propsFromChild.bind(this)}
          />
        </div>
      </div>
    )
  }

  renderDocViewOperations() {
    const endpoints = { ...this.props.endpoints }
    const endpointId = this.endpointId
    if (isDashboardRoute(this.props) && this.state.currentView === 'doc' && endpoints[endpointId]) {
      const approvedOrRejected = isStateApproved(endpointId, endpoints) || isStateReject(endpointId, endpoints)
      const isPublicEndpoint = endpoints[endpointId].isPublished
      return (
        <div>
          {isStatePending(endpointId, endpoints) && isAdmin() &&
            <ApproveRejectEntity
              {...this.props}
              entity={endpoints}
              entityId={endpointId}
              entityName='endpoint'
            />}
          <button
            id='api_save_btn'
            className={this.state.saveLoader ? 'ml-2 btn btn-outline orange buttonLoader' : 'ml-2 btn btn-outline orange'}
            type='button'
            onClick={() => this.handleSave()}
          >
            {isPublicEndpoint ? 'Save Draft' : 'Save'}
          </button>
          {(isAdmin() && !isStatePending(endpointId, endpoints)) && <span> {approvedOrRejected ? this.renderInOverlay(this.renderPublishEndpoint.bind(this), endpointId) : this.renderPublishEndpoint(endpointId, endpoints)}</span>}
          {(isAdmin() && isPublicEndpoint) && <span> {isStateApproved(endpointId, endpoints) ? this.renderInOverlay(this.renderUnPublishEndpoint.bind(this), endpointId) : this.renderUnPublishEndpoint(endpointId, endpoints)}</span>}
          {!isAdmin() &&
            <button
              className={'ml-2 ' + (isStateDraft(endpointId, endpoints) ? 'btn btn-outline orange' : 'btn text-link')}
              type='button'
              onClick={() => isStateDraft(endpointId, endpoints) ? this.handlePublicEndpointState(endpoints[endpointId]) : null}
            >
              {getEntityState(endpointId, endpoints)}
            </button>}
        </div>
      )
    }
  }

  renderInOverlay(method, endpointId) {
    const endpoints = { ...this.props.endpoints }
    return (
      <OverlayTrigger overlay={<Tooltip id='tooltip-disabled'>Nothing to publish</Tooltip>}>
        <span className='d-inline-block float-right'>
          {method(endpointId, endpoints)}
        </span>
      </OverlayTrigger>
    )
  }

  handleRemovePublicEndpoint (endpointId) {
    const endpoints = {...this.props.endpoints}
    this.props.update_endpoint({
      ...endpoints[endpointId],
      groupId: this.state.selectedGroupId,
      isPublished: false,
      publishedEndpoint: {},
      state: 'Draft',
      position: null
    })
  }

  renderUnPublishEndpoint(endpointId, endpoints) {
    return (
        <UnPublishEntityButton
        entity={endpoints}
        entityId={endpointId}
        onUnpublish={() => this.handleRemovePublicEndpoint (endpointId)}
        entityName='Endpoint'
      />
    )
  }

  renderPublishEndpoint(endpointId, endpoints) {
    return (
        <PublishEntityButton
        entity={endpoints}
        entityId={endpointId}
        open_publish_confirmation_modal={() => this.setState({ openPublishConfirmationModal: true })}
        entityName='Endpoint'
      />
    )
  }

  renderPublishConfirmationModal() {
    return this.state.openPublishConfirmationModal &&
      <ConfirmationModal
        show={this.state.openPublishConfirmationModal}
        onHide={() => this.setState({ openPublishConfirmationModal: false })}
        proceed_button_callback={this.handleApproveEndpointRequest.bind(this)}
        title={msgText.publishEndpoint}
        submitButton='Publish'
        rejectButton='Discard'
      />
  }

  async handleApproveEndpointRequest() {
    const endpointId = this.endpointId
    this.setState({ publishLoader: true })
    if (sensitiveInfoFound(this.props.endpoints[endpointId])) {
      this.setState({ warningModal: true })
    } else {
      this.props.approve_endpoint(this.props.endpoints[endpointId], () => { this.setState({ publishLoader: false }) })
    }
  }

  async handlePublicEndpointState(endpoint) {
    if (isStateDraft(endpoint.id, this.props.endpoints) || isStateReject(endpoint.id, this.props.endpoints)) {
      this.props.pending_endpoint(endpoint)
    }
  }

  renderWarningModal() {
    return (
      <WarningModal
        show={this.state.warningModal}
        ignoreButtonCallback={() => this.props.approve_endpoint(this.props.endpoints[this.endpointId])}
        onHide={() => { this.setState({ warningModal: false, publishLoader: false }) }}
        title='Sensitive Information Warning'
        message='This Entity contains some sensitive information. Please remove them before making it public.'
      />
    )
  }

  showDocOptions() {
    const { docOptions } = this.state
    this.setState({ docOptions: !docOptions })
  }

  renderSaveButton() {
    return (
      <div className='save-endpoint position-absolute top-right'>
        {
          this.isDashboardAndTestingView()
            ? (
              this.props.location.pathname.split('/')[5] !== 'new'
                ? (
                  <Dropdown as={ButtonGroup}>
                    <button
                      id='api_save_btn'
                      className={this.state.saveLoader ? 'btn btn-outline orange buttonLoader' : 'btn btn-outline orange'}
                      type='button'
                      onClick={() => this.handleSave()}
                    >
                      Save
                    </button>
                    {
                      getCurrentUser()
                        ? (
                          <>
                            <Dropdown.Toggle className='btn-outline' split variant='' />
                            <Dropdown.Menu className=''>
                              <Dropdown.Item
                                onClick={() =>
                                  this.setState({ saveAsFlag: true }, () => {
                                    this.openEndpointFormModal()
                                  })}
                              >
                                Save As
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </>
                        )
                        : null
                    }
                  </Dropdown>
                )
                : (
                  <button
                    className={this.state.saveLoader ? 'btn btn-outline orange buttonLoader' : 'btn btn-outline orange'}
                    type='button'
                    id='save-endpoint-button'
                    onClick={() => this.handleSave()}
                  >
                    Save
                  </button>
                )
            )
            : null
        }
      </div>
    )
  }

  responseToggle() {
    return JSON.parse(window.localStorage.getItem('right'))
  }

  render() {
    this.endpointId = this.props.endpointId
      ? this.props.endpointId
      : isDashboardRoute(this.props)
        ? this.props.location.pathname.split('/')[5]
        : this.props.location.pathname.split('/')[4]
    if (
      isDashboardRoute(this.props) &&
      this.state.groupId &&
      this.props.tab.status === tabStatusTypes.DELETED
    ) {
      this.setState({ groupId: null })
    }

    if (
      this.props.save_endpoint_flag &&
      this.props.tab.id === this.props.selected_tab_id
    ) {
      this.props.handle_save_endpoint(false)
      this.handleSave()
    }

    if (
      (
        !isDashboardRoute(this.props) &&
        this.state.endpoint.id !== this.endpointId &&
        this.props.endpoints[this.endpointId]
      ) ||
      (
        !isDashboardRoute(this.props) && (
          (this.props.rejectedEndpointId && this.state.publicEndpointId !== this.props.rejectedEndpointId)
        )
      )
    ) {
      this.fetchEndpoint(0, this.endpointId)
      store.subscribe(() => {
        if (!this.props.location.title && !this.state.title) {
          this.fetchEndpoint(0, this.endpointId)
        }
      })
    }

    const { theme, codeEditorVisibility } = this.state
    const { responseView } = this.props
    return ((isDashboardRoute(this.props) && this.state.currentView) || !isDashboardRoute(this.props)) || !isSavedEndpoint(this.props)
      ? (
        <div
          ref={this.myRef}
          className={!this.isNotDashboardOrDocView() ? '' : codeEditorVisibility ? 'mainContentWrapperPublic hideCodeEditor' : 'mainContentWrapperPublic '}
        >
          <div onClick={this.closeChatBotModal} className={this.isNotDashboardOrDocView() ? 'mainContentWrapper dashboardPage' : 'mainContentWrapper'} >
            <div className={`innerContainer ${responseView === 'right' ? 'response-right' : 'response-bottom'}`}>
              <div className={`hm-endpoint-container mid-part endpoint-container ${this.state.currentView === 'doc' ? 'doc-fix-width' : ''}`}>
                {this.renderCookiesModal()}
                {this.renderDefaultViewConfirmationModal()}
                {this.renderPublishConfirmationModal()}
                {this.renderWarningModal()}
                {this.state.showLoginSignupModal && (
                  <LoginSignupModal
                    show
                    onHide={() => this.closeLoginSignupModal()}
                    title='Save Endpoint'
                  />
                )}
                {
                  getCurrentUser()
                    ? (
                      <div
                        className={this.isDashboardAndTestingView() ? 'hm-panel' : null}
                      >

                        <div className='d-flex justify-content-between'>
                          {this.renderToggleView()}
                          {this.renderDocViewOperations()}
                        </div>
                        <div className='position-relative top-part'>
                          {this.state.showEndpointFormModal && (
                            <SaveAsSidebar
                              {...this.props}
                              onHide={() => this.closeEndpointFormModal()}
                              set_group_id={this.setGroupId.bind(this)}
                              name={this.state.data.name}
                              description={this.state.data.description}
                              save_endpoint={this.handleSave.bind(this)}
                              saveAsLoader={this.state.saveAsLoader}
                            />
                          )}
                          {this.isDashboardAndTestingView() && (
                            <DisplayDescription
                              {...this.props}
                              endpoint={this.state.endpoint}
                              data={this.state.data}
                              old_description={this.state.oldDescription}
                              groupId={this.state.groupId ? this.state.groupId : null}
                              props_from_parent={this.propsFromDescription.bind(this)}
                              alterEndpointName={(name) => this.alterEndpointName(name)}
                            />
                          )}
                          {this.renderSaveButton()}
                        </div>
                      </div>
                    )
                    : null
                }
                <div className={'clear-both ' + (this.state.currentView === 'doc' ? 'doc-view' : 'testing-view')}>
                  <div className='endpoint-header' ref={this.scrollDiv}>
                    {this.isNotDashboardOrDocView() && (
                      <div className='endpoint-name-container'>
                        {this.isNotDashboardOrDocView() && <h1 className='endpoint-title'>{this.state.data?.name || ''}</h1>}
                      </div>
                    )}
                  </div>
                  <div
                    className={this.isNotDashboardOrDocView() ? 'hm-panel' : 'hm-panel'}
                  >
                    {
                      this.isDashboardAndTestingView() &&
                      (
                        <div className='endpoint-url-container'>
                          {this.renderHost()}
                          <div className='d-flex uriContainerWrapper'>
                            <button
                              className={this.state.loader ? 'btn btn-primary buttonLoader' : 'btn btn-primary'}
                              type='submit'
                              id='api-send-button'
                              onClick={() => this.handleSend()}
                              disabled={this.state.loader}
                            >
                              {this.isDashboardAndTestingView() ? 'Send' : 'Try'}
                            </button>
                          </div>
                        </div>
                      )
                    }
                    {isElectron() && <div className='ssl-mode-toggle cursor-pointer' onClick={() => this.setSslMode()}>SSL certificate verification {this.state.sslMode ? <span className='enabled'>enabled</span> : <span>disabled</span>} </div>}
                    <div
                      className={
                        this.isDashboardAndTestingView()
                          ? 'endpoint-headers-container d-flex'
                          : 'hm-public-endpoint-headers'
                      }
                    >
                      <div className='main-table-wrapper'>
                        {
                          this.isDashboardAndTestingView()
                            ? (
                              <div className='d-flex justify-content-between align-items-center'>
                                <div className='headers-params-wrapper custom-tabs'>
                                  <ul className='nav nav-tabs' id='pills-tab' role='tablist'>
                                    <li className='nav-item'>
                                      <a
                                        className={
                                          this.setAuthorizationTab
                                            ? 'nav-link '
                                            : 'nav-link active'
                                        }
                                        id='pills-params-tab'
                                        data-toggle='pill'
                                        href={`#params-${this.props.tab.id}`}
                                        role='tab'
                                        aria-controls={`params-${this.props.tab.id}`}
                                        aria-selected={
                                          this.setAuthorizationTab ? 'false' : 'true'
                                        }
                                      >
                                        Params
                                      </a>
                                    </li>
                                    <li className='nav-item'>
                                      <a
                                        className={
                                          this.setAuthorizationTab
                                            ? 'nav-link active'
                                            : 'nav-link '
                                        }
                                        id='pills-authorization-tab'
                                        data-toggle='pill'
                                        href={`#authorization-${this.props.tab.id}`}
                                        role='tab'
                                        aria-controls={`authorization-${this.props.tab.id}`}
                                        aria-selected={
                                          this.setAuthorizationTab ? 'true' : 'false'
                                        }
                                      >
                                        Authorization
                                      </a>
                                    </li>
                                    <li className='nav-item'>
                                      <a
                                        className='nav-link'
                                        id='pills-headers-tab'
                                        data-toggle='pill'
                                        href={`#headers-${this.props.tab.id}`}
                                        role='tab'
                                        aria-controls={`headers-${this.props.tab.id}`}
                                        aria-selected='false'
                                      >
                                        Headers
                                      </a>
                                    </li>
                                    <li className='nav-item'>
                                      <a
                                        className='nav-link'
                                        id='pills-body-tab'
                                        data-toggle='pill'
                                        href={`#body-${this.props.tab.id}`}
                                        role='tab'
                                        aria-controls={`body-${this.props.tab.id}`}
                                        aria-selected='false'
                                      >
                                        Body
                                      </a>
                                    </li>
                                    <li className='nav-item'>
                                      <a
                                        className='nav-link'
                                        id='pills-pre-script-tab'
                                        data-toggle='pill'
                                        href={`#pre-script-${this.props.tab.id}`}
                                        role='tab'
                                        aria-controls={`pre-script-${this.props.tab.id}`}
                                        aria-selected='false'
                                      >
                                        Pre-Script
                                      </a>
                                    </li>
                                    <li className='nav-item'>
                                      <a
                                        className='nav-link'
                                        id='pills-post-script-tab'
                                        data-toggle='pill'
                                        href={`#post-script-${this.props.tab.id}`}
                                        role='tab'
                                        aria-controls={`post-script-${this.props.tab.id}`}
                                        aria-selected='false'
                                      >
                                        Post-Script
                                      </a>
                                    </li>
                                    <li className='nav-item cookie-tab'>
                                      {getCurrentUser() &&
                                        <a className='nav-link' onClick={() => this.setState({ showCookiesModal: true })}>
                                          Cookies
                                        </a>}
                                    </li>
                                  </ul>
                                </div>

                              </div>
                            )
                            : null
                        }
                        {
                          this.isDashboardAndTestingView()
                            ? (
                              <div className='tab-content' id='pills-tabContent'>
                                <div
                                  className={
                                    this.setAuthorizationTab
                                      ? 'tab-pane fade'
                                      : 'tab-pane fade show active'
                                  }
                                  id={`params-${this.props.tab.id}`}
                                  role='tabpanel'
                                  aria-labelledby='pills-params-tab'
                                >
                                  {this.renderParams()}
                                  <div>
                                    {this.renderPathVariables()}
                                  </div>
                                </div>
                                <div
                                  className={
                                    this.setAuthorizationTab
                                      ? 'tab-pane fade show active'
                                      : 'tab-pane fade '
                                  }
                                  id={`authorization-${this.props.tab.id}`}
                                  role='tabpanel'
                                  aria-labelledby='pills-authorization-tab'
                                >
                                  <div>
                                    <Authorization
                                      {...this.props}
                                      title='Authorization'
                                      groupId={this.state.groupId}
                                      set_authorization_headers={this.setHeaders.bind(this)}
                                      set_authoriztaion_params={this.setParams.bind(this)}
                                      set_authoriztaion_type={this.setAuthType.bind(this)}
                                      accessToken={this.accessToken}
                                      authorizationType={this.state.authType}
                                    />
                                  </div>
                                </div>
                                <div
                                  className='tab-pane fade'
                                  id={`headers-${this.props.tab.id}`}
                                  role='tabpanel'
                                  aria-labelledby='pills-headers-tab'
                                >
                                  <div>
                                    {this.renderHeaders()}
                                  </div>
                                </div>
                                <div
                                  className='tab-pane fade'
                                  id={`body-${this.props.tab.id}`}
                                  role='tabpanel'
                                  aria-labelledby='pills-body-tab'
                                >
                                  {this.renderBodyContainer()}
                                </div>
                                <div
                                  className='tab-pane fade'
                                  id={`pre-script-${this.props.tab.id}`}
                                  role='tabpanel'
                                  aria-labelledby='pills-pre-script-tab'
                                >
                                  <div>
                                    <Script
                                      type='Pre-Script'
                                      handleScriptChange={this.handleScriptChange.bind(this)}
                                      scriptText={this.state.preScriptText}
                                    />
                                  </div>
                                </div>
                                <div
                                  className='tab-pane fade'
                                  id={`post-script-${this.props.tab.id}`}
                                  role='tabpanel'
                                  aria-labelledby='pills-post-script-tab'
                                >
                                  <div>
                                    <Script
                                      type='Post-Script'
                                      handleScriptChange={this.handleScriptChange.bind(this)}
                                      scriptText={this.state.postScriptText}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                            : this.renderDocView()
                        }
                        {
                          !isDashboardRoute(this.props) && (
                            <div className='request-button'>
                              <button
                                className={this.state.loader ? 'btn custom-theme-btn btn-lg buttonLoader' : 'btn btn-lg custom-theme-btn'}
                                style={{ background: theme }}
                                type='submit'
                                id='send-request-button'
                                onClick={() => this.handleSend()}
                              >
                                Try
                              </button>
                            </div>
                          )
                        }
                        {this.isDashboardAndTestingView() && this.renderScriptError()}
                        {
                          this.displayResponse()
                        }
                      </div>
                    </div>
                  </div>
                  {!this.isDashboardAndTestingView() && isDashboardRoute(this.props) &&
                    <div className='doc-options d-flex align-items-center'>
                      {this.renderDocViewOptions()}
                    </div>}
                </div>
                <ApiDocReview {...this.props} />
              </div>
              {
                this.isDashboardAndTestingView()
                  ? (
                    <div className='response-container-main position-relative'>
                      <div className='d-flex response-switcher'>
                        {this.renderToggle('bottom')}
                        {this.renderToggle('right')}
                      </div>
                      {
                        isSavedEndpoint(this.props)
                          ? this.displayResponseAndSampleResponse()
                          : this.displayPublicResponse()
                      }
                    </div>
                  )
                  : null
              }
              {
                this.isNotDashboardOrDocView() &&
                this.state.harObject &&
                this.props.location.pathname.split('/')[3] !== 'admin' && (
                  <CodeTemplate
                    show
                    onHide={() => {
                      this.setState({ showCodeTemplate: false })
                    }}
                    editorToggle={() => { this.setState({ codeEditorVisibility: !this.state.codeEditorVisibility }) }}
                    harObject={this.state.harObject}
                    title='Generate Code Snippets'
                    publicCollectionTheme={this.props.publicCollectionTheme}
                  />
                )
              }
            </div>
          </div>
          {this.isDashboardAndTestingView() && <div>
            {this.state.showAskAiSlider &&
              <ChatbotsideBar
                {...this.props}
                onHide={() => this.closeChatBotModal()}
              />}
          <div>
          </div>   
            <div className='ask-ai-btn' onClick={this.toggleChatbotModal} >
              <p>Ask AI</p>
            </div>
          </div>}
        </div>
      )
      : null
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DisplayEndpoint)
)
