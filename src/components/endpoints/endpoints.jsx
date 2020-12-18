import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isDashboardRoute } from '../common/utility'
import { setEndpointIds } from '../groups/redux/groupsActions'
import {
  approveEndpoint,
  draftEndpoint,
  pendingEndpoint,
  rejectEndpoint
} from '../publicEndpoint/redux/publicEndpointsActions'
import { closeTab, openInNewTab } from '../tabs/redux/tabsActions'
import tabService from '../tabs/tabService'
import tabStatusTypes from '../tabs/tabStatusTypes'
import './endpoints.scss'
import {
  deleteEndpoint,
  duplicateEndpoint,
  updateEndpointOrder
} from './redux/endpointsActions'
import filterService from '../../services/filterService'

const endpointsEnum = {
  PENDING_STATE: 'Pending',
  REJECT_STATE: 'Reject',
  APPROVED_STATE: 'Approved',
  DRAFT_STATE: 'Draft'
}

const mapStateToProps = (state) => {
  return {
    endpoints: state.endpoints,
    groups: state.groups,
    tabs: state.tabs
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    delete_endpoint: (endpoint) => dispatch(deleteEndpoint(endpoint)),
    duplicate_endpoint: (endpoint) => dispatch(duplicateEndpoint(endpoint)),
    set_endpoint_ids: (endpointsOrder, groupId) =>
      dispatch(setEndpointIds(endpointsOrder, groupId)),
    update_endpoints_order: (endpointIds, groupId) =>
      dispatch(updateEndpointOrder(endpointIds, groupId)),
    pending_endpoint: (endpoint) => dispatch(pendingEndpoint(endpoint)),
    approve_endpoint: (endpoint) => dispatch(approveEndpoint(endpoint)),
    draft_endpoint: (endpoint) => dispatch(draftEndpoint(endpoint)),
    reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab))
  }
}

class Endpoints extends Component {
  constructor (props) {
    super(props)
    this.state = {
      endpointState: 'Make Public',
      theme: ''
    }
  }

  componentDidMount () {
    if (this.props.theme) {
      this.setState({ theme: this.props.theme })
    }
  }

  sequencingOnFilter () {
    const filteredEndpointKeys = this.filteredEndpoints
      ? Object.keys(this.filteredEndpoints)
      : []
    this.filteredEndpointsOrder = []
    for (let i = 0; i < this.props.endpoints_order.length; i++) {
      for (let j = 0; j < filteredEndpointKeys.length; j++) {
        if (this.props.endpoints_order[i] === filteredEndpointKeys[j]) {
          this.filteredEndpointsOrder.push(this.props.endpoints_order[i])
          break
        }
      }
    }
  }

  handleDelete (endpoint) {
    this.props.delete_endpoint(endpoint)
    if (this.props.tabs.tabs[endpoint.id]) {
      tabService.removeTab(endpoint.id, { ...this.props })
    }
  }

  handleDuplicate (endpoint) {
    this.props.duplicate_endpoint(endpoint)
  }

  openDeleteModal (endpointId) {
    this.setState({
      showDeleteModal: true,
      selectedEndpoint: {
        ...this.props.endpoints[endpointId]
      }
    })
  }

  closeDeleteEndpointModal () {
    this.setState({ showDeleteModal: false })
  }

  async handlePublicEndpointState (endpoint) {
    if (this.isStateDraft(endpoint.id) || this.isStateReject(endpoint.id)) {
      this.props.pending_endpoint(endpoint)
    }
  }

  async handleCancelRequest (endpoint) {
    this.props.draft_endpoint(endpoint)
  }

  async handleApproveRequest (endpoint) {
    this.props.approve_endpoint(endpoint)
  }

  async handleRejectRequest (endpoint) {
    this.props.reject_endpoint(endpoint)
  }

  handleDisplay (endpoint, groupId, collectionId, previewMode) {
    if (isDashboardRoute(this.props, true)) {
      if (!this.props.tabs.tabs[endpoint.id]) {
        const previewTabId = Object.keys(this.props.tabs.tabs).filter(
          (tabId) => this.props.tabs.tabs[tabId].previewMode === true
        )[0]
        if (previewTabId) this.props.close_tab(previewTabId)
        this.props.open_in_new_tab({
          id: endpoint.id,
          type: 'endpoint',
          status: tabStatusTypes.SAVED,
          previewMode,
          isModified: false
        })
      } else if (
        this.props.tabs.tabs[endpoint.id].previewMode === true &&
        previewMode === false
      ) {
        tabService.disablePreviewMode(endpoint.id)
      }
      this.props.history.push({
        pathname: `/dashboard/endpoint/${endpoint.id}`,
        title: 'update endpoint',
        endpoint: endpoint,
        groupId: groupId,
        collectionId
      })
    } else {
      this.props.history.push({
        pathname: `/p/${collectionId}/e/${endpoint.id}/${this.props.collections[collectionId].name}`,
        title: 'update endpoint',
        endpoint: endpoint,
        groupId: groupId,
        Environment: 'publicCollectionEnvironment'
      })
    }
  }

