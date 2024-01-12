import React, { Component } from 'react'
import { Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isDashboardRoute, getParentIds } from '../common/utility'
// import Endpoints from "../endpoints/endpointsCopy";
import Endpoints from '../endpoints/endpoints'
import GroupForm from '../groups/groupForm'
import { deleteGroup, duplicateGroup, updateGroupOrder } from '../groups/redux/groupsActions'
import { reorderEndpoint } from '../endpoints/redux/endpointsActions'
import ShareGroupForm from '../groups/shareGroupForm'
import GroupPages from '../pages/groupPages'
import PageForm from '../pages/pageForm'
import tabService from '../tabs/tabService'
import './groups.scss'
import groupsService from './groupsService'
import filterService from '../../services/filterService'
import AddEntity from '../main/addEntity/addEntity'
import sidebarActions from '../main/sidebar/redux/sidebarActions'
import { ReactComponent as Plus } from '../../assets/icons/plus-square.svg'
import ExpandedIcon from '../../assets/icons/expand-arrow.svg'
import CombinedCollections from '../combinedCollections/combinedCollections.jsx'
import { updateIsExpandForPages } from '../pages/redux/pagesActions.js'

const mapStateToProps = (state) => {
  return {
    groups: state.groups,
    pages: state.pages,
    endpoints: state.endpoints,
    versions: state.versions,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reorder_endpoint: (sourceEndpointIds, groupId, destinationEndpointIds, destinationGroupId, endpointId) =>
      dispatch(reorderEndpoint(sourceEndpointIds, groupId, destinationEndpointIds, destinationGroupId, endpointId)),
    update_groups_order: (groupIds, versionId) => dispatch(updateGroupOrder(groupIds, versionId)),
    delete_group: (group, props) => dispatch(deleteGroup(group, props)),
    duplicate_group: (group) => dispatch(duplicateGroup(group)),
    update_isExpand_for_subPages: (payload) =>
      dispatch(updateIsExpandForPages(payload))
  }
}

class Groups extends Component {
  constructor(props) {
    super(props)
    this.state = {
      GroupFormName: '',
      showGroupForm: {
        addPage: false,
        edit: false,
        share: false
      },
      theme: '',
      filter: '',
      selectedGroupIds: []
    }

    this.eventkey = {}
    this.filterFlag = false
    this.filteredGroupEndpoints = {}
    this.filteredGroupPages = {}
    this.filteredEndpointsAndPages = {}
    this.scrollRef = {}
  }

