import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { isDashboardRoute, getUrlPathById, isTechdocOwnDomain, SESSION_STORAGE_KEY, isOnPublishedPage } from '../common/utility'
import { approveEndpoint, draftEndpoint, pendingEndpoint, rejectEndpoint } from '../publicEndpoint/redux/publicEndpointsActions'
import { closeTab, openInNewTab } from '../tabs/redux/tabsActions'
import tabService from '../tabs/tabService'
import tabStatusTypes from '../tabs/tabStatusTypes'
import './endpoints.scss'
import { deleteEndpoint, duplicateEndpoint, updateEndpointOrder, addEndpointInCollection } from './redux/endpointsActions'
import GlobeIcon from '../../assets/icons/globe-icon.svg'
import AddEntity from '../main/addEntity/addEntity'
import { updataForIsPublished } from '../../store/clientData/clientDataActions'
import SubPageForm from '../groups/subPageForm'
import deleteicon from '../../assets/icons/delete-icon.svg'
import duplicate from '../../assets/icons/duplicateSign.svg'
import approved from '../../assets/icons/approvedSign.svg'
import makePublic from '../../assets/icons/makePublicSign.svg'
import cancelRequest from '../../assets/icons/cancelRequest.svg'


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
    add_endpoint: (newEndpoint, groupId, callback) => dispatch(addEndpointInCollection(ownProps.history, newEndpoint, groupId, callback)),
    setIsCheckForParenPage: (payload) => dispatch(updataForIsPublished(payload))
  }
}

class Endpoints extends Component {
  constructor(props) {
    super(props)
    this.state = {
      endpointState: 'Make Public',
      theme: '',
      checkboxChecked: false,
      showEndpointForm: {
        addPage: false,
        edit: false,
        share: false
      }
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

  async handleDelete(endpoint) {
    await this.props.delete_endpoint(endpoint)
    tabService.removeTab(this.props.tabs.activeTabId, { ...this.props })
  }

  handleDuplicate(endpoint) {
    this.props.duplicate_endpoint(endpoint)
  }

  openEditEndpointForm(selectedEndpoint) {
    const showEndpointForm = { edit: true }
    this.setState({
      showEndpointForm,
      selectedEndpoint: {
        ...this.props.endpoints[selectedEndpoint]
      }
    })
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
            <div className={`api-label ${this.props.endpoints[endpointId].requestType} request-type-bgcolor`}>
              {this.props.endpoints[endpointId].requestType}
            </div>
            <div className='end-point-name truncate'>{this.props.endpoints[endpointId].name}</div>
          </div>
        ) : (
          <div className='sidebar-accordion-item'>
            <div className={`api-label ${this.props.endpoints[endpointId].requestType} request-type-bgcolor`}>
              {this.props.endpoints[endpointId].requestType}
            </div>
            <div className='end-point-name truncate'>{this.props.endpoints[endpointId].name}</div>
          </div>
        )}
      </>
    )
  }

  displayDeleteOpt(endpointId) {
    return (
      <div className='dropdown-item' onClick={() => this.handleDelete(this.props.endpoints[endpointId])}>
        <img src= {deleteicon} />
        Delete
      </div>
    )
  }

  displayDuplicateOpt(endpointId) {
    return (
      <div className='dropdown-item' onClick={() => this.handleDuplicate(this.props.endpoints[endpointId])}>
        <img src= {duplicate} />
        Duplicate
      </div>
    )
  }

  displayApproveOpt() {
    return (
      <div className='dropdown-item' disabled>
        <img src= {approved} />
        Approved
      </div>
    )
  }

  displayMakePublicOpt(endpointId) {
    return (
      <div id='make_public_btn' className='dropdown-item' onClick={() => this.handlePublicEndpointState(this.props.endpoints[endpointId])}>
        <img src= {makePublic} />
        Make Public
      </div>
    )
  }

  displayCancelRequestOpt(endpointId) {
    return (
      <div className='dropdown-item' onClick={() => this.handleCancelRequest(this.props.endpoints[endpointId])}>
        <img src= {cancelRequest} />
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
          <div className='dropdown-item' onClick={() => this.openEditEndpointForm(endpointId)}>
                          <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                              d='M12.75 2.25023C12.947 2.05324 13.1808 1.89699 13.4382 1.79038C13.6956 1.68378 13.9714 1.62891 14.25 1.62891C14.5286 1.62891 14.8044 1.68378 15.0618 1.79038C15.3192 1.89699 15.553 2.05324 15.75 2.25023C15.947 2.44721 16.1032 2.68106 16.2098 2.93843C16.3165 3.1958 16.3713 3.47165 16.3713 3.75023C16.3713 4.0288 16.3165 4.30465 16.2098 4.56202C16.1032 4.81939 15.947 5.05324 15.75 5.25023L5.625 15.3752L1.5 16.5002L2.625 12.3752L12.75 2.25023Z'
                              stroke='#E98A36'
                              strokeWidth='1.5'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>{' '}
                          Rename
                        </div>
          {this.displayDeleteOpt(endpointId)}
          {/* {this.displayDuplicateOpt(endpointId)} */}
          {/* {this.props.endpoints[endpointId]?.isPublished ? this.displayApproveOpt() : this.displayOtherOpt(endpointId)} */}
        </div>
      </div>
    )
  }
  showEditEndpointModal() {
    return (
      this.state.showEndpointForm.edit && (
        <SubPageForm
          {...this.props}
          title='Rename'
          show={this.state.showEndpointForm.edit}
          onCancel={() => {
            this.setState({ showEndpointForm: false })
          }}
          onHide={() => {
            this.setState({ showEndpointForm: false })
          }}
          selectedEndpoint = {this.props?.endpointId}
          pageType={4}
        />
      )
    )
  }

  displaySingleEndpoint(endpointId) {
    const publishData = this.props.modals.publishData
    const idToCheck = this.props.location.pathname.split('/')[4] === 'endpoint' ? this.props.location.pathname.split('/')[5] : null
    const isOnDashboardPage = isDashboardRoute(this.props)
    if (this.scrollRef[endpointId]) this.scrollToEndpoint(endpointId)
    const isSelected = isOnPublishedPage() && sessionStorage.getItem('currentPublishIdToShow') === endpointId ? 'selected' : ''
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
                className={isSelected}
                onClick={() => {
                  this.handleDisplay(this.props.endpoints[endpointId], this.props.endpointId, this.props.collection_id, true)
                }}
                onDoubleClick={() =>
                  this.handleDisplay(this.props.endpoints[endpointId], this.props.endpointId, this.props.collection_id, false)
                }
              >
                {this.displayEndpointName(endpointId)}

                <div className='d-flex align-items-center'>
                    {isDashboardRoute(this.props, true) &&
                      !this.props.collections[this.props.collection_id]?.importedFromMarketPlace &&
                      this.displayEndpointOptions(endpointId)}
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
    const endpointIds = this.filterEndpointIdsByGroup()
    let endpointsArray = []
    endpointsArray = this.extractEndpointsFromIds(endpointIds)
    let endpoints = {}
    endpoints = this.getEndpointsEntity(endpointsArray)
    return (
      <>
      {this.showEditEndpointModal()}
      {this.displayUserEndpoints(this?.props?.endpointId)}
      </>
      )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Endpoints))
