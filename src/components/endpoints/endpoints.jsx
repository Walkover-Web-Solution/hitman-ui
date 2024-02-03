import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { isDashboardRoute, getUrlPathById, isTechdocOwnDomain, SESSION_STORAGE_KEY } from '../common/utility'
import { approveEndpoint, draftEndpoint, pendingEndpoint, rejectEndpoint } from '../publicEndpoint/redux/publicEndpointsActions'
import { closeTab, openInNewTab } from '../tabs/redux/tabsActions'
import tabService from '../tabs/tabService'
import tabStatusTypes from '../tabs/tabStatusTypes'
import './endpoints.scss'
import { deleteEndpoint, duplicateEndpoint, updateEndpointOrder, addEndpoint } from './redux/endpointsActions'
import filterService from '../../services/filterService'
import GlobeIcon from '../../assets/icons/globe-icon.svg'
import AddEntity from '../main/addEntity/addEntity'
import { updataForIsPublished } from '../../store/clientData/clientDataActions'

// 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
const endpointsEnum = {
  PENDING_STATE: 0,
  REJECT_STATE: 3,
  APPROVED_STATE: 2,
  DRAFT_STATE: 1
}

const mapStateToProps = (state) => {
  return {
    endpoints: state.pages,
    tabs: state.tabs,
    clientData: state.clientData
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    delete_endpoint: (endpoint) => dispatch(deleteEndpoint(endpoint)),
    duplicate_endpoint: (endpoint) => dispatch(duplicateEndpoint(endpoint)),
    update_endpoints_order: (endpointIds, groupId) => dispatch(updateEndpointOrder(endpointIds, groupId)),
    pending_endpoint: (endpoint) => dispatch(pendingEndpoint(endpoint)),
    approve_endpoint: (endpoint) => dispatch(approveEndpoint(endpoint)),
    draft_endpoint: (endpoint) => dispatch(draftEndpoint(endpoint)),
    reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab)),
    add_endpoint: (newEndpoint, groupId, callback) => dispatch(addEndpoint(ownProps.history, newEndpoint, groupId, callback)),
    setIsCheckForParenPage: (payload) => dispatch(updataForIsPublished(payload))
  }
}

class Endpoints extends Component {
  constructor(props) {
    super(props)
    this.state = {
      endpointState: 'Make Public',
      theme: '',
      checkboxChecked: false
    }
    this.scrollRef = {}
  }

