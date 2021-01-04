import React, { Component } from 'react'
import { toast } from 'react-toastify'
import store from '../../store/store'
import { isDashboardRoute } from '../common/utility'
import tabService from '../tabs/tabService'
import tabStatusTypes from '../tabs/tabStatusTypes'
import './endpoints.scss'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
class HostContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedHost: 'customHost',
      customHost: '',
      data: {
        requestType: 'GET',
        uri: '',
        updatedUri: ''
      },
      methodList: ['GET', 'POST', 'PUT', 'DELETE'],
      groupId: null,
      versionId: null
    }
  }

  componentDidMount () {
    const selectedHost = this.findTopPriorityHost()
    this.setState({ selectedHost })
    const unsubscribe = store.subscribe(() => {
      if (this.props.currentEnvironmentId) {
        if (Object.keys(this.props.environments).length) {
          const selectedHost = this.findTopPriorityHost()
          this.setState({ selectedHost })
          unsubscribe()
        }
      } else {
        unsubscribe()
      }
    })
  }

  findTopPriorityHost () {
    let selectedHost = 'customHost'
    if (this.props.custom_host) {
      selectedHost = 'customHost'
    } else if (
      this.props.environment &&
      this.props.environment.variables &&
      this.props.environment.variables.BASE_URL
    ) {
      selectedHost = 'environmentHost'
    } else if (this.state.groupId) {
      if (this.props.groups[this.state.groupId]?.host) {
        selectedHost = 'groupHost'
      } else if (this.props.versions[this.state.versionId]?.host) {
        selectedHost = 'versionHost'
      }
    }
    return selectedHost
  }

  selectHost (host) {
    if (host === 'environmentHost') {
      if (
        this.props.environment &&
        this.props.environment.variables &&
        this.props.environment.variables.BASE_URL
      ) {
        this.setState({ selectedHost: host })
      } else {
        toast.error('Please add BASE_URL variable in current environment')

        this.setState({ selectedHost: 'customHost' })
      }
    } else this.setState({ selectedHost: host })
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id)
    }
  }

  handleChange = (e) => {
    const customHost = e.currentTarget.value
    this.setState({ customHost })
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id)
    }
  };

  fetchHost () {
    if (this.props.historySnapshotFlag) {
      const BASE_URL = this.state.customHost || this.props.custom_host
      this.props.set_base_url(BASE_URL, 'customHost')
      return BASE_URL
    }
    let BASE_URL = ''
    switch (this.state.selectedHost) {
      case 'customHost':
        BASE_URL = this.state.customHost || ''
        break
      case 'environmentHost':
        if (
          this.props.environment &&
          this.props.environment.variables &&
          this.props.environment.variables.BASE_URL
        ) {
          if (
            this.props.environment.variables.BASE_URL.currentValue &&
            this.props.environment.variables.BASE_URL.currentValue.length
          ) {
            BASE_URL = this.props.environment.variables.BASE_URL.currentValue
            break
          } else {
            BASE_URL = this.props.environment.variables.BASE_URL.initialValue
            break
          }
        } else {
          this.setState({ selectedHost: 'customHost' })
          return
        }
      case 'groupHost':
        if (this.props.groups[this.state.groupId]) {
          BASE_URL = this.props.groups[this.state.groupId].host
        }
        break
      case 'versionHost':
        if (this.props.versions[this.state.versionId]) {
          BASE_URL = this.props.versions[this.state.versionId].host
        }
        break
      default:
        break
    }
    this.props.set_base_url(BASE_URL, this.state.selectedHost)
    return BASE_URL
  }

  fetchPublicEndpointHost (props) {
    let HOST_URL = ''
    let endpoint = {}
    const allEndpoints = props.endpoints
    for (endpoint in allEndpoints) {
      if (allEndpoints[endpoint].id === props.match.params.endpointId ||
        (this.props.location.pathname.split('/')[1] === 'admin' &&
          allEndpoints[endpoint].id === this.props.endpointId)) {
        endpoint = allEndpoints[endpoint]
        break
      }
    }
    const groupId = endpoint.groupId
    const endpointUrl = endpoint.BASE_URL
    if (endpointUrl === '' || endpointUrl === null) {
      const group = props.groups[groupId]
      const groupUrl = group.host
      const versionId = group.versionId
      if (groupUrl === '' || groupUrl === null) {
        const version = props.versions[versionId]
        HOST_URL = version.host
      } else {
        HOST_URL = groupUrl
      }
    } else {
      HOST_URL = endpointUrl
    }
    this.props.set_base_url(HOST_URL)
    return null
  }

  chaageHostName (host) {
    switch (host) {
      case 'groupHost':
        return 'Group BASE_URL'
      case 'versionHost':
        return 'Version BASE_URL'
      case 'customHost':
        return 'Custom BASE_URL'
      default:
    }
  }

  render () {
    if (
      isDashboardRoute(this.props) &&
      this.state.groupId &&
      this.props.tab.status === tabStatusTypes.DELETED
    ) {
      this.setState({ groupId: null })
    }

    if (!this.state.groupId && this.props.groupId) {
      const groupId = this.props.groupId
      const versionId = this.props.groups[groupId].versionId
      const customHost = this.props.custom_host
      let selectedHost = null
      if (this.props.custom_host) {
        selectedHost = 'customHost'
      } else if (
        this.props.environment.variables &&
        this.props.environment.variables.BASE_URL
      ) {
        selectedHost = 'environmentHost'
      } else if (this.props.groups[groupId].host) {
        selectedHost = 'groupHost'
      } else {
        selectedHost = 'versionHost'
      }
      this.setState({ groupId, versionId, customHost, selectedHost })
    }
    if (isDashboardRoute(this.props)) {
      return (
        <div className='host-field-container'>
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip id='host'>
                {this.fetchHost() ? this.fetchHost() : this.chaageHostName(this.state.selectedHost)}
              </Tooltip>
            }
          >
            <input
              type='text'
              name='customHost'
              className='form-control'
              value={this.fetchHost()}
              onChange={this.handleChange}
              disabled={this.state.selectedHost !== 'customHost'}
            />
          </OverlayTrigger>
          <div className='dropdown' id='host-select'>
            <button
              className='btn dropdown-toggle'
              type='button'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            />
            <div
              className='dropdown-menu dropdown-menu-right'
              aria-labelledby='dropdownMenuButton'
            >
              {this.props.environment &&
                this.props.environment.variables &&
                this.props.environment.variables.BASE_URL && (
                  <div
                    className='dropdown-item'
                    onClick={() => this.selectHost('environmentHost')}
                  >
                    <div>
                      {this.state.selectedHost === 'environmentHost' && (
                        <i className='fas fa-check' />
                      )}
                      Environment BASE_URL
                    </div>
                  </div>
              )}
              {this.state.groupId &&
                this.props.groups[this.state.groupId] &&
                this.props.groups[this.state.groupId].host && (
                  <div
                    className='dropdown-item'
                    onClick={() => this.selectHost('groupHost')}
                  >
                    <div>
                      {this.state.selectedHost === 'groupHost' && (
                        <i className='fas fa-check' />
                      )}  Group BASE_URL
                    </div>

                  </div>
              )}
              {this.state.groupId && (
                <div
                  className='dropdown-item'
                  onClick={() => this.selectHost('versionHost')}
                >
                  <div>
                    {this.state.selectedHost === 'versionHost' && (
                      <i className='fas fa-check' />
                    )}
                    Version BASE_URL
                  </div>
                </div>
              )}
              <div
                className='dropdown-item'
                id='customHost'
                onClick={() => this.selectHost('customHost')}
              >
                <div>
                  {this.state.selectedHost === 'customHost' && (
                    <i className='fas fa-check' />
                  )}
                  Custom BASE_URL
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        this.fetchPublicEndpointHost(this.props)
      )
    }
  }
}

export default HostContainer
