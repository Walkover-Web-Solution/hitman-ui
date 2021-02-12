import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Dropdown, ButtonGroup } from 'react-bootstrap'
import store from '../../store/store'
import { isDashboardRoute, isSavedEndpoint } from '../common/utility'
import tabService from '../tabs/tabService'
import { closeTab } from '../tabs/redux/tabsActions'
import tabStatusTypes from '../tabs/tabStatusTypes'
import CodeTemplate from './codeTemplate'
import SaveAsSidebar from './saveAsSidebar'
import BodyContainer from './displayBody'
import DisplayDescription from './displayDescription'
import DisplayResponse from './displayResponse'
import SampleResponse from './sampleResponse'
import { getCurrentUser } from '../auth/authService'
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
import Notes from './notes'
import ReactHtmlParser from 'react-html-parser'
const shortid = require('shortid')

const status = require('http-status')
const URI = require('urijs')
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
    collections: state.collections
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
    add_history: (data) => dispatch(addHistory(data))
  }
}

class DisplayEndpoint extends Component {
  constructor (props) {
    super(props)
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
      codeEditorVisibility: true
    }

    this.uri = React.createRef()
    this.paramKey = React.createRef()

    this.customState = {
      BASE_URL: '',
      customBASE_URL: ''
    }

    this.structueParamsHeaders = [
      {
        checked: 'notApplicable',
        key: '',
        value: '',
        description: ''
      }
    ]
  }

  async componentDidMount () {
    this.endpointId = this.props.endpointId
      ? this.props.endpointId
      : isDashboardRoute(this.props)
        ? this.props.location.pathname.split('/')[3]
        : this.props.location.pathname.split('/')[4]

    if (this.props.location.pathname.split('/')[3] === 'new') {
      this.setState({
        data: {
          name: '',
          method: 'GET',
          body: { type: 'none', value: null },
          uri: '',
          updatedUri: ''
        },
        startTime: '',
        timeElapsed: '',
        response: {},
        endpoint: {},
        groupId: this.props.location.groupId,
        title: 'Add New Endpoint',
        flagResponse: false,
        showDescriptionFlag: false,
        authType: null,
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
        ]
      })
      this.setAccessToken()
    }
    // if (!isDashboardRoute(this.props)) {
    //   let collectionIdentifier = this.props.location.pathname.split("/")[2];
    //   this.fetchPublicCollection(collectionIdentifier);
    // }

    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
    if (window.innerWidth < '1400') {
      this.setState({ codeEditorVisibility: false })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.scrollDiv.current.scrollIntoView({ block: 'center' })
    }
    if (this.props.endpointId !== prevProps.endpointId) {
      this.scrollDiv.current.scrollIntoView({ block: 'center' })
    }
    if (!isDashboardRoute(this.props)) {
      if (
        this.state.data !== prevState.data ||
        this.state.originalParams !== prevState.originalParams ||
        this.state.originalHeaders !== prevState.originalHeaders
      ) {
        this.prepareHarObject()
      }
    }

    if (this.state.endpoint.id !== prevState.endpoint.id) {
      this.setState({ flagResponse: false })
    }
  }

  async fetchPublicCollection (collectionId) {
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

  fetchEndpoint (flag, endpointId) {
    let endpoint = {}
    let originalParams = []
    let originalHeaders = []
    let pathVariables = []
    let originalBody = {}
    const { endpoints } = store.getState()
    const { groups } = store.getState()
    const { versions } = store.getState()
    if (this.props.location.pathname.split('/')[3] === 'new' && !this.title) {
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
      this.customState.customBASE_URL = endpoint.BASE_URL

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
        response: {}
      })
      this.setAccessToken()
    }
  }

  fetchHistorySnapshot () {
    let originalParams = []
    let originalHeaders = []
    let originalBody = {}
    let pathVariables = []
    const history = this.props.historySnapshot
    const params = this.fetchoriginalParams(history.endpoint.params)
    originalParams = this.fetchoriginalParams(history.endpoint.params)
    const headers = this.fetchoriginalHeaders(history.endpoint.headers)
    originalHeaders = this.fetchoriginalParams(history.endpoint.params)
    this.customState.customBASE_URL = history.endpoint.BASE_URL
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
      bodyFlag: true
    })
  }

  getFieldDescription (bodyDescription) {
    const keys = Object.keys(bodyDescription)
    const fieldDescription = {}
    for (let i = 0; i < keys.length; i++) {
      fieldDescription[keys[i]] = bodyDescription[keys[i]].description
    }
    return fieldDescription
  }

  handleChange = (e) => {
    const data = { ...this.state.data }
    data[e.currentTarget.name] = e.currentTarget.value
    data.uri = e.currentTarget.value
    if (e.currentTarget.name === 'updatedUri') {
      const keys = []
      const values = []
      const description = []
      let originalParams = this.state.originalParams
      const updatedUri = e.currentTarget.value.split('?')[1]
      let path = new URI(e.currentTarget.value)
      path = path.pathname()
      const pathVariableKeys = path.split('/')
      const pathVariableKeysObject = {}
      for (let i = 0; i < pathVariableKeys.length; i++) {
        pathVariableKeysObject[pathVariableKeys[i]] = false
      }
      this.setPathVariables(pathVariableKeys, pathVariableKeysObject)
      const result = URI.parseQuery(updatedUri)
      for (let i = 0; i < Object.keys(result).length; i++) {
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
      this.setState({ originalParams })
    }
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id)
    }
    this.setState({ data })
  };

  setPathVariables (pathVariableKeys, pathVariableKeysObject) {
    const pathVariables = []
    for (let i = 1; i < pathVariableKeys.length; i++) {
      if (
        pathVariableKeys[i][0] === ':' &&
        pathVariableKeysObject[pathVariableKeys[i]] === false
      ) {
        pathVariableKeysObject[pathVariableKeys[i]] = true
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

    this.setState({ pathVariables })
  }

  getSampleResponseFlagArray (sampleResponse) {
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

  makeOriginalParams (keys, values, description) {
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

  replaceVariables (str) {
    str = str.toString()
    const regexp = /{{(\w+)}}/g
    let match = regexp.exec(str)
    const variables = []
    if (match === null) return str

    if (isDashboardRoute(this.props)) {
      if (!this.props.environment.variables) {
        return str.replace(regexp, '')
      }
      do {
        variables.push(match[1])
      } while ((match = regexp.exec(str)) !== null)
      for (let i = 0; i < variables.length; i++) {
        if (!this.props.environment.variables[variables[i]]) {
          str = str.replace(`{{${variables[i]}}}`, '')
        } else if (
          isDashboardRoute(this.props) &&
          this.props.environment.variables[variables[i]].currentValue
        ) {
          str = str.replace(
            `{{${variables[i]}}}`,
            this.props.environment.variables[variables[i]].currentValue
          )
        } else if (
          this.props.environment.variables[variables[i]].initialValue
        ) {
          str = str.replace(
            `{{${variables[i]}}}`,
            this.props.environment.variables[variables[i]].initialValue
          )
        } else {
          str = str.replace(`{{${variables[i]}}}`, '')
        }
      }
    } else {
      const environmentId = this.state.publicCollectionEnvironmentId
      const originalEnv = this.state.originalEnvironmentReplica
      if (
        this.props.environments[environmentId] !== undefined ||
        (this.props.environments[environmentId] === undefined &&
          originalEnv === null)
      ) {
        if (!this.props.environments[environmentId].variables) {
          return str.replace(regexp, '')
        }
        do {
          variables.push(match[1])
        } while ((match = regexp.exec(str)) !== null)
        for (let i = 0; i < variables.length; i++) {
          if (!this.props.environments[environmentId].variables[variables[i]]) {
            str = str.replace(`{{${variables[i]}}}`, '')
          } else if (
            this.props.environments[environmentId].variables[variables[i]]
              .initialValue
          ) {
            str = str.replace(
              `{{${variables[i]}}}`,
              this.props.environments[environmentId].variables[variables[i]]
                .initialValue
            )
          } else {
            str = str.replace(`{{${variables[i]}}}`, '')
          }
        }
      }
      // If Environment is Deleted
      if (
        this.props.environments[environmentId] === undefined &&
        environmentId != null &&
        originalEnv != null
      ) {
        if (!originalEnv.variables) {
          return str.replace(regexp, '')
        }
        do {
          variables.push(match[1])
        } while ((match = regexp.exec(str)) !== null)
        for (let i = 0; i < variables.length; i++) {
          if (!originalEnv.variables[variables[i]]) {
            str = str.replace(`{{${variables[i]}}}`, '')
          } else if (originalEnv.variables[variables[i]].initialValue) {
            str = str.replace(
              `{{${variables[i]}}}`,
              originalEnv.variables[variables[i]].initialValue
            )
          } else {
            str = str.replace(`{{${variables[i]}}}`, '')
          }
        }
      }
    }
    return str
  }

  replaceVariablesInJson (json) {
    const keys = Object.keys(json)
    for (let i = 0; i < keys.length; i++) {
      json[keys[i]] = this.replaceVariables(json[keys[i]])
      const updatedKey = this.replaceVariables(keys[i])
      if (updatedKey !== keys[i]) {
        json[updatedKey] = json[keys[i]]
        delete json[keys[i]]
      }
    }
    return json
  }

  parseBody (rawBody) {
    let body = {}
    try {
      body = JSON.parse(rawBody)
      return body
    } catch (error) {
      toast.error('Invalid Body')
      return body
    }
  }

  handleErrorResponse (error) {
    if (error.response) {
      const response = {
        status: error.response.status,
        statusText: status[error.response.status],
        data: error.response.data
      }
      this.setState({ response, flagResponse: true })
    } else {
      this.setState({ flagResponse: false })
    }
  }

  async handleApiCall (api, body, headerJson, bodyType) {
    let responseJson = {}
    try {
      const header = this.replaceVariablesInJson(headerJson)
      responseJson = await endpointApiService.apiTest(
        api,
        this.state.data.method,
        body,
        header,
        bodyType
      )
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
    } catch (error) {
      this.handleErrorResponse(error)
    }
  }

  setPathVariableValues () {
    let uri = new URI(this.state.data.updatedUri)
    uri = uri.pathname()
    const pathParameters = uri.split('/')
    const uniquePathParameters = {}
    let path = ''
    let counter = 0
    for (let i = 0; i < pathParameters.length; i++) {
      if (pathParameters[i][0] === ':') {
        if (
          uniquePathParameters[pathParameters[i]] ||
          uniquePathParameters[pathParameters[i]] === ''
        ) {
          path = path + '/' + uniquePathParameters[pathParameters[i]]
        } else {
          uniquePathParameters[pathParameters[i]] = this.state.pathVariables[
            counter
          ]?.value
          path = path + '/' + this.state.pathVariables[counter]?.value
          counter++
        }
      } else if (pathParameters[i].length !== 0) {
        path = path + '/' + pathParameters[i]
      }
    }
    return path
  }

  setData = async () => {
    const body = this.state.data.body
    if (this.state.data.body.type === 'raw') {
      body.value = this.parseBody(body.value)
    }
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
      BASE_URL: this.customState.BASE_URL,
      bodyDescription:
        this.state.data.body.type === 'JSON' ? this.state.bodyDescription : {},
      authorizationType: this.state.authType
    }
    const response = { ...this.state.response }
    const createdAt = new Date()
    const timeElapsed = this.state.timeElapsed
    const obj = {
      id: shortid.generate(),
      endpoint: { ...endpoint },
      response,
      timeElapsed,
      createdAt
    }
    this.props.add_history(obj)
  };

  checkEmptyParams () {
    const params = this.state.originalParams
    let isEmpty = false
    params.forEach((param) => {
      if (param.checked !== 'notApplicable' && (param.value === null || param.value === '')) {
        isEmpty = true
        param.empty = true
      } else {
        param.empty = false
      }
    })
    return isEmpty
  }

  handleSend = async () => {
    this.setState({ loader: true })
    const startTime = new Date().getTime()
    const response = {}
    this.setState({ startTime, response })
    const headersData = this.doSubmitHeader('send')
    const BASE_URL = this.customState.BASE_URL
    const uri = new URI(this.state.data.updatedUri)
    const queryparams = uri.search()
    const path = this.setPathVariableValues()
    let api = BASE_URL + path + queryparams
    api = this.replaceVariables(api)
    const headerJson = {}
    Object.keys(headersData).forEach((header) => {
      headerJson[header] = headersData[header].value
    })
    const { body, headers } = this.formatBody(this.state.data.body, headerJson)
    try {
      if (this.state.data.body.type === 'JSON') JSON.parse(body)
    } catch (e) {
      toast.error('Invalid JSON Body')
    }

    if (!isDashboardRoute(this.props, true) && this.checkEmptyParams()) {
      this.setState({ loader: false })
      return
    }

    await this.handleApiCall(api, body, headers, this.state.data.body.type)
    this.setState({ loader: false })
    !isDashboardRoute(this.props) && this.myRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    isDashboardRoute(this.props) && this.setData()
  };

  extractPosition (groupId) {
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

  extractCollectionId (groupId) {
    const group = this.props.groups[groupId]
    const versionId = group.versionId
    const version = this.props.versions[versionId]
    return version.collectionId
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
      const body = this.state.data.body
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
          this.customState.selectedHost === 'customHost'
            ? this.customState.BASE_URL
            : null,
        bodyDescription:
          this.state.data.body.type === 'JSON'
            ? this.state.bodyDescription
            : {},
        authorizationType: this.state.authType
      }
      if (endpoint.name === '') toast.error('Please enter Endpoint name')
      else if (this.props.location.pathname.split('/')[3] === 'new') {
        endpoint.requestId = this.props.tab.id
        endpoint.description = endpointDescription || ''
        this.setState({ saveAsLoader: true })
        this.props.add_endpoint(endpoint, groupId || this.state.groupId, ({ closeForm, stopLoader }) => {
          if (closeForm) this.closeEndpointFormModal()
          if (stopLoader) this.setState({ saveAsLoader: false })
        })
      } else {
        if (this.state.saveAsFlag) {
          endpoint.requestId = shortid.generate()
          endpoint.description = endpointDescription || ''
          this.setState({ saveAsLoader: true })
          this.props.add_endpoint(endpoint, groupId || this.state.groupId, ({ closeForm, stopLoader }) => {
            if (closeForm) this.closeEndpointFormModal()
            if (stopLoader) this.setState({ saveAsLoader: false })
          })
        } else if (this.state.title === 'update endpoint') {
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

  doSubmitPathVariables () {
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

  doSubmitHeader (title) {
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

  setMethod (method) {
    const response = {}
    const data = { ...this.state.data }
    data.method = method
    this.setState({ response, data })
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id)
    }
  }

  propsFromChild (name, value) {
    if (name === 'Params') {
      this.handleUpdateUri(value)
      this.setState({ originalParams: value })
    }

    if (name === 'Headers') {
      this.setState({ originalHeaders: value })
    }

    if (name === 'Path Variables') {
      this.setState({ pathVariables: value })
    }

    if (
      isDashboardRoute(this.props) &&
      (name === 'Params' || name === 'Headers' || name === 'Path Variables')
    ) {
      tabService.markTabAsModified(this.props.tab.id)
    }
  }

  setPublicBody (body) {
    const json = JSON.stringify(body)
    const data = { ...this.state.data }
    data.body = { type: 'JSON', value: json }

    this.setState({ data, publicBodyFlag: false })
  }

  handleUpdateUri (originalParams) {
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

  doSubmitParam () {
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

  fetchoriginalParams (params) {
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

  fetchoriginalHeaders (headers) {
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

  fetchPathVariables (pathVariables) {
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

  openEndpointFormModal () {
    this.setState({ showEndpointFormModal: true })
  }

  closeEndpointFormModal () {
    this.setState({ showEndpointFormModal: false, saveAsFlag: false })
  }

  setGroupId (groupId, { endpointName, endpointDescription }) {
    this.setState({ groupId }, () => { this.handleSave(groupId, { endpointName, endpointDescription }) })
  }

  updateArray (updatedArray) {
    this.setState({ updatedArray })
  }

  makeHeaders (headers) {
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

  makeParams (params) {
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

  async makePostData (body) {
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

  async prepareHarObject () {
    try {
      const BASE_URL = this.customState.BASE_URL
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
      if (!harObject.url.split(':')[1] || harObject.url.split(':')[0] === '') {
        harObject.url = 'https://' + url
      }
      this.setState({ harObject }, () => { })
    } catch (error) {
      toast.error(error)
    }
  }

  openCodeTemplate (harObject) {
    this.setState({
      showCodeTemplate: true,
      harObject
    })
  }

  showCodeTemplate () {
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

  setBaseUrl (BASE_URL, selectedHost) {
    this.customState.BASE_URL = BASE_URL
    this.customState.selectedHost = selectedHost
  }

  setBody (bodyType, body) {
    const data = { ...this.state.data }
    data.body = { type: bodyType, value: body }
    isDashboardRoute(this.props) && this.setHeaders(bodyType, 'content-type')
    this.setState({ data })
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id)
    }
  }

  setBodyDescription (type, value) {
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

  setDescription (bodyDescription) {
    this.setState({ bodyDescription })
  }

  setFieldDescription (fieldDescription, bodyDescription) {
    this.setState({ fieldDescription, bodyDescription })
  }

  setParams (value, title, authorizationFlag) {
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

  setHeaders (value, title, authorizationFlag = undefined) {
    const originalHeaders = this.state.originalHeaders
    const updatedHeaders = []
    const emptyHeader = {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: ''
    }
    for (let i = 0; i < originalHeaders.length; i++) {
      if (
        originalHeaders[i].key === title.split('.')[0] ||
        originalHeaders[i].key === ''
      ) {
        continue
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

  identifyBodyType (bodyType) {
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

  propsFromDescription (title, data) {
    if (title === 'data') {
      this.setState({ data: data })
      if (isDashboardRoute(this.props)) {
        tabService.markTabAsModified(this.props.tab.id)
      }
    }
    if (title === 'endpoint') this.setState({ endpoint: data })
    if (title === 'oldDescription') this.setState({ oldDescription: data })
  }

  propsFromSampleResponse (sampleResponseArray, sampleResponseFlagArray) {
    this.setState({ sampleResponseArray, sampleResponseFlagArray })
    this.props.update_endpoint({
      id: this.state.endpoint.id,
      sampleResponse: sampleResponseArray
    })
  }

  makeFormData (body) {
    const formData = {}
    for (let i = 0; i < body.value.length; i++) {
      if (
        body.value[i].key.length !== 0 &&
        body.value[i].checked === 'true'
      ) {
        formData[body.value[i].key] = body.value[i].value
      }
    }
    return formData
  }

  formatBody (body, headers) {
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

  async setAccessToken () {
    const url = window.location.href
    const response = URI.parseQuery('?' + url.split('#')[1])
    if (url.split('#')[1]) {
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

  setAuthType (type, value) {
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

  addSampleResponse (response) {
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

  openBody (index) {
    const sampleResponseFlagArray = [...this.state.sampleResponseFlagArray]
    sampleResponseFlagArray[index] = true
    this.setState({ sampleResponseFlagArray })
  }

  closeBody (index) {
    const sampleResponseFlagArray = [...this.state.sampleResponseFlagArray]
    sampleResponseFlagArray[index] = false
    this.setState({ sampleResponseFlagArray })
  }

  closeLoginSignupModal () {
    this.setState({
      showLoginSignupModal: false
    })
  }

  displayResponse () {
    if (!isDashboardRoute(this.props) && this.state.flagResponse) {
      return (
        <div ref={this.myRef} className='hm-panel endpoint-public-response-container public-doc'>
          <DisplayResponse
            {...this.props}
            timeElapsed={this.state.timeElapsed}
            response={this.state.response}
            flagResponse={
              this.state.flagResponse
            }
            add_sample_response={this.addSampleResponse.bind(this)}
          />
        </div>
      )
    }
  }

  displayPublicSampleResponse () {
    if (this.state.sampleResponseArray.length) {
      return (
        <PublicSampleResponse
          highlights={this.props.highlights}
          sample_response_array={this.state.sampleResponseArray}
          publicCollectionTheme={this.props.publicCollectionTheme}
        />
      )
    }
  }

  displayResponseAndSampleResponse () {
    return (
      <>
        <div className='col-12' ref={this.myRef}>
          <ul className='nav nav-tabs respTabsListing' id='myTab' role='tablist'>
            <li className='nav-item'>
              <a
                className='nav-link active'
                id='pills-response-tab'
                data-toggle='pill'
                href={
                  isDashboardRoute(this.props)
                    ? `#response-${this.props.tab.id}`
                    : '#response'
                }
                role='tab'
                aria-controls={
                  isDashboardRoute(this.props)
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
                    isDashboardRoute(this.props)
                      ? `#sample-${this.props.tab.id}`
                      : '#sample'
                  }
                  role='tab'
                  aria-controls={
                    isDashboardRoute(this.props)
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
          <div className='tab-content responseTabWrapper' id='pills-tabContent'>
            <div
              className='tab-pane fade show active'
              id={
                isDashboardRoute(this.props)
                  ? `response-${this.props.tab.id}`
                  : 'response'
              }
              role='tabpanel'
              aria-labelledby='pills-response-tab'
            >
              <div className='hm-panel endpoint-public-response-container '>
                <DisplayResponse
                  {...this.props}
                  timeElapsed={this.state.timeElapsed}
                  response={this.state.response}
                  flagResponse={
                    this.state.flagResponse
                  }
                  sample_response_array={this.state.sampleResponseArray}
                  sample_response_flag_array={this.state.sampleResponseFlagArray}
                  add_sample_response={this.addSampleResponse.bind(this)}
                  props_from_parent={this.propsFromSampleResponse.bind(this)}
                />
              </div>
            </div>
            {this.displaySampleResponse()}
          </div>
        </div>
      </>
    )
  }

  displaySampleResponse () {
    if (getCurrentUser()) {
      return (
        <div
          className='tab-pane fade'
          id={
            isDashboardRoute(this.props)
              ? `sample-${this.props.tab.id}`
              : 'sample'
          }
          role='tabpanel'
          aria-labelledby='pills-sample-tab'
        >
          <SampleResponse
            {...this.props}
            timeElapsed={this.state.timeElapsed}
            response={this.state.response}
            flagResponse={this.state.flagResponse}
            sample_response_array={this.state.sampleResponseArray}
            sample_response_flag_array={
              this.state.sampleResponseFlagArray
            }
            open_body={this.openBody.bind(this)}
            close_body={this.closeBody.bind(this)}
            props_from_parent={this.propsFromSampleResponse.bind(
              this
            )}
          />
        </div>
      )
    }
  }

  displayPublicResponse () {
    return (
      <>
        <div className='hm-panel endpoint-public-response-container col-12 mt-4 endPointRes'>
          <DisplayResponse
            {...this.props}
            timeElapsed={this.state.timeElapsed}
            response={this.state.response}
            flagResponse={this.state.flagResponse}
          />
        </div>
      </>
    )
  }

  setHostUri (host, uri, selectedHost) {
    if (uri !== this.state.data.updatedUri) this.handleChange({ currentTarget: { name: 'updatedUri', value: uri } })
    this.setBaseUrl(host, selectedHost)
  }

  render () {
    console.log('display', this.customState, this.state.data.updatedUri)
    this.endpointId = this.props.endpointId
      ? this.props.endpointId
      : isDashboardRoute(this.props)
        ? this.props.location.pathname.split('/')[3]
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
      isDashboardRoute(this.props) &&
      this.props.location.pathname.split('/')[2] === 'endpoint' &&
      this.props.location.pathname.split('/')[3] !== 'new' &&
      this.state.endpoint.id !== this.props.tab.id &&
      this.props.endpoints[this.props.tab.id]
    ) {
      const flag = 0

      if (isDashboardRoute(this.props)) {
        this.fetchEndpoint(flag, this.props.tab.id)
        store.subscribe(() => {
          if (!this.props.location.title && !this.state.title) {
            this.fetchEndpoint(flag, this.props.tab.id)
          }
        })
      }
    }

    if (
      isDashboardRoute(this.props) &&
      this.props.location.pathname.split('/')[2] === 'history' &&
      this.state.historySnapshotId !== this.props.tab.id &&
      this.props.historySnapshots[this.props.tab.id]
    ) {
      this.fetchHistorySnapshot()
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
    return (
      <div
        // className={
        //   this.props.location.pathname.split('/')[1] !== 'admin' ? '' : 'mainContentWrapperPublic'
        // }
        className={isDashboardRoute(this.props) ? '' : codeEditorVisibility ? 'mainContentWrapperPublic' : 'mainContentWrapperPublic hideCodeEditor'}
      >
        <div className='mainContentWrapper'>
          <div className='hm-endpoint-container endpoint-container row'>
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
                    className={isDashboardRoute(this.props) ? 'hm-panel mt-4 col-12' : null}
                  >
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
                    <DisplayDescription
                      {...this.props}
                      endpoint={this.state.endpoint}
                      data={this.state.data}
                      old_description={this.state.oldDescription}
                      props_from_parent={this.propsFromDescription.bind(this)}
                    />
                  </div>
                  )
                : null
            }
            <div className='endpoint-header' ref={this.scrollDiv}>
              {!isDashboardRoute(this.props) && (
                <div className='endpoint-name-container'>
                  {!isDashboardRoute(this.props, true) && <h1 className='endpoint-title'>{this.state.data?.name || ''}</h1>}
                  <p>{ReactHtmlParser(this.state.endpoint?.description) || ''}</p>
                </div>
              )}
            </div>
            <div
              className={!isDashboardRoute(this.props) ? 'hm-panel' : 'hm-panel col-12'}
            >
              {
                isDashboardRoute(this.props)
                  ? (
                    <div className='endpoint-url-container'>
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
                            groupId={this.state.groupId}
                            endpointId={this.state.endpoint.id}
                            customHost={this.state.endpoint.BASE_URL || ''}
                            environmentHost={this.props.environment?.variables?.BASE_URL?.currentValue || this.props.environment?.variables?.BASE_URL?.initialValue || ''}
                            groupHost={this.props.groups[this.state.groupId]?.host || ''}
                            versionHost={this.props.versions[this.props.groups[this.state.groupId]?.versionId]?.host || ''}
                            updatedUri={this.state.data.updatedUri}
                            set_host_uri={this.setHostUri.bind(this)}
                            set_base_url={this.setBaseUrl.bind(this)}
                          />
                        </div>
                      </div>
                      <div className='d-flex uriContainerWrapper'>
                        <button
                          className={this.state.loader ? 'btn btn-primary buttonLoader' : 'btn btn-primary'}
                          type='submit'
                          id='send-request-button'
                          onClick={() => this.handleSend()}
                        >
                          {isDashboardRoute(this.props) ? 'Send' : 'Try'}
                        </button>

                        {
                          isDashboardRoute(this.props)
                            ? (

                                this.props.location.pathname.split('/')[3] !== 'new'
                                  ? (
                                    <Dropdown as={ButtonGroup}>
                                      <button
                                        className={this.state.saveLoader ? 'btn btn-outline orange buttonLoader' : 'btn btn-outline orange'}
                                        type='button'
                                        id='save-endpoint-button'
                                        onClick={() => this.handleSave()}
                                      >
                                        Save
                                      </button>
                                      {
                                      getCurrentUser()
                                        ? (
                                          <span>
                                            <Dropdown.Toggle split variant='' />
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
                                          </span>
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
                    </div>
                    )
                  : (
                    <div className='hm-endpoint-wrap'>
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
                            groupId={this.state.groupId}
                            versionHost={this.props.versions[this.props.groups[this.state.groupId]?.versionId]?.host || ''}
                            environmentHost={this.props.environment?.variables?.BASE_URL?.currentValue || this.props.environment?.variables?.BASE_URL?.initialValue || ''}
                            groupHost={this.props.groups[this.state.groupId]?.host || ''}
                            updatedUri={this.state.data.updatedUri}
                            set_base_url={this.setBaseUrl.bind(this)}
                            custom_host={this.state.endpoint.BASE_URL || ''}
                            endpointId={this.state.endpoint.id}
                            set_host_uri={this.setHostUri.bind(this)}
                          />
                          <input disabled className='form-control' value={this.customState.BASE_URL + this.state.data.updatedUri} />

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
              <div
                className={
                  isDashboardRoute(this.props)
                    ? 'endpoint-headers-container'
                    : 'hm-public-endpoint-headers'
                }
              >
                <div className='main-table-wrapper'>
                  {
                    isDashboardRoute(this.props)
                      ? (
                        <div className='headers-params-wrapper'>
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
                          </ul>
                        </div>
                        )
                      : null
                  }
                  {
                    isDashboardRoute(this.props)
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
                            <GenericTable
                              {...this.props}
                              title='Params'
                              dataArray={this.state.originalParams}
                              props_from_parent={this.propsFromChild.bind(this)}
                              original_data={[...this.state.params]}
                            />
                            {this.state.pathVariables &&
                              this.state.pathVariables.length !== 0 && (
                                <div>
                                  <GenericTable
                                    {...this.props}
                                    title='Path Variables'
                                    dataArray={this.state.pathVariables}
                                    props_from_parent={this.propsFromChild.bind(this)}
                                    original_data={[...this.state.pathVariables]}
                                  />
                                </div>
                            )}
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
                              <GenericTable
                                {...this.props}
                                title='Headers'
                                dataArray={this.state.originalHeaders}
                                props_from_parent={this.propsFromChild.bind(this)}
                                original_data={[...this.state.headers]}
                              />
                            </div>
                          </div>
                          <div
                            className='tab-pane fade'
                            id={`body-${this.props.tab.id}`}
                            role='tabpanel'
                            aria-labelledby='pills-body-tab'
                          >
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
                          </div>
                        </div>
                        )
                      : (
                        <>
                          {this.state.params.length > 1 && (
                            <GenericTable
                              {...this.props}
                              title='Params'
                              dataArray={this.state.originalParams}
                              props_from_parent={this.propsFromChild.bind(this)}
                              original_data={[...this.state.params]}
                            />
                          )}

                          {this.state.pathVariables &&
                            this.state.pathVariables.length !== 0 && (
                              <GenericTable
                                {...this.props}
                                title='Path Variables'
                                dataArray={this.state.pathVariables}
                                props_from_parent={this.propsFromChild.bind(this)}
                                original_data={[...this.state.pathVariables]}
                              />
                          )}

                          {this.state.headers.length > 1 && (
                            <GenericTable
                              {...this.props}
                              title='Headers'
                              dataArray={this.state.originalHeaders}
                              props_from_parent={this.propsFromChild.bind(this)}
                              original_data={[...this.state.headers]}
                            />
                          )}

                          {this.state.data.body && this.state.originalBody &&
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
                          )}
                        </>
                        )
                  }
                </div>
                {
                  !isDashboardRoute(this.props) && (
                    <div className='text-left'>
                      <button
                        className={this.state.loader ? 'btn btn-primary btn-lg ml-4 buttonLoader' : 'ml-4 btn btn-lg btn-primary'}
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
                {
                  <Notes
                    {...this.props}
                    note={this.state.endpoint?.notes || ''}
                    endpointId={this.state.endpoint?.id}
                  />
                }
                {
                  this.displayResponse()
                }
              </div>
            </div>

            {
              isDashboardRoute(this.props)
                ? isSavedEndpoint(this.props)
                    ? this.displayResponseAndSampleResponse()
                    : this.displayPublicResponse()
                : this.displayPublicSampleResponse()
            }
          </div>
          {
            !isDashboardRoute(this.props) &&
            this.state.harObject &&
            this.props.location.pathname.split('/')[1] !== 'admin' && (
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
    )
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DisplayEndpoint)
)