  componentDidMount() {
    if (this.props.theme) {
      this.setState({ theme: this.props.theme })
    }
    const { endpointId } = this.props.match.params
    if (endpointId) {
      this.scrollToEndpoint(endpointId)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { endpointId } = this.props.match.params
    const { endpointId: prevEndpointId } = prevProps.match.params
    if (endpointId && endpointId !== prevEndpointId) {
      this.scrollToEndpoint(endpointId)
    }
  }

  scrollToEndpoint(endpointId) {
    const ref = this.scrollRef[endpointId] || null
    if (ref) {
      setTimeout(() => {
        ref.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      }, 100)
    }
  }

  sequencingOnFilter() {
    const filteredEndpointKeys = this.filteredEndpoints ? Object.keys(this.filteredEndpoints) : []
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

  async handleDelete(endpoint) {
    await this.props.delete_endpoint(endpoint)
    tabService.removeTab(this.props.tabs.activeTabId, { ...this.props })
  }

  handleDuplicate(endpoint) {
    this.props.duplicate_endpoint(endpoint)
  }

  openDeleteModal(endpointId) {
    this.setState({
      showDeleteModal: true,
      selectedEndpoint: {
        ...this.props.endpoints[endpointId]
      }
    })
  }

  closeDeleteEndpointModal() {
    this.setState({ showDeleteModal: false })
  }

  async handlePublicEndpointState(endpoint) {
    if (this.isStateDraft(endpoint.id) || this.isStateReject(endpoint.id)) {
      this.props.pending_endpoint(endpoint)
    }
  }

  async handleCancelRequest(endpoint) {
    this.props.draft_endpoint(endpoint)
  }

  async handleApproveRequest(endpoint) {
    this.props.approve_endpoint(endpoint)
  }

  async handleRejectRequest(endpoint) {
    this.props.reject_endpoint(endpoint)
  }

  handleDisplay(endpoint, groupId, collectionId, previewMode) {
    window.scroll(0, 0)
    if (isDashboardRoute(this.props, true)) {
      if (!this.props.tabs.tabs[endpoint.id]) {
        const previewTabId = Object.keys(this.props.tabs.tabs).filter((tabId) => this.props.tabs.tabs[tabId].previewMode === true)[0]
        if (previewTabId) this.props.close_tab(previewTabId)
        this.props.open_in_new_tab({
          id: endpoint.id,
          type: 'endpoint',
          status: tabStatusTypes.SAVED,
          previewMode,
          isModified: false,
          state: {}
        })
      } else if (this.props.tabs.tabs[endpoint.id].previewMode === true && previewMode === false) {
        tabService.disablePreviewMode(endpoint.id)
      }
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/dashboard/endpoint/${endpoint.id}`,
        title: 'update endpoint',
        endpoint: endpoint,
        groupId: groupId,
        collectionId
      })
    } else {
      let id = endpoint?.id
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      let pathName = getUrlPathById(id, this.props.pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      this.props.history.push(pathName)
    }
  }

  filterEndpoints() {
    if (this.props.selectedCollection === true && this.props.filter !== '' && this.filterFlag === false) {
      this.filterFlag = true
      let groupIds = []
      let groupIdsAndFilteredEndpoints = []
      groupIdsAndFilteredEndpoints = filterService.filter(this.props.endpoints, this.props.filter, 'endpoints')
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

  filterGroupPages() {
    if (this.props.selectedCollection === true && this.props.filter !== '' && this.filterFlag === false) {
      this.filterFlag = true
      let groupIds = []
      let groupIdsAndFilteredPages = []
      groupIdsAndFilteredPages = filterService.filter(this.props.pages, this.props.filter, 'groupPages')
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
  }

  onDragOver = (e, eId) => {
    e.preventDefault()
  }

  onDrop(e, destinationEndpointId) {
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
      const index = positionWiseEndpoints.findIndex((eId) => eId === destinationEndpointId)
      const endpointIds = positionWiseEndpoints.filter((item) => item !== this.draggedItem)
      endpointIds.splice(index, 0, this.draggedItem)

      this.props.update_endpoints_order(endpointIds, this.props.parent_id)
      this.draggedItem = null
    }
  }

  extractEndpoints() {
    const endpoints = {}
    for (let i = 0; i < Object.keys(this.props.endpoints).length; i++) {
      if (
        this.props.endpoints[Object.keys(this.props.endpoints)[i]].parentId &&
        this.props.endpoints[Object.keys(this.props.endpoints)[i]].parentId === this.props.parent_id
      ) {
        endpoints[Object.keys(this.props.endpoints)[i]] = this.props.endpoints[Object.keys(this.props.endpoints)[i]]
      }
    }

    return endpoints
  }

  handleCheckboxChange = () => {
    this.props.setIsCheckForParenPage({
      id: this.props?.endpointId,
      isChecked: !this.props?.clientData?.[this?.props?.endpointId]?.checkedForPublished
    })
  }

  makePositionWiseEndpoints(endpoints) {
    const positionWiseEndpoints = []
    for (let i = 0; i < Object.keys(endpoints).length; i++) {
      positionWiseEndpoints[endpoints[Object.keys(endpoints)[i]].position] = Object.keys(endpoints)[i]
    }
    return positionWiseEndpoints
  }

  isStateApproved(endpointId) {
    return this.props.endpoints[endpointId].state === endpointsEnum.APPROVED_STATE
  }

  isStatePending(endpointId) {
    return this.props.endpoints[endpointId].state === endpointsEnum.PENDING_STATE
  }

  isStateDraft(endpointId) {
    return this.props.endpoints[endpointId].state === endpointsEnum.DRAFT_STATE
  }

  isStateReject(endpointId) {
    return this.props.endpoints[endpointId].state === endpointsEnum.REJECT_STATE
  }

  displayEndpointName(endpointId) {
    return (
      <>
        {this.props.isPublishData && this.props.modals.publishData ? (
          <div className='sidebar-accordion-item'>
            <input
              type='checkbox'
              checked={this.props?.clientData?.[this.props?.endpointId]?.checkedForPublished || false}
              onChange={this.handleCheckboxChange}
            />
            <div className='api-label GET request-type-bgcolor'>{this.props.endpoints[endpointId].requestType}</div>
            <div className='end-point-name truncate'>{this.props.endpoints[endpointId].name}</div>
          </div>
        ) : (
          <div className='sidebar-accordion-item'>
            <div className='api-label GET request-type-bgcolor'>{this.props.endpoints[endpointId].requestType}</div>
            <div className='end-point-name truncate'>{this.props.endpoints[endpointId].name}</div>
          </div>
        )}
      </>
    )
  }

  displayDeleteOpt(endpointId) {
    return (
      <div className='dropdown-item' onClick={() => this.handleDelete(this.props.endpoints[endpointId])}>
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          <path
            d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z'
            stroke='#E98A36'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path d='M7.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M10.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>{' '}
        Delete
      </div>
    )
  }

  displayDuplicateOpt(endpointId) {
    return (
      <div className='dropdown-item' onClick={() => this.handleDuplicate(this.props.endpoints[endpointId])}>
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M15 6.75H8.25C7.42157 6.75 6.75 7.42157 6.75 8.25V15C6.75 15.8284 7.42157 16.5 8.25 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V8.25C16.5 7.42157 15.8284 6.75 15 6.75Z'
            stroke='#E98A36'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M3.75 11.25H3C2.60218 11.25 2.22064 11.092 1.93934 10.8107C1.65804 10.5294 1.5 10.1478 1.5 9.75V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V3.75'
            stroke='#E98A36'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        Duplicate
      </div>
    )
  }

  displayApproveOpt() {
    return (
      <div className='dropdown-item' disabled>
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M15.2222 1H2.77778C1.79594 1 1 1.79594 1 2.77778V15.2222C1 16.2041 1.79594 17 2.77778 17H15.2222C16.2041 17 17 16.2041 17 15.2222V2.77778C17 1.79594 16.2041 1 15.2222 1Z'
            stroke='#E98A36'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path d='M5.44444 9.37305L7.4364 11.2339' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M12.268 6.63057L7.58466 11.3713' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
        Approved
      </div>
    )
  }

  displayMakePublicOpt(endpointId) {
    return (
      <div id='make_public_btn' className='dropdown-item' onClick={() => this.handlePublicEndpointState(this.props.endpoints[endpointId])}>
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM8.25 14.9475C5.2875 14.58 3 12.06 3 9C3 8.535 3.06 8.0925 3.1575 7.6575L6.75 11.25V12C6.75 12.825 7.425 13.5 8.25 13.5V14.9475ZM13.425 13.0425C13.23 12.435 12.675 12 12 12H11.25V9.75C11.25 9.3375 10.9125 9 10.5 9H6V7.5H7.5C7.9125 7.5 8.25 7.1625 8.25 6.75V5.25H9.75C10.575 5.25 11.25 4.575 11.25 3.75V3.4425C13.4475 4.335 15 6.4875 15 9C15 10.56 14.4 11.9775 13.425 13.0425Z'
            fill='#E98A36'
          />
        </svg>
        Make Public
      </div>
    )
  }

  displayCancelRequestOpt(endpointId) {
    return (
      <div className='dropdown-item' onClick={() => this.handleCancelRequest(this.props.endpoints[endpointId])}>
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M15.2222 1H2.77778C1.79594 1 1 1.79594 1 2.77778V15.2222C1 16.2041 1.79594 17 2.77778 17H15.2222C16.2041 17 17 16.2041 17 15.2222V2.77778C17 1.79594 16.2041 1 15.2222 1Z'
            stroke='#E98A36'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path d='M6 6L12 12' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M12 6L6 12' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>{' '}
        Cancel Request
      </div>
    )
  }

  displayOtherOpt(endpointId) {
    return (
      <>
        {this.isStateDraft(endpointId) || this.isStateReject(endpointId) ? this.displayMakePublicOpt(endpointId) : null}

        {this.isStateApproved(endpointId) ? this.displayApproveOpt() : null}

        {this.isStatePending(endpointId) ? this.displayCancelRequestOpt(endpointId) : null}
      </>
    )
  }

  displayEndpointOptions(endpointId) {
    return (
      <div className='sidebar-item-action'>
        <div className='sidebar-item-action-btn' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
          <i className='uil uil-ellipsis-v' />
        </div>

        <div className='dropdown-menu dropdown-menu-right'>
          {this.displayDeleteOpt(endpointId)}
          {this.displayDuplicateOpt(endpointId)}
          {this.props.endpoints[endpointId]?.isPublished ? this.displayApproveOpt() : this.displayOtherOpt(endpointId)}
        </div>
      </div>
    )
  }

  displaySingleEndpoint(endpointId) {
    const publishData = this.props.modals.publishData
    const idToCheck = this.props.location.pathname.split('/')[4] === 'endpoint' ? this.props.location.pathname.split('/')[5] : null
    const isOnDashboardPage = isDashboardRoute(this.props)
    if (this.scrollRef[endpointId]) this.scrollToEndpoint(endpointId)
    return (
      <>
        {publishData ? (
          <div className={idToCheck === endpointId ? 'sidebar-accordion active' : 'sidebar-accordion'} key={endpointId}>
            <div className={this.props?.endpoints[endpointId]?.state} />
            <div className='sidebar-toggle d-flex justify-content-between'>
              <button
                tabIndex={-1}
                // className={[focused && sidebarFocused ? 'focused' : '']}
              >
                {this.displayEndpointName(endpointId)}
                <div className='d-flex align-items-center'></div>
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={(newRef) => {
              this.scrollRef[endpointId] = newRef
            }}
            key={endpointId}
          >
            <div className={this.props?.endpoints[endpointId]?.state} />
            <div className='sidebar-toggle d-flex justify-content-between'>
              <button
                tabIndex={-1}
                onClick={() => {
                  this.handleDisplay(this.props.endpoints[endpointId], this.props.endpointId, this.props.collection_id, true)
                }}
                onDoubleClick={() =>
                  this.handleDisplay(this.props.endpoints[endpointId], this.props.endpointId, this.props.collection_id, false)
                }
              >
                {this.displayEndpointName(endpointId)}

                <div className='d-flex align-items-center'>
                  <div className=' sidebar-item-action'>
                    {!this.props.collections[this.props.collection_id]?.importedFromMarketPlace && this.displayEndpointOptions(endpointId)}
                  </div>
                  {/* <div className='ml-1 published-icon transition'>
                    {this.props.endpoints[this.props.match.params.endpointId]?.isPublished && <img src={GlobeIcon} alt='globe' width='14' />}
                  </div> */}
                </div>
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  addEndpoint(endpoint) {
    this.props.add_endpoint(endpoint, this.props.parent_id, null)
  }

  renderForm() {
    const endpoint = {
      uri: '',
      name: '',
      requestType: 'GET',
      body: { type: 'none', value: null },
      headers: {},
      params: {},
      pathVariables: {},
      BASE_URL: null,
      bodyDescription: {},
      authorizationType: null
    }
    return (
      <>
        {isDashboardRoute(this.props, true) && (
          <AddEntity placeholder='API Endpoint Name' type='endpoint' endpoint={endpoint} addEndpoint={this.addEndpoint.bind(this)} />
        )}
      </>
    )
  }

  displayUserEndpoints(endpointId) {
    return (
      <>
        {this.displaySingleEndpoint(endpointId)}
        {/* {endpoints?.map((endpointId) => (
          this.displaySingleEndpoint(endpointId)
        ))} */}
        {endpointId?.length === 0 && this.renderForm()}
      </>
    )
  }

  setFilterFlag() {
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false
    }
    if (this.props.filter === '') {
      this.filteredEndpoints = { ...this.props.endpoints }
      // this.filteredEndpointsOrder = [...this.props.endpoints_order]
    }
  }

  filterEndpointIdsByGroup() {
    const endpointIds = Object.keys(this.props.endpoints).filter(
      (eId) => this.props.endpoints[eId].parentId && this.props.endpoints[eId].parentId === this.props.parent_id
    )
    return endpointIds
  }

  extractEndpointsFromIds(endpointIds) {
    let endpointsArray = []
    for (let index = 0; index < endpointIds.length; index++) {
      const id = endpointIds[index]
      const endpoint = this.props.endpoints[id]
      endpointsArray = [...endpointsArray, endpoint]
    }
    endpointsArray.sort(function (a, b) {
      if (a.name < b.name) {
        return -1
      }
      if (a.name > b.name) {
        return 1
      }
      return 0
    })
    return endpointsArray || []
  }

  getEndpointsEntity(endpointsArray) {
    const endpoints = {}
    for (let index = 0; index < endpointsArray.length; index++) {
      const id = endpointsArray[index].id || endpointsArray[index].requestId
      endpoints[id] = this.props.endpoints[id]
    }
    return endpoints || {}
  }

  render() {
    this.setFilterFlag()
    const endpointIds = this.filterEndpointIdsByGroup()
    let endpointsArray = []
    endpointsArray = this.extractEndpointsFromIds(endpointIds)
    let endpoints = {}
    endpoints = this.getEndpointsEntity(endpointsArray)
    return this.displayUserEndpoints(this?.props?.endpointId)
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Endpoints))
