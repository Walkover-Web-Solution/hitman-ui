import React, { Component } from 'react'
import { Button, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { makeHighlightsData } from '../endpoints/highlightChangesHelper'
import { connect } from 'react-redux'
import { updateCollection } from '../collections/redux/collectionsActions'
import { updateEndpoint, updateEndpointOrder } from '../endpoints/redux/endpointsActions'
import extractCollectionInfoService from './extractCollectionInfoService'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import { approveEndpoint, rejectEndpoint, approvePage, rejectPage } from '../publicEndpoint/redux/publicEndpointsActions'
import PublishDocsForm from './publishDocsForm'
import DisplayPage from '../pages/displayPage'
import { updatePage, updatePageOrder } from '../pages/redux/pagesActions'
import './publishDocs.scss'
import WarningModal from '../common/warningModal'
import Footer from '../main/Footer'
import { SortableHandle, SortableContainer, SortableElement } from 'react-sortable-hoc'
import { ReactComponent as DragHandleIcon } from '../../assets/icons/drag-handle.svg'
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings.svg'
import { ReactComponent as ExternalLinks } from '../../assets/icons/externalLinks.svg'
import PublishDocsConfirmModal from './publishDocsConfirmModal'
import { moveToNextStep } from '../../services/widgetService'
import { openExternalLink, sensitiveInfoFound } from '../common/utility'
import { publishData } from '../modals/redux/modalsActions'
const isEqual = require('react-fast-compare')

const URI = require('urijs')

// 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
const publishDocsEnum = {
  PENDING_STATE: 0,
  REJECT_STATE: 3,
  APPROVED_STATE: 2,
  DRAFT_STATE: 1,
  EMPTY_STRING: ''
}
const DragHandle = SortableHandle(() => (
  <span className='dragIcon mr-2'>
    <DragHandleIcon />
  </span>
))
const SortableItem = SortableElement(({ children }) => {
  return <>{children}</>
})

const SortableList = SortableContainer(({ children }) => {
  return <>{children}</>
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_endpoints_order: (endpointIds, groupId) => dispatch(updateEndpointOrder(endpointIds, groupId)),
    set_page_ids: (pageIds) => dispatch(updatePageOrder(pageIds)),
    update_page: (editedPage) => dispatch(updatePage(ownProps.history, editedPage, 'publishDocs')),
    update_endpoint: (editedEndpoint) => dispatch(updateEndpoint(editedEndpoint)),
    update_collection: (editedCollection) => dispatch(updateCollection(editedCollection)),
    approve_endpoint: (endpoint, publishLoaderHandler) => dispatch(approveEndpoint(endpoint, publishLoaderHandler)),
    reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
    approve_page: (page, publishPageLoaderHandler) => dispatch(approvePage(page, publishPageLoaderHandler)),
    reject_page: (page) => dispatch(rejectPage(page)),
    ON_PUBLISH_DOC: (data) => dispatch(publishData(data))
  }
}

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    endpoints: state.pages
  }
}

