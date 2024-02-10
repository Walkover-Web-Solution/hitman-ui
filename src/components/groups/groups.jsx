import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import {
  isDashboardRoute,
  getParentIds,
  getUrlPathById,
  isTechdocOwnDomain,
  SESSION_STORAGE_KEY,
  isOnPublishedPage
} from '../common/utility'
import { reorderEndpoint } from '../endpoints/redux/endpointsActions'
import ShareGroupForm from '../groups/shareGroupForm'
import './groups.scss'
import groupsService from './groupsService'
import filterService from '../../services/filterService'
import AddEntity from '../main/addEntity/addEntity'
import { ReactComponent as Plus } from '../../assets/icons/plus-square.svg'
import ExpandedIcon from '../../assets/icons/expand-arrow.svg'
import CombinedCollections from '../combinedCollections/combinedCollections.jsx'
import { addIsExpandedAction, updataForIsPublished } from '../../store/clientData/clientDataActions.js'
import DefaultViewModal from '../collections/defaultViewModal/defaultViewModal.jsx'

const mapStateToProps = (state) => {
  return {
    groups: state.groups,
    pages: state.pages,
    endpoints: state.endpoints,
    versions: state.versions,
    clientData: state.clientData,
    modals: state.modals
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reorder_endpoint: (sourceEndpointIds, groupId, destinationEndpointIds, destinationGroupId, endpointId) =>
      dispatch(reorderEndpoint(sourceEndpointIds, groupId, destinationEndpointIds, destinationGroupId, endpointId)),
    update_isExpand_for_subPages: (payload) => dispatch(addIsExpandedAction(payload)),
    setIsCheckForParenPage: (payload) => dispatch(updataForIsPublished(payload))
  }
}

class Groups extends Component {
  constructor(props) {
    super(props)
    this.state = {
      GroupFormName: '',
      selectedPage: {},
      showGroupForm: {
        addPage: false,
        edit: false,
        share: false
      },
      theme: '',
      filter: '',
      selectedGroupIds: [],
      checkboxChecked: false
    }

    this.eventkey = {}
    this.filterFlag = false
    this.filteredGroupEndpoints = {}
    this.filteredGroupPages = {}
    this.filteredEndpointsAndPages = {}
    this.scrollRef = {}
  }

