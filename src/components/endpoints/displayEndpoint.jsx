import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Dropdown, ButtonGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { SESSION_STORAGE_KEY, isDashboardAndTestingView, isOnPublishedPage, trimString } from '../common/utility'
import {
  isDashboardRoute,
  isElectron,
  isSavedEndpoint,
  isStateDraft,
  isStateReject,
  isStatePending,
  isStateApproved,
  sensitiveInfoFound,
  msgText,
  getEntityState,
  getCurrentUserSSLMode,
  setCurrentUserSSLMode
} from '../common/utility'
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
import endpointApiService, { getEndpoint } from './endpointApiService'
import './endpoints.scss'
import GenericTable from './genericTable'
import HostContainer from './hostContainer'
import PublicBodyContainer from './publicBodyContainer'
import { addEndpoint } from './redux/endpointsActions'
import { addHistory } from '../history/redux/historyAction'
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
import { openModal, updateStateOfCurlSlider } from '../modals/redux/modalsActions'
import Axios from 'axios'
import { SortableHandle, SortableContainer, SortableElement } from 'react-sortable-hoc'
import ConfirmationModal from '../common/confirmationModal'
import { ReactComponent as DragHandleIcon } from '../../assets/icons/drag-handle.svg'
import { pendingEndpoint, approveEndpoint, rejectEndpoint, draftEndpoint } from '../publicEndpoint/redux/publicEndpointsActions'
import WarningModal from '../common/warningModal'
import DeleteIcon from '../../assets/icons/delete-icon.svg'
import { onToggle } from '../common/redux/toggleResponse/toggleResponseActions'
import PlusIcon from '../../assets/icons/plus.svg'
import ApiDocReview from '../apiDocReview/apiDocReview'
import { ApproveRejectEntity, PublishEntityButton, UnPublishEntityButton } from '../common/docViewOperations'
import Tiptap from '../tiptapEditor/tiptap'
import ChatbotsideBar from './chatbotsideBar'
import { useQuery, useQueryClient } from 'react-query'
import utilityFunctions from '../common/utility.js'
import { getPublishedContentByIdAndType } from '../../services/generalApiService'
import Footer from '../main/Footer.jsx'
import { updateEndpoint } from '../pages/redux/pagesActions.js'
import { statesEnum } from '../common/utility'
import { addAuthorizationDataTypes, grantTypesEnums } from '../common/authorizationEnums.js'
import { updateToken } from '../../store/tokenData/tokenDataActions.js'
import { bodyTypesEnums, rawTypesEnums } from '../common/bodyTypeEnums.js'
import { LiaSaveSolid } from "react-icons/lia"
const shortid = require('shortid')
const status = require('http-status')
const URI = require('urijs')

const SortableItem = SortableElement(({ children }) => {
  return <>{children}</>
})
const SortableList = SortableContainer(({ children }) => {
  return <>{children}</>
})
const DragHandle = SortableHandle(() => (
  <div className='dragIcon'>
    <DragHandleIcon />
  </div>
))

const mapStateToProps = (state) => {
  return {
    endpoints: state.pages,
    environment: state.environment.environments[state.environment.currentEnvironmentId] || { id: null, name: 'No Environment' },
    currentEnvironmentId: state.environment.currentEnvironmentId,
    environments: state.environment.environments,
    historySnapshots: state.history,
    collections: state.collections,
    cookies: state.cookies,
    responseView: state.responseView,
    activeTabId: state.tabs.activeTabId,
    tabs: state?.tabs?.tabs,
    tokenDetails: state?.tokenData?.tokenDetails,
    curlSlider: state.modals?.curlSlider || false
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_endpoint: (newEndpoint, rootParentID, callback, props) =>
      dispatch(addEndpoint(ownProps.history, newEndpoint, rootParentID, callback, props)),
    update_endpoint: (editedEndpoint, stopSave) => dispatch(updateEndpoint(editedEndpoint, stopSave)),
    close_tab: (id) => dispatch(closeTab(id)),
    add_history: (data) => dispatch(addHistory(data)),
    update_environment: (data) => dispatch(updateEnvironment(data)),
    update_tab: (id, data) => dispatch(updateTab(id, data)),
    open_modal: (modal, data) => dispatch(openModal(modal, data)),
    pending_endpoint: (endpoint) => dispatch(pendingEndpoint(endpoint)),
    approve_endpoint: (endpoint, callback) => dispatch(approveEndpoint(endpoint, callback)),
    set_response_view: (view) => dispatch(onToggle(view)),
    reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
    unPublish_endpoint: (endpointId) => dispatch(draftEndpoint(endpointId)),
    update_token: (dataToUpdate) => dispatch(updateToken(dataToUpdate)),
    update_curl_slider: (payload) => dispatch(updateStateOfCurlSlider(payload)),
    // set_chat_view : (view) => dispatch(onChatResponseToggle(view))
  }
}

const untitledEndpointData = {
  data: {
    name: 'Untitled',
    method: 'GET',
    body: {
      type: bodyTypesEnums['none'],
      [bodyTypesEnums['raw']]: { rawType: rawTypesEnums.TEXT, value: '' },
      [bodyTypesEnums['application/x-www-form-urlencoded']]: [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }],
      [bodyTypesEnums['multipart/form-data']]: [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }]
    },
    uri: '',
    updatedUri: ''
  },
  pathVariables: [],
  environment: {},
  endpoint: {},
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
  oldDescription: '',
  headers: [],
  publicBodyFlag: true,
  params: [],
  bodyDescription: {},
  fieldDescription: {},
  sampleResponseArray: [],
  theme: '',
  preScriptText: '',
  postScriptText: '',
  host: {},
  sslMode: getCurrentUserSSLMode(),
  currentView: 'testing',
  docViewData: [
    { type: 'host' },
    { type: 'body' },
    { type: 'params' },
    { type: 'pathVariables' },
    { type: 'headers' },
    { type: 'sampleResponse' }
  ],
  harObject: {},
  authorizationData: {
    authorization: {},
    authorizationTypeSelected: ''
  }
}

const debouncedUpdateDraftData = _.debounce((endpointId, data) => {
  tabService.updateDraftData(endpointId, _.cloneDeep(data));
}, 1000);

const updateTabDraftData = (endpointId, data) => {
  debouncedUpdateDraftData(endpointId, data);
}

const getEndpointContent = async (props) => {
  let isUserOnPublishedPage = isOnPublishedPage()
  let currentIdToShow = isUserOnPublishedPage ? sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) : null

  let endpointId = isUserOnPublishedPage
      ? currentIdToShow
      : props?.match?.params.endpointId !== 'new'
        ? props?.match?.params?.endpointId
        : props?.activeTabId
      
  const tabId = props?.tabs[endpointId]
  // showing data from draft if data is modified
  if (!isUserOnPublishedPage && tabId?.isModified && tabId?.type == 'endpoint' && tabId?.draft) {
    return tabId?.draft
  }

  if (props?.match?.params?.endpointId !== 'new' && props?.pages?.[endpointId] && endpointId) {
    let type = props?.pages?.[currentIdToShow]?.type
    let data = isUserOnPublishedPage ? await getPublishedContentByIdAndType(currentIdToShow, type) : await getEndpoint(endpointId)
    return utilityFunctions.modifyEndpointContent(data, _.cloneDeep(untitledEndpointData))
  }

  return _.cloneDeep(untitledEndpointData)
}

const fetchHistory = (historyId, props) => {
  const history = props?.historySnapshots[historyId]
  let data = history?.endpoint
  let draftData = props?.tabs[historyId]?.draft
  // showing data from draft if data is modified
  if (props?.tabs[historyId]?.isModified && draftData) {
    return draftData
  }
  return utilityFunctions.modifyEndpointContent(_.cloneDeep(data), _.cloneDeep(untitledEndpointData))
}

const withQuery = (WrappedComponent) => {
  return (props) => {
    const queryClient = useQueryClient()
    let currentIdToShow = isOnPublishedPage() ? sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) : null
    let endpointId = isOnPublishedPage()
      ? currentIdToShow
      : props?.match?.params.endpointId !== 'new'
        ? props?.match?.params?.endpointId
        : props?.activeTabId
    const historyId = props?.match?.params?.historyId

    let queryKey, fetchFunction
    if (historyId && historyId !== 'new') {
      queryKey = ['history', historyId]
      fetchFunction = () => {
        return () => fetchHistory(historyId, props)
      }
    } else {
      queryKey = ['endpoint', endpointId]
      fetchFunction = () => getEndpointContent(props)
    }

    const data = useQuery(queryKey, fetchFunction, {
      refetchOnWindowFocus: false,
      cacheTime: 5000000,
      enabled: true,
      staleTime: Infinity,
      retry: 3
    })

    const setOldDataToNewDataForBody = (data) => {
      let endpoint = _.cloneDeep(data.data);
      const bodyType = endpoint.body.type;
      const untitled = _.cloneDeep(untitledEndpointData.data);

      if ([rawTypesEnums.JSON, rawTypesEnums.HTML, rawTypesEnums.JavaScript, rawTypesEnums.XML, rawTypesEnums.TEXT].includes(bodyType) && endpoint.body.raw) {
        untitled.body = endpoint.body;
      } else if ([rawTypesEnums.JSON, rawTypesEnums.HTML, rawTypesEnums.JavaScript, rawTypesEnums.XML, rawTypesEnums.TEXT].includes(bodyType)) {
        untitled.body = { ...untitled.body, type: bodyType, raw: { rawType: bodyType, value: endpoint?.body?.value } };
      } else if (bodyType === bodyTypesEnums['application/x-www-form-urlencoded'] || bodyType === bodyTypesEnums['multipart/form-data']) {
        if (endpoint.body[bodyType]) {
          untitled.body = endpoint.body;
        } else {
          untitled.body = { ...untitled.body, type: bodyType, [bodyType]: endpoint.body?.value || [] };
        }
      } else if (bodyType === bodyTypesEnums['none']) {
        if (endpoint.body?.[bodyTypesEnums['application/x-www-form-urlencoded']] || endpoint.body?.[bodyTypesEnums['multipart/form-data']] || endpoint.body?.[bodyTypesEnums['raw']]) {
          untitled.body = endpoint.body;
        }
        else {
          untitled.body = { ...untitled.body, ...endpoint.body }
        }
      }
      delete endpoint.body?.value;

      untitled.uri = endpoint.uri
      untitled.updatedUri = endpoint.updatedUri
      untitled.method = endpoint.method;
      untitled.name = endpoint.name;
      return _.cloneDeep(untitled);
    }

    const setQueryUpdatedData = (data, callbackFn = null) => {
      let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
      const endpointId =
        props?.match?.params.endpointId !== 'new' ? props?.match?.params?.endpointId || currentIdToShow : props?.activeTabId
      data.data = setOldDataToNewDataForBody(data);
      queryClient.setQueryData(queryKey, data)
      // only update the data if it is different from default data
      if (!_.isEqual(untitledEndpointData, data)) {
        updateTabDraftData(endpointId, data)
      }
      if (callbackFn) {
        callbackFn()
      }
    }

    const getDataFromReactQuery = (id) => {
      return queryClient.getQueryData(id)
    }

    return (
      <WrappedComponent
        {...props}
        endpointContent={data.data}
        endpointContentLoading={data?.isLoading}
        currentEndpointId={endpointId}
        setQueryUpdatedData={setQueryUpdatedData}
        getDataFromReactQuery={getDataFromReactQuery}
        untitledEndpointData={untitledEndpointData}
      />
    )
  }
}

