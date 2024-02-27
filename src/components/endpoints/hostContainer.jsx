import React, { Component } from 'react'
import { isDashboardRoute } from '../common/utility'
import tabStatusTypes from '../tabs/tabStatusTypes'
import { publishData } from '../modals/redux/modalsActions'
import './endpoints.scss'
import parseCurl from 'parse-curl'
import { withRouter } from 'react-router-dom'
import { updateTab } from '../tabs/redux/tabsActions'
import { unescape } from 'lodash'
import { connect } from 'react-redux'
import _ from 'lodash'

const hostContainerEnum = {
  hosts: {
    // customHost: { key: 'customHost', label: 'Custom Host' },
    environmentHost: { key: 'environmentHost', label: 'Environment Host' },
    versionHost: { key: 'versionHost', label: 'Version Host' }
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    // ON_PUBLISH_DOC: (data) => dispatch(publishData(data))
  }
}

const mapStateToProps = (state) => {
  return {
    modals: state.modals,
    endpoints: state.endpoints,
    environment: state.environment.environments[state.environment.currentEnvironmentId] || { id: null, name: 'No Environment' },
    currentEnvironmentId: state.environment.currentEnvironmentId
  }
}
class HostContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      datalistHost: this.props?.endpointContent?.host?.BASE_URL || '',
      datalistUri: '',
      // customHost: '',
      environmentHost: '',
      versionHost: '',
      selectedHost: '',
      groupId: null,
      versionId: null,
      isCurl: false
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
    if (
      prevProps.environmentHost !== this.props.environmentHost ||
      prevProps.versionHost !== this.props.versionHost
      // prevProps.customHost !== this.props.customHost
    ) {
      this.setHosts()
    }
    if (prevProps.updatedUri !== this.props.updatedUri) {
      this.setState({ datalistUri: this.props.updatedUri })
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
    // if (this.state.selectedHost === 'customHost' || this.state.customHost) return 'customHost'
    if (this.state.environmentHost) return 'environmentHost'
    if (this.state.versionHost) return 'versionHost'
    return selectedHost
  }

  fetchPublicEndpointHost() {
    this.props.set_base_url(this.state.datalistHost)
    return null
  }

  // handleInputHostChange(e) {
  //   const data = this.splitUrlHelper(e)
  //   this.setState(
  //     {
  //       ...data,
  //       showDatalist: e.target.value === ''
  //     },
  //     () => {
  //       this.props.props_from_parent('HostAndUri')
  //       this.setParentHostAndUri()
  //     }
  //   )
  // }
  handleInputHostChange(e) {
    const inputValue = e.target.value
    if (inputValue.trim().startsWith('curl ')) {
      this.setState({ isCurl: true })
      try {
        const modifiedCurlCommand = decodeURIComponent(inputValue.replace(/\\/g, ''))

        const parsedData = parseCurl(modifiedCurlCommand)

        const data = this.splitUrlHelper(parsedData.url)
        this.props.handleHeadersValue(parsedData)
        this.props.handleMethodChange(parsedData)
        // this.props.handleInputValue(parsedData)
        this.setState(
          {
            ...data,
            datalistHost: parsedData.url
          },
          () => {
            // this.props.tab.state
            this.props.props_from_parent('HostAndUri')
            this.setParentHostAndUri()
          }
        )
      } catch (error) {
        console.error('Error parsing cURL command:', error)
      }
    } else {
      this.setState({ isCurl: false })
      const data = this.splitUrlHelper(e)
      this.setState(
        {
          ...data,
          showDatalist: inputValue === ''
        },
        () => {
          this.props.props_from_parent('HostAndUri')
          this.setParentHostAndUri()
        }
      )
    }
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
    const { environmentHost, versionHost } = this.state
    if (value?.match(variableRegex)) {
      return value.match(variableRegex)[0]
    }
    if (environmentHost && value.match(new RegExp('^' + environmentHost) + '/')) {
      return environmentHost
    }

    if (versionHost && value.match(new RegExp('^' + versionHost + '/'))) {
      return versionHost
    }
    if (value.match(regex)) {
      return value.match(regex)[0]
    }
    return null
  }

  splitUrlHelper(e) {
    let value = ''
    if (this.state.isCurl) {
      value = e
    } else {
      value = e.target.value
    }
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
    if (hostname === this.state.versionHost) return 'versionHost'
    // return 'customHost'
  }

  setHosts() {
    const { versionHost, environmentHost } = this.props
    this.setState({ versionHost, environmentHost }, () => {
      this.setHostAndUri()
    })
  }

  renderHostDatalist() {
    const endpointId = this.props.endpointId
    return (
      <div className='url-container' key={`${endpointId}_hosts`} ref={this.wrapperRef}>
        <input
          id='host-container-input'
          className='form-control'
          value={this.state.datalistHost + this.state.datalistUri}
          // name={`${endpointId}_hosts`}
          name={`${this.props?.endpointContent}_hosts`}
          // name='hello'
          placeholder='Enter Request URL'
          onChange={(e) => this.handleInputHostChange(e)}
          autoComplete='off'
          onFocus={() =>
            this.setState({ showDatalist: true }, () => {
              document.addEventListener('mousedown', this.handleClickOutside)
            })
          }
        />
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
        disabled
        className='form-control'
        value={this.props?.endpointContent?.host?.BASE_URL + this.props?.endpointContent?.data?.updatedUri}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HostContainer))
