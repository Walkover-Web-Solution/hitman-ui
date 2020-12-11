import React, { Component } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
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
import './publishDocs.scss'
import WarningModal from '../common/warningModal'
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
    reject_page: (page) => dispatch(rejectPage(page))
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
      warningModal: false
    }
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

  sensitiveInfoFound () {
    // check for sensitive info in request here
    return false
  }

  async handleApproveEndpointRequest (endpointId) {
    if (this.sensitiveInfoFound()) {
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
    this.draggedItem = gId
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

  showGroups () {
    if (this.state.groups) {
      return (
        Object.keys(this.state.groups).map((groupId) =>
          this.state.groups[groupId].versionId?.toString() === this.state.selectedVersionId?.toString()
            ? this.showEndpointsAndPages(groupId)
            : null
        )
      )
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
          variant='success publish-collection-button'
          onClick={() => this.publishCollection()}
        >
          Publish Collection
        </Button>
      )
    } else {
      return (
        <Button
          variant='success publish-collection-button'
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
    if (selectedEndpointId) {
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
      <WarningModal show={this.state.warningModal} onHide={() => { this.setState({ warningModal: false }) }} title='Sensitive Information Warning' message='This Entity contains some sensitive information. Please remove them before making it public.' />
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
              <div class='title mb-1'>
                Hosted API's
              </div>
              <div className='publish-button'>
                <Dropdown>
                  <Dropdown.Toggle variant='' id='dropdown-basic'>
                    {this.props.collections[collectionId]?.name || ''}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {this.showCollections()}
                  </Dropdown.Menu>
                </Dropdown>
                {this.publishCollections()}

              </div>
            </div>
            <div className='grid hostedWrapper'>
              <PublishDocsForm
                {...this.props}
                selected_collection_id={this.state.selectedCollectionId}
              />
            </div>
            <div className='grid-two'>
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
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocs)