  filterEndpoints () {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== '' &&
      this.filterFlag === false
    ) {
      this.filterFlag = true
      let groupIds = []
      let groupIdsAndFilteredEndpoints = []
      groupIdsAndFilteredEndpoints = filterService.filter(
        this.props.endpoints,
        this.props.filter,
        'endpoints'
      )
      this.filteredEndpoints = groupIdsAndFilteredEndpoints[0]
      groupIds = groupIdsAndFilteredEndpoints[1]
      this.setState({ filter: this.props.filter })
      if (groupIds.length !== 0) {
        this.props.show_filter_groups(groupIds, 'endpoints')
      } else {
        this.props.show_filter_groups(null, 'endpoints')
      }
    }
  }

  filterGroupPages () {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== '' &&
      this.filterFlag === false
    ) {
      this.filterFlag = true
      let groupIds = []
      let groupIdsAndFilteredPages = []
      groupIdsAndFilteredPages = filterService.filter(
        this.props.pages,
        this.props.filter,
        'groupPages'
      )
      this.filteredGroupPages = groupIdsAndFilteredPages[0]
      groupIds = groupIdsAndFilteredPages[1]
      this.setState({ filter: this.props.filter })
      if (groupIds.length !== 0) {
        this.props.show_filter_groups(groupIds, 'pages')
      } else {
        this.props.show_filter_groups(null, 'pages')
      }
    }
  }

  onDragStart = (e, eId) => {
    this.draggedItem = eId
    this.props.set_endpoint_drag(eId)
  };

  onDragOver = (e, eId) => {
    e.preventDefault()
  };

  onDrop (e, destinationEndpointId) {
    e.preventDefault()

    if (!this.draggedItem) {
      //
    } else {
      if (this.draggedItem === destinationEndpointId) {
        this.draggedItem = null
        return
      }
      const endpoints = this.extractEndpoints()
      const positionWiseEndpoints = this.makePositionWiseEndpoints({
        ...endpoints
      })
      const index = positionWiseEndpoints.findIndex(
        (eId) => eId === destinationEndpointId
      )
      const endpointIds = positionWiseEndpoints.filter(
        (item) => item !== this.draggedItem
      )
      endpointIds.splice(index, 0, this.draggedItem)

      this.props.update_endpoints_order(endpointIds, this.props.group_id)
      this.draggedItem = null
    }
  }

  extractEndpoints () {
    const endpoints = {}
    for (let i = 0; i < Object.keys(this.props.endpoints).length; i++) {
      if (
        this.props.endpoints[Object.keys(this.props.endpoints)[i]].groupId &&
        this.props.endpoints[Object.keys(this.props.endpoints)[i]].groupId ===
        this.props.group_id
      ) {
        endpoints[Object.keys(this.props.endpoints)[i]] = this.props.endpoints[
          Object.keys(this.props.endpoints)[i]
        ]
      }
    }

    return endpoints
  }

  makePositionWiseEndpoints (endpoints) {
    const positionWiseEndpoints = []
    for (let i = 0; i < Object.keys(endpoints).length; i++) {
      positionWiseEndpoints[
        endpoints[Object.keys(endpoints)[i]].position
      ] = Object.keys(endpoints)[i]
    }
    return positionWiseEndpoints
  }

  isStateApproved (endpointId) {
    return this.props.endpoints[endpointId].state === endpointsEnum.APPROVED_STATE
  }

  isStatePending (endpointId) {
    return this.props.endpoints[endpointId].state === endpointsEnum.PENDING_STATE
  }

  isStateDraft (endpointId) {
    return this.props.endpoints[endpointId].state === endpointsEnum.DRAFT_STATE
  }

  isStateReject (endpointId) {
    return this.props.endpoints[endpointId].state === endpointsEnum.REJECT_STATE
  }

  displayEndpointName (endpointId) {
    return (
      <div className='sidebar-accordion-item'>
        {/* <div
          className={`api-label ${this.props.endpoints[endpointId].requestType}`}
        >
          <div className='endpoint-request-div'>
            {this.props.endpoints[endpointId].requestType}
          </div>
        </div> */}
        {this.props.endpoints[endpointId].name}
      </div>
    )
  }

  displayDeleteOpt (endpointId) {
    return (
      <a
        className='dropdown-item'
        onClick={() =>
          this.handleDelete(this.props.endpoints[endpointId])}
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M7.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M10.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
        </svg> Delete
      </a>
    )
  }

  displayDuplicateOpt (endpointId) {
    return (
      <a
        className='dropdown-item'
        onClick={() =>
          this.handleDuplicate(
            this.props.endpoints[endpointId]
          )}
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M15 6.75H8.25C7.42157 6.75 6.75 7.42157 6.75 8.25V15C6.75 15.8284 7.42157 16.5 8.25 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V8.25C16.5 7.42157 15.8284 6.75 15 6.75Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M3.75 11.25H3C2.60218 11.25 2.22064 11.092 1.93934 10.8107C1.65804 10.5294 1.5 10.1478 1.5 9.75V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V3.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
        </svg>
        Duplicate
      </a>
    )
  }

  displayApproveOpt () {
    return (
      <a className='dropdown-item' disabled>
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M15.2222 1H2.77778C1.79594 1 1 1.79594 1 2.77778V15.2222C1 16.2041 1.79594 17 2.77778 17H15.2222C16.2041 17 17 16.2041 17 15.2222V2.77778C17 1.79594 16.2041 1 15.2222 1Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M5.44444 9.37305L7.4364 11.2339' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M12.268 6.63057L7.58466 11.3713' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
        </svg>
        Approved
      </a>
    )
  }

  displayMakePublicOpt (endpointId) {
    return (
      <a
        className='dropdown-item'
        onClick={() =>
          this.handlePublicEndpointState(
            this.props.endpoints[endpointId]
          )}
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM8.25 14.9475C5.2875 14.58 3 12.06 3 9C3 8.535 3.06 8.0925 3.1575 7.6575L6.75 11.25V12C6.75 12.825 7.425 13.5 8.25 13.5V14.9475ZM13.425 13.0425C13.23 12.435 12.675 12 12 12H11.25V9.75C11.25 9.3375 10.9125 9 10.5 9H6V7.5H7.5C7.9125 7.5 8.25 7.1625 8.25 6.75V5.25H9.75C10.575 5.25 11.25 4.575 11.25 3.75V3.4425C13.4475 4.335 15 6.4875 15 9C15 10.56 14.4 11.9775 13.425 13.0425Z' fill='#E98A36' />
        </svg>Make Public
      </a>
    )
  }

  displayCancelRequestOpt (endpointId) {
    return (
      <a
        className='dropdown-item'
        onClick={() =>
          this.handleCancelRequest(
            this.props.endpoints[endpointId]
          )}
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M15.2222 1H2.77778C1.79594 1 1 1.79594 1 2.77778V15.2222C1 16.2041 1.79594 17 2.77778 17H15.2222C16.2041 17 17 16.2041 17 15.2222V2.77778C17 1.79594 16.2041 1 15.2222 1Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M6 6L12 12' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M12 6L6 12' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
        </svg> Cancel Request
      </a>
    )
  }

  displayOtherOpt (endpointId) {
    return (
      <>
        {
          this.isStateDraft(endpointId) || this.isStateReject(endpointId)
            ? this.displayMakePublicOpt(endpointId)
            : null
        }

        {
          this.isStateApproved(endpointId)
            ? this.displayApproveOpt()
            : null
        }

        {
          this.isStatePending(endpointId)
            ? this.displayCancelRequestOpt(endpointId)
            : null
        }
      </>
    )
  }

  displayEndpointOptions (endpointId) {
    return (
      <div className='sidebar-item-action'>
        <div
          className='sidebar-item-action-btn'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        >
          <i className='uil uil-ellipsis-v' />
        </div>
        <div className='dropdown-menu dropdown-menu-right'>
          {this.displayDeleteOpt(endpointId)}
          {this.displayDuplicateOpt(endpointId)}
          {
            this.props.endpoints[endpointId]?.isPublished
              ? this.displayApproveOpt()
              : this.displayOtherOpt(endpointId)
          }

        </div>
      </div>
    )
  }

  displaySingleEndpoint (endpointId) {
    const idToCheck = this.props.location.pathname.split('/')[2] === 'endpoint' ? this.props.location.pathname.split('/')[3] : null
    return (
      <div className={idToCheck === endpointId ? 'sidebar-accordion active' : 'sidebar-accordion'} key={endpointId}>
        <div className={this.props.endpoints[endpointId].state} />
        <button
          onClick={() =>
            this.handleDisplay(
              this.props.endpoints[endpointId],
              this.props.group_id,
              this.props.collection_id,
              true
            )}
          onDoubleClick={() =>
            this.handleDisplay(
              this.props.endpoints[endpointId],
              this.props.group_id,
              this.props.collection_id,
              false
            )}
        >
          {this.displayEndpointName(endpointId)}
          {this.displayEndpointOptions(endpointId)}
        </button>
      </div>
    )
  }

  displayUserEndpoints (endpoints) {
    return (
      <>
        {this.filterEndpoints()}
        {/* {this.sequencingOnFilter()} */}
        {endpoints &&
          Object.keys(endpoints).length !== 0 &&
          Object.keys(endpoints)
            .map((endpointId) => (
              this.displaySingleEndpoint(endpointId)
            ))}
      </>
    )
  }

  convertHexToRGBA = (hexCode, opacity) => {
    let hex = hexCode.replace('#', '')

    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }

    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')'
  };

  displayPublicSingleEndpoint (endpointId) {
    const idToCheck = this.props.location.pathname.split('/')[3] === 'e' ? this.props.location.pathname.split('/')[4] : null
    return (
      <div
        className={idToCheck === endpointId ? 'hm-sidebar-item active' : 'hm-sidebar-item'}
        style={idToCheck === endpointId ? { backgroundColor: this.convertHexToRGBA(this.state.theme, 10), borderColor: this.convertHexToRGBA(this.state.theme, 30) } : {}}
        key={endpointId}
        onClick={() =>
          this.handleDisplay(
            this.props.endpoints[endpointId],
            this.props.group_id,
            this.props.collection_id,
            true
          )}
        onDoubleClick={() =>
          this.handleDisplay(
            this.props.endpoints[endpointId],
            this.props.group_id,
            this.props.collection_id,
            false
          )}
      >
        {/* <div
          className={`api-label ${this.props.endpoints[endpointId].requestType}`}
        >
          <div className='endpoint-request-div'>
            {this.props.endpoints[endpointId].requestType}
          </div>
        </div> */}
        <div className='endpoint-name-div'>
          {this.props.endpoints[endpointId].name}
        </div>
      </div>
    )
  }

  displayPublicEndpoints (endpoints) {
    const sortedEndpoints = []
    Object.values(endpoints).forEach(endpoint => {
      sortedEndpoints.push(endpoint)
    })
    sortedEndpoints.sort(function (a, b) {
      if (a.position < b.position) { return -1 }
      if (a.position > b.position) { return 1 }
      return 0
    })
    return (
      <>
        {
          sortedEndpoints &&
          Object.keys(sortedEndpoints).length !== 0 &&
          sortedEndpoints.map((endpoint) => (
            this.displayPublicSingleEndpoint(endpoint.id)
          ))
        }
      </>
    )
  }

  setFilterFlag () {
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false
    }
    if (this.props.filter === '') {
      this.filteredEndpoints = { ...this.props.endpoints }
      // this.filteredEndpointsOrder = [...this.props.endpoints_order]
    }
  }

  filterEndpointIdsByGroup () {
    const endpointIds = Object.keys(this.props.endpoints).filter(
      (eId) =>
        this.props.endpoints[eId].groupId &&
        this.props.endpoints[eId].groupId === this.props.group_id
    )
    return endpointIds
  }

  extractEndpointsFromIds (endpointIds) {
    let endpointsArray = []
    for (let index = 0; index < endpointIds.length; index++) {
      const id = endpointIds[index]
      const endpoint = this.props.endpoints[id]
      endpointsArray = [...endpointsArray, endpoint]
    }
    endpointsArray.sort(function (a, b) {
      if (a.name < b.name) { return -1 }
      if (a.name > b.name) { return 1 }
      return 0
    })
    return endpointsArray || []
  }

  getEndpointsEntity (endpointsArray) {
    const endpoints = {}
    for (let index = 0; index < endpointsArray.length; index++) {
      const id = endpointsArray[index].id || endpointsArray[index].requestId
      endpoints[id] = this.props.endpoints[id]
    }
    return endpoints || {}
  }

  render () {
    this.setFilterFlag()
    const endpointIds = this.filterEndpointIdsByGroup()
    let endpointsArray = []
    endpointsArray = this.extractEndpointsFromIds(endpointIds)
    let endpoints = {}
    endpoints = this.getEndpointsEntity(endpointsArray)

    if (isDashboardRoute(this.props, true)) {
      return this.displayUserEndpoints(endpoints)
    } else {
      return this.displayPublicEndpoints(endpoints)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Endpoints)
