import React, { Component } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import jwtDecode from 'jwt-decode'
import { makeHighlightsData } from '../endpoints/highlightChangesHelper'
import { connect } from 'react-redux'
import { updateCollection } from '../collections/redux/collectionsActions'
import {
  updateEndpoint, updateEndpointOrder
} from '../endpoints/redux/endpointsActions'
import extractCollectionInfoService from './extractCollectionInfoService'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import {
  approveEndpoint,
  rejectEndpoint,
  approvePage,
  rejectPage
} from '../publicEndpoint/redux/publicEndpointsActions'
import PublishDocsForm from './publishDocsForm'
import DisplayPage from '../pages/displayPage'
import { updatePage, updatePageOrder } from '../pages/redux/pagesActions'
import {
  updateGroupOrder
} from '../groups/redux/groupsActions'
import './publishDocs.scss'
import WarningModal from '../common/warningModal'
import Footer from '../main/Footer'
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings.svg'
const isEqual = require('react-fast-compare')

const URI = require('urijs')

const publishDocsEnum = {
  PENDING_STATE: 'Pending',
  REJECT_STATE: 'Reject',
  APPROVED_STATE: 'Approved',
  DRAFT_STATE: 'Draft',
  EMPTY_STRING: ''
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_endpoints_order: (endpointIds, groupId) =>
      dispatch(updateEndpointOrder(endpointIds, groupId)),
    set_page_ids: (pageIds) => dispatch(updatePageOrder(pageIds)),
    update_page: (editedPage) =>
      dispatch(updatePage(ownProps.history, editedPage, 'publishDocs')),
    update_endpoint: (editedEndpoint) =>
      dispatch(updateEndpoint(editedEndpoint)),
    update_collection: (editedCollection) =>
      dispatch(updateCollection(editedCollection)),
    approve_endpoint: (endpoint) => dispatch(approveEndpoint(endpoint)),
    reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
    approve_page: (page) => dispatch(approvePage(page)),
    reject_page: (page) => dispatch(rejectPage(page)),
    update_groups_order: (groupIds, versionId) =>
      dispatch(updateGroupOrder(groupIds, versionId))
  }
}

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    endpoints: state.endpoints
  }
}