class DisplayEndpoint extends Component {
  constructor(props) {
    super(props)
    this.handleRemovePublicEndpoint = this.handleRemovePublicEndpoint.bind(this)
    this.myRef = React.createRef()
    this.sideRef = React.createRef()
    this.state = {
      methodList: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      environment: {},
      startTime: '',
      timeElapsed: '',
      response: {},
      endpoint: {},
      title: '',
      flagResponse: false,
      authorizationData: {
        authorization: {},
        authorizationTypeSelected: '',
      },
      oldDescription: '',
      publicBodyFlag: true,
      bodyDescription: {},
      fieldDescription: {},
      sampleResponseFlagArray: [],
      theme: '',
      loader: false,
      saveLoader: false,
      codeEditorVisibility: false,
      isMobileView: false,
      publicEndpointWidth: 0,
      publicEndpointHeight: 0,
      showCookiesModal: false,
      preReqScriptError: '',
      postReqScriptError: '',
      host: {},
      draftDataSet: false,
      runSendRequest: null,
      requestKey: null,
      docOptions: false,
      sslMode: getCurrentUserSSLMode(),
      showAskAiSlider: false,
      endpointContentState: null,
      showEndpointFormModal: false
    }
    this.uri = React.createRef()
    this.paramKey = React.createRef()
    this.setCurrentReponseView()
    this.rawBodyTypes = Object.keys(rawTypesEnums);
  }

