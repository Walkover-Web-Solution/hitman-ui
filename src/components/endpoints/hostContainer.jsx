import React, { Component } from 'react'
import { isDashboardRoute } from '../common/utility'
import tabStatusTypes from '../tabs/tabStatusTypes'
import './endpoints.scss'

const hostContainerEnum = {
  hosts: {
    customHost: { key: 'customHost', label: 'Custom Host' },
    environmentHost: { key: 'environmentHost', label: 'Environment Host' },
    groupHost: { key: 'groupHost', label: 'Group Host' },
    versionHost: { key: 'versionHost', label: 'Version Host' }
  }
}
class HostContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      datalistHost: '',
      datalistUri: '',
      customHost: '',
      environmentHost: '',
      groupHost: '',
      versionHost: '',
      selectedHost: '',
      groupId: null,
      versionId: null
    }
    this.wrapperRef = React.createRef()
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  handleClickOutside (event) {
    if ((this.state.showDatalist || this.state.showInputHost) && this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      document.removeEventListener('mousedown', this.handleClickOutside)
      this.setState({ showDatalist: false, showInputHost: false })
    }
  }

  componentDidMount () {
    this.setHosts()
    this.setState({ datalistUri: this.props.updatedUri })
    // const unsubscribe = store.subscribe(() => {
    //   if (this.props.currentEnvironmentId) {
    //     if (Object.keys(this.props.environments).length) {
    //       const selectedHost = this.findTopPriorityHost()
    //       this.setState({ selectedHost })
    //       unsubscribe()
    //     }
    //   } else {
    //     unsubscribe()
    //   }
    // })
    this.setState({ datalistHost: this.state[this.state.selectedhost] || '' })
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      prevProps.environmentHost !== this.props.environmentHost ||
      prevProps.groupHost !== this.props.groupHost ||
      prevProps.versionHost !== this.props.versionHost ||
      prevProps.customHost !== this.props.customHost
    ) {
      this.setHosts()
    }
    if (prevProps.updatedUri !== this.props.updatedUri) {
      this.setState({ datalistUri: this.props.updatedUri })
    }
    if (prevState.selectedHost !== this.state.selectedHost) {
      this.setState({ datalistHost: this.state[this.state.selectedHost] || '' })
    }
  }

  setHostAndUri () {
    const endpointUri = this.props.updatedUri || ''
    const host = this.state[this.state.selectedHost] || this.state[this.customFindTopPriorityHost()] || ''
    this.setState({ datalistUri: endpointUri, datalistHost: host }, () => this.setParentHostAndUri())
  }

  setParentHostAndUri () {
    this.props.set_host_uri(this.state.datalistHost, this.state.datalistUri, this.state.selectedHost)
  }

  // findTopPriorityHost () {
  //   let selectedHost = 'customHost'
  //   if (this.props.custom_host) {
  //     selectedHost = 'customHost'
  //   } else if (
  //     this.props.environment &&
  //     this.props.environment.variables &&
  //     this.props.environment.variables.BASE_URL
  //   ) {
  //     selectedHost = 'environmentHost'
  //   } else if (this.state.groupId) {
  //     if (this.props.groups[this.state.groupId]?.host) {
  //       selectedHost = 'groupHost'
  //     } else if (this.props.versions[this.state.versionId]?.host) {
  //       selectedHost = 'versionHost'
  //     }
  //   }
  //   return selectedHost
  // }

  customFindTopPriorityHost () {
    const selectedHost = ''
    if (this.state.customHost) return 'customHost'
    if (this.state.environmentHost) return 'environmentHost'
    if (this.state.groupHost) return 'groupHost'
    if (this.state.versionHost) return 'versionHost'
    return selectedHost
  }

  // selectHost (host) {
  //   if (host === 'environmentHost') {
  //     if (
  //       this.props.environment &&
  //       this.props.environment.variables &&
  //       this.props.environment.variables.BASE_URL
  //     ) {
  //       this.setState({ selectedHost: host })
  //     } else {
  //       toast.error('Please add BASE_URL variable in current environment')

  //       this.setState({ selectedHost: 'customHost' })
  //     }
  //   } else this.setState({ selectedHost: host })
  //   if (isDashboardRoute(this.props)) {
  //     tabService.markTabAsModified(this.props.tab.id)
  //   }
  // }

  // handleChange = (e) => {
  //   const customHost = e.currentTarget.value
  //   this.setState({ customHost })
  //   if (isDashboardRoute(this.props)) {
  //     tabService.markTabAsModified(this.props.tab.id)
  //   }
  // };

  // fetchHost () {
  //   if (this.props.historySnapshotFlag) {
  //     const BASE_URL = this.state.customHost || this.props.custom_host
  //     this.props.set_base_url(BASE_URL, 'customHost')
  //     return BASE_URL
  //   }
  //   let BASE_URL = ''
  //   switch (this.state.selectedHost) {
  //     case 'customHost':
  //       BASE_URL = this.state.customHost || ''
  //       break
  //     case 'environmentHost':
  //       if (
  //         this.props.environment &&
  //         this.props.environment.variables &&
  //         this.props.environment.variables.BASE_URL
  //       ) {
  //         if (
  //           this.props.environment.variables.BASE_URL.currentValue &&
  //           this.props.environment.variables.BASE_URL.currentValue.length
  //         ) {
  //           BASE_URL = this.props.environment.variables.BASE_URL.currentValue
  //           break
  //         } else {
  //           BASE_URL = this.props.environment.variables.BASE_URL.initialValue
  //           break
  //         }
  //       } else {
  //         this.setState({ selectedHost: 'customHost' })
  //         return
  //       }
  //     case 'groupHost':
  //       if (this.props.groups[this.state.groupId]) {
  //         BASE_URL = this.props.groups[this.state.groupId].host
  //       }
  //       break
  //     case 'versionHost':
  //       if (this.props.versions[this.state.versionId]) {
  //         BASE_URL = this.props.versions[this.state.versionId].host
  //       }
  //       break
  //     default:
  //       break
  //   }
  //   this.props.set_base_url(BASE_URL, this.state.selectedHost)
  //   return BASE_URL
  // }

  // fetchPublicEndpointHost (props) {
  //   let HOST_URL = ''
  //   let endpoint = {}
  //   const allEndpoints = props.endpoints
  //   for (endpoint in allEndpoints) {
  //     if (allEndpoints[endpoint].id === props.match.params.endpointId ||
  //       (this.props.location.pathname.split('/')[1] === 'admin' &&
  //         allEndpoints[endpoint].id === this.props.endpointId)) {
  //       endpoint = allEndpoints[endpoint]
  //       break
  //     }
  //   }
  //   const groupId = endpoint.groupId
  //   const endpointUrl = endpoint.BASE_URL
  //   if (endpointUrl === '' || endpointUrl === null) {
  //     const group = props.groups[groupId]
  //     const groupUrl = group.host
  //     const versionId = group.versionId
  //     if (groupUrl === '' || groupUrl === null) {
  //       const version = props.versions[versionId]
  //       HOST_URL = version.host
  //     } else {
  //       HOST_URL = groupUrl
  //     }
  //   } else {
  //     HOST_URL = endpointUrl
  //   }
  //   this.props.set_base_url(HOST_URL)
  //   return null
  // }

  fetchPublicEndpointHost () {
    this.props.set_base_url(this.state.datalistHost)
    return null
  }

  // chaageHostName (host) {
  //   switch (host) {
  //     case 'groupHost':
  //       return 'Group BASE_URL'
  //     case 'versionHost':
  //       return 'Version BASE_URL'
  //     case 'customHost':
  //       return 'Custom BASE_URL'
  //     default:
  //   }
  // }

  // renderHostInputDropdown() {
  //   return (
  //     <div className='host-field-container'>
  //         <OverlayTrigger
  //           placement='top'
  //           overlay={
  //             <Tooltip id='host'>
  //               {this.fetchHost() ? this.fetchHost() : this.chaageHostName(this.state.selectedHost)}
  //             </Tooltip>
  //           }
  //         >
  //           <input
  //             type='text'
  //             name='customHost'
  //             className='form-control'
  //             value={this.fetchHost()}
  //             onChange={this.handleChange}
  //             disabled={this.state.selectedHost !== 'customHost'}
  //           />
  //         </OverlayTrigger>
  //         <div className='dropdown' id='host-select'>
  //           <button
  //             className='btn dropdown-toggle'
  //             type='button'
  //             data-toggle='dropdown'
  //             aria-haspopup='true'
  //             aria-expanded='false'
  //           />
  //           <div
  //             className='dropdown-menu dropdown-menu-right'
  //             aria-labelledby='dropdownMenuButton'
  //           >
  //             {this.props.environment &&
  //               this.props.environment.variables &&
  //               this.props.environment.variables.BASE_URL && (
  //                 <div
  //                   className='dropdown-item'
  //                   onClick={() => this.selectHost('environmentHost')}
  //                 >
  //                   <div>
  //                     {this.state.selectedHost === 'environmentHost' && (
  //                       <i className='fas fa-check' />
  //                     )}
  //                     Environment BASE_URL
  //                   </div>
  //                 </div>
  //             )}
  //             {this.state.groupId &&
  //               this.props.groups[this.state.groupId] &&
  //               this.props.groups[this.state.groupId].host && (
  //                 <div
  //                   className='dropdown-item'
  //                   onClick={() => this.selectHost('groupHost')}
  //                 >
  //                   <div>
  //                     {this.state.selectedHost === 'groupHost' && (
  //                       <i className='fas fa-check' />
  //                     )}  Group BASE_URL
  //                   </div>

  //                 </div>
  //             )}
  //             {this.state.groupId && (
  //               <div
  //                 className='dropdown-item'
  //                 onClick={() => this.selectHost('versionHost')}
  //               >
  //                 <div>
  //                   {this.state.selectedHost === 'versionHost' && (
  //                     <i className='fas fa-check' />
  //                   )}
  //                   Version BASE_URL
  //                 </div>
  //               </div>
  //             )}
  //             <div
  //               className='dropdown-item'
  //               id='customHost'
  //               onClick={() => this.selectHost('customHost')}
  //             >
  //               <div>
  //                 {this.state.selectedHost === 'customHost' && (
  //                   <i className='fas fa-check' />
  //                 )}
  //                 Custom BASE_URL
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //   )
  // }

  handleInputHostChange (e) {
    const data = this.splitUrlHelper(e)
    this.setState({
      ...data,
      showDatalist: e.target.value === ''
    },
    () => this.setParentHostAndUri())
  }

  handleClickHostOptions (host, type) {
    this.setState({
      datalistHost: host,
      showDatalist: false,
      selectedHost: type,
      Flag: true
    },
    () => this.setParentHostAndUri())
  }

  splitUrlHelper (e) {
    const value = e.target.value
    const regex = /^[\w]*:\/\/[\w||.||-||@||:]*/i
    const hostName = value.match(regex)
    let uri = ''
    const data = {
      datalistHost: '',
      datalistUri: '',
      selectedHost: '',
      Flag: true
    }
    if (hostName) {
      const selectedHost = this.selectCurrentHost(hostName[0])
      if (selectedHost === 'customHost') data.customHost = hostName[0]
      data.datalistHost = hostName[0]
      data.selectedHost = selectedHost
      uri = value.split(hostName[0]).join('')
    } else {
      data.selectedHost = 'customHost'
      uri = value
    }
    data.datalistUri = uri
    return data
  }

  selectCurrentHost (hostname) {
    if (hostname === this.state.customHost) return 'customHost'
    if (hostname === this.state.environmentHost) return 'environmentHost'
    if (hostname === this.state.groupHost) return 'groupHost'
    if (hostname === this.state.versionHost) return 'versionHost'
    return 'customHost'
  }

  setHosts () {
    const { groupHost, versionHost, environmentHost } = this.props
    let customHost = this.state.customHost
    if (this.state.customHost === '') customHost = this.props.customHost
    this.setState({ groupHost, versionHost, environmentHost, customHost }, () => { this.setHostAndUri() })
  }

  renderHostDatalist () {
    const endpointId = this.props.endpointId
    return (
      <div className='url-container' key={`${endpointId}_hosts`} ref={this.wrapperRef}>
        <input
          id='host-container-input'
          value={this.state.datalistHost + this.state.datalistUri}
          name={`${endpointId}_hosts`}
          placeholder='Enter Request URL'
          onChange={((e) => this.handleInputHostChange(e))}
          autoComplete='off'
          onFocus={() => this.setState({ showDatalist: true }, () => {
            document.addEventListener('mousedown', this.handleClickOutside)
          })}
        />
        <div className={['host-data', this.state.showDatalist ? 'd-block' : 'd-none'].join(' ')}>
          {Object.values(hostContainerEnum.hosts).map(host => (
            this.state[host.key] &&
              <div className='host-data-item' onClick={(e) => this.handleClickHostOptions(this.state[host.key], host.key)}>
                <div>{this.state[host.key]}</div>
                <small className='text-muted font-italic'>{host.label}</small>
              </div>
          ))}
        </div>
      </div>
    )
  }

  render () {
    if (
      isDashboardRoute(this.props) &&
      this.state.groupId &&
      this.props.tab.status === tabStatusTypes.DELETED
    ) {
      this.setState({ groupId: null })
    }

    // if (!this.state.groupId && this.props.groupId) {
    //   const groupId = this.props.groupId
    //   const versionId = this.props.groups[groupId].versionId
    //   const customHost = this.props.custom_host
    //   let selectedHost = null
    //   if (this.props.custom_host) {
    //     selectedHost = 'customHost'
    //   } else if (
    //     this.props.environment.variables &&
    //     this.props.environment.variables.BASE_URL
    //   ) {
    //     selectedHost = 'environmentHost'
    //   } else if (this.props.groups[groupId].host) {
    //     selectedHost = 'groupHost'
    //   } else {
    //     selectedHost = 'versionHost'
    //   }
    //   this.setState({ groupId, versionId, customHost, selectedHost })
    // }
    if (isDashboardRoute(this.props)) {
      return (
        // this.renderHostInputDropdown()
        this.renderHostDatalist()
      )
    } else {
      return (
        this.fetchPublicEndpointHost(this.props)
      )
    }
  }
}

export default HostContainer