  handleAddPage(groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId
    })
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
    sidebarActions.expandItem('groups', groupId)
  }

  setSelectedGroupId(id, value) {
    if (id && this.state.selectedGroupIds[id] !== value) {
      this.setState({ selectedGroupIds: { ...this.state.selectedGroupIds, [id]: value } })
    }
  }

  handleAddEndpoint(groupId, versions, groups) {
    tabService.newTab({ ...this.props })
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/endpoint/new`,
      title: 'Add New Endpoint',
      search: `?group=${groupId}`
    })
  }

  openShareGroupForm(group) {
    const showGroupForm = { share: true, addPage: false }
    this.setState({
      showGroupForm,
      groupFormName: 'Share Group',
      selectedGroup: group
    })
  }

  handleDuplicate(group) {
    this.props.duplicate_group(group)
  }

  closeGroupForm() {
    const edit = false
    const addPage = false
    const showGroupForm = { edit, addPage }
    this.setState({ showGroupForm })
  }

  showEditGroupForm() {
    return (
      this.state.showGroupForm.edit && (
        <GroupForm
          {...this.props}
          show={this.state.showGroupForm.edit}
          onHide={() => this.closeGroupForm()}
          selected_group={this.state.selectedGroup}
          title='Edit Group'
        />
      )
    )
  }

  showAddGroupPageForm() {
    return (
      this.state.showGroupForm.addPage && (
        <PageForm
          {...this.props}
          show={this.state.showGroupForm.addPage}
          onHide={() => this.closeGroupForm()}
          title={this.state.groupFormName}
          selectedVersion={this.state.selectedVersion}
          selectedGroup={this.state.selectedGroup}
          selectedCollection={this.state.selectedCollection}
          rootParentId={this.props.rootParentId}
        />
      )
    )
  }

  showShareGroupForm() {
    return (
      this.state.showGroupForm.share && (
        <ShareGroupForm
          show={this.state.showGroupForm.share}
          onHide={() => this.closeGroupForm()}
          title={this.state.groupFormName}
          selectedGroup={this.state.selectedGroup}
        />
      )
    )
  }

  openGroupPageForm (selectedVersion='', selectedGroup = '', selectedCollection = '') {
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

  propsFromGroups(groupIds, title) {
    this.filteredEndpointsAndPages = {}
    this.filterGroups()
    if (title === 'endpoints') {
      this.filteredGroupEndpoints = {}
      if (groupIds !== null) {
        for (let i = 0; i < groupIds.length; i++) {
          this.filteredGroupEndpoints[groupIds[i]] = this.props.groups[groupIds[i]]
          this.eventkey[groupIds[i]] = '0'
        }
      }
    }
    if (title === 'pages') {
      this.filteredGroupPages = {}
      if (groupIds !== null) {
        for (let i = 0; i < groupIds.length; i++) {
          this.filteredGroupPages[groupIds[i]] = this.props.groups[groupIds[i]]
          this.eventkey[groupIds[i]] = '0'
        }
      }
    }

    this.filteredEndpointsAndPages = filterService.jsonConcat(this.filteredEndpointsAndPages, this.filteredGroupPages)

    this.filteredEndpointsAndPages = filterService.jsonConcat(this.filteredEndpointsAndPages, this.filteredGroupEndpoints)
    this.filteredEndpointsAndPages = filterService.jsonConcat(this.filteredEndpointsAndPages, this.filteredOnlyGroups)
    const versionIds = []
    if (Object.keys(this.filteredEndpointsAndPages).length !== 0) {
      for (let i = 0; i < Object.keys(this.filteredEndpointsAndPages).length; i++) {
        if (Object.keys(this.filteredEndpointsAndPages)[i] !== 'null') {
          versionIds.push(this.filteredEndpointsAndPages[Object.keys(this.filteredEndpointsAndPages)[i]].versionId)
        } else {
          delete this.filteredEndpointsAndPages[Object.keys(this.filteredEndpointsAndPages)[i]]
        }
      }
    }
    if (Object.keys(this.filteredEndpointsAndPages).length === 0) {
      this.props.show_filter_version(null, 'endpointsAndPages')
    } else {
      this.props.show_filter_version(versionIds, 'endpointsAndPages')
    }
    this.groups = this.filteredEndpointsAndPages
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

        this.props.update_groups_order(groupIds, this.props.version_id)
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

  renderBody(groupId) {
    const expanded = this.props.pages?.[this.props.rootParentId]?.clientData?.isExpanded || false
    // const { focused, expanded, firstChild } = this.props.sidebar.navList[`groups_${groupId}`]
    // const { focused: sidebarFocused } = this.props.sidebar
    // if (sidebarFocused && focused && this.scrollRef[groupId]) this.scrollToGroup(groupId)
    // const pagesToRender = []; const endpointsToRender = []
    // if (firstChild) {
    //   let childEntity = this.props.sidebar.navList[firstChild]
    //   while (childEntity) {
    //     if (childEntity.type === 'pages') pagesToRender.push(childEntity.id)
    //     if (childEntity.type === 'endpoints') endpointsToRender.push(childEntity.id)
    //     childEntity = this.props.sidebar.navList[childEntity.nextSibling]
    //   }
    // }
    return isDashboardRoute(this.props, true) ? (
      <div className='sidebar-accordion accordion pl-3' id='child-accordion'>
        <button
          tabIndex={-1}
          ref={(newRef) => {
            this.scrollRef[groupId] = newRef
          }}
          className={(expanded ? 'expanded' : '')}
        >
          <div className='d-flex align-items-center cl-name' onClick={() => this.toggleSubPageIds(groupId)}>
            <span className='versionChovron'>
              <img src={ExpandedIcon} alt='' />
            </span>
            <div className='sidebar-accordion-item d-inline text-truncate'>{this.props.pages[this.props.rootParentId].name}</div>
          </div>
          {isDashboardRoute(this.props, true) && !this.props.collections[this.props.collection_id]?.importedFromMarketPlace ? (
            <div className='sidebar-item-action d-flex align-items-center'>
              <div
                onClick={() =>
                  this
                    .openGroupPageForm
                    // this.props.groups[groupId].versionId,
                    // this.props.groups[groupId],
                    // this.props.collection_id
                    ()
                }
                className='mr-1 d-flex align-items-center'
              >
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
                <div
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
                </div>
                <div className='dropdown-item' onClick={() => this.handleDuplicate(this.props.groups[groupId])}>
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
                </div>
                <div
                  className='dropdown-item'
                  onClick={() =>
                    this.openGroupPageForm(this.props.groups[groupId].versionId, this.props.groups[groupId], this.props.collection_id)
                  }
                >
                  <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M15.75 3H2.25C1.42157 3 0.75 3.67157 0.75 4.5V13.5C0.75 14.3284 1.42157 15 2.25 15H15.75C16.5784 15 17.25 14.3284 17.25 13.5V4.5C17.25 3.67157 16.5784 3 15.75 3Z'
                      stroke='#E98A36'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <line x1='5.25' y1='15' x2='5.25' y2='3' stroke='#E98A36' strokeWidth='1.5' />
                    <path d='M14 9L8 9' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    <path d='M11 12L11 6' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                  </svg>{' '}
                  Add Page
                </div>
                <div className='dropdown-item' onClick={() => this.openShareGroupForm(this.props.groups[groupId])}>
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
          ) : null}
        </button>
        {expanded ? (
          <div className='linkWrapper versionPages'>
            <Card.Body>
              <CombinedCollections
                {...this.props}
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
      <div className='hm-sidebar-block'>
        <div className='hm-sidebar-label mb-3'>{this.props.groups[groupId].name}</div>
        <GroupPages
          {...this.props}
          version_id={this.props.groups[groupId].versionId}
          group_id={groupId}
          show_filter_groups={this.propsFromGroups.bind(this)}
          theme={this.props.collections[this.props.collection_id].theme}
        />
        <Endpoints
          {...this.props}
          group_id={groupId}
          endpoints_order={this.props.groups[groupId].endpointsOrder}
          theme={this.props.collections[this.props.collection_id].theme}
          show_filter_groups={this.propsFromGroups.bind(this)}
        />
      </div>
    )
  }

  renderForm(sortedGroups) {
    const groupsCount = sortedGroups.filter((group) => group.versionId === this.props.version_id).length
    return (
      <>
        {groupsCount === 0 && isDashboardRoute(this.props, true) && (
          <AddEntity
            placeholder='Group Name'
            type='group'
            entity={this.props.versions[this.props.version_id]}
            addNewEntity={this.props.addGroup}
          />
        )}
      </>
    )
  }

  toggleSubPageIds (id) {
    console.log(id,"idddd")
    const isExpanded = this.props.pages?.[id]?.clientData?.isExpanded || false;
    this.props.update_isExpand_for_subPages({
    value: !isExpanded,
    id: id,
  });
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
        {this.showEditGroupForm()}
        {this.showAddGroupPageForm()}
        {this.state.showDeleteModal &&
          groupsService.showDeleteGroupModal(
            this.props,
            this.closeDeleteGroupModal.bind(this),
            'Delete Group',
            `Are you sure you wish to delete this group?
              All your pages and endpoints present in this group will be deleted.`,
            this.state.selectedGroup
          )}

        {
          isDashboardRoute(this.props, true) && (
            // groupId ?
            <div className='linkWith'>{this.renderBody(this.props.rootParentId)}</div>
          )
          // : null
        }

        {!isDashboardRoute(this.props, true) &&
          this.sortedGroups &&
          this.sortedGroups
            .filter((group) => group.versionId === this.props.version_id)
            .map((group) =>
              group?.id ? (
                <div key={group.id} className='linkWith'>
                  {this.renderBody(group.id)}
                </div>
              ) : null
            )}

        <div className='pl-4'>{this.renderForm(this.sortedGroups)}</div>
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups)