class PublishDocs extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedCollectionId: null,
      warningModal: false,
      sDocPropertiesComplete: false,
      openPageSettingsSidebar: false
    }
    this.wrapperRef = React.createRef()
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentDidMount () {
    const collectionInfo = this.extractCollectionInfo()
    const items = this.getInitialItems(Object.keys(
      collectionInfo.versions)[0],
    collectionInfo.groups,
    collectionInfo.endpoints,
    collectionInfo.pages
    )
    this.setState({
      selectedCollectionId: URI.parseQuery(this.props.location.search)
        .collectionId,
      selectedVersionId: Object.keys(collectionInfo.versions)[0],
      selectedGroupId: items?.selectedGroupId || null,
      selectedEndpointId: items?.selectedEndpointId || null,
      selectedPageId: items?.selectedPageId || null
    })
  }

  handleClickOutside (event) {
    if (this.state.openPageSettingsSidebar && this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      document.removeEventListener('mousedown', this.handleClickOutside)
      this.setState({ openPageSettingsSidebar: false })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps !== this.props) {
      const collectionInfo = this.extractCollectionInfo()
      if (!(this.state.selectedEndpointId || this.state.selectedPageId) ||
        this.state.selectedCollectionId !== URI.parseQuery(this.props.location.search).collectionId
      ) {
        const items = this.getInitialItems(Object.keys(
          collectionInfo.versions)[0],
        collectionInfo.groups,
        collectionInfo.endpoints,
        collectionInfo.pages
        )
        this.setState({
          selectedCollectionId: URI.parseQuery(this.props.location.search)
            .collectionId,
          selectedVersionId: Object.keys(collectionInfo.versions)[0],
          selectedGroupId: items?.selectedGroupId || null,
          selectedEndpointId: items?.selectedEndpointId || null,
          selectedPageId: items?.selectedPageId || null
        })
      }
    }
  }

  getInitialItems (versionId, groups, endpoints, pages, endpointId = null, pageId = null) {
    for (let i = 0; i < Object.keys(groups).length; i++) {
      if (groups[Object.keys(groups)[i]].versionId?.toString() === versionId?.toString()) {
        const groupId = groups[Object.keys(groups)[i]].id
        for (let i = 0; i < Object.keys(endpoints).length; i++) {
          if (
            endpoints[Object.keys(endpoints)[i]].groupId?.toString() === groupId?.toString() &&
            (
              endpoints[Object.keys(endpoints)[i]].isPublished === true ||
              endpoints[Object.keys(endpoints)[i]].state === publishDocsEnum.PENDING_STATE
            ) &&
            endpointId?.toString() !== Object.keys(endpoints)[i]?.toString()
          ) {
            const items = {
              selectedGroupId: groupId,
              selectedEndpointId: Object.keys(endpoints)[i],
              selectedPageId: null
            }
            return items
          }
        }
        for (let i = 0; i < Object.keys(pages).length; i++) {
          if (
            pages[Object.keys(pages)[i]].versionId?.toString() === versionId?.toString() &&
            (pages[Object.keys(pages)[i]].isPublished === true ||
              pages[Object.keys(pages)[i]].state === publishDocsEnum.PENDING_STATE) &&
            pageId?.toString() !== Object.keys(pages)[i]?.toString()
          ) {
            const items = {
              selectedGroupId: null,
              selectedEndpointId: null,
              selectedPageId: Object.keys(pages)[i]
            }
            return items
          }
        }
        for (let i = 0; i < Object.keys(pages).length; i++) {
          if (
            pages[Object.keys(pages)[i]].groupId?.toString() === groupId?.toString() &&
            (pages[Object.keys(pages)[i]].isPublished === true ||
              pages[Object.keys(pages)[i]].state === publishDocsEnum.PENDING_STATE) &&
            pageId?.toString() !== Object.keys(pages)[i]?.toString()
          ) {
            const items = {
              selectedGroupId: groupId,
              selectedEndpointId: null,
              selectedPageId: Object.keys(pages)[i]
            }
            return items
          }
        }
        const items = {
          selectedGroupId: null,
          selectedEndpointId: null,
          selectedPageId: null
        }
        return items
      }
    }
  }

  extractCollectionInfo () {
    const selectedCollectionId = URI.parseQuery(this.props.location.search).collectionId
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(selectedCollectionId, this.props)
    const groups = extractCollectionInfoService.extractGroupsFromVersions(versions, this.props)
    const pages = extractCollectionInfoService.extractPagesFromVersions(versions, this.props)
    const endpoints = extractCollectionInfoService.extractEndpointsFromGroups(groups, this.props)
    this.setState({
      versions, groups, pages, endpoints
    })
    return { versions, groups, pages, endpoints }
  }

  setSelectedCollection (collection) {
    this.props.history.push({
      pathname: '/admin/publish',
      search: `?collectionId=${collection?.id}`
    })
  }

  openEndpoint (groupId, endpointId) {
    this.setState({
      selectedGroupId: groupId,
      selectedEndpointId: endpointId,
      selectedPageId: false
    })
  }

  setSelectedVersion (e) {
    const items = this.getInitialItems(
      e.currentTarget.value,
      this.state.groups,
      this.state.endpoints,
      this.state.pages
    )
    this.setState({
      selectedVersionId: e.currentTarget.value,
      selectedGroupId: items?.selectedGroupId || null,
      selectedEndpointId: items?.selectedEndpointId || null,
      selectedPageId: items?.selectedPageId || null
    })
  }

  sensitiveInfoFound (endpoint) {
    // check for sensitive info in request here
    let result = false
    // first check access_token in params
    if (typeof endpoint?.params?.access_token === 'object') {
      const value = typeof endpoint.params.access_token.value === 'string' ? endpoint.params.access_token.value : ''
      const authData = value.split(' ')
      if (authData.length === 1) {
        try {
          jwtDecode(authData[0])
          return true
        } catch (err) {
          result = false
        }
      }
    }
    // first check Authorization in headers
    if (typeof endpoint?.headers?.Authorization === 'object') {
      const value = typeof endpoint.headers.Authorization.value === 'string' ? endpoint.headers.Authorization.value : ''
      const authData = value.split(' ')
      if (authData.length === 1) {
        try {
          jwtDecode(authData[0])
          return true
        } catch (err) {
          result = false
        }
      }
      if (authData.length === 2) {
        switch (authData[0]) {
          case 'Basic':
            try {
              const string = authData[1]
              window.atob(string)
              return true
            } catch (err) {
              result = false
            }
            break
          case 'Bearer':
            try {
              jwtDecode(authData[1])
              return true
            } catch (err) {
              result = false
            }
            break
          default: result = false
        }
      }
    }
    // check for all params if theres any JWT token
    if (typeof endpoint.params === 'object') {
      Object.entries(endpoint.params).forEach(entry => {
        const value = typeof entry[1].value === 'string' ? entry[1].value : ''
        const authData = value.split(' ')
        authData.forEach(item => {
          try {
            jwtDecode(item)
            result = true
          } catch (err) {
          }
        })
      })
    }
    // check all headers if theres any JWT token
    if (typeof endpoint.headers === 'object') {
      Object.entries(endpoint.headers).forEach(entry => {
        const value = typeof entry[1].value === 'string' ? entry[1].value : ''
        const authData = value.split(' ')
        authData.forEach(item => {
          try {
            jwtDecode(item)
            result = true
          } catch (err) {
          }
        })
      })
    }
    return result
  }

  async handleApproveEndpointRequest (endpointId) {
    if (this.sensitiveInfoFound(this.props.endpoints[endpointId])) {
      this.setState({ warningModal: true })
    } else {
      this.props.approve_endpoint(this.props.endpoints[endpointId])
    }
  }

  async handleRejectEndpointRequest (endpointId) {
    if (this.state.endpoints[endpointId].isPublished) {
      //
    } else {
      const items = this.getInitialItems(this.state.selectedVersionId,
        this.state.groups,
        this.state.endpoints,
        this.state.pages,
        endpointId
      )
      this.setState({
        selectedGroupId: items?.selectedGroupId || null,
        selectedEndpointId: items?.selectedEndpointId || null,
        selectedPageId: items?.selectedPageId || null
      })
    }
    this.props.reject_endpoint(this.props.endpoints[endpointId])
  }

  openPage (groupId, pageId) {
    this.setState({
      selectedGroupId: groupId,
      selectedEndpointId: false,
      selectedPageId: pageId
    })
  }

  async handleApprovePageRequest (pageId) {
    this.props.approve_page(this.props.pages[pageId])
  }

  async handleRejectPageRequest (pageId) {
    this.props.reject_page(this.props.pages[pageId])
    if (this.state.pages[pageId].isPublished) {
      //
    } else {
      const items = this.getInitialItems(this.state.selectedVersionId,
        this.state.groups,
        this.state.endpoints,
        this.state.pages
      )
      this.setState({
        selectedGroupId: items?.selectedGroupId || null,
        selectedEndpointId: items?.selectedEndpointId || null,
        selectedPageId: items?.selectedPageId || null
      })
    }
  }

  displayState (endpoint) {
    if (endpoint.state === publishDocsEnum.PENDING_STATE) {
      return <span class='status-new'> New</span>
    } else if (endpoint.state === publishDocsEnum.DRAFT_STATE) {
      return <span class='status-edit'> Edit</span>
    }
  }

  filterEndpoints (groupId) {
    const endpoints = {}
    for (let i = 0; i < Object.keys(this.state.endpoints).length; i++) {
      if ((this.state.endpoints[Object.keys(this.state.endpoints)[i]].isPublished === true ||
        this.state.endpoints[Object.keys(this.state.endpoints)[i]].state === publishDocsEnum.PENDING_STATE) &&
        this.state.endpoints[Object.keys(this.state.endpoints)[i]].groupId === groupId
      ) {
        endpoints[Object.keys(this.state.endpoints)[i]] = this.state.endpoints[Object.keys(this.state.endpoints)[i]]
      }
    }
    const sortedEndpoints = Object.values(endpoints).sort(function (a, b) {
      return a.position - b.position
    })
    return (
      <span>
        {sortedEndpoints.map((endpoint) =>
          <div
            draggable
            onDragOver={(e) => {
              e.preventDefault()
            }}
            onDragStart={(e) => this.onDragStart(e, endpoint.id)}
            onDrop={(e) => this.onDrop(e, endpoint.id, sortedEndpoints, 'endpoints')}
            key={endpoint.id} onClick={() => this.openEndpoint(groupId, endpoint.id)}
            className={this.state.selectedEndpointId === endpoint.id ? 'groupListing active' : 'groupListing'}
          >
            {/* <span className='tag'>E</span> */}
            {endpoints[endpoint.id]?.name}
            {this.displayState(endpoints[endpoint.id])}
          </div>
        )}
      </span>
    )
  }

  filterPages (groupId) {
    const pages = {}
    if (groupId) {
      if (this.state.pages) {
        for (let i = 0; i < Object.keys(this.state.pages).length; i++) {
          if (
            (this.state.pages[Object.keys(this.state.pages)[i]].isPublished === true ||
              this.state.pages[Object.keys(this.state.pages)[i]].state === publishDocsEnum.PENDING_STATE
            ) &&
            this.state.pages[Object.keys(this.state.pages)[i]].groupId === groupId
          ) {
            pages[Object.keys(this.state.pages)[i]] = this.state.pages[Object.keys(this.state.pages)[i]]
          }
        }
        const sortedPages = Object.values(pages).sort(function (a, b) {
          return a.position - b.position
        })

        return (
          <div className='pages-inner'>
            {sortedPages.map((page) =>
              <div
                draggable
                onDragStart={(e) => this.onDragStart(e, page.id)}
                onDragOver={(e) => {
                  e.preventDefault()
                }}
                onDrop={(e) => this.onDrop(e, page.id, sortedPages, 'pages')}
                key={page.id} onClick={() => this.openPage(groupId, page.id)}
                className={this.state.selectedPageId === page.id ? 'groupListing active' : 'groupListing'}
              >
                {/* <span className='tag'>P</span> */}
                {this.state.pages[page.id]?.name}
                {this.displayState(pages[page.id])}
              </div>
            )}
          </div>
        )
      }
    } else {
      if (this.state.pages) {
        for (let i = 0; i < Object.keys(this.state.pages).length; i++) {
          if ((this.state.pages[Object.keys(this.state.pages)[i]].isPublished === true ||
            this.state.pages[Object.keys(this.state.pages)[i]].state === publishDocsEnum.PENDING_STATE) &&
            this.state.pages[Object.keys(this.state.pages)[i]].groupId === null &&
            this.state.pages[Object.keys(this.state.pages)[i]].versionId === this.state.selectedVersionId
          ) {
            pages[Object.keys(this.state.pages)[i]] = this.state.pages[Object.keys(this.state.pages)[i]]
          }
        }
        const sortedPages = Object.values(pages).sort(function (a, b) {
          return a.position - b.position
        })
        if (Object.keys(pages).length === 0) return
        return (
          <div className='pages-inner-wrapper'>
            {sortedPages.map((page) =>
              <div
                draggable
                onDragStart={(e) => this.onDragStart(e, page.id)}
                onDragOver={(e) => {
                  e.preventDefault()
                }}
                onDrop={(e) => this.onDrop(e, page.id, sortedPages, 'pages')}
                key={page.id} onClick={() => this.openPage('', page.id)}
                className={this.state.selectedPageId === page.id ? 'groupListing active' : 'groupListing'}
              >
                {/* <span className='tag'>P</span> */}
                {this.state.pages[page.id]?.name}
                {this.displayState(pages[page.id])}
              </div>
            )}
          </div>
        )
      }
    }
  }

  onDragStart (e, gId) {
    if (!this.draggedItem) { this.draggedItem = gId }
  };

  onDrop (e, destinationItemId, sortedData, item) {
    e.preventDefault()
    if (!this.draggedItem) {
      //
    } else {
      if (this.draggedItem === destinationItemId) {
        this.draggedItem = null
        return
      }
      const ids = []
      sortedData.map((data) => ids.push(data.id))
      let index = ''
      let dropCheckFlag = false
      for (let i = 0; i < ids.length; i++) {
        if (ids[i] === destinationItemId) {
          index = i
        }
        if (this.draggedItem === ids[i]) {
          dropCheckFlag = true
        }
      }
      if (!dropCheckFlag) return
      const itemIds = ids.filter(
        (item) => item !== this.draggedItem
      )
      itemIds.splice(index, 0, this.draggedItem)
      if (item === 'pages') { this.props.set_page_ids(itemIds) }
      if (item === 'endpoints') { this.props.update_endpoints_order(itemIds) }
      if (item === 'groups') {
        this.props.update_groups_order(itemIds, this.state.selectedVersionId)
      }
      this.draggedItem = null
    }
  }

  getSelectedCollection () {
    const collectionId = URI.parseQuery(this.props.location.search)
      .collectionId
    const selectedCollection = this.props.collections[collectionId]
    return selectedCollection || {}
  }

  isCollectionPublished () {
    const selectedCollection = this.getSelectedCollection()
    return selectedCollection?.isPublic || false
  }

  publishCollection () {
    const selectedCollection = this.getSelectedCollection()
    if (selectedCollection?.isPublic !== true) {
      const editedCollection = { ...selectedCollection }
      editedCollection.isPublic = true
      this.props.update_collection(editedCollection)
    }
  }

  unPublishCollection () {
    const selectedCollection = this.getSelectedCollection()
    if (selectedCollection?.isPublic === true) {
      const editedCollection = { ...selectedCollection }
      editedCollection.isPublic = false
      this.props.update_collection(editedCollection)
    }
  }

  dataFetched () {
    return (
      this.props.collections &&
      this.props.versions &&
      this.props.groups &&
      this.props.endpoints &&
      this.props.pages
    )
  }

  isPageApprovalPending (page) {
    return page?.state === publishDocsEnum.PENDING_STATE ||
      (page?.state === publishDocsEnum.DRAFT_STATE &&
        page?.isPublished)
  }

  isEndpointApprovalPending (endpoint) {
    return endpoint?.state === publishDocsEnum.PENDING_STATE ||
      (endpoint?.state === publishDocsEnum.DRAFT_STATE &&
        endpoint?.isPublished)
  }

  collectionHasPageChanges (versionIds) {
    const allPageIds = Object.keys(this.props.pages)
    for (let i = 0; i < allPageIds.length; i++) {
      const pageId = allPageIds[i]
      const page = this.props.pages[pageId]
      if (versionIds.includes(page.versionId)) {
        if (this.isPageApprovalPending(page)) {
          return true
        }
      }
    }
  }

  filterGroups (groupIds, versionIds) {
    let groupsArray = []

    groupIds.forEach(gId => {
      const group = this.props.groups[gId]
      if (versionIds.includes(group.versionId)) {
        groupsArray = [...groupsArray, gId]
      }
    })
    return groupsArray || []
  }

  collectionHasEndpointChanges (versionIds) {
    const allGroupIds = Object.keys(this.props.groups)
    const allEndpointIds = Object.keys(this.props.endpoints)
    const groupsArray = this.filterGroups(allGroupIds, versionIds)
    for (let i = 0; i < allEndpointIds.length; i++) {
      const endpointId = allEndpointIds[i]
      const endpoint = this.props.endpoints[endpointId]
      if (groupsArray.includes(endpoint.groupId)) {
        if (this.isEndpointApprovalPending(endpoint)) {
          return true
        }
      }
    }
  }

  collectionHasChanges (collectionId) {
    if (this.dataFetched()) {
      const versionIds = Object.keys(this.props.versions).filter(
        (vId) => this.props.versions[vId].collectionId === collectionId
      )
      if (this.collectionHasPageChanges(versionIds)) {
        return true
      } else if (this.collectionHasEndpointChanges(versionIds)) {
        return true
      } else {
        return false
      }
    }
  }

  showCollections () {
    if (this.props.collections) {
      return (
        Object.keys(this.props.collections).map(
          (id, index) => (
            <Dropdown.Item key={index} onClick={() => this.setSelectedCollection(this.props.collections[id])}>
              {this.props.collections[id]?.name}
              {this.collectionHasChanges(id) && <i class='fas fa-circle' />}
            </Dropdown.Item>
          ))
      )
    }
  }

  showVersions () {
    if (this.state.versions) {
      return (
        Object.keys(this.state.versions).map((id) =>
          <option key={id} value={id}>{this.props.versions[id]?.number}</option>
        )
      )
    }
  }

  showEndpointsAndPages (groupId) {
    return (
      <div key={groupId} className='groups-inner'>
        <h3> {this.state.groups[groupId]?.name}</h3>
        {this.filterPages(groupId)}
        {this.filterEndpoints(groupId)}
      </div>
    )
  }

  groupsToShow (versionId) {
    const versionGroups = extractCollectionInfoService.extractGroupsFromVersionId(versionId, this.props)
    const endpointsToCheck = extractCollectionInfoService.extractEndpointsFromGroups(versionGroups, this.props)
    const filteredEndpoints = Object.values(endpointsToCheck).filter(endpoint => endpoint.state === publishDocsEnum.PENDING_STATE || endpoint.isPublished)
    const publicGroupIds = new Set()
    filteredEndpoints.forEach(endpoint => {
      publicGroupIds.add(endpoint.groupId)
    })
    const publicGroups = {}
    publicGroupIds.forEach(id => {
      publicGroups[id] = versionGroups[id]
    })
    return publicGroups
  }

  showGroups () {
    if (this.state.groups) {
      const sortedGroups = Object.values(this.groupsToShow(this.state.selectedVersionId)).sort(function (a, b) {
        return a.position - b.position
      })
      if (sortedGroups.length !== 0) {
        return (
          sortedGroups.map((group) =>
            <div
              key={group.id}
              draggable
              onDragOver={(e) => {
                e.preventDefault()
              }}
              onDragStart={(e) => this.onDragStart(e, group.id)}
              onDrop={(e) => this.onDrop(e, group.id, sortedGroups, 'groups')}
            >{this.showEndpointsAndPages(group.id)}
            </div>
          )
        )
      }
    }
  }

  showEndpoints () {
    let endpointName = publishDocsEnum.EMPTY_STRING
    if (this.state.endpoints) {
      if (this.state.endpoints[this.state.selectedEndpointId]?.state === publishDocsEnum.REJECT_STATE) {
        endpointName = this.props.endpoints[this.state.selectedEndpointId]?.publishedEndpoint?.name
      } else {
        endpointName = this.props.endpoints[this.state.selectedEndpointId]?.name
      }
    }
    if (this.state.selectedEndpointId) {
      return (
        <div>
          <div className='d-flex justify-content-between mx-2 mb-3'>
            <div> <div className='contacts mb-2'>{this.props.groups[this.state.selectedGroupId]?.name}</div>
              <div className='list-contacts'>
                {endpointName}
              </div>
            </div>
            {this.endpointPublishAndReject()}
          </div>
          {this.checkEndpointState()}
        </div>

      )
    }
  }

  checkEndpointState () {
    if (this.state.selectedEndpointId && this.state.endpoints[this.state.selectedEndpointId]) {
      if (this.state.endpoints[this.state.selectedEndpointId]?.state === publishDocsEnum.REJECT_STATE) {
        return (
          <DisplayEndpoint rejectedEndpointId={this.state.selectedEndpointId} endpointId={this.state.selectedEndpointId} groupId={this.state.selectedGroupId} {...this.props} />
        )
      } else {
        return (
          <DisplayEndpoint rejected={false} endpointId={this.state.selectedEndpointId} groupId={this.state.selectedGroupId} {...this.props} highlights={this.setChangeHighlighting() || null} />
        )
      }
    }
  }

  handleRemovePublicEndpoint (endpointId) {
    this.props.update_endpoint({
      ...this.state.endpoints[endpointId],
      groupId: this.state.selectedGroupId,
      isPublished: false,
      publishedEndpoint: {},
      state: 'Draft',
      position: null
    })
    const items = this.getInitialItems(this.state.selectedVersionId,
      this.state.groups,
      this.state.endpoints,
      this.state.pages,
      endpointId
    )
    this.setState({
      selectedGroupId: items?.selectedGroupId || null,
      selectedEndpointId: items?.selectedEndpointId || null,
      selectedPageId: items?.selectedPageId || null
    })
  }

  handleRemovePublicPage (pageId) {
    const page = { ...this.state.pages[pageId] }
    page.isPublished = false
    page.publishedEndpoint = {}
    page.state = 'Draft'
    page.position = null
    this.props.update_page(page)
    const items = this.getInitialItems(this.state.selectedVersionId,
      this.state.groups,
      this.state.endpoints,
      this.state.pages
    )
    this.setState({
      selectedGroupId: items?.selectedGroupId || null,
      selectedEndpointId: items?.selectedEndpointId || null,
      selectedPageId: items?.selectedPageId || null
    })
  }

  endpointPublishAndReject () {
    if (this.state.endpoints[this.state.selectedEndpointId]?.state !== publishDocsEnum.APPROVED_STATE &&
      this.state.endpoints[this.state.selectedEndpointId]?.state !== publishDocsEnum.REJECT_STATE) {
      return (
        <div className='publish-reject mt-3 d-flex'>
          <button class='btn btn-outline danger mr-3' onClick={() => this.handleRejectEndpointRequest(this.state.selectedEndpointId)}>Reject</button>
          <div className='publish-button'>  <Button variant='success' onClick={() => this.handleApproveEndpointRequest(this.state.selectedEndpointId)}>PUBLISH</Button>
          </div>
        </div>
      )
    } else {
      return (
        <div className='publish-reject mt-3 d-flex'>
          <div className='publish-button'>  <Button variant='success' onClick={() => this.handleRemovePublicEndpoint(this.state.selectedEndpointId)}>Unpublish Endpoint</Button>
          </div>
        </div>
      )
    }
  }

  pagePublishAndReject () {
    if (this.state.pages[this.state.selectedPageId]?.state !== publishDocsEnum.APPROVED_STATE &&
      this.state.pages[this.state.selectedPageId]?.state !== publishDocsEnum.REJECT_STATE
    ) {
      return (
        <div className='publish-reject mt-3 d-flex'>
          <button class='btn btn-outline danger mr-3' onClick={() => this.handleRejectPageRequest(this.state.selectedPageId)}>Reject</button>
          <div className='publish-button'>  <Button variant='success' onClick={() => this.handleApprovePageRequest(this.state.selectedPageId)}>PUBLISH</Button>
          </div>
        </div>
      )
    } else {
      return (
        <div className='publish-reject mt-3 d-flex'>
          <div className='publish-button'>  <Button variant='success' onClick={() => this.handleRemovePublicPage(this.state.selectedPageId)}>Unpublish Page</Button>
          </div>
        </div>
      )
    }
  }

  showPages () {
    let pageName = publishDocsEnum.EMPTY_STRING
    if (this.state.pages) {
      if (this.state.pages[this.state.selectedPageId]?.state === publishDocsEnum.REJECT_STATE) {
        pageName = this.props.pages[this.state.selectedPageId]?.publishedPage.name
      } else {
        pageName = this.props.pages[this.state.selectedPageId]?.name
      }
    }

    if (this.state.selectedPageId) {
      return (
        <div className='row'>
          <div className='col-12'>
            <div className='d-flex justify-content-between mx-2 mb-3 mt-4'>
              <div>
                <div className='contacts mb-2'>{this.props.groups[this.state.selectedGroupId]?.name}</div>
                <div className='list-contacts'>
                  {pageName}
                </div>
              </div>
              {this.pagePublishAndReject()}
            </div>
            {this.checkPageState()}
          </div>
        </div>
      )
    }
  }

  checkPageState () {
    if (this.state.pages) {
      if (this.state.pages[this.state.selectedPageId]?.state === publishDocsEnum.REJECT_STATE) {
        return (
          <DisplayPage rejected pageId={this.state.selectedPageId} groupId={this.state.selectedGroupId} {...this.props} />
        )
      } else {
        return (
          <DisplayPage pageId={this.state.selectedPageId} groupId={this.state.selectedGroupId} {...this.props} />
        )
      }
    }
  }

  publishCollections () {
    if (!this.isCollectionPublished()) {
      return (
        <Button
          variant='success publish-collection-button ml-4'
          onClick={() => this.publishCollection()}
        >
          Publish Collection
        </Button>
      )
    } else {
      return (
        <Button
          variant='btn btn-outline danger ml-4'
          onClick={() => this.unPublishCollection()}
        >
          Unpublish Doc
        </Button>
      )
    }
  }

  setChangeHighlighting () {
    const { selectedEndpointId } = this.state
    let result = {
      BASE_URL: null,
      authorizationType: null,
      body: {
        isChanged: null,
        type: null,
        value: null
      },
      bodyDescription: null,
      headers: {
        isChanged: null,
        items: {}
      },
      name: null,
      params: {
        isChanged: null,
        items: {}
      },
      pathVariables: {
        isChanged: null,
        items: {}
      },
      requestType: null,
      sampleResponse: {
        isChanged: null,
        items: {}
      },
      uri: null
    }
    if (selectedEndpointId && this.state.endpoints[selectedEndpointId]) {
      const endpoint = this.state.endpoints[selectedEndpointId]
      if (endpoint.state === publishDocsEnum.DRAFT_STATE && endpoint.isPublished) {
        const originalEndpoint = JSON.parse(JSON.stringify(endpoint.publishedEndpoint))
        const currentChanges = JSON.parse(JSON.stringify(endpoint))
        delete originalEndpoint.publishedEndpoint
        delete currentChanges.publishedEndpoint
        result = {
          BASE_URL: !isEqual(originalEndpoint.BASE_URL, currentChanges.BASE_URL),
          authorizationType: null,
          body: {
            isChanged: !isEqual(originalEndpoint.body, currentChanges.body),
            type: !isEqual(originalEndpoint.body.type, currentChanges.body.type),
            value: (currentChanges.body.type === 'multipart/form-data' || currentChanges.body.type === 'application/x-www-form-urlencoded') ? makeHighlightsData(originalEndpoint.body.value, currentChanges.body.value, 'body') : !isEqual(originalEndpoint.body.value, currentChanges.body.value)
          },
          bodyDescription: null,
          headers: makeHighlightsData(originalEndpoint.headers, currentChanges.headers, 'headers'),
          name: !isEqual(originalEndpoint.name, currentChanges.name),
          params: makeHighlightsData(originalEndpoint.params, currentChanges.params, 'params'),
          pathVariables: makeHighlightsData(originalEndpoint.pathVariables, currentChanges.pathVariables, 'pathVariables'),
          requestType: !isEqual(originalEndpoint.requestType, currentChanges.requestType),
          sampleResponse: makeHighlightsData(originalEndpoint.sampleResponse, currentChanges.sampleResponse, 'sampleResponse'),
          uri: !isEqual(originalEndpoint.uri, currentChanges.uri)
        }
        return result
      }
    }
    return result
  }

  renderWarningModal () {
    return (
      <WarningModal show={this.state.warningModal} ignoreButtonCallback={() => this.props.approve_endpoint(this.props.endpoints[this.state.selectedEndpointId])} onHide={() => { this.setState({ warningModal: false }) }} title='Sensitive Information Warning' message='This Entity contains some sensitive information. Please remove them before making it public.' />
    )
  }

  checkDocProperties (collectionId) {
    const collection = this.props.collections[collectionId]
    return !!(collection?.docProperties?.defaultTitle)
  }

  renderDocsFormSidebar () {
    return (
      <div ref={this.wrapperRef} className='right-sidebar hostedWrapper'>
        <div className='modal-title h4'>Page Settings</div>
        <PublishDocsForm
          {...this.props}
          selected_collection_id={this.state.selectedCollectionId}
          isSidebar
        />
      </div>
    )
  }

  renderPageSettingButton () {
    return (
      <div className='d-flex align-items-center mx-3'>
        <button
          className='pageSettingsButton'
          onClick={() => {
            this.setState({ openPageSettingsSidebar: !this.state.openPageSettingsSidebar }, () => {
              document.addEventListener('mousedown', this.handleClickOutside)
            })
          }}
        >
          <SettingsIcon />
        </button>
      </div>
    )
  }

  renderHostedAPIDetials () {
    return (
      <>
        <div className='hosted-doc-heading'>Hosted API Doc</div>
        <div className='publish-button'>
          {this.rednerHostedAPIDropdown()}
          {this.publishCollections()}
          {this.renderPageSettingButton()}
        </div>
        <div className='grid-two'>
          {this.state.openPageSettingsSidebar && this.renderDocsFormSidebar()}
          <div className='versions-section'>
            <select
              className='form-control mb-3' onChange={this.setSelectedVersion.bind(this)} value={this.state.selectedVersionId}
            >
              {this.showVersions()}
            </select>
            {this.filterPages(null)}
            <div className='version-groups'>
              {this.showGroups()}
            </div>
          </div>
          <div className='version-details'>
            {this.showEndpoints()}
            {this.showPages()}
          </div>
        </div>
      </>
    )
  }

  renderFullPageDocForm () {
    return (
      <>
        <div className='publish-api-doc d-block'>
          <div className='hosted-doc-heading'>Publish API Doc</div>
          <div className='publish-api-doc-container my-3'>
            <div className='form-group'>
              <label>Hosted API's</label>
              {this.rednerHostedAPIDropdown()}
            </div>
            <PublishDocsForm
              {...this.props}
              selected_collection_id={this.state.selectedCollectionId}
            />
          </div>
        </div>
      </>
    )
  }

  rednerHostedAPIDropdown () {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    return (
      <>
        <Dropdown>
          <Dropdown.Toggle variant='' id='dropdown-basic'>
            {this.props.collections[collectionId]?.name || ''}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {this.showCollections()}
          </Dropdown.Menu>
        </Dropdown>
      </>
    )
  }

  render () {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    return (
      <div className='publish-docs-container'>
        {this.renderWarningModal()}
        <div className='publish-docs-wrapper'>
          <div class='content-panel'>
            <div className='hosted-APIs'>
              {this.state.selectedCollectionId && this.props.collections[this.state.selectedCollectionId] && (
                !this.checkDocProperties(collectionId)
                  ? this.renderFullPageDocForm()
                  : this.renderHostedAPIDetials()
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocs)