  componentDidMount() {
    if (!this.state.theme) {
      this.setState({ theme: this.props.collections[this.props.collection_id].theme })
    }

    const { pageId, endpointId } = this.props.match.params

    if (pageId) {
      this.setGroupIdforEntity(pageId, 'page')
    }

    if (endpointId) {
      this.setGroupIdforEntity(endpointId, 'endpoint')
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { pageId, endpointId } = this.props.match.params
    const { pageId: prevPageId, endpointId: prevEndpointId } = prevProps.match.params

    if (pageId && prevPageId !== pageId) {
      this.setGroupIdforEntity(pageId, 'page')
    }

    if (endpointId && prevEndpointId !== endpointId) {
      this.setGroupIdforEntity(endpointId, 'endpoint')
    }
  }

  setGroupIdforEntity(id, type) {
    const { groupId } = getParentIds(id, type, this.props)
  }

  setSelectedGroupId(id, value) {
    if (id && this.state.selectedGroupIds[id] !== value) {
      this.setState({ selectedGroupIds: { ...this.state.selectedGroupIds, [id]: value } })
    }
  }

  openShareGroupForm(groupId) {
    const showGroupForm = { share: true, addPage: false }
    this.setState({
      showGroupForm,
      groupFormName: 'Share Subpage',
      selectedGroup: { ...this.props.pages[groupId] }
    })
  }

  closeGroupForm() {
    const edit = false
    const addPage = false
    const showGroupForm = { edit, addPage }
    this.setState({ showGroupForm })
  }

  showShareGroupForm() {
    return (
      this.state.showGroupForm.share && (
        <ShareGroupForm
          show={this.state.showGroupForm.share}
          onHide={() => this.closeGroupForm()}
          title={this.state.groupFormName}
          selectedGroup={this.props.rootParentId}
        />
      )
    )
  }

  openGroupPageForm(selectedVersion = '', selectedGroup = '', selectedCollection = '') {
    const showGroupForm = { addPage: true }
    this.setState({
      showGroupForm,
      groupFormName: 'Add Sub Page',
      selectedVersion,
      selectedGroup,
      selectedCollection
    })
  }

  openEditGroupForm(selectedGroup) {
    const showGroupForm = { edit: true }
    this.setState({
      showGroupForm,
      selectedGroup
    })
  }

  openDeleteGroupModal(groupId) {
    this.setState({
      showDeleteModal: true,
      selectedGroup: {
        ...this.props.groups[groupId]
      }
    })
  }

  closeDeleteGroupModal() {
    this.setState({ showDeleteModal: false })
  }
  openAddPageEndpointModal(groupId) {
    this.setState({
      showAddCollectionModal: true,
      selectedPage: {
        ...this.props.pages[groupId]
      }
    })
  }

  showAddPageEndpointModal() {
    return (
      this.state.showAddCollectionModal && (
        <DefaultViewModal
          {...this.props}
          title='Add Sub Page'
          show={this.state.showAddCollectionModal}
          onCancel={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          onHide={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          selectedPage={this.props?.rootParentId}
          pageType={3}
        />
      )
    )
  }

  filterGroups() {
    if (this.props.selectedCollection === true && this.props.filter !== '' && this.filterFlag === false) {
      this.filterFlag = true
      let groupIds = []
      this.filteredOnlyGroups = {}
      groupIds = filterService.filter(this.props.groups, this.props.filter, 'groups')
      this.setState({ filter: this.props.filter })
      if (groupIds.length !== 0) {
        for (let i = 0; i < groupIds.length; i++) {
          this.filteredOnlyGroups[groupIds[i]] = this.props.groups[groupIds[i]]
        }
      }
    } else {
      this.filteredOnlyGroups = {}
    }
  }

  onDragStart = (e, gId) => {
    this.draggedItem = gId
  }

  extractEndpoints(groupId) {
    const endpoints = {}
    for (let i = 0; i < Object.keys(this.props.endpoints).length; i++) {
      if (
        this.props.endpoints[Object.keys(this.props.endpoints)[i]].groupId &&
        this.props.endpoints[Object.keys(this.props.endpoints)[i]].groupId === groupId
      ) {
        endpoints[Object.keys(this.props.endpoints)[i]] = this.props.endpoints[Object.keys(this.props.endpoints)[i]]
      }
    }

    return endpoints
  }

  makePositionWiseEndpoints(endpoints) {
    const positionWiseEndpoints = []
    for (let i = 0; i < Object.keys(endpoints).length; i++) {
      positionWiseEndpoints[endpoints[Object.keys(endpoints)[i]].position] = Object.keys(endpoints)[i]
    }
    return positionWiseEndpoints
  }

  getEndpointIds(groupId) {
    const endpoints = this.extractEndpoints(groupId)
    const positionWiseEndpoints = this.makePositionWiseEndpoints({
      ...endpoints
    })
    const endpointIds = positionWiseEndpoints.filter((item) => item !== this.endpointId)
    return endpointIds
  }

  onDrop(e, destinationGroupId) {
    e.preventDefault()
    if (this.endpointDrag === true) {
      const endpoint = this.props.endpoints[this.endpointId]
      if (endpoint.groupId !== destinationGroupId) {
        const groupId = endpoint.groupId

        const sourceEndpointIds = this.getEndpointIds(groupId)
        const destinationEndpointIds = this.getEndpointIds(destinationGroupId)

        destinationEndpointIds.push(this.endpointId)

        this.endpointDrag = false
        this.props.reorder_endpoint(sourceEndpointIds, groupId, destinationEndpointIds, destinationGroupId, this.endpointId)
      }
    } else {
      if (!this.draggedItem) {
        //
      } else {
        if (this.draggedItem === destinationGroupId) {
          this.draggedItem = null
          return
        }
        const groups = this.extractGroups()
        const positionWisegroups = this.makePositionWisegroups({ ...groups })
        const index = positionWisegroups.findIndex((eId) => eId === destinationGroupId)
        const groupIds = positionWisegroups.filter((item) => item !== this.draggedItem)
        groupIds.splice(index, 0, this.draggedItem)

        this.draggedItem = null
      }
    }
  }

  makePositionWisegroups(groups) {
    const positionWisegroups = []
    for (let i = 0; i < Object.keys(groups).length; i++) {
      positionWisegroups[groups[Object.keys(groups)[i]].position] = Object.keys(groups)[i]
    }
    return positionWisegroups
  }

  extractGroups() {
    const groups = {}
    for (let i = 0; i < Object.keys(this.props.groups).length; i++) {
      if (this.props.groups[Object.keys(this.props.groups)[i]].versionId === this.props.version_id) {
        groups[Object.keys(this.props.groups)[i]] = this.props.groups[Object.keys(this.props.groups)[i]]
      }
    }
    return groups
  }

  setEndpointdrag(eId) {
    this.endpointDrag = true
    this.endpointId = eId
  }

  setPagedrag() {
    this.pageDrag = true
  }

  scrollToGroup(groupId) {
    const ref = this.scrollRef[groupId] || null
    if (ref) {
      setTimeout(() => {
        ref.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      }, 100)
    }
  }

  handleCheckboxChange = () => {
    this.props.setIsCheckForParenPage({
      id: this.props?.rootParentId,
      isChecked: !this.props?.clientData?.[this?.props?.rootParentId]?.checkedForPublished
    })
  }

  renderBody(groupId) {
    const expanded = this.props.clientData?.[this.props.rootParentId]?.isExpanded ?? isOnPublishedPage()
    const isSelected = isOnPublishedPage() && sessionStorage.getItem('currentPublishIdToShow') === groupId ? 'selected' : ''
    return (
      <>
        {/* for publish side barrrr */}
        {this.props.isPublishData && this.props.modals.publishData ? (
          <div className='sidebar-accordion accordion pl-3' id='child-accordion'>
            <button
              tabIndex={-1}
              ref={(newRef) => {
                this.scrollRef[groupId] = newRef
              }}
              className={expanded ? 'expanded' : ''}
            >
              <div className='d-flex align-items-center cl-name'>
                {/* <span className='versionChovron'>
                    <img src={ExpandedIcon} alt='' />
                  </span> */}
                <input
                  type='checkbox'
                  checked={this.props?.clientData?.[this.props?.rootParentId]?.checkedForPublished || false}
                  onChange={this.handleCheckboxChange}
                />
                <div className='sidebar-accordion-item d-inline text-truncate'>{this.props.pages[groupId]?.name}</div>
              </div>
            </button>
            {expanded ? (
              <div className='linkWrapper versionPages'>
                <Card.Body>
                  <CombinedCollections
                    {...this.props}
                    // isPublishData={false}
                    // pagesToRender={pagesToRender}
                    // version_id={this.props.groups[groupId].versionId}
                    // set_page_drag={this.setPagedrag.bind(this)}
                    // group_id={groupId}
                    // show_filter_groups={this.propsFromGroups.bind(this)}
                  />
                </Card.Body>
              </div>
            ) : null}
            {/* </Card> */}
          </div>
        ) : (
          <div className='sidebar-accordion accordion pl-3' id='child-accordion'>
            <button
              tabIndex={-1}
              ref={(newRef) => {
                this.scrollRef[groupId] = newRef
              }}
              className={`${expanded ? 'expanded' : ''} ${isSelected}`}
            >
              <div className='d-flex align-items-center cl-name' onClick={() => this.toggleSubPageIds(groupId)}>
                <span className='versionChovron'>
                  <img src={ExpandedIcon} alt='' />
                </span>
                <div className='sidebar-accordion-item d-inline text-truncate'>{this.props.pages[groupId]?.name}</div>
              </div>
              {
                // [info] options not to show on publihsed page
                isDashboardRoute(this.props, true) && !this.props.collections[this.props.collection_id]?.importedFromMarketPlace ? (
                  <div className='sidebar-item-action d-flex align-items-center'>
                    <div onClick={() => this.openAddPageEndpointModal(groupId)} className='mr-1 d-flex align-items-center'>
                      <Plus />
                    </div>
                    <div className='sidebar-item-action-btn' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                      <i className='uil uil-ellipsis-v' />
                    </div>
                    <div className='dropdown-menu dropdown-menu-right'>
                      <div className='dropdown-item' onClick={() => this.openEditGroupForm(this.props.groups[groupId])}>
                        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M12.75 2.25023C12.947 2.05324 13.1808 1.89699 13.4382 1.79038C13.6956 1.68378 13.9714 1.62891 14.25 1.62891C14.5286 1.62891 14.8044 1.68378 15.0618 1.79038C15.3192 1.89699 15.553 2.05324 15.75 2.25023C15.947 2.44721 16.1032 2.68106 16.2098 2.93843C16.3165 3.1958 16.3713 3.47165 16.3713 3.75023C16.3713 4.0288 16.3165 4.30465 16.2098 4.56202C16.1032 4.81939 15.947 5.05324 15.75 5.25023L5.625 15.3752L1.5 16.5002L2.625 12.3752L12.75 2.25023Z'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>{' '}
                        Edit
                      </div>
                      {/* <div
                        className='dropdown-item'
                        onClick={() => {
                          this.openDeleteGroupModal(groupId)
                        }}
                      >
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
                      </div> */}
                      {/* <div className='dropdown-item' onClick={() => this.handleDuplicate(this.props.groups[groupId])}>
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
                      </svg>{' '}
                      Duplicate
                    </div> */}
                      <div className='dropdown-item' onClick={() => this.openShareGroupForm(groupId)}>
                        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M13.5 6C14.7426 6 15.75 4.99264 15.75 3.75C15.75 2.50736 14.7426 1.5 13.5 1.5C12.2574 1.5 11.25 2.50736 11.25 3.75C11.25 4.99264 12.2574 6 13.5 6Z'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M4.5 11.25C5.74264 11.25 6.75 10.2426 6.75 9C6.75 7.75736 5.74264 6.75 4.5 6.75C3.25736 6.75 2.25 7.75736 2.25 9C2.25 10.2426 3.25736 11.25 4.5 11.25Z'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M13.5 16.5C14.7426 16.5 15.75 15.4926 15.75 14.25C15.75 13.0074 14.7426 12 13.5 12C12.2574 12 11.25 13.0074 11.25 14.25C11.25 15.4926 12.2574 16.5 13.5 16.5Z'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M6.4425 10.1323L11.565 13.1173'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M11.5575 4.88232L6.4425 7.86732'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>{' '}
                        Share
                      </div>
                    </div>
                  </div>
                ) : null
              }
            </button>
            {expanded ? (
              <div className='linkWrapper versionPages'>
                <Card.Body>
                  <CombinedCollections
                    {...this.props}
                    // isPublishData={false}
                    // pagesToRender={pagesToRender}
                    // version_id={this.props.groups[groupId].versionId}
                    // set_page_drag={this.setPagedrag.bind(this)}
                    // group_id={groupId}
                    // show_filter_groups={this.propsFromGroups.bind(this)}
                  />
                </Card.Body>
              </div>
            ) : null}
            {/* </Card> */}
          </div>
        )}
      </>
    )
  }

  toggleSubPageIds(id) {
    const isExpanded = this.props?.clientData?.[id]?.isExpanded ?? isOnPublishedPage()
    this.props.update_isExpand_for_subPages({
      value: !isExpanded,
      id: id
    })

    if (isDashboardRoute(this.props)) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${id}`
      })
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      let pathName = getUrlPathById(id, this.props.pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      this.props.history.push(pathName)
    }
  }

  render() {
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false
    }
    if (this.filterFlag === false && this.props.filter === '') {
      this.eventkey = {}
    }
    if (!this.props.filter || this.props.filter === '') {
      this.groups = { ...this.props.groups }
    }

    if (this.groups && Object.keys(this.groups)) {
      this.sortedGroups = Object.keys(this.groups)
        .map((gId) => this.groups[gId])
        .sort(function (a, b) {
          return a.position - b.position
        })
    }

    return (
      <>
        {this.showShareGroupForm()}
        {this.showAddPageEndpointModal()}
        {this.state.showDeleteModal &&
          groupsService.showDeleteGroupModal(
            this.props,
            this.closeDeleteGroupModal.bind(this),
            'Delete Page',
            `Are you sure you wish to delete this page?
              All your pages and endpoints present in this page will be deleted.`,
            this.state.selectedGroup
          )}

        {<div className='linkWith'>{this.renderBody(this.props?.rootParentId)}</div>}
      </>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Groups))
