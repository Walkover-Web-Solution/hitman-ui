import React, { Component } from 'react'
import { isDashboardRoute } from '../common/utility'
import tabStatusTypes from '../tabs/tabStatusTypes'
import tabService from '../tabs/tabService'
import './endpoints.scss'
import { connect } from 'react-redux'
import _, { cloneDeep } from 'lodash'
import { getParseCurlData } from '../common/apiUtility'
import URI from 'urijs'
import { toast } from 'react-toastify'
import { contentTypesEnums } from '../common/bodyTypeEnums'
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

const hostContainerEnum = {
  hosts: {
    environmentHost: { key: 'environmentHost', label: 'Environment Host' }
  }
}

const mapStateToProps = (state) => {
  return {
    modals: state.modals,
    tabs: state?.tabs
  }
}
class HostContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      datalistHost: this.props?.endpointContent?.host?.BASE_URL,
      datalistUri: '',
      // customHost: '',
      environmentHost: '',
      selectedHost: '',
      showIcon: true,
    }
    this.wrapperRef = React.createRef()
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  handleClickOutside(event) {
    if ((this.state.showDatalist || this.state.showInputHost) && this.wrapperRef && !this.wrapperRef.current?.contains(event.target)) {
      document.removeEventListener('mousedown', this.handleClickOutside)
      this.setState({ showDatalist: false, showInputHost: false })
    }
    // this.props.ON_PUBLISH_DOC(false)
  }

  componentDidMount() {
    this.setHosts()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.environmentHost !== this.props.environmentHost) {
      this.setHosts()
    }
    if (!_.isEqual(prevProps.updatedUri, this.props.updatedUri)) {
      this.setState({ datalistUri: this.props.updatedUri })
    }
    if (!_.isEqual(prevProps?.endpointContent?.host?.BASE_URL, this.props?.endpointContent?.host?.BASE_URL)) {
      this.setState({ datalistHost: this.props?.endpointContent?.host?.BASE_URL })
    }
  }

  setHostAndUri() {
    const endpointUri = this.props?.updatedUri || ''
    const topPriorityHost = this.customFindTopPriorityHost()
    const selectedHost = topPriorityHost
    const host = this.props?.endpointContent?.host?.BASE_URL || this.state[selectedHost] || this.state?.datalistHost || ''
    this.setState({ datalistUri: endpointUri, datalistHost: host, selectedHost }, () => this.setParentHostAndUri())
  }

  setParentHostAndUri() {
    this.props.set_host_uri(this.state.datalistHost, this.state.datalistUri, this.state.selectedHost)
  }

  customFindTopPriorityHost() {
    const selectedHost = ''
    if (this.state.environmentHost) return 'environmentHost'
    return selectedHost
  }

  fetchPublicEndpointHost() {
    this.props.set_base_url(this.state.datalistHost)
    return null
  }

  getDataFromParsedData(untitledEndpointData, parsedData) {
    let e = {}
    e['url'] = parsedData.raw_url
    parsedData = cloneDeep(parsedData)
    untitledEndpointData = cloneDeep(untitledEndpointData)
    untitledEndpointData.data.name = this.props.endpointContent?.data?.name || 'Untitled'
    untitledEndpointData.currentView = this.props.endpointContent?.currentView || 'testing'
    let data = this.splitUrlHelper(e)
    // setting method, url and host
    untitledEndpointData.data.method = parsedData?.method.toUpperCase()
    untitledEndpointData.data.uri = data?.datalistUri
    untitledEndpointData.data.updatedUri = data?.datalistUri
    untitledEndpointData.host = {
      BASE_URL: data?.datalistHost,
      selectedHost: ''
    }

    if (parsedData.auth_type == 'basic') {
      untitledEndpointData.authorizationData.authorizationTypeSelected = `${parsedData.auth_type}Auth`
    } else {
      untitledEndpointData.authorizationData.authorizationTypeSelected = parsedData.auth_type
    }
    untitledEndpointData.authorizationData.authorization = parsedData.auth

    // setting path variables
    let path = new URI(parsedData.raw_url)
    let queryParams = path.query(true)
    path = path.pathname()
    const pathVariableKeys = path
      .split('/')
      .filter((part) => part.startsWith(':'))
      .map((key) => key.slice(1))
    for (let i = 0; i < pathVariableKeys.length; i++) {
      let eachData = {
        checked: 'true',
        value: '',
        description: '',
        key: pathVariableKeys[i]
      }
      untitledEndpointData.pathVariables.push(eachData)
    }

    if (parsedData?.data) {
      // if content-type is json then value is added json stringified and body description is specially handled
      // parsedData.data is in the format of json string then convert it to object format
      try {
        parsedData.data = JSON.parse(parsedData.data)
      } catch (e) { }
      const contentType = (parsedData.headers?.['Content-Type'] || parsedData.headers?.['content-type'])?.toLowerCase()
      if (contentType.includes('application/json')) {
        /* contentType = 'application/json' */
        untitledEndpointData.data.body.type = contentTypesEnums[contentType]
        untitledEndpointData.data.body.raw.rawType = contentTypesEnums[contentType]
        untitledEndpointData.data.body.raw.value = typeof parsedData.data === 'object' ? JSON.stringify(parsedData.data) : parsedData.data
        // setting body description
        untitledEndpointData.bodyDescription = {
          payload: {
            value: {},
            type: 'object',
            description: ''
          }
        }

        for (let key in parsedData.data) {
          untitledEndpointData.bodyDescription.payload.value[key] = {
            value: parsedData.data[key],
            type: 'string',
            description: ''
          }
        }
      }
      // setting data for all the rawTypes defined except JSON
      else if (contentType && contentTypesEnums[contentType]) {
        untitledEndpointData.data.body.type = contentTypesEnums[contentType]
        untitledEndpointData.data.body.raw.rawType = contentTypesEnums[contentType]
        untitledEndpointData.data.body.raw.value = typeof parsedData.data === 'object' ? JSON.stringify(parsedData.data) : parsedData.data
      } else {
        // setting data for 'multipart/form-data' or url-encodeded
        if (!parsedData.headers) {
          parsedData.headers = {}
        }
        parsedData.headers['Content-Type'] = !parsedData.headers?.['Content-Type']
          ? parsedData.headers?.['content-type']
          : parsedData.headers?.['Content-Type']
        let bodyType = (untitledEndpointData.data.body.type = !parsedData.headers?.['Content-Type']
          ? 'multipart/form-data'
          : parsedData.headers?.['Content-Type'] || 'application/x-www-form-urlencoded')

        // 'multipart/form-data' and 'application/x-www-form-urlencoded' both contains body values description
        if (typeof parsedData.data === 'string') {
          let keyValuePairs = parsedData.data.split('&')
          let keys = []
          let values = []
          keyValuePairs.forEach((pair) => {
            let [key, value] = pair.split('=')
            keys.push(key)
            values.push(value)
          })
          for (let key in values) {
            let eachData = {
              checked: 'true',
              key: keys[key],
              value: values[key],
              description: '',
              type: 'text'
            }
            untitledEndpointData.data.body[bodyType].push(eachData)
          }
          untitledEndpointData.data.body[bodyType].push(...untitledEndpointData.data.body[bodyType].splice(0, 1))
        }
      }
    }

    // setting headers
    for (let key in parsedData?.headers) {
      let eachDataOriginal = {
        checked: 'true',
        value: parsedData.headers[key],
        description: '',
        key: key
      }
      untitledEndpointData.originalHeaders.push(eachDataOriginal)
    }
    untitledEndpointData.originalHeaders.push(...untitledEndpointData.originalHeaders.splice(0, 1))

    // setting query params
    for (let key in queryParams) {
      let eachDataOriginal = {
        checked: 'true',
        value: queryParams[key],
        description: '',
        key: key
      }
      untitledEndpointData.originalParams.push(eachDataOriginal)
    }
    untitledEndpointData.originalParams.push(...untitledEndpointData.originalParams.splice(0, 1))

    this.props.setQueryUpdatedData(untitledEndpointData)
    tabService.markTabAsModified(this.props.tabs.activeTabId)
  }

  async handleInputHostChange(e) {
    let inputValue = e.target.value

    if (inputValue.trim().startsWith('curl')) {
      try {
        let modifiedCurlCommand = inputValue
        if (modifiedCurlCommand.includes('--url')) {
          modifiedCurlCommand = modifiedCurlCommand.replace('--url', ' ')
        }
        let parsedData = await getParseCurlData(modifiedCurlCommand)
        parsedData = JSON.parse(parsedData.data)
        // Remove any occurrence of 'http://' followed by a space
        parsedData.url = parsedData.url.replace(/^http:\/\/\s/, '')
        // Check if 'http://' or 'https://' appears twice and correct it
        parsedData.url = parsedData.url.replace(/^(http:\/\/https?:\/\/)/, '$2')
        parsedData.raw_url = parsedData.raw_url.replace(/^http:\/\/\s/, '')
        parsedData.raw_url = parsedData.raw_url.replace(/^(http:\/\/https?:\/\/)/, '$2')
        this.getDataFromParsedData(this.props.untitledEndpointData, parsedData)
        return
      } catch (e) {
        toast.error('could not parse the curl')
      }
    }
    const data = this.splitUrlHelper(e)
    this.setState(
      {
        ...data,
        showDatalist: e.target.value === ''
      },
      () => {
        this.props.props_from_parent('HostAndUri')
        this.setParentHostAndUri()
      }
    )
  }

  handleClickHostOptions(host, type) {
    this.setState(
      {
        datalistHost: host || this.props?.endpointContent?.host?.BASE_URL,
        showDatalist: false,
        selectedHost: type,
        Flag: true
      },
      () => this.setParentHostAndUri()
    )
  }

  checkExistingHosts(value) {
    const regex = /^((http[s]?|ftp):\/\/[\w.\-@:]*)/i
    const variableRegex = /^{{[\w|-]+}}/i
    const { environmentHost } = this.state
    if (value?.match(variableRegex)) {
      return value.match(variableRegex)[0]
    }
    if (environmentHost && value?.match(new RegExp('^' + environmentHost) + '/')) {
      return environmentHost
    }
    if (value?.match(regex)) {
      return value.match(regex)[0]
    }
    return null
  }

  splitUrlHelper(e) {
    const value = e?.target?.value || e?.url || ''
    const hostName = this.checkExistingHosts(value)
    let uri = ''
    const data = {
      datalistHost: '',
      datalistUri: '',
      selectedHost: '',
      Flag: true
    }
    if (hostName) {
      const selectedHost = this.selectCurrentHost(hostName)
      // if (selectedHost === 'customHost') data.customHost = hostName
      data.datalistHost = hostName
      data.selectedHost = selectedHost
      uri = value.replace(hostName, '')
    } else {
      // data.selectedHost = 'customHost'
      uri = value
    }
    data.datalistUri = uri
    return data
  }

  selectCurrentHost(hostname) {
    // if (hostname === this.state.customHost) return 'customHost'
    if (hostname === this.state.environmentHost) return 'environmentHost'
    return 'environmentHost'
  }

  setHosts() {
    const { environmentHost } = this.props
    this.setState({ environmentHost }, () => {
      this.setHostAndUri()
    })
  }

  renderHostDatalist() {
    const endpointId = this.props.endpointId
    const { showIcon } = this.state;
    return (
      <div className='url-container' key={`${endpointId}_hosts`} ref={this.wrapperRef}>
        <input
          id='host-container-input'
          className='form-control'
          // value={(this.props?.endpointContent?.host?.BASE_URL ?? '') + (this.props?.endpointContent?.data?.updatedUri ?? '') ?? ''}  ? to resolve later
          value={(this.state?.datalistHost ?? '') + (this.state?.datalistUri ?? '') ?? ''}
          name={`${endpointId}_hosts`}
          placeholder='Enter URL or paste cURL'
          onChange={(e) => this.handleInputHostChange(e)}
          autoComplete='off'
          onFocus={() =>
            this.setState({ showDatalist: true, showIcon: false }, () => {
              document.addEventListener('mousedown', this.handleClickOutside);
            })
          }
          onBlur={() => this.setState({ showIcon: true })}
        />
        {showIcon && <div className='position-relative url-icons'> <HiOutlineExclamationCircle size={20} className='invalid-icon' />
          <span className='position-absolute'>URL cannot be empty</span>
        </div>}
        <div className={['host-data', this.state.showDatalist ? 'd-block' : 'd-none'].join(' ')}>
          {Object.values(hostContainerEnum.hosts).map(
            (host, index) =>
              this.state[host.key] && (
                <div key={index} className='host-data-item' onClick={(e) => this.handleClickHostOptions(this.state[host.key], host.key)}>
                  <div>{this.state[host.key]}</div>
                  <small className='text-muted font-italic'>{host.label}</small>
                </div>
              )
          )}
        </div>
      </div>
    )
  }

  renderPublicHost() {
    return (
      <input
        type="text"
        aria-label="Search"
        disabled
        className='form-control'
        value={(this.props?.endpointContent?.host?.BASE_URL ?? '') + (this.props?.endpointContent?.data?.updatedUri ?? '') ?? ''}
      />
    )
  }

  render() {
    if (isDashboardRoute(this.props) && this.state.groupId && this.props.tab.status === tabStatusTypes.DELETED) {
      this.setState({ groupId: null })
    }
    if (isDashboardRoute(this.props)) {
      return this.renderHostDatalist()
    } else {
      return this.renderPublicHost()
    }
  }
}

export default connect(mapStateToProps)(HostContainer)