  async componentDidMount() {
    this.isMobileView();
    if (this.props.endpointContent) {
      this.setState({ endpointContentState: _.cloneDeep(this.props.endpointContent) })
    }
    this.extractEndpointName()
    this.endpointId = this.props.endpointId
      ? this.props.endpointId
      : isDashboardRoute(this.props)
        ? this.props.location.pathname.split('/')[5]
        : this.props.location.pathname.split('/')[4]
    if (!this.state.theme) this.setState({ theme: this.props.publicCollectionTheme })


    const { endpointId } = this.props.match.params
    if (endpointId === 'new') this.setUnsavedTabDataInIDB()

    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  handleShortcuts = (event, data) => {
    const { activeTabId } = this.props.tabs
    const { id: endpointId } = this.props.tab

    if (activeTabId === endpointId) {
      switch (data) {
        case 'TRIGGER_ENDPOINT':
          this.handleSend()
          break
        case 'SAVE_AS':
          this.setState({ saveAsFlag: true }, () => {
            this.openEndpointFormModal()
          })
          break
        case 'SAVE':
          this.handleSave()
          break
        case 'ASK AI':
          this.handleSave()
          break
        default:
      }
    }
  }

  updateDimensions = () => {
    this.setState({ publicEndpointWidth: window.innerWidth, publicEndpointHeight: window.innerHeight });
    this.isMobileView()
  };

  isMobileView = () => {
    if (window.innerWidth < 800) {
      this.setState({ isMobileView: true, codeEditorVisibility: true })
    }
    else {
      this.setState({ isMobileView: false, codeEditorVisibility: false })
    }
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.removeListener('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    window.addEventListener('resize', this.updateDimensions);
    if (prevState.isMobileView !== this.state.isMobileView) {
      this.isMobileView()
    }
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.extractEndpointName()
    }
    if (this.props.endpointId !== prevProps.endpointId) {
    }
    if (
      this.props?.endpointContent &&
      (!_.isEqual(this.state?.endpointContentState?.data, this.props?.endpointContent?.data) ||
        !_.isEqual(this.state?.endpointContentState?.originalParams, this.props?.endpointContent?.originalParams) ||
        !_.isEqual(this.state?.endpointContentState?.originalHeaders, this.props?.endpointContent?.originalHeaders) ||
        !_.isEqual(this.state?.endpointContentState?.pathVariables, this.props?.endpointContent?.pathVariables) ||
        !_.isEqual(this.state?.endpointContentState?.host, this.props?.endpointContent?.host))
    ) {
      this.prepareHarObject()
    }
    if (this.state.endpoint.id !== prevState.endpoint.id && !this.props.location.pathname.includes('history')) {
      this.setState({ flagResponse: false })
    }

    if (this.props?.endpointContent && !_.isEqual(this.props.endpointContent, this.state.endpointContentState)) {
      this.setState({ endpointContentState: _.cloneDeep(this.props.endpointContent) })
    }
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

  extractEndpointName() {
    if (!isDashboardRoute(this.props, true) && this.props.endpoints) {
      const endpointName = this.props.endpoints[this.props.match.params.endpointId]?.name
      if (endpointName) this.props.fetch_entity_name(endpointName)
      else this.props.fetch_entity_name()
    }
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
    // if(!e?.target?.value) return;
    const data = { ...this.props?.endpointContent?.data }
    data[e.currentTarget.name] = e.currentTarget.value
    data.uri = e.currentTarget.value
    let tempData = this.props?.endpointContent || {}
    if (e.currentTarget.name === 'updatedUri') {
      const keys = []
      const values = []
      const description = []
      let originalParams = this.props?.endpointContent?.originalParams || {}
      const updatedUri = e.currentTarget.value?.split('?')[1]
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
            if (originalParams[k].key === keys[i] && originalParams[k].checked === 'true') {
              description[i] = originalParams[k].description
              break
            } else if (k === originalParams.length - 1) {
              description[i] = ''
            }
          }
        }
      }
      originalParams = this.makeOriginalParams(keys, values, description)
      tempData.originalParams = originalParams
    }
    tempData.data = data
    this.props.setQueryUpdatedData(tempData)
  }

  setUnsavedTabDataInIDB() {
    if (this.props.tab.id === this.props.tabs.activeTabId) {
      clearTimeout(this.saveTimeOut)
      this.saveTimeOut = setTimeout(() => {
        const state = _.cloneDeep(this.state)

        /** clean unnecessary items from state before saving */
        const unnecessaryStateItems = [
          'loader',
          'draftDataSet',
          'saveLoader',
          'codeEditorVisibility',
          'showCookiesModal',
          'methodList',
          'theme',
          'runSendRequest',
          'requestKey'
        ]
        unnecessaryStateItems.forEach((item) => delete state[item])
        this.props.update_tab(this.props.tab.id, { state })
      }, 1000)
    }
  }

  setPathVariables(pathVariableKeys, pathVariableKeysObject) {
    const pathVariables = []
    let counter = 0;
    for (let i = 0; i < pathVariableKeys.length; i++) {
      if (pathVariableKeys[i][0] === ':' &&
        pathVariableKeysObject[pathVariableKeys[i]] === false
      ) {
        pathVariableKeysObject[pathVariableKeys[i]] = true
        let pathVariableKeyWithoutColon = pathVariableKeys[i].slice(1).trim();
        if (pathVariableKeyWithoutColon !== '') {
          pathVariables.push({
            checked: 'notApplicable',
            key: pathVariableKeyWithoutColon,
            value: this.props.endpointContent.pathVariables[counter] // TODO :: correct this index and assign correct value
              ? this.props.endpointContent.pathVariables[counter].key === pathVariableKeyWithoutColon
                ? this.props.endpointContent.pathVariables[counter].value
                : ''
              : '',
            description: this.props.endpointContent.pathVariables[counter]
              ? this.props.endpointContent.pathVariables[counter].key === pathVariableKeyWithoutColon
                ? this.props.endpointContent.pathVariables[counter].description
                : ''
              : ''
          })
          counter++
        }
      }
    }
    const dummyData = this.props?.endpointContent
    dummyData.pathVariables = pathVariables
    this.props.setQueryUpdatedData(dummyData)
  }

  makeOriginalParams(keys, values, description) {
    const originalParams = []
    for (let i = 0; i < this.props?.endpointContent?.originalParams?.length; i++) {
      if (this.props?.endpointContent?.originalParams[i].checked === 'false') {
        originalParams.push({
          checked: this.props?.endpointContent?.originalParams[i].checked,
          key: this.props?.endpointContent?.originalParams[i].key,
          value: this.props?.endpointContent?.originalParams[i].value,
          description: this.props?.endpointContent?.originalParams[i].description
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

  replaceVariables(str, customEnv) {
    let envVars = this.props.environment.variables
    if (customEnv) {
      envVars = customEnv
    }
    str = str?.toString() || ''
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
    if (bodyType === bodyTypesEnums['multipart/form-data'] || bodyType === bodyTypesEnums['application/x-www-form-urlencoded']) {
      body = this.replaceVariablesInJson(body, customEnv)
    }
    else if (this.rawBodyType?.includes(bodyType)) {
      body = this.replaceVariables(body, customEnv)
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
    const dummyEndpointData = this.props?.endpointContent;
    if (error.response) {
      const response = {
        status: error.response.status,
        statusText: status[error.response.status],
        data: error.response.data
      }
      dummyEndpointData.testResponse = response
      dummyEndpointData.flagResponse = true
      this.props.setQueryUpdatedData(dummyEndpointData);
    } else {
      const timeElapsed = new Date().getTime() - this.state.startTime
      const response = {
        data: error.message || 'ERROR:Server Connection Refused'
      }
      dummyEndpointData.testResponse = response
      dummyEndpointData.flagResponse = true
      this.props.setQueryUpdatedData(dummyEndpointData);
      this.setState({ timeElapsed })
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
        const code = this.props?.endpointContent?.postScriptText

        this.processResponse(responseJson)

        /** Run Post-Request Script */
        const result = this.runScript(code, currentEnvironment, request, responseJson)
        if (!result.success) {
          this.setState({ postReqScriptError: result.error })
        } else {
          this.setState({ tests: [...this.state.tests, ...result.data.tests] })
        }
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
      const { status, statusText, response: data, headers } = responseJson.data
      response = { status, statusText, data, headers }
    } else {
      response = { ...responseJson }
    }
    if (responseJson.status === 200) {
      const timeElapsed = new Date().getTime() - this.state.startTime
      const dummyEndpointData = this.props?.endpointContent;
      dummyEndpointData.testResponse = response
      dummyEndpointData.flagResponse = true
      this.props.setQueryUpdatedData(dummyEndpointData);
      this.setState({ timeElapsed })
    }
  }

  setPathVariableValues() {
    let uri = new URI(this.props?.endpointContent?.data?.updatedUri || '');
    uri = uri.pathname();
    const pathParameters = uri.split('/');
    let path = '';
    const pathVariablesMap = {};

    this.props.endpointContent.pathVariables.forEach(variable => {
      pathVariablesMap[variable.key] = variable.value;
    });

    for (let i = 0; i < pathParameters.length; i++) {
      if (pathParameters[i][0] === ':') {
        const pathVariableKey = pathParameters[i].slice(1).trim()
        if (pathVariablesMap.hasOwnProperty(pathVariableKey) && pathVariablesMap[pathVariableKey] !== '') {
          pathParameters[i] = pathVariablesMap[pathVariableKey];
        } else {
          pathParameters[i] = ':' + pathVariableKey;
        }
      }
    }
    path = pathParameters.join('/')
    return path
  }

  setData = async () => {
    let body = this.props?.endpointContent?.data?.body
    if (this.props?.endpointContent?.data?.body?.type === bodyTypesEnums['raw']) {
      body.value = this.parseBody(body.value)
    }
    body = this.prepareBodyForSending(body)
    const headersData = this.doSubmitHeader('save')
    const updatedParams = this.doSubmitParam()
    const updatedPathVariables = this.doSubmitPathVariables()
    const endpoint = {
      uri: this.props.endpointContent.data.updatedUri,
      name: this.props.endpointContent.data.name,
      requestType: this.props.endpointContent.data.method,
      body: body,
      id: this.state.endpoint.id || null,
      status: this.props.tab?.status || tabStatusTypes.NEW,
      headers: headersData,
      params: updatedParams,
      pathVariables: updatedPathVariables,
      BASE_URL: this.props.endpointContent.host.BASE_URL,
      bodyDescription: this.props.endpointContent.data.body.type === rawTypesEnums.JSON ? this.props.endpointContent.bodyDescription : {},
      authorizationData: this.props.endpointContent.authorizationData
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
  }

  checkValue(param, originalParams) {
    let valueFlag = false
    const originalParam = originalParams.find((o) => o.key === param.key)
    if (originalParam.value === null || originalParam.value === '') {
      valueFlag = true
    }
    return valueFlag
  }

  checkEmptyParams() {
    const params = this.props?.endpointContent?.params
    const originalParams = this.props?.endpointContent?.originalParams
    let isEmpty = false
    params.forEach((param) => {
      if (param.checked !== 'notApplicable' && param.checked === 'true' && this.checkValue(param, originalParams)) {
        isEmpty = true
        param.empty = true
      } else {
        param.empty = false
      }
    })
    // const endpoint = { ...this.props?.endpointContent }
    // endpoint.params = { ...params }
    // this.props.setQueryUpdatedData(endpoint)
    this.setState({ params })
    return isEmpty
  }

  addhttps(url) {
    if (url) {
      if (this.props?.endpointContent?.data?.updatedUri.includes('localhost') && !url.includes('localhost')) {
        url = 'localhost:' + url
      }
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

  checkTokenExpired(expirationTime, generatedDateTime) {
    if (!expirationTime) return false;
    const generatedTime = new Date(generatedDateTime).getTime();
    const expirationDateTime = generatedTime + expirationTime;
    const currentTime = new Date().getTime();
    const isExpired = currentTime > expirationDateTime;

    return isExpired;
  }

  async getRefreshToken(headers, url) {
    let oauth2Data = this.props?.endpointContent?.authorizationData?.authorization?.oauth2
    if (this.props?.endpointContent?.authorizationData?.authorizationTypeSelected === 'oauth2' && (this.props.tokenDetails?.[oauth2Data?.selectedTokenId]?.grantType === grantTypesEnums.authorizationCode || this.props.tokenDetails?.[oauth2Data?.selectedTokenId]?.grantType === grantTypesEnums.authorizationCodeWithPkce)) {
      const generatedDateTime = this.props.tokenDetails?.[oauth2Data?.selectedTokenId]?.createdTime;
      const expirationTime = this.props.tokenDetails?.[oauth2Data?.selectedTokenId]?.expiryTime;
      const isTokenExpired = this.checkTokenExpired(expirationTime, generatedDateTime)
      if (isTokenExpired && this.props.tokenDetails[oauth2Data.selectedTokenId]?.refreshTokenUrl && this.props.tokenDetails[oauth2Data.selectedTokenId]?.refreshToken) {
        try {
          const data = await endpointApiService.getRefreshToken(this.props.tokenDetails[oauth2Data.selectedTokenId])
          if (data?.access_token) {
            const dataToUpdate = {
              tokenId: oauth2Data.selectedTokenId,
              accessToken: data.access_token || this.props.tokenDetails[oauth2Data.selectedTokenId]?.accessToken,
              refreshToken: data.refresh_token || this.props.tokenDetails[oauth2Data.selectedTokenId]?.refreshToken,
              expiryTime: data.expires_in || this.props.tokenDetails[oauth2Data.selectedTokenId]?.expiryTime,
            }
            this.props.update_token(dataToUpdate)
            if (oauth2Data?.addAuthorizationRequestTo === addAuthorizationDataTypes.requestHeaders && headers?.Authorization) {
              headers.Authorization = `Bearer ${data.access_token}`
              this.setHeaders(data.access_token, 'Authorization.oauth_2')
            }
            else if (oauth2Data?.addAuthorizationRequestTo === addAuthorizationDataTypes.requestUrl) {
              const urlObj = new URL(url);
              const searchParams = new URLSearchParams(urlObj.search);
              searchParams.set('access_token', data.access_token);
              const newSearchParamsString = searchParams.toString();
              url = urlObj.origin + urlObj.pathname + '?' + newSearchParamsString + urlObj.hash;
              this.setParams(data.access_token, 'access_token')
            }
          }
        }
        catch (error) {
          console.error('could not regenerate the token')
        }
      }
    }
    return { newHeaders: headers, newUrl: url }
  }

  handleSend = async () => {
    const keyForRequest = shortid.generate()
    const runSendRequest = Axios.CancelToken.source()
    const startTime = new Date().getTime()
    const response = {}
    this.setState({
      startTime,
      response,
      preReqScriptError: '',
      postReqScriptError: '',
      tests: null,
      loader: true,
      requestKey: keyForRequest,
      runSendRequest
    })

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
    const BASE_URL = this.props.endpointContent.host.BASE_URL || ''
    const uri = new URI(this.props.endpointContent.data.updatedUri || '')
    const queryparams = uri.search()
    const path = this.setPathVariableValues()
    const url = BASE_URL + path + queryparams
    if (!url) {
      toast.error('Request URL is empty')
      setTimeout(() => {
        this.setState({ loader: false })
      }, 500)
      return
    }

    /** Prepare Body & Modify Headers */
    let { body, headers } = this.formatBody(this.props?.endpointContent?.data.body, headerJson)

    /** Add Cookie in Headers */
    const cookiesString = this.prepareHeaderCookies(BASE_URL)
    if (cookiesString) {
      headers.cookie = cookiesString.trim()
    }

    const method = this.props?.endpointContent?.data?.method
    /** Set Request Options */
    let requestOptions = null
    const cancelToken = runSendRequest.token
    requestOptions = { url, body, headers, method, cancelToken, keyForRequest }

    const currentEnvironment = this.props.environment

    const code = this.props.endpointContent.preScriptText

    /** Run Pre Request Script */
    const result = this.runScript(code, currentEnvironment, requestOptions)
    if (result.success) {
      let {
        environment,
        request: { url, headers },
        tests
      } = result.data
      this.setState({ tests })
      /** Replace Environemnt Variables */
      url = this.replaceVariables(url, environment)
      url = this.addhttps(url)
      headers = this.replaceVariablesInJson(headers, environment)
      // Start of Regeneration of AUTH2.0 Token
      const { newHeaders, newUrl } = await this.getRefreshToken(headers, url)
      headers = newHeaders
      url = newUrl
      const bodyType = this.props?.endpointContent?.data?.body?.type
      body = this.replaceVariablesInBody(body, bodyType, environment)
      requestOptions = { ...requestOptions, body, headers, url, bodyType }
      /** Steve Onboarding Step 5 Completed */
      moveToNextStep(5)
      /** Handle Request Call */
      await this.handleApiCall(requestOptions)
      this.setState({
        loader: false,
        runSendRequest: null,
        requestKey: null
      })
      /** Add to History */
      isDashboardRoute(this.props) && this.setData()
    } else {
      this.setState({ preReqScriptError: result.error, loader: false })
    }
    if (this.myRef?.current?.scrollIntoView) {
      this.myRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  runScript(code, environment, request, responseJson) {
    let response
    if (responseJson) {
      const { status, statusText, response: body, headers } = responseJson.data
      response = { status, statusText, body, headers }
      response = { value: response }
    }

    if (code?.trim()?.length === 0 || !isDashboardRoute(this.props, true)) {
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
      if (groupId === this.props.endpoints[Object.keys(this.props.endpoints)[i]].groupId) {
        count = count + 1
      }
    }
    return count + 1
  }

  prepareBodyForSaving(body) {
    const data = _.cloneDeep(body)
    if (data.type === bodyTypesEnums['multipart/form-data']) {
      data[bodyTypesEnums['multipart/form-data']].forEach((item) => {
        if (item.type === 'file') item.value = {}
      })
    }
    return data
  }

  prepareBodyForSending(body) {
    const data = _.cloneDeep(body)
    if (data.type === bodyTypesEnums['multipart/form-data']) {
      data[bodyTypesEnums['multipart/form-data']].forEach((item) => {
        if (item.type === 'file') item.value.srcPath = ''
      })
    }
    return data
  }

  handleSave = async (id, endpointObject, slug) => {
    const { endpointName, endpointDescription } = endpointObject || {}
    let currentTabId = this.props.tab.id;
    let parentId = id;
    if (!getCurrentUser()) {
      this.setState({
        showLoginSignupModal: true
      })
    }
    if ((currentTabId && !this.props.pages[currentTabId] && !this.state.showEndpointFormModal) || (this.props?.match?.params?.historyId && slug !== 'isHistory')) {
      this.openEndpointFormModal()
    } else {
      let endpointContent = this.props.getDataFromReactQuery(['endpoint', currentTabId])
      const body = this.prepareBodyForSaving(endpointContent?.data?.body)
      const bodyDescription = bodyDescriptionService.handleUpdate(false, {
        body_description: endpointContent?.bodyDescription,
        body: body.value
      })
      if (this.props?.endpointContent?.data?.body.type === bodyTypesEnums['raw']) {
        body.value = this.parseBody(body.value)
      }
      const headersData = this.doSubmitHeader('save')
      const updatedParams = this.doSubmitParam()
      let updatedPathVariables = this.doSubmitPathVariables()
      updatedPathVariables = Object.keys(updatedPathVariables).reduce((obj, key) => {
        obj[key] = updatedPathVariables[key]
        return obj
      }, {})
      const endpoint = {
        id: slug === 'isHistory' ? this.props?.match?.params?.historyId : currentTabId,
        uri: endpointContent?.data.updatedUri,
        name: this.state.saveAsFlag ? endpointName : endpointContent?.data?.name,
        requestType: endpointContent?.data?.method,
        body: body,
        headers: headersData,
        params: updatedParams,
        pathVariables: updatedPathVariables,
        BASE_URL: endpointContent.host.BASE_URL || null,
        bodyDescription: endpointContent?.bodyDescription,
        authorizationData: endpointContent.authorizationData,
        notes: endpointContent?.endpoint.notes,
        preScript: endpointContent?.preScriptText,
        postScript: endpointContent?.postScriptText,
        docViewData: endpointContent?.docViewData
      }
      if (trimString(endpoint.name) === '' || trimString(endpoint.name).toLowerCase() === 'untitled')
        return toast.error('Please enter Endpoint name')
      else if (currentTabId && !this.props.pages[currentTabId]) {
        endpoint.requestId = currentTabId
        endpoint.description = endpointDescription || ''
        this.setState({ saveAsLoader: true })
        this.props.add_endpoint(
          endpoint,
          parentId,
          ({ closeForm, stopLoader }) => {
            if (closeForm) this.closeEndpointFormModal()
            if (stopLoader) this.setState({ saveAsLoader: false })
          },
          this.props
        )
        moveToNextStep(4)
      } else {
        if (this.state.saveAsFlag || slug === 'isHistory') {
          endpoint.description = endpointDescription || ''
          // 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
          delete endpoint.state
          delete endpoint.isPublished
          this.setState({ saveAsLoader: true })
          this.props.add_endpoint(
            endpoint,
            parentId,
            ({ closeForm, stopLoader }) => {
              if (closeForm) this.closeEndpointFormModal()
              if (stopLoader) this.setState({ saveAsLoader: false })
            },
            this.state.saveAsFlag
          )
          moveToNextStep(4)
        } else {
          // endpoint.isPublished = this.props.endpoints[this.endpointId]?.isPublished
          // not sending isPublished during put method
          // 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
          endpoint.state = statesEnum.DRAFT_STATE
          this.setState({ saveLoader: true })
          this.props.update_endpoint(
            {
              ...endpoint,
              id: currentTabId
            },
            () => {
              this.setState({ saveLoader: false })
            }
          )
          tabService.markTabAsSaved(currentTabId)
        }
      }
    }
  }

  doSubmitPathVariables() {
    if (this.props?.endpointContent.pathVariables) {
      const pathVariables = this.props?.endpointContent?.pathVariables || []
      const endpoint = { ...this.props?.endpointContent }
      endpoint.pathVariables = pathVariables
      this.props.setQueryUpdatedData(endpoint)
      return pathVariables
    }
    return []
  }

  doSubmitHeader(title) {
    const originalHeaders = [...this.props?.endpointContent.originalHeaders]
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
    const endpoint = { ...this.props?.endpointContent }
    endpoint.headers = { ...updatedHeaders }
    this.props.setQueryUpdatedData(endpoint)
    return updatedHeaders
  }

  setMethod(method) {
    const dummyData = this.props?.endpointContent
    dummyData.data.method = method
    this.props.setQueryUpdatedData(dummyData)
    const response = {}
    this.setState({ response }, () => this.setModifiedTabData())
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
      this.setModifiedTabData()
      const dummyData = this?.props?.endpointContent
      dummyData.originalParams = [...value]
      this.setState({ endpointContentState: dummyData })
      this.props.setQueryUpdatedData(dummyData, this.prepareHarObject.bind(this))
    }

    if (name === 'Headers') {
      this.setModifiedTabData()
      const dummyData = this?.props?.endpointContent
      dummyData.originalHeaders = [...value]
      this.setState({ endpointContentState: dummyData })
      this.props.setQueryUpdatedData(dummyData, this.prepareHarObject.bind(this))
    }

    if (name === 'Path Variables') {
      this.setModifiedTabData()
      const dummyData = this?.props?.endpointContent
      dummyData.pathVariables = [...value]
      this.setState({ endpointContentState: dummyData })
      this.props.setQueryUpdatedData(dummyData, this.prepareHarObject.bind(this))
    }

    if (name === 'HostAndUri') this.setModifiedTabData()
  }

  setPublicBody(body) {
    const data = { ...this.props?.endpointContent?.data }
    data.body = { type: data?.body?.type ?? bodyTypesEnums['none'], value: body }
    const tempData = this.props?.endpointContent
    tempData.data = data
    this.props.setQueryUpdatedData(tempData)
    this.setState({ data, publicBodyFlag: false })
  }

  handleUpdateUri(originalParams) {
    const tempdata = this.props.endpointContent
    if (originalParams.length === 0) {
      const updatedUri = this.props.endpointContent.data.updatedUri.split('?')[0]
      const data = { ...this.props?.endpointContent.data }
      data.updatedUri = updatedUri
      tempdata.data = data
      this.props.setQueryUpdatedData(tempdata)
      return
    }
    const originalUri = this.props?.endpointContent.data.updatedUri.split('?')[0] + '?'
    const parts = {}
    for (let i = 0; i < originalParams.length; i++) {
      if (originalParams[i].key.length !== 0 && originalParams[i].checked === 'true') {
        parts[originalParams[i].key] = originalParams[i].value
      }
    }
    URI.escapeQuerySpace = false
    let updatedUri = URI.buildQuery(parts)
    updatedUri = originalUri + URI.decode(updatedUri)
    const data = { ...this.props?.endpointContent.data }
    if (Object.keys(parts).length === 0) {
      data.updatedUri = updatedUri.split('?')[0]
    } else {
      data.updatedUri = updatedUri
    }
    tempdata.data = data
    this.props.setQueryUpdatedData(tempdata)
  }

  doSubmitParam() {
    const originalParams = [...this.props?.endpointContent.originalParams]
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
    const endpoint = { ...this.props?.endpointContent }
    endpoint.params = { ...updatedParams }
    this.props.setQueryUpdatedData(endpoint)
    return updatedParams
  }

  openEndpointFormModal() {
    this.setState({ showEndpointFormModal: true })
  }

  closeEndpointFormModal() {
    this.setState({ showEndpointFormModal: false, saveAsFlag: false })
  }

  closeChatBotModal = () => {
    this.setState({ showAskAiSlider: false })
  }

  makeHeaders(headers) {
    const processedHeaders = []
    for (let i = 0; i < Object.keys(headers)?.length; i++) {
      if (headers[Object.keys(headers)[i]].checked === 'true') {
        processedHeaders.push({
          name: headers[Object.keys(headers)[i]].key,
          value: headers[Object.keys(headers)[i]].value,
          comment: headers[Object.keys(headers)[i]].description === null ? '' : headers[Object.keys(headers)[i]].description
        })
      }
    }
    return processedHeaders
  }

  makeParams(params) {
    const processedParams = []
    if (params) {
      for (let i = 0; i < Object.keys(params).length; i++) {
        if (params[Object.keys(params)[i]].checked === 'true') {
          processedParams.push({
            name: params[Object.keys(params)[i]].key,
            value: params[Object.keys(params)[i]].value,
            comment: params[Object.keys(params)[i]].description
          })
        }
      }
    }
    return processedParams
  }

  async makePostData(body) {
    const params = []
    let paramsFlag = false
    let postData = {}
    if ((body.type === bodyTypesEnums['application/x-www-form-urlencoded'] || body.type === bodyTypesEnums['multipart/form-data'])) {
      paramsFlag = true
      let data = body[body.type]
      for (let i = 0; i < data.length; i++) {
        if (data[i].checked === 'true' && data[i].key !== '') {
          params.push({
            name: data[i].key,
            value: data[i].value,
            fileName: null,
            contentType: null
          })
        }
      }
      postData = {
        mimeType: body?.type,
        params: params,
        comment: ''
      }
    } else {
      postData = {
        mimeType: body?.type,
        params: params,
        text: paramsFlag === false ? body?.raw?.value : '',
        comment: ''
      }
    }
    return postData
  }

  async prepareHarObject() {
    const BASE_URL = this.props?.endpointContent?.host?.BASE_URL || ''
    const uri = new URI(this.props?.endpointContent?.data?.updatedUri || '')
    const queryparams = uri.search()
    const path = this.setPathVariableValues()
    let url = encodeURI(BASE_URL + path + queryparams)
    // url = this.replaceVariables(url)
    const method = this.props?.endpointContent?.data?.method || ''
    const body = this.props?.endpointContent?.data?.body || {}
    const { originalHeaders, originalParams } = this.props?.endpointContent || {}
    const harObject = {
      method,
      url: url,
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers: this.makeHeaders(originalHeaders || {}),
      postData: body && body.type !== bodyTypesEnums['none'] ? await this.makePostData(body) : null,
      queryString: this.makeParams(originalParams)
    }
    if (!harObject.url.split(':')[1] || harObject.url.split(':')[0] === '') {
      harObject.url = 'https://' + url
    }
    const updatedharObject = {
      ...this.props.endpointContent,
      harObject: harObject
    }
    this.props.setQueryUpdatedData(updatedharObject)
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
        harObject={this.props?.endpointContent?.harObject}
        title='Generate Code Snippets'
      />
    )
  }

  setBaseUrl(BASE_URL, selectedHost) {
    this.setState({ host: { BASE_URL, selectedHost } })
    const tempData = this?.props?.endpointContent || untitledEndpointData
    tempData.host = { BASE_URL, selectedHost }
    this.props.setQueryUpdatedData(tempData)
  }

  setBody(bodyType, body, rawType) {
    let data = { ...this.props?.endpointContent.data }
    if (this.rawBodyTypes.includes(bodyType)) {
      data.body = { ...data.body, type: bodyType, [bodyTypesEnums['raw']]: { rawType, value: body } }
    }
    else if (bodyType === bodyTypesEnums['application/x-www-form-urlencoded'] || bodyType === bodyTypesEnums['multipart/form-data']) {
      data.body = { ...data.body, type: bodyType, [bodyType]: body }
    }
    else if (bodyType === bodyTypesEnums['none']) {
      data.body = { ...data.body, type: bodyType }
    }
    isDashboardRoute(this.props) && this.setHeaders(bodyType, 'content-type')
    this.setModifiedTabData()
    const tempData = this.props.endpointContent
    tempData.data = data
    this.props.setQueryUpdatedData(tempData)
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
            description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
            dataType: typeof body[keys[i]]
          }
        } else {
          if (typeof body[keys[i]] === 'object' && Array.isArray(body[keys[i]])) {
            if (body[keys[i]].length !== 0) {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
                dataType: 'Array of ' + typeof body[keys[i]][0]
              }
            } else {
              bodyDescription[keys[i]] = {
                default: [''],
                description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
                dataType: 'Array of string'
              }
            }
          } else if (typeof body[keys[i]] === 'object') {
            const bodyField = body[keys[i]]
            const key = Object.keys(bodyField)
            if (key.length > 0 && typeof bodyField[key[0]] === 'object') {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
                dataType: 'Object of objects'
              }
            } else {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
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
    const tempData = this.props.endpointContent
    tempData.bodyDescription = bodyDescription
    this.props.setQueryUpdatedData(tempData)
  }

  setFieldDescription(fieldDescription, bodyDescription) {
    this.setState({ fieldDescription, bodyDescription })
    const tempData = this.props.endpointContent
    tempData.fieldDescription = fieldDescription
    tempData.bodyDescription = bodyDescription
    this.props.setQueryUpdatedData(tempData)
  }

  setParams(value, title, authorizationFlag, tokenIdToSave) {
    const originalParams = this.props.endpointContent.originalParams
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
    const dummyData = this.props.endpointContent
    dummyData.originalParams = updatedParams
    if (dummyData?.authorizationData?.authorization?.oauth2) {
      dummyData.authorizationData.authorization.oauth2 = { ...dummyData?.authorizationData?.authorization?.oauth2, selectedTokenId: tokenIdToSave }
    }
    else {
      dummyData.authorizationData.authorization = { oauth2: {} }
      dummyData.authorizationData.authorization.oauth2 = { ...dummyData?.authorizationData?.authorization?.oauth2, selectedTokenId: tokenIdToSave }
    }
    this.props.setQueryUpdatedData(dummyData)
    this.propsFromChild('Params', updatedParams)
  }

  setHeaders(value, title, authorizationFlag = undefined, tokenIdToSave) {
    const originalHeaders = this.props.endpointContent.originalHeaders
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
        const dummyData = this.props.endpointContent
        dummyData.originalHeaders = originalHeaders
        this.props.setQueryUpdatedData(dummyData)
        return
      } else {
        updatedHeaders.push(originalHeaders[i])
      }
    }
    if (value === 'none') {
      updatedHeaders.push(emptyHeader)
      const dummyData = this.props.endpointContent
      dummyData.originalHeaders = updatedHeaders
      this.props.setQueryUpdatedData(dummyData)
      return
    }
    if (value !== 'noAuth' && !authorizationFlag) {
      updatedHeaders.push({
        checked: 'true',
        key: title === 'content-type' ? 'content-type' : 'Authorization',
        value: title.split('.')[0] === 'Authorization' ? (title.split('.')[1] === 'oauth_2' ? 'Bearer ' + value : 'Basic ' + value) : '',
        description: ''
      })
    }
    if (title === 'content-type') {
      updatedHeaders[updatedHeaders.length - 1].value = this.identifyBodyType(value)
    }
    updatedHeaders.push(emptyHeader)
    const dummyData = this.props.endpointContent
    if (dummyData?.authorizationData?.authorization?.oauth2) {
      dummyData.authorizationData.authorization.oauth2 = { ...dummyData?.authorizationData?.authorization?.oauth2, selectedTokenId: tokenIdToSave }
    }
    else {
      dummyData.authorizationData.authorization = { oauth2: {} }
      dummyData.authorizationData.authorization.oauth2 = { ...dummyData?.authorizationData?.authorization?.oauth2, selectedTokenId: tokenIdToSave }
    }
    dummyData.originalHeaders = updatedHeaders
    this.props.setQueryUpdatedData(dummyData)
  }

  identifyBodyType(bodyType) {
    switch (bodyType) {
      case bodyTypesEnums['application/x-www-form-urlencoded']:
        return bodyTypesEnums['application/x-www-form-urlencoded']
      case bodyTypesEnums['multipart/form-data']:
        return bodyTypesEnums['multipart/form-data']
      case rawTypesEnums.TEXT:
        return 'text/plain'
      case rawTypesEnums.JSON:
        return 'application/JSON'
      case rawTypesEnums.HTML:
        return 'text/HTML'
      case rawTypesEnums.XML:
        return 'application/XML'
      case rawTypesEnums.JavaScript:
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
    this.setState({ sampleResponseFlagArray })
    const updatedEndpointData = {
      ...this.props.endpointContent,
      sampleResponseArray: sampleResponseArray
    }
    this.props.setQueryUpdatedData(updatedEndpointData)
    this.props.update_endpoint({
      id: this.props.currentEndpointId,
      sampleResponse: sampleResponseArray
    })
  }

  makeFormData(body) {
    const formData = {}
    for (let i = 0; i < body.length; i++) {
      if (body[i].key.length !== 0 && body[i].checked === 'true') {
        if (!isElectron() && body[i].type === 'file') {
          continue
        }
        formData[body[i].key] = body[i].value
      }
    }
    return formData
  }

  formatBody(body, headers) {
    let finalBodyValue = null
    switch (body.type) {
      case bodyTypesEnums['raw']:
        finalBodyValue = this.parseBody(body?.raw?.value || '')
        return { body: finalBodyValue, headers }
      case bodyTypesEnums['multipart/form-data']: {
        const formData = this.makeFormData(body[bodyTypesEnums['multipart/form-data']])
        headers['content-type'] = bodyTypesEnums['multipart/form-data']
        return { body: formData, headers }
      }
      case bodyTypesEnums['application/x-www-form-urlencoded']: {
        const urlEncodedData = {}
        for (let i = 0; i < body?.[bodyTypesEnums['application/x-www-form-urlencoded']].length; i++) {
          if (body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].key.length !== 0 && body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].checked === 'true') {
            urlEncodedData[body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].key] = body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].value
          }
        }
        return { body: urlEncodedData, headers }
      }
      default:
        return { body: body?.raw?.value, headers }
    }
  }

  async setAccessToken() {
    const url = window.location.href
    const hashVariables = isElectron() ? url.split('#')[2] : url.split('#')[1]
    const response = URI.parseQuery('?' + hashVariables)
    if (hashVariables) {
      await indexedDbService.getDataBase()
      await indexedDbService.updateData('responseData', response, 'currentResponse')
      const responseData = await indexedDbService.getValue('responseData', 'currentResponse')
      const timer = setInterval(async function () {
        if (responseData) {
          clearInterval(timer)
          window.close()
        }
      }, 1000)
    }
    if (url.split('?')[1]) {
      await indexedDbService.getDataBase()
      const authData = await indexedDbService.getValue('authData', 'currentAuthData')
      const resposneAuthCode = URI.parseQuery('?' + url.split('?')[1])
      const code = resposneAuthCode.code
      const paramsObject = {}
      paramsObject.code = code
      paramsObject.client_id = authData.clientId
      paramsObject.client_secret = authData.clientSecret
      paramsObject.redirect_uri = authData.callbackUrl
      await endpointApiService.authorize(authData.accessTokenUrl, paramsObject, 'auth_code', this.props, authData)
    }
  }

  setAuthType(type, value) {
    this.setModifiedTabData()
    const dummyData = this.props.endpointContent
    dummyData.authorizationData = {
      ...dummyData.authorizationData,
      authorizationTypeSelected: type,
      authorization: { ...dummyData.authorizationData.authorization, [type]: value }
    }
    this.props.setQueryUpdatedData(dummyData)
  }

  addSampleResponse(response) {
    const { data, status } = response
    const sampleResponseFlagArray = [...this.state.sampleResponseFlagArray]
    const description = ''
    const title = ''
    const sampleResponse = { data, status, description, title }
    const sampleResponseArray = [...this.props.endpointContent.sampleResponseArray, sampleResponse]
    sampleResponseFlagArray.push(false)
    this.setState({ sampleResponseFlagArray })
    const updatedEndpointData = {
      ...this.props.endpointContent,
      sampleResponseArray: sampleResponseArray
    }
    this.props.setQueryUpdatedData(updatedEndpointData)
    this.props.update_endpoint({
      id: this.props.currentEndpointId,
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
    if (this.isNotDashboardOrDocView() && this.props?.endpointContent?.flagResponse) {
      return (
        <div ref={this.myRef} className='hm-panel endpoint-public-response-container public-doc'>
          <DisplayResponse
            {...this.props}
            loader={this.state.loader}
            timeElapsed={this.state.timeElapsed}
            response={this.props?.endpointContent?.testResponse}
            flagResponse={this.props?.endpointContent?.flagResponse}
            add_sample_response={this.addSampleResponse.bind(this)}
            handleCancel={() => {
              this.handleCancel()
            }}
            tests={this.state.tests}
            sample_response_array={this.props?.endpointContent?.sampleResponseArray}
            sample_response_flag_array={this.state?.sampleResponseFlagArray}
            props_from_parent={this.propsFromSampleResponse.bind(this)}
          />
        </div>
      )
    }
  }

  displayPublicSampleResponse() {
    if (this.props?.endpointContent?.sampleResponseArray?.length) {
      return (
        <div className='mt-3'>
          <PublicSampleResponse
            highlights={this.props?.highlights}
            sample_response_array={this.props?.endpointContent?.sampleResponseArray}
            publicCollectionTheme={this.props?.publicCollectionTheme}
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
        <OverlayTrigger overlay={<Tooltip id='tooltip-disabled'>Doc to {type}</Tooltip>}>
          <div className='icon-bx' />
        </OverlayTrigger>
      </div>
    )
  }

  toggleChatbotModal = () => {
    if (this.props.responseView === 'right' && this.state.showAskAiSlider === false) {
      this.props.set_response_view('bottom')
    }
    this.setState((prevState) => ({
      showAskAiSlider: !prevState.showAskAiSlider
    }))
    // this.props.set_chat_view(this.state.showAskAiSlider)
  }

  displayResponseAndSampleResponse() {
    return (
      <>
        <div className='custom-tabs clear-both response-container mb-2' ref={this.myRef}>
          <div className='d-flex justify-content-between align-items-center'>
            <ul className='nav nav-tabs respTabsListing' id='myTab' role='tablist'>
              <li className='nav-item'>
                <a
                  className='nav-link active'
                  id='pills-response-tab'
                  data-toggle='pill'
                  href={this.isDashboardAndTestingView() ? `#response-${this.props.tab.id}` : '#response'}
                  role='tab'
                  aria-controls={this.isDashboardAndTestingView() ? `response-${this.props.tab.id}` : 'response'}
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
                    href={this.isDashboardAndTestingView() ? `#sample-${this.props.tab.id}` : '#sample'}
                    role='tab'
                    aria-controls={this.isDashboardAndTestingView() ? `sample-${this.props.tab.id}` : 'sample'}
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
              id={this.isDashboardAndTestingView() ? `response-${this.props.tab.id}` : 'response'}
              role='tabpanel'
              aria-labelledby='pills-response-tab'
            >
              <div className='hm-panel endpoint-public-response-container '>
                <DisplayResponse
                  {...this.props}
                  loader={this.state?.loader}
                  timeElapsed={this.state?.timeElapsed}
                  response={this.props?.endpointContent?.testResponse}
                  tests={this.state.tests}
                  flagResponse={this.props?.endpointContent?.flagResponse}
                  sample_response_array={this.props?.endpointContent?.sampleResponseArray}
                  sample_response_flag_array={this.state.sampleResponseFlagArray}
                  add_sample_response={this.addSampleResponse.bind(this)}
                  props_from_parent={this.propsFromSampleResponse.bind(this)}
                  handleCancel={() => {
                    this.handleCancel()
                  }}
                />
              </div>
            </div>
            {getCurrentUser() && (
              <div
                className='tab-pane fade'
                id={this.isDashboardAndTestingView() ? `sample-${this.props.tab.id}` : 'sample'}
                role='tabpanel'
                aria-labelledby='pills-sample-tab'
              >
                {this.renderSampleResponse()}
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  renderSampleResponse() {
    return (
      <SampleResponse
        {...this.props}
        timeElapsed={this.state?.timeElapsed}
        response={this.state?.response}
        flagResponse={this.state?.flagResponse}
        sample_response_array={this.props?.endpointContent?.sampleResponseArray}
        sample_response_flag_array={this.state.sampleResponseFlagArray}
        open_body={this.openBody.bind(this)}
        close_body={this.closeBody.bind(this)}
        props_from_parent={this.propsFromSampleResponse.bind(this)}
        currentView={this.props?.endpointContent?.currentView}
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
            response={this.props?.endpointContent?.testResponse}
            flagResponse={this.props?.endpointContent?.flagResponse}
            handleCancel={() => {
              this.handleCancel()
            }}
          />
        </div>
      </>
    )
  }

  setHostUri(host, uri, selectedHost) {
    if (uri !== this.props?.endpointContent?.data?.uri) this.handleChange({ currentTarget: { name: 'updatedUri', value: uri } })
    this.setBaseUrl(host, selectedHost)
  }

  alterEndpointName(name) {
    if (name) {
      const obj = this.state.data
      obj.name = name
      this.setState({ data: obj })
    }
  }

  renderCookiesModal() {
    return (
      this.state.showCookiesModal && (
        <CookiesModal show={this.state.showCookiesModal} onHide={() => this.setState({ showCookiesModal: false })} />
      )
    )
  }

  handleScriptChange(text, type) {
    let preScriptText = this.props?.endpointContent?.preScriptText || ''
    let postScriptText = this.props?.endpointContent?.postScriptText || ''
    if (type === 'Pre-Script') {
      preScriptText = text
    } else {
      postScriptText = text
    }
    this.setModifiedTabData()
    const dummyData = this.props.endpointContent
    dummyData.preScriptText = preScriptText
    dummyData.postScriptText = postScriptText
    this.props.setQueryUpdatedData(dummyData)
  }

  renderScriptError() {
    return (
      <>
        {this.state.postReqScriptError ? (
          <div className='script-error'>{`There was an error in evaluating the Post-request Script: ${this.state.postReqScriptError}`}</div>
        ) : null}
        {this.state.preReqScriptError ? (
          <div className='script-error'>{`There was an error in evaluating the Pre-request Script: ${this.state.preReqScriptError}`}</div>
        ) : null}
      </>
    )
  }

  switchView = (currentView) => {
    const data = this.props.endpointContent
    data.currentView = currentView
    this.props.setQueryUpdatedData(data)
  }

  renderDefaultViewConfirmationModal() {
    return (
      this.state.showViewConfirmationModal && (
        <ConfirmationModal
          show={this.state.showViewConfirmationModal}
          onHide={() => this.setState({ showViewConfirmationModal: false })}
          proceed_button_callback={this.setDefaultView.bind(this)}
          title={msgText.viewSwitch}
        />
      )
    )
  }

  setDefaultView() {
    const endpointView = { [getCurrentUser().identifier]: this.props?.endpointContent?.currentView }
    window.localStorage.setItem('endpointView', JSON.stringify(endpointView))
  }

  removePublicItem(item, index) {
    const showRemoveButton = !['body', 'host', 'params', 'pathVariables', 'headers', 'sampleResponse'].includes(item.type)
    const handleOnClick = () => {
      const docData = [...this.props?.endpointContent?.docViewData]
      docData.splice(index, 1)
      this.props.setQueryUpdatedData({ ...this.props.endpointContent, docViewData: docData })
    }
    return (
      showRemoveButton && (
        <div className='' onClick={handleOnClick.bind(this)}>
          {' '}
          <img src={DeleteIcon} alt='' />{' '}
        </div>
      )
    )
  }

  renderDocView = () => {
    if (!this.props?.endpointContent?.docViewData) return
    if (isDashboardRoute(this.props)) {
      return (
        <SortableList
          lockAxis='y'
          useDragHandle
          onSortEnd={({ oldIndex, newIndex }) => {
            this.onSortEnd(oldIndex, newIndex)
          }}
        >
          <div>
            {this.props?.endpointContent?.docViewData.map((item, index) => (
              <SortableItem key={index} index={index}>
                <div className='doc-secs-container mb-3'>
                  <div className='doc-secs'>{this.renderPublicItem(item, index)}</div>
                  <div className='addons'>
                    {this.renderDragHandle(item)}
                    {this.removePublicItem(item, index)}
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )
    } else {
      return this.props?.endpointContent?.docViewData?.map((item, index) => <div key={index}>{this.renderPublicItem(item, index)}</div>)
    }
  }

  renderDragHandle(item) {
    if (item.type === 'pathVariables') {
      if (this.props?.endpointContent?.pathVariables && this.props?.endpointContent?.pathVariables.length) return <DragHandle />
      return
    }
    return <DragHandle />
  }

  onSortEnd = (oldIndex, newIndex) => {
    const docViewData = [...this.props?.endpointContent?.docViewData]
    if (newIndex !== oldIndex) {
      const newData = []
      docViewData.forEach((data, index) => {
        index !== oldIndex && newData.push(data)
      })
      newData.splice(newIndex, 0, docViewData[oldIndex])
      this.props.setQueryUpdatedData({ ...this.props.endpointContent, docViewData: newData })
    }
  }

  saveData = (index, data) => {
    const updatedDocViewData = [...this.props.endpointContent.docViewData]
    updatedDocViewData[index] = { ...updatedDocViewData[index], data: data }
    this.props.setQueryUpdatedData({
      ...this.props.endpointContent,
      docViewData: updatedDocViewData
    })
  }

  debouncedSave = _.debounce(this.saveData, 1000)

  renderTiptapEditor(item, index) {
    return (
      <Tiptap
        initial={item.data}
        onChange={(e) => this.debouncedSave(index, e)}
        match={this.props.match}
        isInlineEditor
        disabled={!isDashboardRoute(this.props)}
        key={`${item.type}-${index}`}
      />
    )
  }

  renderPublicItem = (item, index) => {
    switch (item.type) {
      case 'textArea': {
        if (isDashboardRoute(this.props) || (!isDashboardRoute(this.props) && item.data)) {
          return <div>{this.renderTiptapEditor(item, index)}</div>
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
    return !isDashboardRoute(this.props) || this.props?.endpointContent?.currentView === 'doc'
  }

  isDashboardAndTestingView() {
    return isDashboardRoute(this.props) && (this.props?.endpointContent?.currentView === 'testing' || !isSavedEndpoint(this.props))
  }

  renderToggleView() {
    if (isSavedEndpoint(this.props)) {
      return (
        <ButtonGroup className='btn-group-custom mb-3' aria-label='Basic example'>
          <Button
            className={'mr-1 ' + (this.props?.endpointContent?.currentView === 'testing' ? 'active' : '')}
            onClick={() => this.switchView('testing')}
          >
            Testing
          </Button>
          <Button className={this.props?.endpointContent?.currentView === 'doc' ? 'active' : ''} onClick={() => this.switchView('doc')}>
            Doc
          </Button>
        </ButtonGroup>
      )
    }
  }

  renderDocViewOptions() {
    if (isDashboardRoute(this.props) && this.props?.endpointContent.currentView === 'doc') {
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
    const updatedDocViewData = [...this.props.endpointContent.docViewData, { type: blockType, data: '' }]
    this.props.setQueryUpdatedData({ ...this.props.endpointContent, docViewData: updatedDocViewData })
  }

  renderBodyContainer() {
    return (
      <BodyContainer
        {...this.props}
        set_body={this.setBody.bind(this)}
        body={this.props.endpointContent?.data?.body || {}}
        endpoint_id={this.props.tab.id}
        set_body_description={this.setDescription.bind(this)}
        body_description={this.props?.endpointContent?.bodyDescription || ''}
      />
    )
  }

  renderPublicBodyContainer() {
    return (
      this.props?.endpointContent?.data?.body &&
      // this.props?.endpointContent?.originalBody &&
      this.props?.endpointContent?.data?.body?.value !== null && (
        <PublicBodyContainer
          {...this.props}
          set_body={this.setBody.bind(this)}
          set_body_description={this.setDescription.bind(this)}
          body={this.props?.endpointContent?.data?.body}
          original_body={this.props?.endpointContent?.data?.body}
          public_body_flag={this.props?.endpointContent?.publicBodyFlag}
          set_public_body={this.setPublicBody.bind(this)}
          body_description={this.props?.endpointContent?.bodyDescription}
        />
      )
    )
  }

  renderHeaders() {
    return (
      <GenericTable
        {...this.props}
        title='Headers'
        dataArray={this.props?.endpointContent?.originalHeaders || []}
        props_from_parent={this.propsFromChild.bind(this)}
        original_data={[this.props?.endpointContent?.originalHeaders || []]}
        currentView={this.props?.endpointContent?.currentView}
      />
    )
  }

  renderPublicHeaders() {
    return (
      this.props?.endpointContent?.originalHeaders?.length > 0 && (
        <GenericTable
          {...this.props}
          title='Headers'
          dataArray={this.props?.endpointContent?.originalHeaders}
          props_from_parent={this.propsFromChild.bind(this)}
          original_data={[...this.props?.endpointContent?.originalHeaders]}
          currentView={this.props?.endpointContent?.currentView}
        />
      )
    )
  }

  renderParams() {
    return (
      <GenericTable
        {...this.props}
        title='Params'
        dataArray={this.props?.endpointContent?.originalParams || []}
        props_from_parent={this.propsFromChild.bind(this)}
        original_data={this.props?.endpointContent?.originalParams || []}
        open_modal={this.props.open_modal}
        currentView={this.props?.endpointContent?.currentView}
      />
    )
  }

  renderPublicParams() {
    return (
      this.props?.endpointContent?.originalParams?.length > 0 && (
        <div>
          <GenericTable
            {...this.props}
            title='Params'
            dataArray={this.props?.endpointContent?.originalParams || []}
            props_from_parent={this.propsFromChild.bind(this)}
            original_data={this.props?.endpointContent?.originalParams}
            currentView={this.props?.endpointContent?.currentView}
          />
        </div>
      )
    )
  }

  renderPathVariables() {
    return (
      this.props.endpointContent?.pathVariables &&
      this.props.endpointContent?.pathVariables?.length !== 0 && (
        <GenericTable
          {...this.props}
          title='Path Variables'
          dataArray={this.props?.endpointContent?.pathVariables || []}
          props_from_parent={this.propsFromChild.bind(this)}
          original_data={this.props?.endpointContent?.pathVariables || []}
          currentView={this.props?.endpointContent?.currentView}
        />
      )
    )
  }

  renderPublicPathVariables() {
    return (
      this.props?.endpointContent?.pathVariables &&
      this.props?.endpointContent?.pathVariables?.length !== 0 && (
        <div>
          <GenericTable
            {...this.props}
            title='Path Variables'
            dataArray={this.props?.endpointContent?.pathVariables}
            props_from_parent={this.propsFromChild.bind(this)}
            original_data={this.props?.endpointContent?.pathVariables}
            currentView={this.props?.endpointContent?.currentView}
          />
        </div>
      )
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
              <span className={`api-label api-label-lg input-group-text ${this.props?.endpointContent?.data?.method}`}>
                {this.props?.endpointContent?.data?.method}
              </span>
            </div>
            <HostContainer
              {...this.props}
              environmentHost={
                this.props?.environment?.variables?.BASE_URL?.currentValue ||
                this.props?.environment?.variables?.BASE_URL?.initialValue ||
                ''
              }
              updatedUri={_.cloneDeep(this.props?.endpointContent?.data?.updatedUri)}
              set_base_url={this.setBaseUrl.bind(this)}
              // customHost={this.props?.endpointContent?.host.BASE_URL || ''}
              endpointId={this.props?.match?.params?.endpointId}
              set_host_uri={this.setHostUri.bind(this)}
              props_from_parent={this.propsFromChild.bind(this)}
              setQueryUpdatedData={this.props.setQueryUpdatedData.bind(this)}
              untitledEndpointData={_.cloneDeep(this.props.untitledEndpointData)}
            />
          </div>
          {this.props?.highlights?.uri ? <i className='fas fa-circle' /> : null}
        </div>
        <input ref={this.uri} type='hidden' value={this.props?.endpointContent?.data?.updatedUri} name='updatedUri' />
      </div>
    )
  }

  renderHost() {
    return (
      <div className='input-group-prepend'>
        <div className='dropdown'>
          <button
            className={`api-label ${this.props?.endpointContent?.data?.method} dropdown-toggle`}
            type='button'
            id='dropdownMenuButton'
            data-toggle='dropdown'
            aria-haspopup='true'
            aria-expanded='false'
            disabled={isDashboardRoute(this.props) ? null : true}
          >
            {this.props?.endpointContent?.data?.method}
          </button>
          <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
            {this.state.methodList.map((methodName) => (
              <button className='dropdown-item' onClick={() => this.setMethod(methodName)} key={methodName}>
                {methodName}
              </button>
            ))}
          </div>
        </div>
        <div className='d-flex w-100 dashboard-url'>
          <HostContainer
            {...this.props}
            endpointId={this.state.endpoint.id}
            // customHost={this.props?.endpointContent?.host?.BASE_URL || ''}
            environmentHost={
              this.props.environment?.variables?.BASE_URL?.currentValue || this.props.environment?.variables?.BASE_URL?.initialValue || ''
            }
            updatedUri={this.props.endpointContent?.data?.updatedUri}
            set_host_uri={this.setHostUri.bind(this)}
            set_base_url={this.setBaseUrl.bind(this)}
            props_from_parent={this.propsFromChild.bind(this)}
          />
        </div>
      </div>
    )
  }

  renderDocViewOperations() {
    const endpoints = this.props.endpointContent
    const endpointss = this.props.pages[this.endpointId]
    // const endpointPublish = this.props.endpoints
    const endpointId = this.endpointId
    if (isDashboardRoute(this.props) && this.props?.endpointContent?.currentView === 'doc' && endpointss) {
      const approvedOrRejected = isStateApproved(endpointId, endpointss) || isStateReject(this.endpointId, endpointss)
      const isPublicEndpoint = endpointss?.isPublished
      return (
        <div>
          {isStatePending(endpointId, endpointss) && isAdmin() && (
            <ApproveRejectEntity {...this.props} entity={endpointss} entityId={endpointId} entityName='endpoint' />
          )}
          <button
            id='api_save_btn'
            className={this.state.saveLoader ? 'ml-2 btn btn-outline orange buttonLoader' : 'ml-2 btn btn-outline orange'}
            type='button'
            onClick={() => this.handleSave()}
          >
            {isPublicEndpoint ? 'Save Draft' : 'Save'}
          </button>
          {isAdmin() && !isStatePending(endpointId, endpointss) && (
            <span>
              {' '}
              {approvedOrRejected
                ? this.renderInOverlay(this.renderPublishEndpoint.bind(this), endpointId)
                : this.renderPublishEndpoint(endpointId, endpointss)}
            </span>
          )}
          {isAdmin() && isPublicEndpoint && (
            <span>
              {' '}
              {isStateApproved(endpointId, endpointss)
                ? this.renderInOverlay(this.renderUnPublishEndpoint.bind(this), endpointId)
                : this.renderUnPublishEndpoint(endpointId, endpointss)}
            </span>
          )}
          {!isAdmin() && (
            <button
              className={'ml-2 ' + (isStateDraft(endpointId, endpointss) ? 'btn btn-outline orange' : 'btn text-link')}
              type='button'
              onClick={() => (isStateDraft(endpointId, endpointss) ? this.handlePublicEndpointState(this.props.pages[endpointId]) : null)}
            >
              {getEntityState(endpointId, endpointss)}
            </button>
          )}
        </div>
      )
    }
  }

  renderInOverlay(method, endpointId) {
    const endpoints = { ...this.props.pages[endpointId] }
    return (
      // <OverlayTrigger overlay={<Tooltip id='tooltip-disabled'>Nothing to publish</Tooltip>}>
      <span className='d-inline-block'>{method(endpointId, endpoints)}</span>
      // </OverlayTrigger>
    )
  }

  handleRemovePublicEndpoint(endpointId) {
    this.setState({ openUnPublishConfirmationModal: true })
  }

  renderUnPublishEndpoint(endpointId, endpointss) {
    return (
      <UnPublishEntityButton
        entity={endpointss}
        entityId={endpointId}
        onUnpublish={() => this.handleRemovePublicEndpoint(endpointId)}
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
    return (
      this.state.openPublishConfirmationModal && (
        <ConfirmationModal
          show={this.state.openPublishConfirmationModal}
          onHide={() => this.setState({ openPublishConfirmationModal: false })}
          proceed_button_callback={this.handleApproveEndpointRequest.bind(this)}
          title={msgText.publishEndpoint}
          submitButton='Publish'
          rejectButton='Discard'
        />
      )
    )
  }

  renderUnPublishConfirmationModal() {
    return (
      this.state.openUnPublishConfirmationModal && (
        <ConfirmationModal
          show={this.state.openUnPublishConfirmationModal}
          onHide={() => this.setState({ openUnPublishConfirmationModal: false })}
          proceed_button_callback={this.handleRejectEndpointRequest.bind(this)}
          title={msgText.unpublishEndpoint}
          submitButton='UnPublish'
          rejectButton='Discard'
        />
      )
    )
  }

  async handleApproveEndpointRequest() {
    const endpointId = this.endpointId
    this.setState({ publishLoader: true })
    if (sensitiveInfoFound(this.props?.endpointContent)) {
      this.setState({ warningModal: true })
    } else {
      this.props.approve_endpoint(endpointId, () => {
        this.setState({ publishLoader: false })
      })
    }
  }

  async handleRejectEndpointRequest() {
    const endpoints = this.props.endpoints[this.endpointId]
    this.setState({ publishLoader: true })
    if (sensitiveInfoFound(this.props?.endpointContent)) {
      this.setState({ warningModal: true })
    } else {
      this.props.unPublish_endpoint(endpoints, () => {
        this.setState({ publishLoader: false })
      })
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
        onHide={() => {
          this.setState({ warningModal: false, publishLoader: false })
        }}
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
        {this.isDashboardAndTestingView() ? (
          this.props.location.pathname.split('/')[5] !== 'new' ? (
            <Dropdown as={ButtonGroup}>
              <button id='api_save_btn' className={this.state.saveLoader ? 'btn btn-outline orange buttonLoader d-flex align-items-center' : 'btn btn-outline orange d-flex align-items-center'} type='button' onClick={() => this.handleSave()}>
                <LiaSaveSolid size={18} className='mr-1' />
                <span>Save</span>
              </button>
              {getCurrentUser() ? (
                <>
                  <Dropdown.Toggle className='btn-outline' split variant='' />
                  <Dropdown.Menu className=''>
                    <Dropdown.Item
                      onClick={() =>
                        this.setState({ saveAsFlag: true }, () => {
                          this.openEndpointFormModal()
                        })
                      }
                    >
                      Save As
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </>
              ) : null}
            </Dropdown>
          ) : (
            <button
              className={this.state.saveLoader ? 'btn btn-outline orange buttonLoader' : 'btn btn-outline orange'}
              type='button'
              id='save-endpoint-button'
              onClick={() => this.handleSave()}
            >
              Save
            </button>
          )
        ) : null}
      </div>
    )
  }

  responseToggle() {
    return JSON.parse(window.localStorage.getItem('right'))
  }

  renderCodeTemplate() {
    const shouldShowCodeTemplate = (this.isDashboardAndTestingView(this.props, 'testing') && this.props.curlSlider && this.props.match.params.endpointId) || isOnPublishedPage(this.props);
    const harObjectExists = !!this.props?.endpointContent?.harObject;

    if (shouldShowCodeTemplate && harObjectExists) {
      const commonProps = {
        show: true,
        ...this.props,
        onHide: () => { this.setState({ showCodeTemplate: false }); },
        editorToggle: () => { this.setState({ codeEditorVisibility: !this.state.codeEditorVisibility }); },
        harObject: this.props?.endpointContent?.harObject,
        title: 'Generate Code Snippets',
        publicCollectionTheme: this.props?.publicCollectionTheme,
        updateCurlSlider: this.props.update_curl_slider
      };

      if (this.isDashboardAndTestingView(this.props, 'testing')) {
        return <CodeTemplate {...commonProps} showClosebtn={true} theme={'light'} />;
      } else {
        return <CodeTemplate {...commonProps} />;
      }
    }
  }

  render() {
    if (this.props?.endpointContentLoading) {
      return (
        <>
          <div>
            <div className='loading'>
              <div className='box bg'></div>
              <div className='d-flex align-items-center justify-content-between mt-3'>
                <div>
                  <div className='new bg rounded-1'></div>
                  <div className='live bg mt-1'></div>
                </div>
                <div className='new bg rounded-1'></div>
              </div>
              <div className='d-flex align-items-center gap-3 mt-2'>
                <div className='api-call bg rounded-1'></div>
                <div className='bg send rounded-1'></div>
              </div>
              <div className='boxes mt-4 bg rounded-1'></div>
              <div className='bulk-edit bg mt-2 rounded-1'></div>
              <div className='path-var mt-2 bg rounded-1'></div>
              <div className='bulk-edit bg mt-2 rounded-1'></div>
              <div className='d-flex align-items-center justify-content-between mt-4'>
                <div className='response bg rounded-1'></div>
                <div className='d-flex align-items-center gap-2'>
                  <div className='min-box bg rounded-1'></div>
                  <div className='min-box bg rounded-1'></div>
                </div>
              </div>
              <div className='hit-send bg mt-3 rounded-1'></div>
            </div>
          </div>
        </>
      )
    }
    this.endpointId = this.props.endpointId
      ? this.props.endpointId
      : isDashboardRoute(this.props)
        ? this.props.location.pathname.split('/')[5]
        : this.props.location.pathname.split('/')[4]

    if (this.props.save_endpoint_flag && this.props.tab.id === this.props.selected_tab_id) {
      this.props.handle_save_endpoint(false)
      this.handleSave()
    }

    const { theme, codeEditorVisibility } = this.state
    const { responseView } = this.props
    return (isDashboardRoute(this.props) && this.props?.endpointContent?.currentView) ||
      !isDashboardRoute(this.props) ||
      !isSavedEndpoint(this.props) ? (
      <div
        ref={this.myRef}
        className={
          !this.isNotDashboardOrDocView()
            ? ''
            : codeEditorVisibility
              ? 'mainContentWrapperPublic hideCodeEditor'
              : 'mainContentWrapperPublic '
        }
      >
        <div
          onClick={this.closeChatBotModal}
          className={this.isNotDashboardOrDocView() ? 'mainContentWrapper dashboardPage' : 'mainContentWrapper'}
        >
          <div className={`innerContainer ${responseView === 'right' ? 'response-right' : 'response-bottom'}`}>
            <div
              className={`hm-endpoint-container mid-part endpoint-container ${this.props?.endpointContent?.currentView === 'doc' ? 'doc-fix-width' : ''
                }`}
            >
              {this.renderCookiesModal()}
              {this.renderDefaultViewConfirmationModal()}
              {this.renderPublishConfirmationModal()}
              {this.renderUnPublishConfirmationModal()}
              {this.renderWarningModal()}
              {this.state.showLoginSignupModal && (
                <LoginSignupModal show onHide={() => this.closeLoginSignupModal()} title='Save Endpoint' />
              )}
              {getCurrentUser() ? (
                <>
                  {isDashboardRoute(this.props) && (
                    <div className='hm-panel'>
                      <div className='d-flex justify-content-between'>
                        {this.renderToggleView()}
                        {this.renderDocViewOperations()}
                      </div>
                      <div className='position-relative top-part'>
                        {this.state.showEndpointFormModal && (
                          <SaveAsSidebar
                            {...this.props}
                            onHide={() => this.closeEndpointFormModal()}
                            name={this.props.endpointContent.data.name}
                            description={this.props.endpointContent.data.description}
                            save_endpoint={this.handleSave.bind(this)}
                            saveAsLoader={this.state.saveAsLoader}
                            endpointContent={this.props?.endpointContent}
                          />
                        )}
                        {this.isDashboardAndTestingView() && (
                          <DisplayDescription
                            {...this.props}
                            endpoint={this.state.endpoint}
                            data={this.state.data}
                            old_description={this.state.oldDescription}
                            props_from_parent={this.propsFromDescription.bind(this)}
                            alterEndpointName={(name) => this.alterEndpointName(name)}
                          />
                        )}
                        {this.renderSaveButton()}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
              <div className={'clear-both ' + (this.props?.endpointContent?.currentView === 'doc' ? 'doc-view' : 'testing-view')}>
                <div className='endpoint-header'>
                  {this.isNotDashboardOrDocView() && (
                    <div className='endpoint-name-container d-flex justify-content-between'>
                      {this.isNotDashboardOrDocView() && (
                        <>
                          <h1 className='endpoint-title'>{this.props?.endpointContent?.data?.name || ''}</h1>
                          {!isDashboardRoute(this.props) && (
                            <div className='request-button'>
                              <button
                                className={
                                  this.state.loader
                                    ? 'btn custom-theme-btn btn-lg buttonLoader'
                                    : 'btn btn-lg custom-theme-btn px-md-4 px-3'
                                }
                                style={{ background: theme }}
                                type='submit'
                                id='send-request-button'
                                onClick={() => this.handleSend()}
                              >
                                TRY
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className={this.isNotDashboardOrDocView() ? 'hm-panel' : 'hm-panel'}>
                  {this.isDashboardAndTestingView() && (
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
                  )}
                  {isElectron() && (
                    <div className='ssl-mode-toggle cursor-pointer' onClick={() => this.setSslMode()}>
                      SSL certificate verification {this.state.sslMode ? <span className='enabled'>enabled</span> : <span>disabled</span>}{' '}
                    </div>
                  )}
                  <div className={this.isDashboardAndTestingView() ? 'endpoint-headers-container d-flex' : 'hm-public-endpoint-headers'}>
                    <div className='main-table-wrapper'>
                      {this.isDashboardAndTestingView() ? (
                        <div className='d-flex justify-content-between align-items-center'>
                          <div className='headers-params-wrapper custom-tabs'>
                            <ul className='nav nav-tabs' id='pills-tab' role='tablist'>
                              <li className='nav-item'>
                                <a
                                  className={this.setAuthorizationTab ? 'nav-link ' : 'nav-link active'}
                                  id='pills-params-tab'
                                  data-toggle='pill'
                                  href={`#params-${this.props.tab.id}`}
                                  role='tab'
                                  aria-controls={`params-${this.props.tab.id}`}
                                  aria-selected={this.setAuthorizationTab ? 'false' : 'true'}
                                >
                                  Params
                                </a>
                              </li>
                              <li className='nav-item'>
                                <a
                                  className={this.setAuthorizationTab ? 'nav-link active' : 'nav-link '}
                                  id='pills-authorization-tab'
                                  data-toggle='pill'
                                  href={`#authorization-${this.props.tab.id}`}
                                  role='tab'
                                  aria-controls={`authorization-${this.props.tab.id}`}
                                  aria-selected={this.setAuthorizationTab ? 'true' : 'false'}
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
                                {getCurrentUser() && (
                                  <a className='nav-link' onClick={() => this.setState({ showCookiesModal: true })}>
                                    Cookies
                                  </a>
                                )}
                              </li>
                            </ul>
                          </div>
                        </div>
                      ) : null}
                      {this.isDashboardAndTestingView() ? (
                        <div className='tab-content' id='pills-tabContent'>
                          <div
                            className={this.setAuthorizationTab ? 'tab-pane fade' : 'tab-pane fade show active'}
                            id={`params-${this.props.tab.id}`}
                            role='tabpanel'
                            aria-labelledby='pills-params-tab'
                          >
                            {this.renderParams()}
                            <div>{this.renderPathVariables()}</div>
                          </div>
                          <div
                            className={this.setAuthorizationTab ? 'tab-pane fade show active' : 'tab-pane fade '}
                            id={`authorization-${this.props.tab.id}`}
                            role='tabpanel'
                            aria-labelledby='pills-authorization-tab'
                          >
                            <div>
                              <Authorization
                                {...this.props}
                                set_authorization_headers={this.setHeaders.bind(this)}
                                set_authoriztaion_params={this.setParams.bind(this)}
                                set_authoriztaion_type={this.setAuthType.bind(this)}
                                handleSaveEndpoint={this.handleSave.bind(this)}
                              />
                            </div>
                          </div>
                          <div
                            className='tab-pane fade'
                            id={`headers-${this.props.tab.id}`}
                            role='tabpanel'
                            aria-labelledby='pills-headers-tab'
                          >
                            <div>{this.renderHeaders()}</div>
                          </div>
                          <div className='tab-pane fade' id={`body-${this.props.tab.id}`} role='tabpanel' aria-labelledby='pills-body-tab'>
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
                                scriptText={this.props?.endpointContent?.preScriptText}
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
                                scriptText={this.props?.endpointContent?.postScriptText}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        this.renderDocView()
                      )}

                      {this.isDashboardAndTestingView() && this.renderScriptError()}
                      {this.displayResponse()}
                    </div>
                  </div>
                </div>
                {!this.isDashboardAndTestingView() && isDashboardRoute(this.props) && (
                  <div className='doc-options d-flex align-items-center'>{this.renderDocViewOptions()}</div>
                )}
              </div>
              {/* <ApiDocReview {...this.props} /> */}
              <span className='footer-upper'>{isOnPublishedPage() && <Footer />}</span>
            </div>

            {this.isDashboardAndTestingView() ? (
              <div className='response-container-main position-relative'>
                <div className='d-flex response-switcher'>
                  {this.renderToggle('bottom')}
                  {this.renderToggle('right')}
                </div>
                {isSavedEndpoint(this.props) ? this.displayResponseAndSampleResponse() : this.displayPublicResponse()}
              </div>
            ) : null}
            {this.renderCodeTemplate()}
          </div>
        </div>
        {this.isDashboardAndTestingView() && (
          <div>
            {this.state.showAskAiSlider && <ChatbotsideBar {...this.props} onHide={() => this.closeChatBotModal()} />}
            <div />
            {/* <div className='ask-ai-btn' onClick={this.toggleChatbotModal}>
              <p>Ask AI</p>
            </div> */}
          </div>
        )}
        <span className='footer-lower'>{isOnPublishedPage() && <Footer />}</span>
      </div>
    ) : null
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withQuery(DisplayEndpoint)))