class PublishDocs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCollectionId: null,
      warningModal: false,
      sDocPropertiesComplete: false,
      openPageSettingsSidebar: false,
      publishLoader: false,
      publishPageLoader: false,
      showPublishDocConfirmModal: false
    }
    this.wrapperRef = React.createRef()
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentDidMount() {
    const collectionInfo = this.extractCollectionInfo()
    const items = this.getInitialItems(
      Object.keys(collectionInfo.versions)[0],
      collectionInfo.groups,
      collectionInfo.endpoints,
      collectionInfo.pages
    )

    this.setState({
      selectedCollectionId: URI.parseQuery(this.props.location.search).collectionId,
      selectedVersionId: Object.keys(collectionInfo.versions)[0],
      selectedGroupId: items?.selectedGroupId || null,
      selectedEndpointId: items?.selectedEndpointId || null,
      selectedPageId: items?.selectedPageId || null
    })
  }

  handleClickOutside(event) {
    if (this.state.openPageSettingsSidebar && this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      document.removeEventListener('mousedown', this.handleClickOutside)
      this.setState({ openPageSettingsSidebar: false })
    }
    // this.props.ON_PUBLISH_DOC(false)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selectedEndpointId !== prevState.selectedEndpointId) {
      this.publishLoaderHandler()
    }
    if (this.state.selectedPageId !== prevState.selectedPageId) {
      this.publishPageLoaderHandler()
    }
    if (prevProps !== this.props) {
      const collectionInfo = this.extractCollectionInfo()
      if (
        !(this.state.selectedEndpointId || this.state.selectedPageId) ||
        this.state.selectedCollectionId !== URI.parseQuery(this.props.location.search).collectionId
      ) {
        const items = this.getInitialItems(
          Object.keys(collectionInfo.versions)[0],
          collectionInfo.groups,
          collectionInfo.endpoints,
          collectionInfo.pages
        )
        this.setState({
          selectedCollectionId: URI.parseQuery(this.props.location.search).collectionId,
          selectedVersionId: Object.keys(collectionInfo.versions)[0],
          selectedGroupId: items?.selectedGroupId || null,
          selectedEndpointId: items?.selectedEndpointId || null,
          selectedPageId: items?.selectedPageId || null
        })
      }
    }
    if (this.props.location !== prevProps.location && this.props.location?.showConfirmModal) {
      this.setState({ showPublishDocConfirmModal: true })
    }
  }

  getInitialItems(versionId, groups, endpoints, pages, endpointId = null, pageId = null) {
    for (let i = 0; i < Object.keys(groups).length; i++) {
      if (groups[Object.keys(groups)[i]].versionId?.toString() === versionId?.toString()) {
        const groupId = groups[Object.keys(groups)[i]].id
        for (let i = 0; i < Object.keys(endpoints).length; i++) {
          if (
            endpoints[Object.keys(endpoints)[i]].groupId?.toString() === groupId?.toString() &&
            (endpoints[Object.keys(endpoints)[i]].isPublished === true ||
              endpoints[Object.keys(endpoints)[i]].state === publishDocsEnum.PENDING_STATE) &&
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
            (pages[Object.keys(pages)[i]].isPublished === true || pages[Object.keys(pages)[i]].state === publishDocsEnum.PENDING_STATE) &&
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
            (pages[Object.keys(pages)[i]].isPublished === true || pages[Object.keys(pages)[i]].state === publishDocsEnum.PENDING_STATE) &&
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

  extractCollectionInfo() {
    const selectedCollectionId = URI.parseQuery(this.props.location.search).collectionId
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(selectedCollectionId, this.props)
    const groups = extractCollectionInfoService.extractGroupsFromVersions(versions, this.props)
    const pages = extractCollectionInfoService.extractPagesFromVersions(versions, this.props)
    const endpoints = extractCollectionInfoService.extractEndpointsFromGroups(groups, this.props)
    this.setState({
      versions,
      groups,
      pages,
      endpoints
    })
    return { versions, groups, pages, endpoints }
  }

  setSelectedCollection(collection) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/admin/publish`,
      search: `?collectionId=${collection?.id}`
    })
  }

  openEndpoint(groupId, endpointId) {
    this.setState({
      selectedGroupId: groupId,
      selectedEndpointId: endpointId,
      selectedPageId: false
    })
  }

  setSelectedVersion(e) {
    const items = this.getInitialItems(e.currentTarget.value, this.state.groups, this.state.endpoints, this.state.pages)
    this.setState({
      selectedVersionId: e.currentTarget.value,
      selectedGroupId: items?.selectedGroupId || null,
      selectedEndpointId: items?.selectedEndpointId || null,
      selectedPageId: items?.selectedPageId || null
    })
  }

  async handleApproveEndpointRequest(endpointId) {
    this.setState({ publishLoader: true })
    if (sensitiveInfoFound(this.props.endpoints[endpointId])) {
      this.setState({ warningModal: true })
    } else {
      this.props.approve_endpoint(this.props.endpoints[endpointId], this.publishLoaderHandler.bind(this))
    }
  }

  async handleRejectEndpointRequest(endpointId) {
    if (this.state.endpoints[endpointId].isPublished) {
      //
    } else {
      const items = this.getInitialItems(
        this.state.selectedVersionId,
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

  openPage(groupId, pageId) {
    this.setState({
      selectedGroupId: groupId,
      selectedEndpointId: false,
      selectedPageId: pageId
    })
  }

  async handleApprovePageRequest(pageId) {
    this.setState({ publishPageLoader: true })
    this.props.approve_page(this.props.pages[pageId], this.publishPageLoaderHandler.bind(this))
  }

  async handleRejectPageRequest(pageId) {
    this.props.reject_page(this.props.pages[pageId])
    if (this.state.pages[pageId].isPublished) {
      //
    } else {
      const items = this.getInitialItems(
        this.state.selectedVersionId,
        this.state.groups,
        this.state.endpoints,
        this.state.pages,
        null,
        pageId
      )
      this.setState({
        selectedGroupId: items?.selectedGroupId || null,
        selectedEndpointId: items?.selectedEndpointId || null,
        selectedPageId: items?.selectedPageId || null
      })
    }
  }

  displayState(endpoint) {
    if (endpoint.state === publishDocsEnum.PENDING_STATE) {
      return <span className='status-new'> New</span>
    } else if (endpoint.state === publishDocsEnum.DRAFT_STATE) {
      return <span className='status-edit'> Edit</span>
    }
  }

  filterEndpoints(groupId) {
    const endpoints = {}
    for (let i = 0; i < Object.keys(this.state.endpoints).length; i++) {
      if (
        (this.state.endpoints[Object.keys(this.state.endpoints)[i]].isPublished === true ||
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
      <SortableList
        lockAxis='y'
        useDragHandle
        onSortEnd={({ oldIndex, newIndex }) => {
          this.onSortEnd(oldIndex, newIndex, sortedEndpoints, 'endpoints')
        }}
      >
        <div className='pages-inner'>
          {sortedEndpoints.map((endpoint, index) => (
            <SortableItem key={endpoint.id} index={index}>
              <div
                onClick={() => this.openEndpoint(groupId, endpoint.id)}
                className={this.state.selectedEndpointId === endpoint.id ? 'groupListing active' : 'groupListing'}
              >
                <DragHandle />
                <span className='endpointNameWrapper'>{endpoints[endpoint.id]?.name}</span>
                {this.displayState(endpoints[endpoint.id])}
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableList>
    )
  }

  publishLoaderHandler() {
    this.setState({ publishLoader: false })
  }

  publishPageLoaderHandler() {
    this.setState({ publishPageLoader: false })
  }

  filterPages(groupId) {
    const pages = {}
    if (groupId) {
      if (this.state.pages) {
        for (let i = 0; i < Object.keys(this.state.pages).length; i++) {
          if (
            (this.state.pages[Object.keys(this.state.pages)[i]].isPublished === true ||
              this.state.pages[Object.keys(this.state.pages)[i]].state === publishDocsEnum.PENDING_STATE) &&
            this.state.pages[Object.keys(this.state.pages)[i]].groupId === groupId
          ) {
            pages[Object.keys(this.state.pages)[i]] = this.state.pages[Object.keys(this.state.pages)[i]]
          }
        }
        const sortedPages = Object.values(pages).sort(function (a, b) {
          return a.position - b.position
        })
        return (
          <SortableList
            lockAxis='y'
            useDragHandle
            onSortEnd={({ oldIndex, newIndex }) => {
              this.onSortEnd(oldIndex, newIndex, sortedPages, 'pages')
            }}
          >
            <div className='pages-inner'>
              {sortedPages.map((page, index) => (
                <SortableItem key={page.id} index={index}>
                  <div
                    onClick={() => this.openPage('', page.id)}
                    className={this.state.selectedPageId === page.id ? 'groupListing active' : 'groupListing'}
                  >
                    <DragHandle />
                    {this.state.pages[page.id]?.name}
                    {this.displayState(pages[page.id])}
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableList>
        )
      }
    } else {
      if (this.state.pages) {
        for (let i = 0; i < Object.keys(this.state.pages).length; i++) {
          if (
            (this.state.pages[Object.keys(this.state.pages)[i]].isPublished === true ||
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
          <SortableList
            lockAxis='y'
            useDragHandle
            onSortEnd={({ oldIndex, newIndex }) => {
              this.onSortEnd(oldIndex, newIndex, sortedPages, 'pages')
            }}
          >
            <div className='pages-inner-wrapper'>
              {sortedPages.map((page, index) => (
                <SortableItem key={page.id} index={index}>
                  <div
                    onClick={() => this.openPage('', page.id)}
                    className={this.state.selectedPageId === page.id ? 'groupListing active' : 'groupListing'}
                  >
                    <DragHandle />
                    {this.state.pages[page.id]?.name}
                    {this.displayState(pages[page.id])}
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableList>
        )
      }
    }
  }

  onSortEnd = (oldIndex, newIndex, sortedData, type) => {
    if (newIndex !== oldIndex) {
      const newData = []
      sortedData.forEach((item) => {
        item.id !== sortedData[oldIndex].id && newData.push(item.id)
      })
      newData.splice(newIndex, 0, sortedData[oldIndex].id)
      if (type === 'pages') {
        this.props.set_page_ids(newData)
      }
      if (type === 'endpoints') {
        this.props.update_endpoints_order(newData)
      }
    }
  }

  getSelectedCollection() {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    const selectedCollection = this.props.collections[collectionId]
    return selectedCollection || {}
  }

  isCollectionPublished() {
    const selectedCollection = this.getSelectedCollection()
    return selectedCollection?.isPublic || false
  }

  publishCollection() {
    const selectedCollection = this.getSelectedCollection()
    if (selectedCollection?.isPublic !== true) {
      const editedCollection = { ...selectedCollection }
      editedCollection.isPublic = true
      this.props.update_collection(editedCollection)
      moveToNextStep(6)
    }
  }

  unPublishCollection() {
    const selectedCollection = this.getSelectedCollection()
    if (selectedCollection?.isPublic === true) {
      const editedCollection = { ...selectedCollection }
      editedCollection.isPublic = false
      this.props.update_collection(editedCollection)
    }
  }

  dataFetched() {
    return this.props.collections && this.props.versions && this.props.groups && this.props.endpoints && this.props.pages
  }

  isPageApprovalPending(page) {
    return page?.state === publishDocsEnum.PENDING_STATE || (page?.state === publishDocsEnum.DRAFT_STATE && page?.isPublished)
  }

  isEndpointApprovalPending(endpoint) {
    return endpoint?.state === publishDocsEnum.PENDING_STATE || (endpoint?.state === publishDocsEnum.DRAFT_STATE && endpoint?.isPublished)
  }

  collectionHasPageChanges(versionIds) {
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

  filterGroups(groupIds, versionIds) {
    let groupsArray = []

    groupIds.forEach((gId) => {
      const group = this.props.groups[gId]
      if (versionIds.includes(group.versionId)) {
        groupsArray = [...groupsArray, gId]
      }
    })
    return groupsArray || []
  }

  collectionHasEndpointChanges(versionIds) {
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

  collectionHasChanges(collectionId) {
    if (this.dataFetched()) {
      const versionIds = Object.keys(this.props.versions).filter((vId) => this.props.versions[vId].collectionId === collectionId)
      if (this.collectionHasPageChanges(versionIds)) {
        return true
      } else if (this.collectionHasEndpointChanges(versionIds)) {
        return true
      } else {
        return false
      }
    }
  }

  showCollections() {
    if (this.props.collections) {
      return Object.keys(this.props.collections).map(
        (id, index) =>
          !this.props.collections[id]?.importedFromMarketPlace && (
            <Dropdown.Item key={index} onClick={() => this.setSelectedCollection(this.props.collections[id])}>
              {this.props.collections[id]?.name}
              {this.collectionHasChanges(id) && <i className='fas fa-circle' />}
            </Dropdown.Item>
          )
      )
    }
  }

  showVersions() {
    if (this.state.versions) {
      return Object.keys(this.state.versions).map((id) => (
        <option key={id} value={id}>
          {this.props.versions[id]?.number}
        </option>
      ))
    }
  }

  showEndpointsAndPages(groupId) {
    return (
      <>
        <div className='group-title'>{this.state.groups[groupId]?.name}</div>
        {this.filterPages(groupId)}
        {this.filterEndpoints(groupId)}
      </>
    )
  }

  groupsToShow(versionId) {
    const versionGroups = extractCollectionInfoService.extractGroupsFromVersionId(versionId, this.props)
    const endpointsToCheck = extractCollectionInfoService.extractEndpointsFromGroups(versionGroups, this.props)
    const pagesToCheck = extractCollectionInfoService.extractPagesFromVersions({ [versionId]: versionId }, this.props)
    const filteredEndpoints = Object.values(endpointsToCheck).filter(
      (endpoint) => endpoint.state === publishDocsEnum.PENDING_STATE || endpoint.isPublished
    )
    const filteredPages = Object.values(pagesToCheck).filter(
      (page) => (page.state === publishDocsEnum.PENDING_STATE || page.isPublished) && page.groupId
    )
    const publicGroupIds = new Set()
    filteredEndpoints.forEach((endpoint) => {
      publicGroupIds.add(endpoint.groupId)
    })

    filteredPages.forEach((page) => {
      publicGroupIds.add(page.groupId)
    })
    const publicGroups = {}
    publicGroupIds.forEach((id) => {
      publicGroups[id] = versionGroups[id]
    })
    return publicGroups
  }

  showGroups() {
    if (this.state.groups) {
      const sortedGroups = Object.values(this.groupsToShow(this.state.selectedVersionId)).sort(function (a, b) {
        return a.position - b.position
      })
      if (sortedGroups.length !== 0) {
        return (
          <SortableList
            lockAxis='y'
            onSortEnd={({ oldIndex, newIndex }) => {
              this.onSortEnd(oldIndex, newIndex, sortedGroups, 'groups')
            }}
          >
            <div>
              {sortedGroups.map((group, index) => (
                <SortableItem key={group.id} index={index}>
                  <div className='groups-inner'>{this.showEndpointsAndPages(group.id)}</div>
                </SortableItem>
              ))}
            </div>
          </SortableList>
        )
      }
    }
  }

  showEndpoints() {
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
            <div>
              {' '}
              <div className='contacts mb-2'>{this.props.groups[this.state.selectedGroupId]?.name}</div>
              <div className='list-contacts'>{endpointName}</div>
            </div>
            <div className='publish-reject mt-3 d-flex'>{this.endpointPublishAndReject()}</div>
          </div>
          <div className='scrollTo'>{this.checkEndpointState()}</div>
        </div>
      )
    }
  }

  checkEndpointState() {
    if (this.state.selectedEndpointId && this.state.endpoints[this.state.selectedEndpointId]) {
      if (this.state.endpoints[this.state.selectedEndpointId]?.state === publishDocsEnum.REJECT_STATE) {
        return (
          <DisplayEndpoint
            rejectedEndpointId={this.state.selectedEndpointId}
            endpointId={this.state.selectedEndpointId}
            groupId={this.state.selectedGroupId}
            {...this.props}
          />
        )
      } else {
        return (
          <DisplayEndpoint
            rejected={false}
            endpointId={this.state.selectedEndpointId}
            groupId={this.state.selectedGroupId}
            {...this.props}
            highlights={this.setChangeHighlighting() || null}
          />
        )
      }
    }
  }

  handleRemovePublicEndpoint(endpointId) {
    this.props.update_endpoint({
      ...this.state.endpoints[endpointId],
      groupId: this.state.selectedGroupId,
      isPublished: false,
      publishedEndpoint: {},
      state: 1,
      position: null
    })
    const items = this.getInitialItems(this.state.selectedVersionId, this.state.groups, this.state.endpoints, this.state.pages, endpointId)
    this.setState({
      selectedGroupId: items?.selectedGroupId || null,
      selectedEndpointId: items?.selectedEndpointId || null,
      selectedPageId: items?.selectedPageId || null
    })
  }

  handleRemovePublicPage(pageId) {
    const page = { ...this.state.pages[pageId] }
    page.isPublished = false
    page.publishedEndpoint = {}
    page.state = 1
    page.position = null
    this.props.update_page(page)
    const items = this.getInitialItems(this.state.selectedVersionId, this.state.groups, this.state.endpoints, this.state.pages)
    this.setState({
      selectedGroupId: items?.selectedGroupId || null,
      selectedEndpointId: items?.selectedEndpointId || null,
      selectedPageId: items?.selectedPageId || null
    })
  }

  publishButtonEndpoint() {
    return (
      <div className={!this.state.publishLoader ? 'publish-button' : 'publish-button buttonLoader'}>
        {' '}
        <Button
          variant='success'
          id='publish_endpoint_btn'
          onClick={() => this.handleApproveEndpointRequest(this.state.selectedEndpointId)}
        >
          PUBLISH
        </Button>
      </div>
    )
  }

  endpointPublishAndReject() {
    if (
      this.state.endpoints[this.state.selectedEndpointId]?.state !== publishDocsEnum.APPROVED_STATE &&
      this.state.endpoints[this.state.selectedEndpointId]?.state !== publishDocsEnum.REJECT_STATE
    ) {
      return (
        <>
          {!this.state.publishLoader && (
            <button className='btn btn-outline danger mr-3' onClick={() => this.handleRejectEndpointRequest(this.state.selectedEndpointId)}>
              Reject
            </button>
          )}
          {this.publishButtonEndpoint()}
        </>
      )
    } else {
      return (
        <>
          <div className='publish-button'>
            {' '}
            <Button
              variant='success'
              id='unpublish_endpoint_btn'
              onClick={() => this.handleRemovePublicEndpoint(this.state.selectedEndpointId)}
            >
              Unpublish Endpoint
            </Button>
          </div>
        </>
      )
    }
  }

  pagePublishButton() {
    return (
      <div className={!this.state.publishPageLoader ? 'publish-button' : 'publish-button buttonLoader'}>
        {' '}
        <Button variant='success' onClick={() => this.handleApprovePageRequest(this.state.selectedPageId)}>
          PUBLISH
        </Button>
      </div>
    )
  }

  pagePublishAndReject() {
    if (
      this.state.pages[this.state.selectedPageId]?.state !== publishDocsEnum.APPROVED_STATE &&
      this.state.pages[this.state.selectedPageId]?.state !== publishDocsEnum.REJECT_STATE
    ) {
      return (
        <>
          {!this.state.publishPageLoader && (
            <button className='btn btn-outline danger mr-3' onClick={() => this.handleRejectPageRequest(this.state.selectedPageId)}>
              Reject
            </button>
          )}
          {this.pagePublishButton()}
        </>
      )
    } else {
      return (
        <>
          <div className='publish-button'>
            {' '}
            <Button variant='success' onClick={() => this.handleRemovePublicPage(this.state.selectedPageId)}>
              Unpublish Page
            </Button>
          </div>
        </>
      )
    }
  }

  showPages() {
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
                <div className='list-contacts'>{pageName}</div>
              </div>
              <div className='publish-reject mt-3 d-flex'>{this.pagePublishAndReject()}</div>
            </div>
            {this.checkPageState()}
          </div>
        </div>
      )
    }
  }

  checkPageState() {
    if (this.state.pages) {
      if (this.state.pages[this.state.selectedPageId]?.state === publishDocsEnum.REJECT_STATE) {
        return <DisplayPage rejected pageId={this.state.selectedPageId} groupId={this.state.selectedGroupId} {...this.props} />
      } else {
        return <DisplayPage pageId={this.state.selectedPageId} groupId={this.state.selectedGroupId} {...this.props} />
      }
    }
  }

  publishCollections() {
    if (!this.isCollectionPublished()) {
      return (
        <Button id='publish_collection_btn' variant='success publish-collection-button ml-4 mt-4' onClick={() => this.publishCollection()}>
          Publish Collection
        </Button>
      )
    }
  }

  setChangeHighlighting() {
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
            value:
              currentChanges.body.type === 'multipart/form-data' || currentChanges.body.type === 'application/x-www-form-urlencoded'
                ? makeHighlightsData(originalEndpoint.body.value, currentChanges.body.value, 'body')
                : !isEqual(originalEndpoint.body.value, currentChanges.body.value)
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

  renderWarningModal() {
    return (
      <WarningModal
        show={this.state.warningModal}
        ignoreButtonCallback={() => this.props.approve_endpoint(this.props.endpoints[this.state.selectedEndpointId])}
        onHide={() => {
          this.setState({ warningModal: false })
        }}
        title='Sensitive Information Warning'
        message='This Entity contains some sensitive information. Please remove them before making it public.'
      />
    )
  }

  checkDocProperties(collectionId) {
    const collection = this.props.collections[collectionId]

    if (this.props.location.fromSidebar && !collection?.isPublic) {
      return false
    }
    return !!collection?.docProperties?.defaultTitle
  }

  renderDocsFormSidebar() {
    return (
      <div ref={this.wrapperRef} className='right-sidebar page-setting hostedWrapper p-3'>
        <div className='modal-title'>Page Settings</div>
        <PublishDocsForm
          {...this.props}
          isCollectionPublished={this.isCollectionPublished.bind(this)}
          unPublishCollection={this.unPublishCollection.bind(this)}
          selected_collection_id={this.state.selectedCollectionId}
          isSidebar
          onHide={() => {
            this.setState({ openPageSettingsSidebar: false })
          }}
        />
      </div>
    )
  }

  renderPageSettingButton() {
    return (
      <div className='d-flex align-items-center ml-3 mt-4'>
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

  renderExternalLinkButton() {
    const url = process.env.REACT_APP_PUBLIC_UI_URL + '/p/' + this.state.selectedCollectionId
    if (this.isCollectionPublished()) {
      return (
        <OverlayTrigger placement='right' overlay={<Tooltip> Go To Docs </Tooltip>}>
          <div className='d-flex align-items-center mx-3 mt-4'>
            <button
              className='externalLinkButton'
              onClick={() => {
                openExternalLink(url)
              }}
            >
              <ExternalLinks />
            </button>
          </div>
        </OverlayTrigger>
      )
    }
  }

  renderHostedAPIDetials() {
    return (
      <>
        {this.renderHostedApiHeading('Public API Documentation')}
        <div className='hosted-doc-wrapper'>
          <div className='d-flex align-items-center my-3'>
            {this.rednerHostedAPIDropdown()}
            {this.publishCollections()}
            {this.renderPageSettingButton()}
            {this.renderExternalLinkButton()}
          </div>
          <div className='grid-two new-pub-doc'>
            {this.state.openPageSettingsSidebar && this.renderDocsFormSidebar()}
            <div className='versions-section'>
              <select className='form-control mb-3' onChange={this.setSelectedVersion.bind(this)} value={this.state.selectedVersionId}>
                {this.showVersions()}
              </select>
              {this.filterPages(null)}
              <div className='version-groups'>{this.showGroups()}</div>
            </div>
            <div className='version-details'>
              {this.showEndpoints()}
              {this.showPages()}
            </div>
          </div>
        </div>
      </>
    )
  }

  renderFullPageDocForm() {
    return (
      <>
        <div className='publish-api-doc d-block'>
          {this.renderHostedApiHeading('Publish API Doc')}
          <div className='publish-api-doc-container my-3'>
            <div className='form-group'>{this.rednerHostedAPIDropdown()}</div>
            <div className='pub-inner'>
              <PublishDocsForm {...this.props} selected_collection_id={this.state.selectedCollectionId} />
            </div>
            <div className='pub-illustrator'>
              <svg width='399' height='399' viewBox='0 0 399 399' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M60.2493 319.838C59.9301 319.838 59.6907 319.759 59.4513 319.519C59.2119 319.28 59.1321 319.04 59.1321 318.721C59.1321 318.641 59.1321 318.562 59.1321 318.482C59.1321 318.402 59.1321 318.322 59.2119 318.242C59.2119 318.163 59.2917 318.083 59.2917 318.083C59.3715 318.003 59.3715 318.003 59.4513 317.923C59.5311 317.843 59.5311 317.843 59.6109 317.764C59.6907 317.764 59.6907 317.684 59.7705 317.684C59.8503 317.684 59.9301 317.604 60.0099 317.604C60.1695 317.604 60.3291 317.604 60.4089 317.604C60.4887 317.604 60.5685 317.604 60.6483 317.684C60.7281 317.684 60.8079 317.764 60.8079 317.764C60.8877 317.843 60.8877 317.843 60.9675 317.923C61.0473 318.003 61.0473 318.003 61.1271 318.083C61.1271 318.163 61.2069 318.163 61.2069 318.242C61.2069 318.322 61.2867 318.402 61.2867 318.482C61.2867 318.562 61.2867 318.641 61.2867 318.721C61.2867 319.04 61.2069 319.28 60.9675 319.519C60.8079 319.679 60.5685 319.838 60.2493 319.838Z'
                  fill='#EBB393'
                />
                <path
                  d='M297.175 317.524C296.856 317.046 297.016 316.327 297.574 316.088C298.053 315.769 298.771 316.008 299.011 316.487C299.33 316.966 299.091 317.684 298.612 317.923C298.452 318.003 298.293 318.083 298.053 318.083C297.734 318.083 297.415 317.923 297.175 317.524ZM55.8603 314.811C55.5411 314.332 55.6209 313.614 56.1795 313.295C56.6583 312.976 57.3765 313.056 57.6957 313.614C58.0149 314.093 57.9351 314.811 57.3765 315.13C57.2169 315.29 56.9775 315.29 56.7381 315.29C56.4189 315.29 56.0199 315.051 55.8603 314.811ZM302.123 314.652C301.804 314.173 301.963 313.455 302.442 313.135C302.921 312.816 303.639 312.976 303.958 313.455C304.278 313.933 304.118 314.652 303.639 314.971C303.48 315.051 303.24 315.13 303.081 315.13C302.682 315.13 302.362 314.971 302.123 314.652ZM306.911 311.38C306.592 310.901 306.672 310.263 307.15 309.864C307.629 309.544 308.268 309.624 308.667 310.103C308.986 310.582 308.906 311.22 308.427 311.619C308.268 311.779 308.028 311.859 307.789 311.859C307.47 311.859 307.15 311.699 306.911 311.38ZM52.8279 309.704C52.5885 309.145 52.7481 308.507 53.3067 308.268C53.8653 307.948 54.5037 308.188 54.7431 308.746C54.9825 309.305 54.8229 309.943 54.2643 310.183C54.1047 310.263 53.9451 310.342 53.7855 310.342C53.3865 310.342 52.9875 310.103 52.8279 309.704ZM311.539 307.948C311.14 307.47 311.22 306.831 311.699 306.432C312.178 306.033 312.816 306.113 313.215 306.592C313.614 307.071 313.534 307.709 313.056 308.108C312.816 308.268 312.657 308.347 312.417 308.347C312.098 308.347 311.779 308.188 311.539 307.948ZM50.3541 304.357C50.1147 303.799 50.4339 303.16 50.9925 302.921C51.5511 302.682 52.1895 303.001 52.3491 303.559C52.5885 304.118 52.2693 304.756 51.7107 304.916C51.5511 304.996 51.4713 304.996 51.3117 304.996C50.9127 305.076 50.5137 304.836 50.3541 304.357ZM316.008 304.278C315.609 303.879 315.689 303.16 316.088 302.761C316.567 302.362 317.205 302.442 317.604 302.841C318.003 303.24 317.923 303.958 317.524 304.357C317.285 304.517 317.046 304.597 316.806 304.597C316.487 304.597 316.168 304.517 316.008 304.278ZM320.238 300.367C319.839 299.968 319.839 299.25 320.238 298.851C320.637 298.452 321.355 298.452 321.754 298.851C322.153 299.25 322.153 299.968 321.754 300.367C321.514 300.607 321.275 300.687 320.956 300.687C320.716 300.687 320.397 300.607 320.238 300.367ZM48.5187 298.851C48.3591 298.293 48.6783 297.654 49.2369 297.495C49.7955 297.335 50.4339 297.654 50.5935 298.213C50.7531 298.771 50.4339 299.41 49.8753 299.569C49.7955 299.569 49.7157 299.649 49.5561 299.649C49.0773 299.649 48.6783 299.33 48.5187 298.851ZM324.228 296.218C323.749 295.819 323.749 295.101 324.148 294.702C324.547 294.303 325.265 294.223 325.664 294.622C326.063 295.021 326.143 295.739 325.744 296.138C325.504 296.377 325.265 296.457 324.946 296.457C324.706 296.537 324.467 296.457 324.228 296.218ZM47.2419 293.106C47.1621 292.547 47.5611 291.988 48.1197 291.909C48.6783 291.829 49.2369 292.228 49.3965 292.786C49.4763 293.345 49.0773 293.904 48.5187 294.063C48.4389 294.063 48.4389 294.063 48.3591 294.063C47.8005 293.983 47.3217 293.584 47.2419 293.106ZM328.058 291.909C327.579 291.51 327.499 290.871 327.898 290.392C328.297 289.914 328.936 289.914 329.415 290.233C329.893 290.632 329.973 291.27 329.574 291.749C329.335 291.988 329.095 292.148 328.776 292.148C328.537 292.148 328.297 292.068 328.058 291.909ZM46.6035 287.28C46.6035 286.722 47.0025 286.163 47.6409 286.163C48.1995 286.163 48.7581 286.562 48.7581 287.2C48.7581 287.759 48.3591 288.318 47.7207 288.318H47.6409C47.0823 288.238 46.6833 287.839 46.6035 287.28ZM331.649 287.44C331.17 287.121 331.09 286.402 331.41 285.924C331.729 285.445 332.447 285.365 332.926 285.684C333.405 286.003 333.484 286.722 333.165 287.2C332.926 287.52 332.607 287.599 332.287 287.599C332.128 287.679 331.888 287.599 331.649 287.44ZM335.08 282.811C334.602 282.492 334.442 281.774 334.761 281.295C335.08 280.816 335.799 280.657 336.277 280.976C336.756 281.295 336.916 282.013 336.597 282.492C336.357 282.811 336.038 282.971 335.719 282.971C335.479 282.971 335.24 282.891 335.08 282.811ZM47.5611 282.492C47.0025 282.492 46.5237 281.934 46.5237 281.375C46.5237 280.816 47.0823 280.338 47.6409 280.338C48.1995 280.338 48.6783 280.896 48.6783 281.455C48.6783 282.013 48.1995 282.492 47.5611 282.492C47.6409 282.492 47.6409 282.492 47.5611 282.492ZM338.193 277.944C337.714 277.624 337.554 276.986 337.794 276.427C338.113 275.949 338.751 275.789 339.31 276.028C339.789 276.348 339.948 276.986 339.709 277.545C339.469 277.864 339.15 278.103 338.751 278.103C338.592 278.103 338.352 278.023 338.193 277.944ZM48.0399 276.747C47.4813 276.667 47.0823 276.108 47.1621 275.55C47.2419 274.991 47.8005 274.592 48.3591 274.672C48.9177 274.752 49.3167 275.31 49.2369 275.869C49.1571 276.427 48.6783 276.747 48.1995 276.747C48.1197 276.747 48.1197 276.747 48.0399 276.747ZM341.145 272.996C340.587 272.677 340.427 272.038 340.746 271.56C341.065 271.001 341.704 270.841 342.183 271.161C342.661 271.48 342.901 272.118 342.582 272.597C342.342 272.916 342.023 273.156 341.624 273.156C341.464 273.076 341.305 273.076 341.145 272.996ZM49.0773 271.081C48.5187 270.921 48.1995 270.363 48.3591 269.724C48.5187 269.166 49.0773 268.846 49.7157 268.926C50.2743 269.086 50.6733 269.644 50.5137 270.283C50.3541 270.762 49.9551 271.081 49.4763 271.081C49.3167 271.161 49.2369 271.081 49.0773 271.081ZM343.779 267.889C343.22 267.649 342.981 267.011 343.3 266.452C343.539 265.894 344.178 265.654 344.736 265.974C345.295 266.213 345.534 266.851 345.215 267.41C345.055 267.809 344.656 268.048 344.257 268.048C344.098 267.969 343.938 267.889 343.779 267.889ZM50.8329 265.575C50.2743 265.335 50.0349 264.697 50.1945 264.138C50.4339 263.58 51.0723 263.34 51.6309 263.5C52.1895 263.739 52.4289 264.378 52.2693 264.936C52.1097 265.335 51.7107 265.654 51.2319 265.654C51.0723 265.654 50.9127 265.654 50.8329 265.575ZM346.173 262.622C345.614 262.383 345.375 261.744 345.614 261.186C345.853 260.627 346.492 260.388 347.05 260.627C347.609 260.866 347.848 261.505 347.609 262.063C347.449 262.462 347.05 262.702 346.572 262.702C346.412 262.702 346.252 262.702 346.173 262.622ZM53.1471 260.308C52.6683 259.989 52.4289 259.35 52.7481 258.871C53.0673 258.313 53.7057 258.153 54.1845 258.472C54.7431 258.792 54.9027 259.43 54.5835 259.909C54.4239 260.228 54.0249 260.467 53.6259 260.467C53.4663 260.467 53.3067 260.388 53.1471 260.308ZM348.247 257.275C347.689 257.036 347.37 256.477 347.609 255.919C347.848 255.36 348.407 255.041 348.966 255.28C349.524 255.44 349.843 256.078 349.604 256.637C349.444 257.116 349.045 257.355 348.567 257.355C348.487 257.275 348.407 257.275 348.247 257.275ZM56.0199 255.36C55.5411 255.041 55.3815 254.323 55.7007 253.844C56.0199 253.365 56.7381 253.206 57.2169 253.525C57.6957 253.844 57.8553 254.562 57.5361 255.041C57.2967 255.36 56.9775 255.52 56.6583 255.52C56.4189 255.52 56.1795 255.44 56.0199 255.36ZM350.083 251.769C349.524 251.61 349.205 250.971 349.365 250.413C349.524 249.854 350.163 249.535 350.721 249.694C351.28 249.854 351.599 250.492 351.439 251.051C351.28 251.53 350.881 251.849 350.402 251.849C350.322 251.849 350.242 251.849 350.083 251.769ZM59.3715 250.652C58.8927 250.253 58.8129 249.615 59.2119 249.136C59.6109 248.657 60.2493 248.577 60.7281 248.976C61.2069 249.375 61.2867 250.014 60.8877 250.492C60.6483 250.812 60.3291 250.891 60.0099 250.891C59.7705 250.891 59.5311 250.812 59.3715 250.652ZM62.9625 246.103C62.4837 245.704 62.4837 245.066 62.8029 244.587C63.2019 244.108 63.8403 244.108 64.3191 244.428C64.7979 244.827 64.7979 245.465 64.4787 245.944C64.2393 246.183 63.9999 246.343 63.6807 246.343C63.3615 246.423 63.1221 246.263 62.9625 246.103ZM351.679 246.263C351.12 246.103 350.721 245.545 350.881 244.986C351.04 244.428 351.599 244.029 352.158 244.188C352.716 244.348 353.115 244.906 352.956 245.465C352.796 245.944 352.397 246.263 351.918 246.263C351.838 246.263 351.759 246.263 351.679 246.263ZM66.7131 241.794C66.3141 241.395 66.2343 240.757 66.6333 240.278C67.0323 239.799 67.6707 239.799 68.1495 240.198C68.6283 240.597 68.6283 241.236 68.2293 241.714C67.9899 241.954 67.7505 242.113 67.4313 242.113C67.1919 242.034 66.9525 241.954 66.7131 241.794ZM352.956 240.597C352.397 240.517 351.998 239.959 352.078 239.32C352.158 238.762 352.716 238.363 353.355 238.443C353.913 238.522 354.312 239.081 354.232 239.719C354.153 240.278 353.674 240.597 353.195 240.597C353.115 240.677 353.035 240.597 352.956 240.597ZM70.5435 237.485C70.0647 237.086 70.0647 236.448 70.4637 235.969C70.8627 235.49 71.5011 235.49 71.9799 235.889C72.4587 236.288 72.4587 236.926 72.0597 237.405C71.8203 237.645 71.5809 237.804 71.2617 237.804C71.0223 237.724 70.7829 237.645 70.5435 237.485ZM353.913 234.931C353.355 234.852 352.876 234.293 352.956 233.734C353.035 233.176 353.594 232.697 354.153 232.777C354.711 232.857 355.19 233.415 355.11 233.974C355.03 234.532 354.552 234.931 354.073 234.931C353.993 234.931 353.993 234.931 353.913 234.931ZM74.3739 233.176C73.8951 232.777 73.8951 232.138 74.2143 231.66C74.6133 231.181 75.2517 231.181 75.7305 231.5C76.2093 231.899 76.2093 232.537 75.8901 233.016C75.6507 233.256 75.4113 233.415 75.0921 233.415C74.7729 233.415 74.5335 233.335 74.3739 233.176ZM354.552 229.186C353.993 229.106 353.514 228.627 353.594 228.069C353.674 227.51 354.153 227.031 354.711 227.111C355.27 227.191 355.749 227.67 355.749 228.228C355.669 228.787 355.27 229.186 354.711 229.186C354.631 229.186 354.552 229.186 354.552 229.186ZM77.9649 228.707C77.4861 228.388 77.4063 227.67 77.7255 227.191C78.0447 226.712 78.7629 226.632 79.2417 226.951C79.7205 227.271 79.8003 227.989 79.4811 228.468C79.2417 228.787 78.9225 228.867 78.6033 228.867C78.4437 228.867 78.2043 228.787 77.9649 228.707ZM81.3165 223.999C80.8377 223.68 80.6781 223.041 80.9973 222.483C81.3165 222.004 81.9549 221.844 82.5135 222.163C82.9923 222.483 83.1519 223.121 82.8327 223.68C82.5933 223.999 82.2741 224.158 81.9549 224.158C81.7155 224.158 81.5559 224.079 81.3165 223.999ZM354.871 223.44C354.312 223.44 353.833 222.961 353.833 222.323C353.833 221.764 354.312 221.286 354.951 221.286C355.509 221.286 355.988 221.764 355.988 222.403C355.988 222.961 355.509 223.44 354.871 223.44ZM84.3489 219.051C83.7903 218.812 83.6307 218.094 83.8701 217.615C84.1893 217.056 84.8277 216.897 85.3065 217.136C85.8651 217.455 86.0247 218.094 85.7853 218.572C85.6257 218.971 85.2267 219.131 84.8277 219.131C84.6681 219.211 84.5085 219.131 84.3489 219.051ZM353.833 216.657C353.833 216.099 354.312 215.54 354.871 215.54C355.43 215.54 355.988 216.019 355.988 216.577C355.988 217.136 355.509 217.695 354.951 217.695C354.312 217.695 353.833 217.216 353.833 216.657ZM86.8227 213.864C86.2641 213.625 85.9449 213.066 86.1843 212.508C86.4237 211.949 86.9823 211.63 87.5409 211.869C88.0995 212.109 88.3389 212.667 88.1793 213.226C88.0197 213.625 87.6207 213.944 87.1419 213.944C87.0621 213.944 86.9025 213.864 86.8227 213.864ZM353.514 210.991C353.434 210.433 353.913 209.874 354.472 209.874C355.03 209.794 355.589 210.273 355.669 210.832C355.749 211.39 355.27 211.949 354.711 212.029H354.631C353.993 211.949 353.514 211.55 353.514 210.991ZM88.5783 208.358C88.0197 208.198 87.6207 207.64 87.7803 207.081C87.9399 206.523 88.4985 206.124 89.0571 206.283C89.6157 206.443 90.0147 207.001 89.8551 207.56C89.7753 208.039 89.2965 208.438 88.8177 208.438C88.7379 208.438 88.6581 208.358 88.5783 208.358ZM352.876 205.246C352.796 204.687 353.195 204.129 353.833 204.049C354.392 203.969 354.951 204.368 355.03 205.006C355.11 205.565 354.711 206.124 354.073 206.203C353.993 206.203 353.993 206.203 353.913 206.203C353.434 206.203 352.956 205.804 352.876 205.246ZM89.5359 202.692C88.9773 202.692 88.4985 202.134 88.4985 201.575C88.4985 201.016 89.0571 200.538 89.6157 200.538C90.1743 200.538 90.6531 201.096 90.6531 201.655C90.6531 202.213 90.1743 202.692 89.5359 202.692ZM351.998 199.66C351.918 199.101 352.237 198.543 352.876 198.383C353.434 198.303 353.993 198.622 354.153 199.261C354.232 199.819 353.913 200.378 353.275 200.538C353.195 200.538 353.115 200.538 353.115 200.538C352.477 200.538 352.078 200.139 351.998 199.66ZM88.1793 196.069C88.0995 195.51 88.4985 194.952 89.0571 194.872C89.6157 194.792 90.1743 195.191 90.2541 195.75C90.3339 196.308 89.9349 196.867 89.3763 196.947C89.2965 196.947 89.2965 196.947 89.2167 196.947C88.7379 196.947 88.2591 196.548 88.1793 196.069ZM350.801 194.074C350.641 193.515 351.04 192.957 351.599 192.797C352.158 192.637 352.796 193.036 352.876 193.595C353.035 194.154 352.637 194.792 352.078 194.872C351.998 194.872 351.918 194.872 351.838 194.872C351.36 194.872 350.881 194.553 350.801 194.074ZM86.8227 190.642C86.6631 190.084 86.9025 189.445 87.4611 189.286C88.0197 189.126 88.6581 189.366 88.8177 189.924C88.9773 190.483 88.7379 191.121 88.1793 191.281C88.0995 191.281 87.9399 191.361 87.8601 191.361C87.4611 191.361 86.9823 191.121 86.8227 190.642ZM349.285 188.568C349.125 188.009 349.444 187.371 350.003 187.211C350.562 187.051 351.2 187.371 351.36 187.929C351.519 188.488 351.2 189.126 350.641 189.286C350.562 189.286 350.402 189.366 350.322 189.366C349.843 189.366 349.444 189.046 349.285 188.568ZM84.6681 185.535C84.4287 184.977 84.5883 184.338 85.1469 184.099C85.7055 183.859 86.3439 184.019 86.5833 184.578C86.8227 185.136 86.6631 185.775 86.1045 186.014C85.9449 186.094 85.7853 186.174 85.6257 186.174C85.2267 186.094 84.8277 185.854 84.6681 185.535ZM347.529 183.141C347.37 182.583 347.609 181.944 348.168 181.785C348.726 181.625 349.365 181.864 349.524 182.423C349.684 182.982 349.444 183.62 348.886 183.78C348.806 183.78 348.646 183.859 348.567 183.859C348.168 183.859 347.689 183.54 347.529 183.141ZM81.7953 180.588C81.4761 180.109 81.6357 179.391 82.1145 179.071C82.5933 178.752 83.3115 178.912 83.6307 179.391C83.9499 179.869 83.7903 180.588 83.3115 180.907C83.1519 181.066 82.9125 181.066 82.7529 181.066C82.3539 181.146 82.0347 180.907 81.7953 180.588ZM345.534 177.795C345.295 177.236 345.614 176.598 346.093 176.358C346.651 176.119 347.29 176.438 347.529 176.917C347.769 177.475 347.449 178.114 346.971 178.353C346.811 178.433 346.731 178.433 346.572 178.433C346.173 178.433 345.774 178.194 345.534 177.795ZM78.5235 175.959C78.2043 175.48 78.2841 174.842 78.7629 174.443C79.2417 174.124 79.8801 174.204 80.2791 174.682C80.5983 175.161 80.5185 175.8 80.0397 176.199C79.8801 176.358 79.6407 176.438 79.4013 176.438C79.0821 176.358 78.7629 176.278 78.5235 175.959ZM343.3 172.528C343.06 171.969 343.3 171.331 343.858 171.091C344.417 170.852 345.055 171.091 345.295 171.65C345.534 172.209 345.295 172.847 344.736 173.086C344.577 173.166 344.417 173.166 344.257 173.166C343.858 173.166 343.46 172.927 343.3 172.528ZM75.0123 171.411C74.6133 170.932 74.6931 170.293 75.1719 169.894C75.6507 169.495 76.2891 169.575 76.6881 170.054C77.0871 170.533 77.0073 171.171 76.5285 171.57C76.2891 171.73 76.1295 171.81 75.8901 171.81C75.5709 171.81 75.2517 171.65 75.0123 171.411ZM340.826 167.421C340.507 166.862 340.746 166.224 341.305 165.984C341.863 165.665 342.502 165.904 342.741 166.463C343.06 167.022 342.821 167.66 342.262 167.899C342.103 167.979 341.943 168.059 341.784 168.059C341.385 167.979 340.986 167.74 340.826 167.421ZM71.4213 166.862C71.0223 166.383 71.1021 165.745 71.5809 165.346C72.0597 164.947 72.6981 165.027 73.0971 165.505C73.4961 165.984 73.4163 166.623 72.9375 167.022C72.6981 167.181 72.5385 167.261 72.2991 167.261C71.9799 167.341 71.6607 167.181 71.4213 166.862ZM338.033 162.393C337.714 161.914 337.873 161.196 338.432 160.957C338.911 160.638 339.629 160.797 339.868 161.356C340.188 161.835 340.028 162.553 339.469 162.792C339.31 162.872 339.15 162.952 338.911 162.952C338.592 162.952 338.193 162.792 338.033 162.393ZM67.9101 162.313C67.5909 161.835 67.6707 161.196 68.1495 160.797C68.6283 160.478 69.2667 160.558 69.6657 161.037C69.9849 161.515 69.9051 162.154 69.4263 162.553C69.2667 162.712 69.0273 162.792 68.7879 162.792C68.4687 162.712 68.1495 162.553 67.9101 162.313ZM335.001 157.605C334.681 157.126 334.841 156.408 335.32 156.089C335.799 155.77 336.517 155.929 336.836 156.408C337.155 156.887 336.996 157.605 336.517 157.924C336.357 158.084 336.118 158.084 335.958 158.084C335.559 158.084 335.16 157.845 335.001 157.605ZM64.6383 157.525C64.3191 157.047 64.4787 156.328 64.9575 156.009C65.4363 155.69 66.1545 155.85 66.4737 156.328C66.7929 156.807 66.6333 157.525 66.1545 157.845C65.9949 157.924 65.7555 158.004 65.5959 158.004C65.1969 158.004 64.7979 157.845 64.6383 157.525ZM331.729 152.897C331.41 152.418 331.489 151.78 331.968 151.381C332.447 151.062 333.085 151.141 333.484 151.62C333.804 152.099 333.724 152.737 333.245 153.136C333.085 153.296 332.846 153.376 332.607 153.376C332.287 153.296 331.968 153.136 331.729 152.897ZM61.6857 152.418C61.4463 151.86 61.6059 151.221 62.1645 150.982C62.7231 150.742 63.3615 150.902 63.6009 151.461C63.8403 152.019 63.6807 152.658 63.1221 152.897C62.9625 152.977 62.8029 153.057 62.6433 153.057C62.2443 152.977 61.8453 152.817 61.6857 152.418ZM328.218 148.348C327.819 147.87 327.898 147.231 328.377 146.832C328.856 146.433 329.494 146.513 329.893 146.992C330.292 147.471 330.213 148.109 329.734 148.508C329.495 148.668 329.255 148.747 329.016 148.747C328.776 148.747 328.457 148.668 328.218 148.348ZM59.2119 147.151C58.9725 146.593 59.2119 145.954 59.7705 145.715C60.3291 145.476 60.9675 145.715 61.2069 146.274C61.4463 146.832 61.2069 147.471 60.6483 147.71C60.4887 147.79 60.4089 147.79 60.2493 147.79C59.7705 147.79 59.3715 147.55 59.2119 147.151ZM324.547 144.039C324.148 143.64 324.148 142.922 324.627 142.523C325.026 142.124 325.744 142.124 326.143 142.603C326.542 143.002 326.542 143.72 326.063 144.119C325.824 144.279 325.584 144.438 325.345 144.438C325.026 144.438 324.706 144.279 324.547 144.039ZM57.2169 141.645C57.0573 141.087 57.3765 140.448 57.9351 140.289C58.4937 140.129 59.1321 140.448 59.2917 141.007C59.4513 141.565 59.1321 142.204 58.5735 142.363C58.4937 142.363 58.3341 142.443 58.2543 142.443C57.7755 142.363 57.2967 142.124 57.2169 141.645ZM320.557 139.969C320.158 139.57 320.158 138.852 320.557 138.453C320.956 138.054 321.674 138.054 322.073 138.453C322.472 138.852 322.472 139.57 322.073 139.969C321.834 140.209 321.594 140.289 321.275 140.289C321.036 140.209 320.796 140.129 320.557 139.969ZM55.6209 135.979C55.4613 135.421 55.8603 134.862 56.4189 134.703C56.9775 134.543 57.5361 134.942 57.6957 135.501C57.8553 136.059 57.4563 136.618 56.8977 136.777C56.8179 136.777 56.7381 136.777 56.6583 136.777C56.1795 136.857 55.7007 136.538 55.6209 135.979ZM316.407 136.059C315.928 135.66 315.928 135.022 316.327 134.543C316.726 134.064 317.365 134.064 317.844 134.463C318.322 134.862 318.322 135.501 317.923 135.979C317.684 136.219 317.445 136.378 317.125 136.378C316.886 136.299 316.647 136.219 316.407 136.059ZM312.018 132.309C311.539 131.91 311.539 131.271 311.859 130.792C312.258 130.314 312.896 130.314 313.375 130.633C313.854 131.032 313.854 131.67 313.534 132.149C313.295 132.388 313.056 132.548 312.736 132.548C312.497 132.548 312.258 132.468 312.018 132.309ZM54.5037 130.234C54.4239 129.675 54.8229 129.117 55.3815 129.037C55.9401 128.957 56.4987 129.356 56.5785 129.915C56.6583 130.473 56.2593 131.032 55.7007 131.112C55.6209 131.112 55.6209 131.112 55.5411 131.112C55.0623 131.191 54.5835 130.792 54.5037 130.234ZM307.629 128.558C307.15 128.159 307.15 127.521 307.47 127.042C307.869 126.563 308.507 126.563 308.986 126.962C309.465 127.361 309.465 127.999 309.066 128.478C308.826 128.718 308.587 128.877 308.268 128.877C308.108 128.877 307.869 128.797 307.629 128.558ZM53.8653 124.408C53.7855 123.85 54.2643 123.291 54.9027 123.291C55.4613 123.211 56.0199 123.69 56.0199 124.329C56.0199 124.887 55.6209 125.446 54.9825 125.446H54.9027C54.4239 125.446 53.9451 124.967 53.8653 124.408ZM303.32 124.728C302.921 124.329 302.841 123.61 303.24 123.211C303.639 122.812 304.357 122.733 304.756 123.132C305.155 123.531 305.235 124.249 304.836 124.648C304.597 124.887 304.357 124.967 304.038 124.967C303.799 125.047 303.48 124.887 303.32 124.728ZM299.17 120.578C298.771 120.099 298.851 119.461 299.25 119.062C299.729 118.663 300.367 118.743 300.766 119.142C301.165 119.62 301.086 120.259 300.687 120.658C300.447 120.817 300.208 120.897 299.968 120.897C299.729 120.897 299.41 120.817 299.17 120.578ZM54.8229 119.7C54.2643 119.7 53.7855 119.221 53.7855 118.583C53.7855 118.024 54.2643 117.546 54.9027 117.546C55.4613 117.546 55.9401 118.024 55.9401 118.663C55.8603 119.221 55.3815 119.7 54.8229 119.7ZM295.5 115.95C295.18 115.471 295.26 114.753 295.819 114.433C296.298 114.114 296.936 114.194 297.335 114.753C297.654 115.231 297.574 115.95 297.016 116.269C296.856 116.428 296.617 116.428 296.377 116.428C296.058 116.349 295.739 116.189 295.5 115.95ZM55.0623 113.955C54.5037 113.875 54.0249 113.396 54.1047 112.758C54.1845 112.199 54.6633 111.72 55.3017 111.8C55.8603 111.88 56.3391 112.359 56.2593 112.997C56.1795 113.556 55.7007 113.955 55.2219 113.955C55.1421 113.955 55.1421 113.955 55.0623 113.955ZM292.627 110.683C292.387 110.124 292.627 109.486 293.185 109.246C293.744 109.007 294.382 109.246 294.622 109.805C294.861 110.364 294.622 111.002 294.063 111.241C293.904 111.321 293.744 111.321 293.664 111.321C293.185 111.401 292.786 111.162 292.627 110.683ZM55.8603 108.209C55.3017 108.129 54.9027 107.491 54.9825 106.932C55.0623 106.374 55.7007 105.975 56.2593 106.054C56.8179 106.214 57.2169 106.773 57.1371 107.331C57.0573 107.81 56.5785 108.209 56.0997 108.209C55.9401 108.209 55.8603 108.209 55.8603 108.209ZM143.64 105.097C143.64 104.538 144.039 103.98 144.678 103.98C145.236 103.98 145.795 104.379 145.795 105.017C145.795 105.576 145.396 106.134 144.757 106.134C144.757 106.134 144.757 106.134 144.678 106.134C144.199 106.134 143.72 105.735 143.64 105.097ZM290.791 105.017C290.712 104.458 291.031 103.9 291.669 103.74C292.228 103.66 292.786 103.98 292.946 104.618C293.026 105.177 292.707 105.735 292.068 105.895C291.988 105.895 291.909 105.895 291.829 105.895C291.35 105.895 290.951 105.496 290.791 105.017ZM138.852 105.815C138.294 105.735 137.895 105.177 137.974 104.618C138.054 104.059 138.613 103.66 139.171 103.74C139.73 103.82 140.129 104.379 140.049 104.937C139.969 105.496 139.491 105.815 139.012 105.815C138.932 105.815 138.932 105.815 138.852 105.815ZM149.386 104.458C149.226 103.9 149.625 103.261 150.184 103.182C150.742 103.022 151.381 103.341 151.461 103.98C151.62 104.538 151.221 105.177 150.663 105.256C150.583 105.256 150.503 105.256 150.423 105.256C149.944 105.336 149.545 105.017 149.386 104.458ZM133.107 104.458C132.548 104.299 132.229 103.66 132.388 103.102C132.548 102.543 133.186 102.224 133.745 102.384C134.304 102.543 134.623 103.182 134.463 103.74C134.304 104.219 133.905 104.458 133.426 104.458C133.266 104.458 133.186 104.458 133.107 104.458ZM154.892 102.703C154.653 102.144 154.892 101.506 155.451 101.266C156.009 101.027 156.648 101.266 156.887 101.825C157.126 102.384 156.887 103.022 156.328 103.261C156.169 103.341 156.009 103.341 155.85 103.341C155.451 103.341 155.052 103.102 154.892 102.703ZM57.1371 102.623C56.5785 102.463 56.2593 101.825 56.4189 101.266C56.5785 100.708 57.2169 100.389 57.7755 100.548C58.3341 100.708 58.6533 101.346 58.4937 101.905C58.3341 102.384 57.9351 102.623 57.4563 102.623C57.3765 102.703 57.2967 102.623 57.1371 102.623ZM127.6 102.224C127.042 101.985 126.802 101.346 127.122 100.788C127.361 100.229 127.999 99.9895 128.558 100.309C129.117 100.548 129.356 101.187 129.037 101.745C128.877 102.144 128.478 102.384 128.079 102.384C127.92 102.304 127.76 102.304 127.6 102.224ZM159.999 100.069C159.68 99.5905 159.84 98.8723 160.318 98.5531C160.797 98.2339 161.515 98.3935 161.835 98.8723C162.154 99.3511 161.994 100.069 161.515 100.389C161.356 100.468 161.116 100.548 160.957 100.548C160.558 100.548 160.159 100.389 159.999 100.069ZM290.233 99.1117C290.233 98.5531 290.712 97.9945 291.27 97.9945C291.829 97.9945 292.308 98.4733 292.387 99.0319C292.387 99.5905 291.909 100.069 291.35 100.149C290.712 100.149 290.233 99.6703 290.233 99.1117ZM122.413 99.5107C121.935 99.1915 121.695 98.5531 122.014 98.0743C122.334 97.5955 122.972 97.3561 123.451 97.6753C123.93 97.9945 124.169 98.6329 123.85 99.1117C123.61 99.4309 123.291 99.6703 122.892 99.6703C122.812 99.6703 122.573 99.5905 122.413 99.5107ZM59.2119 97.1965C58.6533 96.9571 58.4139 96.3187 58.7331 95.7601C58.9725 95.2015 59.6109 94.9621 60.1695 95.2813C60.7281 95.5207 60.9675 96.1591 60.6483 96.7177C60.4887 97.1167 60.0897 97.3561 59.6907 97.3561C59.4513 97.2763 59.2917 97.2763 59.2119 97.1965ZM164.707 96.7975C164.308 96.3187 164.388 95.6803 164.867 95.2813C165.346 94.8823 165.984 94.9621 166.383 95.4409C166.782 95.9197 166.702 96.5581 166.224 96.9571C165.984 97.1167 165.745 97.1965 165.505 97.1965C165.186 97.1965 164.947 97.0369 164.707 96.7975ZM117.466 96.4783C116.987 96.1591 116.827 95.5207 117.147 94.9621C117.466 94.4833 118.104 94.3237 118.663 94.6429C119.142 94.9621 119.301 95.6005 118.982 96.1591C118.743 96.4783 118.423 96.6379 118.104 96.6379C117.865 96.6379 117.625 96.5581 117.466 96.4783ZM291.589 94.4035C291.031 94.3237 290.552 93.7651 290.632 93.2065C290.712 92.6479 291.27 92.1691 291.829 92.2489C292.387 92.3287 292.866 92.8873 292.786 93.4459C292.707 94.0045 292.228 94.4035 291.749 94.4035C291.669 94.4035 291.589 94.4035 291.589 94.4035ZM112.598 93.2863C112.119 92.9671 111.96 92.2489 112.279 91.7701C112.598 91.2913 113.316 91.1317 113.795 91.4509C114.274 91.7701 114.433 92.4883 114.114 92.9671C113.875 93.2863 113.556 93.4459 113.236 93.4459C112.997 93.4459 112.837 93.4459 112.598 93.2863ZM169.017 92.9671C168.618 92.5681 168.618 91.8499 169.017 91.4509C169.416 91.0519 170.134 91.0519 170.533 91.4509C170.932 91.8499 170.932 92.5681 170.533 92.9671C170.293 93.2065 170.054 93.2863 169.735 93.2863C169.495 93.2863 169.256 93.2065 169.017 92.9671ZM61.9251 92.1691C61.4463 91.8499 61.2867 91.1317 61.6059 90.6529C61.9251 90.1741 62.6433 90.0145 63.1221 90.3337C63.6009 90.6529 63.7605 91.3711 63.3615 91.8499C63.1221 92.1691 62.8029 92.3287 62.4837 92.3287C62.3241 92.3287 62.0847 92.2489 61.9251 92.1691ZM107.81 90.1741C107.331 89.8549 107.172 89.2165 107.491 88.6579C107.81 88.1791 108.448 88.0195 109.007 88.3387C109.486 88.6579 109.645 89.2963 109.326 89.8549C109.087 90.1741 108.768 90.3337 108.448 90.3337C108.209 90.3337 108.049 90.2539 107.81 90.1741ZM173.007 88.8175C172.528 88.4185 172.528 87.7801 172.927 87.3013C173.326 86.8225 173.964 86.8225 174.443 87.2215C174.922 87.6205 174.922 88.2589 174.523 88.7377C174.283 88.9771 174.044 89.1367 173.725 89.1367C173.406 89.0569 173.166 88.9771 173.007 88.8175ZM292.387 88.7377C291.829 88.6579 291.43 88.0993 291.51 87.4609C291.589 86.9023 292.148 86.5033 292.786 86.5831C293.345 86.6629 293.744 87.2215 293.664 87.8599C293.584 88.3387 293.106 88.7377 292.627 88.7377C292.547 88.7377 292.467 88.7377 292.387 88.7377ZM65.4363 87.5407C65.0373 87.1417 65.0373 86.4235 65.4363 86.0245C65.8353 85.6255 66.5535 85.6255 66.9525 86.0245C67.3515 86.4235 67.3515 87.1417 66.9525 87.5407C66.7131 87.7801 66.4737 87.8599 66.1545 87.8599C65.9151 87.8599 65.6757 87.7801 65.4363 87.5407ZM102.942 87.2215C102.463 86.9023 102.224 86.2639 102.543 85.7851C102.862 85.2265 103.501 85.0669 103.98 85.3861C104.458 85.7053 104.698 86.3437 104.379 86.8225C104.219 87.1417 103.82 87.3811 103.421 87.3811C103.261 87.3811 103.102 87.3013 102.942 87.2215ZM97.9149 84.6679C97.3563 84.4285 97.1169 83.7901 97.3563 83.2315C97.5957 82.6729 98.2341 82.4335 98.7927 82.6729C99.3513 82.9123 99.5907 83.5507 99.3513 84.1093C99.1917 84.5083 98.7927 84.7477 98.3937 84.7477C98.1543 84.7477 98.0745 84.7477 97.9149 84.6679ZM176.677 84.3487C176.199 83.9497 176.119 83.3113 176.518 82.8325C176.917 82.3537 177.555 82.2739 178.034 82.6729C178.513 83.0719 178.593 83.7103 178.194 84.1891C177.954 84.4285 177.635 84.5881 177.316 84.5881C177.156 84.5881 176.917 84.5083 176.677 84.3487ZM69.8253 83.8699C69.5061 83.3911 69.6657 82.6729 70.1445 82.3537C70.6233 82.0345 71.3415 82.1941 71.6607 82.6729C71.9799 83.1517 71.8203 83.8699 71.3415 84.1891C71.1819 84.2689 70.9425 84.3487 70.7829 84.3487C70.3839 84.3487 69.9849 84.1891 69.8253 83.8699ZM293.425 83.0719C292.866 82.9921 292.467 82.4335 292.547 81.7951C292.627 81.2365 293.186 80.8375 293.824 80.9173C294.382 80.9971 294.781 81.5557 294.702 82.1941C294.622 82.7527 294.143 83.0719 293.664 83.0719C293.584 83.0719 293.505 83.0719 293.425 83.0719ZM92.6481 82.5931C92.0895 82.4335 91.7703 81.7951 91.9299 81.2365C92.0895 80.6779 92.7279 80.3587 93.2865 80.5183C93.8451 80.6779 94.1643 81.3163 94.0047 81.8749C93.8451 82.3537 93.4461 82.5931 92.9673 82.5931C92.8875 82.6729 92.7279 82.6729 92.6481 82.5931ZM74.9325 81.2365C74.7729 80.6779 75.0921 80.0395 75.6507 79.8799C76.2093 79.7203 76.8477 80.0395 77.0073 80.5981C77.1669 81.1567 76.8477 81.7951 76.2891 81.9547C76.2093 81.9547 76.0497 82.0345 75.9699 82.0345C75.4911 82.0345 75.0921 81.7153 74.9325 81.2365ZM87.2217 81.3163C86.6631 81.2365 86.2641 80.6779 86.3439 80.1193C86.4237 79.5607 86.9823 79.1617 87.5409 79.2415C88.0995 79.3213 88.4985 79.8799 88.4187 80.4385C88.3389 80.9971 87.8601 81.3163 87.3813 81.3163C87.3015 81.3163 87.2217 81.3163 87.2217 81.3163ZM80.5185 80.0395C80.5185 79.4809 80.9175 78.9223 81.5559 78.9223C82.1145 78.9223 82.6731 79.3213 82.6731 79.9597C82.6731 80.5183 82.2741 81.0769 81.6357 81.0769C81.6357 81.0769 81.6357 81.0769 81.5559 81.0769C81.0771 80.9971 80.5983 80.5981 80.5185 80.0395ZM180.268 79.8799C179.79 79.4809 179.71 78.8425 180.109 78.3637C180.508 77.8849 181.146 77.8051 181.625 78.2041C182.104 78.6031 182.184 79.2415 181.785 79.7203C181.545 79.9597 181.226 80.1193 180.907 80.1193C180.747 80.1193 180.508 80.0395 180.268 79.8799ZM294.382 77.3263C293.824 77.2465 293.345 76.7677 293.425 76.1293C293.505 75.5707 294.063 75.0919 294.622 75.1717C295.18 75.2515 295.659 75.8101 295.579 76.3687C295.5 76.9273 295.021 77.3263 294.542 77.3263C294.462 77.3263 294.382 77.3263 294.382 77.3263ZM183.859 75.3313C183.381 74.9323 183.301 74.2939 183.7 73.8151C184.099 73.3363 184.737 73.2565 185.216 73.6555C185.695 74.0545 185.775 74.6929 185.376 75.1717C185.136 75.4111 184.817 75.5707 184.578 75.5707C184.338 75.5707 184.099 75.4909 183.859 75.3313ZM293.744 70.5433C293.744 69.9847 294.223 69.4261 294.781 69.4261C295.34 69.4261 295.899 69.9049 295.899 70.4635C295.899 71.0221 295.42 71.5807 294.861 71.5807C294.223 71.5807 293.744 71.1019 293.744 70.5433ZM187.61 70.9423C187.131 70.5433 187.131 69.9049 187.53 69.4261C187.929 69.0271 188.568 68.9473 189.046 69.3463C189.525 69.7453 189.525 70.3837 189.126 70.8625C188.887 71.1019 188.647 71.1817 188.328 71.1817C188.009 71.2615 187.77 71.1019 187.61 70.9423ZM191.52 66.7129C191.121 66.3139 191.121 65.5957 191.52 65.1967C191.919 64.7977 192.637 64.7977 193.036 65.1967C193.435 65.5957 193.435 66.3139 193.036 66.7129C192.797 66.9523 192.558 67.0321 192.318 67.0321C191.999 67.0321 191.76 66.9523 191.52 66.7129ZM293.185 65.0371C293.026 64.4785 293.425 63.9199 293.983 63.7603C294.542 63.6007 295.101 63.9997 295.26 64.5583C295.42 65.1169 295.021 65.6755 294.462 65.8351C294.382 65.8351 294.303 65.8351 294.223 65.8351C293.744 65.9149 293.265 65.5159 293.185 65.0371ZM195.67 62.8027C195.271 62.3239 195.351 61.6855 195.75 61.2865C196.228 60.8875 196.867 60.9673 197.266 61.3663C197.665 61.8451 197.585 62.4835 197.186 62.8825C196.947 63.0421 196.707 63.1219 196.468 63.1219C196.228 63.1219 195.909 63.0421 195.67 62.8027ZM291.43 59.7703C291.19 59.2117 291.43 58.5733 291.988 58.3339C292.547 58.0945 293.186 58.3339 293.425 58.8925C293.664 59.4511 293.425 60.0895 292.866 60.3289C292.707 60.4087 292.547 60.4087 292.467 60.4087C291.988 60.4087 291.669 60.1693 291.43 59.7703ZM200.139 59.0521C199.819 58.5733 199.899 57.9349 200.378 57.5359C200.857 57.1369 201.495 57.2965 201.894 57.6955C202.293 58.1743 202.134 58.8127 201.735 59.2117C201.575 59.3713 201.336 59.4511 201.096 59.4511C200.617 59.5309 200.298 59.3713 200.139 59.0521ZM204.767 55.6207C204.448 55.1419 204.528 54.4237 205.086 54.1045C205.565 53.7853 206.283 53.8651 206.602 54.4237C206.922 54.9025 206.842 55.6207 206.283 55.9399C206.124 56.0995 205.884 56.0995 205.645 56.0995C205.326 56.0995 204.927 55.9399 204.767 55.6207ZM288.717 54.9823C288.397 54.5035 288.477 53.8651 288.956 53.4661C289.435 53.1469 290.073 53.2267 290.472 53.7055C290.791 54.1843 290.712 54.8227 290.233 55.2217C290.073 55.3813 289.834 55.3813 289.594 55.3813C289.275 55.3813 288.876 55.2217 288.717 54.9823ZM209.555 52.5085C209.236 52.0297 209.395 51.3115 209.954 50.9923C210.433 50.6731 211.151 50.8327 211.47 51.3913C211.789 51.8701 211.63 52.5883 211.071 52.9075C210.912 52.9873 210.672 53.0671 210.513 53.0671C210.114 52.9873 209.794 52.8277 209.555 52.5085ZM285.126 50.7529C284.727 50.3539 284.727 49.6357 285.126 49.2367C285.525 48.8377 286.243 48.8377 286.642 49.2367C287.041 49.6357 287.041 50.3539 286.642 50.7529C286.402 50.9923 286.163 51.0721 285.844 51.0721C285.604 50.9923 285.285 50.9125 285.126 50.7529ZM214.582 49.6357C214.343 49.0771 214.503 48.4387 215.061 48.1993C215.62 47.8801 216.258 48.1195 216.498 48.6781C216.737 49.2367 216.577 49.8751 216.019 50.1145C215.859 50.1943 215.7 50.2741 215.54 50.2741C215.141 50.1943 214.742 50.0347 214.582 49.6357ZM219.769 47.0821C219.53 46.5235 219.769 45.8851 220.328 45.6457C220.887 45.4063 221.525 45.6457 221.764 46.2043C222.004 46.7629 221.764 47.4013 221.206 47.6407C221.046 47.7205 220.887 47.7205 220.807 47.7205C220.328 47.7205 219.929 47.4811 219.769 47.0821ZM280.816 47.1619C280.338 46.8427 280.258 46.1245 280.577 45.6457C280.896 45.1669 281.614 45.0871 282.093 45.4063C282.572 45.7255 282.652 46.4437 282.333 46.9225C282.093 47.2417 281.774 47.4013 281.455 47.4013C281.215 47.3215 280.976 47.2417 280.816 47.1619ZM225.036 44.8477C224.797 44.2891 225.116 43.6507 225.675 43.4911C226.233 43.2517 226.872 43.5709 227.031 44.1295C227.271 44.6881 226.951 45.3265 226.393 45.4861C226.233 45.5659 226.153 45.5659 225.994 45.5659C225.595 45.4861 225.196 45.2467 225.036 44.8477ZM276.028 44.2093C275.47 43.9699 275.31 43.2517 275.55 42.7729C275.789 42.2143 276.507 42.0547 276.986 42.2941C277.545 42.5335 277.704 43.1719 277.465 43.7305C277.305 44.1295 276.906 44.2891 276.507 44.2891C276.348 44.3689 276.188 44.2891 276.028 44.2093ZM230.463 42.9325C230.303 42.3739 230.622 41.7355 231.181 41.5759C231.739 41.4163 232.378 41.7355 232.537 42.2941C232.697 42.8527 232.378 43.4911 231.819 43.6507C231.739 43.6507 231.58 43.7305 231.5 43.7305C231.021 43.6507 230.622 43.3315 230.463 42.9325ZM270.841 42.1345C270.283 41.9749 269.964 41.3365 270.123 40.7779C270.283 40.2193 270.921 39.9001 271.48 40.0597C272.038 40.2193 272.358 40.8577 272.198 41.4163C272.038 41.8951 271.639 42.1345 271.161 42.1345C271.081 42.1345 271.001 42.1345 270.841 42.1345ZM236.049 41.3365C235.889 40.7779 236.288 40.1395 236.847 40.0597C237.405 39.9001 237.964 40.2991 238.123 40.8577C238.283 41.4163 237.884 41.9749 237.325 42.1345C237.246 42.1345 237.166 42.1345 237.086 42.1345C236.607 42.1345 236.128 41.8153 236.049 41.3365ZM241.635 40.0597C241.555 39.5011 241.954 38.9425 242.512 38.7829C243.071 38.7031 243.63 39.1021 243.789 39.6607C243.869 40.2193 243.47 40.7779 242.911 40.9375C242.832 40.9375 242.752 40.9375 242.752 40.9375C242.193 40.9375 241.714 40.5385 241.635 40.0597ZM265.415 40.6981C264.856 40.6183 264.457 40.0597 264.537 39.4213C264.617 38.8627 265.255 38.4637 265.814 38.5435C266.373 38.6233 266.772 39.2617 266.692 39.8203C266.612 40.2991 266.133 40.6981 265.654 40.6981C265.575 40.6981 265.495 40.6981 265.415 40.6981ZM247.3 39.1819C247.221 38.6233 247.699 38.0647 248.258 37.9849C248.817 37.9051 249.375 38.3839 249.455 38.9425C249.535 39.5011 249.056 40.0597 248.497 40.1395H248.418C247.859 40.1395 247.38 39.7405 247.3 39.1819ZM259.829 39.9799C259.27 39.9001 258.792 39.4213 258.871 38.7829C258.951 38.2243 259.43 37.7455 259.989 37.8253C260.547 37.9051 261.026 38.3839 260.946 38.9425C260.946 39.5011 260.467 39.9799 259.829 39.9799C259.909 39.9799 259.829 39.9799 259.829 39.9799ZM253.046 38.7031C253.046 38.1445 253.525 37.5859 254.083 37.5859C254.642 37.5859 255.201 38.0647 255.201 38.6233C255.201 39.1819 254.722 39.7405 254.163 39.7405C253.605 39.7405 253.126 39.3415 253.046 38.7031Z'
                  fill='#EBB393'
                />
                <path
                  d='M292.946 320.876C292.787 320.876 292.627 320.876 292.547 320.796C292.388 320.716 292.308 320.637 292.228 320.557C291.989 320.317 291.909 320.078 291.909 319.759C291.909 319.44 291.989 319.2 292.228 318.961C292.627 318.562 293.345 318.562 293.744 318.961C293.983 319.2 294.063 319.44 294.063 319.759C294.063 320.078 293.983 320.317 293.744 320.557C293.505 320.796 293.186 320.876 292.946 320.876Z'
                  fill='#EBB393'
                />
                <path
                  opacity='0.45'
                  d='M55.0622 333.644H322.153C320.716 326.143 319.44 318.562 321.674 311.46C325.903 298.213 341.145 290.791 345.215 277.545C348.806 265.734 342.422 253.285 335.24 243.151C328.058 233.016 319.679 222.802 318.642 210.513C317.764 199.979 322.632 189.844 328.138 180.827C333.644 171.81 340.028 163.032 342.901 152.897C345.774 142.762 344.257 130.393 335.958 123.77C326.143 115.87 311.859 119.062 299.649 122.014C287.44 124.967 272.358 126.403 264.298 116.748C259.191 110.523 258.871 101.745 255.52 94.4036C248.817 79.8002 230.303 73.3364 214.582 76.5284C198.862 79.8002 185.695 90.7328 175.401 103.022C165.106 115.311 156.887 129.356 146.513 141.565C137.735 151.939 124.967 161.755 111.8 158.643C99.9098 155.77 91.9298 143.241 79.88 141.406C71.2616 140.129 62.4836 144.997 57.2966 152.019C52.1096 159.042 50.0348 167.899 49.2368 176.598C47.2418 199.181 53.546 222.483 66.8726 240.837C73.895 250.572 83.2316 261.984 78.4436 272.916C72.2192 287.041 47.7206 285.764 42.9326 300.447C41.0972 306.193 43.0922 312.417 45.6458 317.844C48.2792 323.509 51.4712 328.696 55.0622 333.644Z'
                  fill='url(#paint0_linear)'
                />
                <path
                  d='M164.388 105.416C159.52 113.795 154.573 123.052 150.503 131.75C147.63 129.835 145.077 127.6 142.603 125.206C140.049 126.723 137.575 128.319 135.022 129.835C140.767 133.665 146.832 137.097 153.296 139.411C157.126 128.478 160.558 116.428 164.388 105.416Z'
                  fill='#002B66'
                />
                <path
                  d='M97.915 296.936V120.658C97.915 112.678 104.379 106.294 112.279 106.294H321.834C329.814 106.294 336.198 112.758 336.198 120.658V296.936C336.198 304.916 329.734 311.3 321.834 311.3H112.279C104.299 311.3 97.915 304.916 97.915 296.936Z'
                  fill='url(#paint1_linear)'
                />
                <path
                  d='M332.607 295.26V252.887V164.229V121.855C332.607 115.232 327.739 109.805 321.834 109.805H112.279C106.294 109.805 101.506 115.232 101.506 121.855V295.26C101.506 301.884 106.374 307.31 112.279 307.31H321.834C327.739 307.31 332.607 301.884 332.607 295.26Z'
                  fill='white'
                />
                <g opacity='0.1'>
                  <path
                    opacity='0.1'
                    d='M291.43 151.86L112.678 330.612C115.152 332.527 118.184 333.724 121.536 333.724H145.715L291.43 188.009V151.86Z'
                    fill='white'
                  />
                  <path
                    opacity='0.1'
                    d='M107.172 318.402L291.43 134.144V109.725C291.43 101.745 284.966 95.3613 277.066 95.3613H258.074L107.252 246.183V318.402H107.172Z'
                    fill='white'
                  />
                </g>
                <path
                  opacity='0.45'
                  d='M124.01 307.31H112.758C106.374 307.31 101.187 302.123 101.187 295.739V121.536C101.187 115.072 106.374 109.885 112.838 109.885H123.93V307.31H124.01Z'
                  fill='#D3D3D3'
                />
                <path d='M62.0049 322.791L65.2767 314.971L71.5011 318.641L66.3141 325.345L62.0049 322.791Z' fill='#F2D2C2' />
                <path d='M99.5906 328.058L97.9946 318.163H108.129L106.613 328.058H99.5906Z' fill='#F2D2C2' />
                <path
                  d='M63.3615 231.5C64.3191 234.213 65.2767 237.246 64.2393 239.879C65.0373 241.315 63.9999 243.55 62.7231 244.507C61.4463 245.465 59.4513 245.305 58.2543 244.188C57.3765 243.31 57.0573 242.034 56.8977 240.757C56.5785 237.405 57.5361 233.894 59.5311 231.261C59.5311 230.383 59.9301 229.425 60.8079 229.425C61.6857 229.345 63.1221 230.702 63.3615 231.5Z'
                  fill='#F2D2C2'
                />
                <path
                  d='M90.8127 162.952C89.5359 161.116 89.6955 158.643 90.6531 156.648C91.6107 154.653 93.2865 153.136 94.9623 151.78C96.6381 150.423 98.4735 149.146 99.9897 147.55C102.703 144.598 103.98 140.448 103.581 136.458C103.341 134.463 102.623 132.468 101.107 131.271C98.6331 129.436 94.8825 130.314 92.6481 132.388C90.3339 134.463 89.1369 137.416 87.8601 140.209C86.5833 143.002 85.0671 145.954 82.4337 147.63C80.8377 148.668 78.9225 149.146 77.3265 150.184C73.8951 152.338 72.3789 157.047 73.8153 160.797C72.3789 162.234 72.0597 164.628 72.8577 166.463C73.6557 168.298 75.2517 169.735 77.0871 170.613C80.5185 172.368 84.7479 172.448 88.2591 171.012C87.5409 169.256 87.9399 166.543 89.3763 165.346C90.0945 164.707 90.8925 163.909 90.8127 162.952Z'
                  fill='url(#paint2_linear)'
                />
                <path
                  d='M126.164 139.571C125.127 137.975 125.606 135.581 127.122 134.463C126.723 132.628 128.079 130.154 129.995 129.915C131.192 129.755 132.548 130.394 132.947 131.511C133.187 132.149 133.027 132.947 132.788 133.586C131.99 136.458 130.473 139.092 128.399 141.167C127.68 140.768 126.563 140.289 126.164 139.571Z'
                  fill='#F2D2C2'
                />
                <path
                  d='M64.2394 234.214C65.995 221.047 72.2992 208.438 81.8752 199.181C84.349 196.787 87.0622 194.553 89.2966 191.999C91.531 189.446 93.3664 186.254 93.6856 182.822C93.8452 181.067 93.6058 179.311 92.6482 177.875C91.6906 176.438 89.935 175.401 88.2592 175.64C82.9126 176.359 78.5236 180.349 75.0124 184.418C64.1596 197.266 58.2544 214.104 58.5736 230.942C60.4888 232.618 61.8454 233.575 64.2394 234.214Z'
                  fill='#FFB227'
                />
                <path
                  d='M64.2394 234.214C65.995 221.047 72.2992 208.438 81.8752 199.181C84.349 196.787 87.0622 194.553 89.2966 191.999C91.531 189.446 93.3664 186.254 93.6856 182.822C93.8452 181.067 93.6058 179.311 92.6482 177.875C91.6906 176.438 89.935 175.401 88.2592 175.64C82.9126 176.359 78.5236 180.349 75.0124 184.418C64.1596 197.266 58.2544 214.104 58.5736 230.942C60.4888 232.618 61.8454 233.575 64.2394 234.214Z'
                  fill='url(#paint3_linear)'
                />
                <path
                  d='M97.9948 256.318C96.2392 278.901 86.9824 300.846 71.9002 317.764C69.586 317.046 67.4314 315.45 65.7556 313.694C68.3092 299.729 78.4438 287.6 79.561 273.475C80.1196 265.974 78.2044 258.473 77.2468 250.971C76.2892 243.47 74.1346 232.218 78.5236 226.074C85.147 229.505 93.127 237.725 96.9574 244.109C98.2342 246.183 99.3514 248.498 99.7504 250.892C100.149 253.286 98.1544 253.844 97.9948 256.318Z'
                  fill='#005898'
                />
                <path
                  d='M97.9948 256.318C96.2392 278.901 86.9824 300.846 71.9002 317.764C69.586 317.046 67.4314 315.45 65.7556 313.694C68.3092 299.729 78.4438 287.6 79.561 273.475C80.1196 265.974 78.2044 258.473 77.2468 250.971C76.2892 243.47 74.1346 232.218 78.5236 226.074C85.147 229.505 93.127 237.725 96.9574 244.109C98.2342 246.183 99.3514 248.498 99.7504 250.892C100.149 253.286 98.1544 253.844 97.9948 256.318Z'
                  fill='url(#paint4_linear)'
                />
                <path
                  opacity='0.2'
                  d='M99.6705 250.812C99.2715 248.418 98.1543 246.104 96.8775 244.029C93.1269 237.804 85.3863 229.824 78.9225 226.233C78.6033 226.393 78.2841 226.553 78.0447 226.632C74.5335 232.458 76.0497 242.114 77.0073 249.216C77.2467 249.615 77.4063 249.934 77.6457 250.333C81.2367 256.557 85.9449 262.143 89.1369 268.527C91.1319 272.517 92.6481 277.066 92.8077 281.535C95.6007 273.315 97.3563 264.777 97.9947 256.158C98.1543 253.844 100.149 253.286 99.6705 250.812Z'
                  fill='black'
                />
                <path
                  d='M101.745 225.914C109.326 256.797 111.64 288.876 108.608 320.557H98.2341C95.3613 308.986 92.7279 296.218 92.8875 284.248C92.9673 276.826 94.1643 269.325 92.3289 262.223C90.6531 255.839 86.6631 250.413 83.3913 244.747C80.1195 239.081 77.3265 232.537 78.5235 226.074C86.1843 224.158 94.0845 224.079 101.745 225.914Z'
                  fill='url(#paint5_linear)'
                />
                <path
                  opacity='0.2'
                  d='M103.022 231.5C102.862 230.862 102.783 230.303 102.623 229.665C102.463 229.106 102.384 228.627 102.224 228.069C99.8301 227.35 97.9149 226.233 94.9623 225.515C93.2067 225.116 91.4511 224.797 89.6955 224.637C87.3813 224.637 85.1469 224.877 82.8327 225.196C80.7579 225.834 78.8427 226.951 77.1669 228.388C77.0871 228.627 77.0073 228.867 76.8477 229.106C76.8477 229.106 76.8477 229.106 76.8477 229.186C76.6881 229.585 76.6083 229.984 76.4487 230.383V230.463C76.3689 230.862 76.2093 231.34 76.1295 231.739V231.819C75.8901 233.176 75.7305 234.612 75.7305 236.049V236.128C75.7305 236.607 75.7305 237.086 75.7305 237.565C75.7305 237.645 75.7305 237.645 75.7305 237.724C75.7305 238.203 75.7305 238.682 75.8103 239.161V239.241C75.8901 240.198 75.9699 241.236 76.0497 242.193V242.273C76.1295 242.752 76.1295 243.231 76.2093 243.63C76.2093 243.709 76.2093 243.709 76.2093 243.789C76.2891 244.268 76.2891 244.667 76.3689 245.146C76.3689 245.226 76.3689 245.305 76.3689 245.385C76.4487 245.784 76.4487 246.263 76.5285 246.662C76.5285 246.742 76.5285 246.822 76.5285 246.901C76.5285 247.141 76.6083 247.38 76.6083 247.699C87.1419 245.784 96.7179 239.879 103.022 231.5Z'
                  fill='black'
                />
                <path
                  d='M74.1346 237.884C82.9924 240.438 95.8402 233.176 104.459 229.984C103.74 220.807 101.745 211.311 101.027 202.134C100.309 192.239 99.2716 181.705 93.0472 173.964C90.4936 170.852 84.748 172.608 81.7156 175.241C78.6832 177.875 77.0074 181.705 75.7306 185.535C70.8628 200.697 69.9052 222.722 74.1346 237.884Z'
                  fill='url(#paint6_linear)'
                />
                <path
                  opacity='0.2'
                  d='M101.027 202.214C100.389 193.515 99.511 184.259 95.0422 176.917C93.2068 177.396 91.3714 178.194 89.6956 179.151C86.2642 181.146 83.3914 184.259 79.96 186.094C85.945 192.797 93.127 198.463 101.107 202.613C101.027 202.533 101.027 202.373 101.027 202.214Z'
                  fill='black'
                />
                <path
                  d='M85.7055 162.553C84.9873 166.623 84.5883 170.693 84.5085 174.842C86.5035 175.401 88.7379 176.119 90.733 175.72C91.3714 171.57 91.531 167.181 91.2916 162.952C89.3764 162.314 87.7804 162.314 85.7055 162.553Z'
                  fill='#F2D2C2'
                />
                <path
                  opacity='0.2'
                  d='M84.8276 169.416C86.7428 170.772 88.8974 171.889 91.1318 172.608C91.451 169.655 91.451 166.623 91.3712 163.67C91.1318 163.351 90.8924 163.032 90.5732 162.712C90.5732 162.712 90.4934 162.712 90.4934 162.633C88.8974 162.234 87.461 162.234 85.7054 162.393C85.3064 164.787 85.067 167.101 84.8276 169.416Z'
                  fill='black'
                />
                <path
                  d='M85.9448 154.573C90.4934 157.047 94.1642 161.276 95.9198 166.144C94.8824 168.059 93.047 169.495 90.9722 170.134C87.9398 171.091 84.4286 170.613 81.875 168.618C79.3214 166.702 78.0447 163.191 78.8427 160.159C79.5609 157.126 83.072 153.057 85.9448 154.573Z'
                  fill='#F2D2C2'
                />
                <path
                  d='M129.755 139.89C127.281 149.386 124.249 158.723 119.621 167.341C114.912 175.959 108.449 183.7 100.149 188.807C97.5159 190.403 94.7229 191.76 91.6905 192.159C88.6581 192.558 85.3863 191.999 83.0721 190.084C80.7579 188.169 77.8851 183.78 79.6407 181.306C81.8751 178.194 85.7853 176.917 89.2965 175.56C105.815 169.017 119.301 155.132 125.366 138.374L129.755 139.89Z'
                  fill='url(#paint7_linear)'
                />
                <path
                  d='M90.6532 156.089C90.733 156.488 90.5734 156.967 90.2542 157.286C89.935 157.605 89.6159 157.845 89.2169 158.084C87.2219 159.281 84.8279 159.999 82.4339 160.079C83.2319 161.196 83.3914 162.872 83.0722 164.149C83.7904 164.787 84.4288 165.506 85.147 166.144C84.5086 165.745 83.4712 165.506 82.753 165.186C82.354 165.027 81.7954 164.867 81.3964 165.186C81.157 165.426 81.0772 165.825 81.157 166.144C81.2368 166.463 81.4762 166.703 81.7954 166.942C82.5136 167.66 83.4713 168.139 84.5086 168.378C84.8279 169.336 84.748 170.373 84.5884 171.411C81.8752 170.772 78.4438 169.416 77.0074 167.022C76.0498 165.346 76.0498 163.351 76.1296 161.436C76.369 158.723 76.9276 155.85 78.6034 153.695C80.2792 151.541 83.2318 150.184 85.8652 151.062C87.94 151.94 90.2542 153.935 90.6532 156.089Z'
                  fill='url(#paint8_linear)'
                />
                <path
                  d='M108.129 322.871H97.9949C97.0373 322.871 96.2393 322.073 96.2393 321.115V319.998C96.2393 319.041 97.0373 318.243 97.9949 318.243H108.129C109.087 318.243 109.885 319.041 109.885 319.998V321.195C109.885 322.073 109.087 322.871 108.129 322.871Z'
                  fill='#005898'
                />
                <path
                  d='M108.129 322.871H97.9949C97.0373 322.871 96.2393 322.073 96.2393 321.115V319.998C96.2393 319.041 97.0373 318.243 97.9949 318.243H108.129C109.087 318.243 109.885 319.041 109.885 319.998V321.195C109.885 322.073 109.087 322.871 108.129 322.871Z'
                  fill='url(#paint9_linear)'
                />
                <path
                  d='M72.1396 320.477L63.4414 315.29C62.5636 314.811 62.3242 313.694 62.803 312.896L63.3616 311.859C63.8404 310.981 64.9576 310.742 65.7556 311.22L74.4538 316.407C75.3316 316.886 75.571 318.003 75.0922 318.801L74.5336 319.839C74.0548 320.637 73.0174 320.956 72.1396 320.477Z'
                  fill='#005898'
                />
                <path
                  d='M72.1396 320.477L63.4414 315.29C62.5636 314.811 62.3242 313.694 62.803 312.896L63.3616 311.859C63.8404 310.981 64.9576 310.742 65.7556 311.22L74.4538 316.407C75.3316 316.886 75.571 318.003 75.0922 318.801L74.5336 319.839C74.0548 320.637 73.0174 320.956 72.1396 320.477Z'
                  fill='url(#paint10_linear)'
                />
                <path
                  d='M99.1918 328.617L97.3564 331.809C96.8776 332.607 97.4362 333.644 98.3938 333.644H112.279C113.556 333.644 113.955 331.969 112.838 331.33L106.853 328.138C106.693 328.058 106.454 327.979 106.294 327.979H100.229C99.8302 328.058 99.4312 328.298 99.1918 328.617Z'
                  fill='black'
                />
                <path
                  d='M68.7081 329.016L66.4737 325.584C66.3939 325.425 66.2343 325.265 66.0747 325.185L62.5635 323.11C62.2443 322.871 61.7655 322.871 61.4463 323.031L58.8129 324.228C57.9351 324.627 57.8553 325.903 58.7331 326.382L66.7131 331.011L66.7929 331.09L67.4313 331.569C67.5909 331.729 67.8303 331.809 67.9899 331.809L68.7879 331.888C70.0647 332.048 70.6233 330.372 69.5859 329.654L69.1071 329.335C68.9475 329.255 68.8677 329.175 68.7081 329.016Z'
                  fill='black'
                />
                <path
                  d='M337.793 101.186C339.424 101.186 340.746 99.8645 340.746 98.2338C340.746 96.6032 339.424 95.2812 337.793 95.2812C336.163 95.2812 334.841 96.6032 334.841 98.2338C334.841 99.8645 336.163 101.186 337.793 101.186Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M160.877 62.9623C160.877 64.3189 159.76 65.5159 158.323 65.5159C156.887 65.5159 155.77 64.3987 155.77 62.9623C155.77 61.6057 156.887 60.4087 158.323 60.4087C159.76 60.4087 160.877 61.5259 160.877 62.9623Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M83.7103 52.6679C83.7103 53.5457 82.9921 54.2639 82.1143 54.2639C81.2365 54.2639 80.5183 53.5457 80.5183 52.6679C80.5183 51.7901 81.2365 51.0719 82.1143 51.0719C82.9921 50.9921 83.7103 51.7901 83.7103 52.6679Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M81.9548 109.885C81.9548 110.842 81.1568 111.64 80.1992 111.64C79.2416 111.64 78.4436 110.842 78.4436 109.885C78.4436 108.927 79.2416 108.129 80.1992 108.129C81.1568 108.049 81.9548 108.847 81.9548 109.885Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M40.5385 147.391C40.5385 149.306 38.9425 150.902 37.0273 150.902C35.1121 150.902 33.5161 149.306 33.5161 147.391C33.5161 145.475 35.1121 143.879 37.0273 143.879C39.0223 143.879 40.5385 145.396 40.5385 147.391Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M250.971 62.8027C250.971 63.8401 250.173 64.6381 249.136 64.6381C248.098 64.6381 247.3 63.8401 247.3 62.8027C247.3 61.7653 248.098 60.9673 249.136 60.9673C250.173 60.9673 250.971 61.8451 250.971 62.8027Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M309.385 64.0796C309.864 65.516 310.981 66.6332 312.337 67.0322C310.901 67.511 309.784 68.6282 309.385 69.9848C308.906 68.5484 307.789 67.4312 306.432 67.0322C307.869 66.6332 308.986 65.516 309.385 64.0796Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M349.684 305.395C350.163 306.831 351.28 307.948 352.636 308.347C351.2 308.826 350.083 309.943 349.684 311.3C349.205 309.863 348.088 308.746 346.731 308.347C348.168 307.868 349.285 306.831 349.684 305.395Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M358.94 168.059C359.419 169.495 360.536 170.613 361.893 171.012C360.457 171.49 359.339 172.608 358.94 173.964C358.462 172.528 357.344 171.411 355.988 171.012C357.424 170.533 358.541 169.416 358.94 168.059Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M274.592 80.0396C275.071 81.476 276.188 82.5931 277.545 82.9921C276.108 83.4709 274.991 84.5881 274.592 85.9447C274.113 84.5083 272.996 83.3911 271.639 82.9921C272.996 82.5931 274.113 81.476 274.592 80.0396Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M196.069 37.9849C196.548 39.4213 197.665 40.5385 199.021 40.9375C197.585 41.4163 196.468 42.5335 196.069 43.8901C195.59 42.4537 194.473 41.3365 193.116 40.9375C194.553 40.4587 195.67 39.3415 196.069 37.9849Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M40.5385 68.229C41.0173 69.6654 42.1345 70.7826 43.4911 71.1816C42.0547 71.6604 40.9375 72.7776 40.5385 74.1342C40.0597 72.6978 38.9425 71.5806 37.5859 71.1816C39.0223 70.7826 40.1395 69.6654 40.5385 68.229Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M124.009 60.1694C124.488 61.6058 125.605 62.723 126.962 63.122C125.525 63.6008 124.408 64.718 124.009 66.0746C123.53 64.6382 122.413 63.521 121.057 63.122C122.493 62.723 123.61 61.6058 124.009 60.1694Z'
                  fill='#F6E1D5'
                />
                <path
                  d='M36.5485 208.757C37.0273 210.193 38.1445 211.31 39.5011 211.709C38.0647 212.188 36.9475 213.305 36.5485 214.662C36.0697 213.226 34.9525 212.108 33.5959 211.709C35.0323 211.31 36.1495 210.193 36.5485 208.757Z'
                  fill='#F6E1D5'
                />
                <path
                  opacity='0.35'
                  d='M200.936 334.761C305.474 334.761 390.222 333.484 390.222 331.968C390.222 330.452 305.474 329.175 200.936 329.175C96.3985 329.175 11.6509 330.452 11.6509 331.968C11.6509 333.484 96.4783 334.761 200.936 334.761Z'
                  fill='#9A6F5D'
                />
                <path
                  opacity='0.45'
                  d='M163.191 293.983H139.969C136.937 293.983 134.463 291.509 134.463 288.477V130.473C134.463 127.441 136.937 124.967 139.969 124.967H163.191C166.224 124.967 168.697 127.441 168.697 130.473V288.477C168.697 291.509 166.224 293.983 163.191 293.983Z'
                  fill='#D3D3D3'
                />
                <path
                  opacity='0.45'
                  d='M176.438 132.628V127.122C176.438 125.925 177.396 125.047 178.513 125.047H296.776C297.973 125.047 298.851 126.004 298.851 127.122V132.628C298.851 133.825 297.894 134.703 296.776 134.703H178.513C177.396 134.782 176.438 133.825 176.438 132.628Z'
                  fill='#D3D3D3'
                />
                <path
                  opacity='0.45'
                  d='M176.438 151.54V146.034C176.438 144.837 177.396 143.959 178.513 143.959H275.47C276.667 143.959 277.545 144.917 277.545 146.034V151.54C277.545 152.737 276.587 153.615 275.47 153.615H178.513C177.396 153.615 176.438 152.658 176.438 151.54Z'
                  fill='#D3D3D3'
                />
                <path
                  opacity='0.45'
                  d='M176.438 179.71V174.204C176.438 173.007 177.396 172.129 178.513 172.129H266.851C268.048 172.129 268.926 173.087 268.926 174.204V179.71C268.926 180.907 267.969 181.785 266.851 181.785H178.513C177.396 181.785 176.438 180.827 176.438 179.71Z'
                  fill='#D3D3D3'
                />
                <path
                  opacity='0.45'
                  d='M176.438 205.405V199.899C176.438 198.702 177.396 197.824 178.513 197.824H280.417C281.614 197.824 282.492 198.782 282.492 199.899V205.405C282.492 206.602 281.535 207.48 280.417 207.48H178.513C177.396 207.48 176.438 206.602 176.438 205.405Z'
                  fill='#D3D3D3'
                />
                <path
                  opacity='0.45'
                  d='M176.438 224.797V219.291C176.438 218.094 177.396 217.216 178.513 217.216H294.303C295.5 217.216 296.377 218.173 296.377 219.291V224.797C296.377 225.994 295.42 226.872 294.303 226.872H178.513C177.396 226.872 176.438 225.914 176.438 224.797Z'
                  fill='#D3D3D3'
                />
                <path
                  opacity='0.45'
                  d='M176.438 244.108V238.602C176.438 237.405 177.396 236.527 178.513 236.527H266.851C268.048 236.527 268.926 237.485 268.926 238.602V244.108C268.926 245.305 267.969 246.183 266.851 246.183H178.513C177.396 246.263 176.438 245.305 176.438 244.108Z'
                  fill='#D3D3D3'
                />
                <path
                  opacity='0.45'
                  d='M176.438 290.472V277.385C176.438 276.188 177.396 275.31 178.513 275.31H228.308C229.505 275.31 230.383 276.268 230.383 277.385V290.472C230.383 291.669 229.425 292.547 228.308 292.547H178.513C177.396 292.547 176.438 291.589 176.438 290.472Z'
                  fill='#088B00'
                />
                <defs>
                  <linearGradient id='paint0_linear' x1='42.2783' y1='204.677' x2='346.322' y2='204.677' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#E6B46C' stop-opacity='0.7' />
                    <stop offset='0.3309' stop-color='#F7E3DA' />
                    <stop offset='0.6795' stop-color='#F9EDC7' />
                    <stop offset='0.9888' stop-color='#F9ECDD' />
                  </linearGradient>
                  <linearGradient id='paint1_linear' x1='217.035' y1='106.257' x2='217.035' y2='311.338' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#4B4B84' />
                    <stop offset='0.0275216' stop-color='#4D4C84' />
                    <stop offset='1' stop-color='#7C6B8D' />
                  </linearGradient>
                  <linearGradient id='paint2_linear' x1='72.4076' y1='151.15' x2='103.622' y2='151.15' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#683564' />
                    <stop offset='0.5694' stop-color='#AF6A7C' />
                    <stop offset='1' stop-color='#E3908D' />
                  </linearGradient>
                  <linearGradient id='paint3_linear' x1='58.6472' y1='204.891' x2='93.786' y2='204.891' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#AFA5CE' />
                    <stop offset='0.4763' stop-color='#8084C2' />
                    <stop offset='1' stop-color='#5264B5' />
                  </linearGradient>
                  <linearGradient id='paint4_linear' x1='65.7494' y1='271.872' x2='99.7506' y2='271.872' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#4B4B84' />
                    <stop offset='0.0275216' stop-color='#4D4C84' />
                    <stop offset='1' stop-color='#7C6B8D' />
                  </linearGradient>
                  <linearGradient id='paint5_linear' x1='78.2098' y1='272.561' x2='109.906' y2='272.561' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#4B4B84' />
                    <stop offset='0.0275216' stop-color='#4D4C84' />
                    <stop offset='1' stop-color='#7C6B8D' />
                  </linearGradient>
                  <linearGradient id='paint6_linear' x1='71.4484' y1='205.423' x2='104.457' y2='205.423' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#AFA5CE' />
                    <stop offset='0.4763' stop-color='#8084C2' />
                    <stop offset='1' stop-color='#5264B5' />
                  </linearGradient>
                  <linearGradient id='paint7_linear' x1='79.1381' y1='165.302' x2='129.775' y2='165.302' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#AFA5CE' />
                    <stop offset='0.4763' stop-color='#8084C2' />
                    <stop offset='1' stop-color='#5264B5' />
                  </linearGradient>
                  <linearGradient id='paint8_linear' x1='76.1536' y1='161.212' x2='90.6426' y2='161.212' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#683564' />
                    <stop offset='0.5694' stop-color='#AF6A7C' />
                    <stop offset='1' stop-color='#E3908D' />
                  </linearGradient>
                  <linearGradient id='paint9_linear' x1='96.2496' y1='320.546' x2='109.906' y2='320.546' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#4B4B84' />
                    <stop offset='0.0275216' stop-color='#4D4C84' />
                    <stop offset='1' stop-color='#7C6B8D' />
                  </linearGradient>
                  <linearGradient id='paint10_linear' x1='62.5766' y1='315.844' x2='75.4132' y2='315.844' gradientUnits='userSpaceOnUse'>
                    <stop stop-color='#4B4B84' />
                    <stop offset='0.0275216' stop-color='#4D4C84' />
                    <stop offset='1' stop-color='#7C6B8D' />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </>
    )
  }

  rednerHostedAPIDropdown() {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    return (
      <>
        <div>
          <label className='hostes-label'>Collection</label>
          <Dropdown>
            <Dropdown.Toggle variant='' id='dropdown-basic' className='custom-toggle'>
              {this.props.collections[collectionId]?.name || ''}
            </Dropdown.Toggle>
            <Dropdown.Menu>{this.showCollections()}</Dropdown.Menu>
          </Dropdown>
        </div>
      </>
    )
  }

  renderHostedApiHeading(heading) {
    return (
      <div className='hosted-doc-heading'>
        <div>{heading}</div>
      </div>
    )
  }

  showPublishDocConfirmationModal() {
    return (
      <PublishDocsConfirmModal
        {...this.props}
        show={this.state.showPublishDocConfirmModal}
        onHide={() => {
          this.setState({ showPublishDocConfirmModal: false })
        }}
        collection_id={URI.parseQuery(this.props.location.search).collectionId}
      />
    )
  }

  render() {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    return (
      <div className='publish-docs-container'>
        {this.renderWarningModal()}
        {this.showPublishDocConfirmationModal()}
        <div className='publish-docs-wrapper'>
          <div className='content-panel'>
            <div className='hosted-APIs'>
              {this.state.selectedCollectionId &&
                this.props.collections[this.state.selectedCollectionId] &&
                (!this.checkDocProperties(collectionId) ? this.renderFullPageDocForm() : this.renderHostedAPIDetials())}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocs)
