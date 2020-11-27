import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import './publishDocs.scss'
import { connect } from 'react-redux'
import { fetchCollections, updateCollection } from '../collections/redux/collectionsActions'
import { fetchAllVersions } from '../collectionVersions/redux/collectionVersionsActions'
import { fetchEndpoints } from '../endpoints/redux/endpointsActions'
import { fetchGroups } from '../groups/redux/groupsActions'
import { fetchPages } from '../pages/redux/pagesActions'
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
const URI = require('urijs')

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_collections: () => dispatch(fetchCollections()),
    fetch_all_versions: () => dispatch(fetchAllVersions()),
    fetch_groups: () => dispatch(fetchGroups()),
    fetch_endpoints: () => dispatch(fetchEndpoints()),
    fetch_pages: () => dispatch(fetchPages()),
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
      selectedCollectionId: null
    }
  }

  componentDidMount () {
    const collectionInfo = this.extractCollectionInfo()
    const selectedGroupId = this.getInitialGroup(Object.keys(collectionInfo.versions)[0], collectionInfo.groups)
    const selectedEndpointId = this.getInitialEndpoint(selectedGroupId, collectionInfo.endpoints)
    this.setState({
      selectedCollectionId: URI.parseQuery(this.props.location.search)
        .collectionId,
      selectedVersionId: Object.keys(collectionInfo.versions)[0],
      selectedGroupId,
      selectedEndpointId
    })
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps !== this.props) {
      const collectionInfo = this.extractCollectionInfo()
      if (!(this.state.selectedEndpointId || this.state.selectedPageId) ||
        this.state.selectedCollectionId !== URI.parseQuery(this.props.location.search).collectionId
      ) {
        const selectedGroupId = this.getInitialGroup(Object.keys(collectionInfo.versions)[0], collectionInfo.groups)
        const selectedEndpointId = this.getInitialEndpoint(selectedGroupId, collectionInfo.endpoints)
        this.setState({
          selectedCollectionId: URI.parseQuery(this.props.location.search)
            .collectionId,
          selectedVersionId: Object.keys(collectionInfo.versions)[0],
          selectedGroupId,
          selectedEndpointId
        })
      }
    }
  }

  getInitialGroup (versionId, groups) {
    for (let i = 0; i < Object.keys(groups).length; i++) {
      if (groups[Object.keys(groups)[i]].versionId?.toString() === versionId?.toString()) {
        return Object.keys(groups)[i]
      }
    }
    return ''
  }

  getInitialEndpoint (groupId, endpoints) {
    for (let i = 0; i < Object.keys(endpoints).length; i++) {
      if (endpoints[Object.keys(endpoints)[i]].groupId?.toString() === groupId?.toString() &&
        (endpoints[Object.keys(endpoints)[i]].isPublished === true ||
          endpoints[Object.keys(endpoints)[i]].state === 'Pending'
        )
      ) {
        return Object.keys(endpoints)[i]
      }
    }
    return ''
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

  setSelectedCollection (e) {
    this.props.history.push({
      pathname: '/admin/publish',
      search: `?collectionId=${e.currentTarget.value}`
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
    this.setState({
      selectedVersionId: e.currentTarget.value
    })
  }

  async handleApproveEndpointRequest (endpointId) {
    this.props.approve_endpoint(this.props.endpoints[endpointId])
  }

  async handleRejectEndpointRequest (endpointId) {
    this.props.reject_endpoint(this.props.endpoints[endpointId])
    if (this.state.endpoints[endpointId].isPublished) {
      //
    } else {
      this.setState({
        selectedEndpointId: this.getInitialEndpoint(this.state.groupId, this.state.endpoints)
      })
    }
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
      if (this.props.pages[pageId].groupId === null) {
        const selectedGroupId = this.getInitialGroup(Object.keys(this.state.versions)[0], this.state.groups)
        this.setState({
          selectedGroupId,
          selectedEndpointId: this.getInitialEndpoint(selectedGroupId, this.state.endpoints)
        })
      } else {
        this.setState({
          selectedEndpointId: this.getInitialEndpoint(this.state.groupId, this.state.endpoints)
        })
      }
    }
  }

  displayState (endpoint) {
    if (endpoint.state === 'Pending') {
      return <span class='status-new'> New</span>
    } else if (endpoint.state === 'Draft') {
      return <span class='status-edit'> Edit</span>
    }
  }

  filterEndpoints (groupId) {
    const endpoints = {}
    for (let i = 0; i < Object.keys(this.state.endpoints).length; i++) {
      if ((this.state.endpoints[Object.keys(this.state.endpoints)[i]].isPublished === true ||
        this.state.endpoints[Object.keys(this.state.endpoints)[i]].state === 'Pending') &&
        this.state.endpoints[Object.keys(this.state.endpoints)[i]].groupId === groupId
      ) {
        endpoints[Object.keys(this.state.endpoints)[i]] = this.state.endpoints[Object.keys(this.state.endpoints)[i]]
      }
    }
    return (
      <span>
        {Object.keys(endpoints).map((endpointId) =>
          <div key={endpointId} onClick={() => this.openEndpoint(groupId, endpointId)} className='groups'>
            <span className='tag'>E</span>{endpoints[endpointId]?.name}
            {this.displayState(endpoints[endpointId])}
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
              this.state.pages[Object.keys(this.state.pages)[i]].state === 'Pending'
            ) &&
            this.state.pages[Object.keys(this.state.pages)[i]].groupId === groupId
          ) {
            pages[Object.keys(this.state.pages)[i]] = this.state.pages[Object.keys(this.state.pages)[i]]
          }
        }
        return (
          <div className='groups'>
            {Object.keys(pages).map((pageId) =>
              <div
                key={pageId} onClick={() => this.openPage(groupId, pageId)} className='groups'
              >
                <span className='tag'>P</span>{this.state.pages[pageId]?.name}
                {this.displayState(pages[pageId])}
              </div>
            )}
          </div>
        )
      }
    } else {
      if (this.state.pages) {
        for (let i = 0; i < Object.keys(this.state.pages).length; i++) {
          if ((this.state.pages[Object.keys(this.state.pages)[i]].isPublished === true ||
            this.state.pages[Object.keys(this.state.pages)[i]].state === 'Pending') &&
            this.state.pages[Object.keys(this.state.pages)[i]].groupId === null &&
            this.state.pages[Object.keys(this.state.pages)[i]].versionId === this.state.selectedVersionId
          ) {
            pages[Object.keys(this.state.pages)[i]] = this.state.pages[Object.keys(this.state.pages)[i]]
          }
        }
        if (Object.keys(pages).length === 0) return
        return (
          <div className='groups'>
            {Object.keys(pages).map((pageId) =>
              <div
                key={pageId} onClick={() => this.openPage('', pageId)} className='groups'
              >
                <span className='tag'>P</span>{this.state.pages[pageId]?.name}
                {this.displayState(pages[pageId])}
              </div>
            )}
          </div>
        )
      }
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

  showCollections () {
    if (this.props.collections) {
      return (
        Object.keys(this.props.collections).map(
          (id, index) =>
            <option value={id} key={index}>{this.props.collections[id]?.name}</option>
        )
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
      <div className='groups'>
        {this.state.groups[groupId]?.name}
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
    if (this.state.selectedEndpointId) {
      return (
        <div>
          <div className='contacts'>{this.props.groups[this.state.selectedGroupId]?.name}</div>
          <div className='list-contacts'>
            {this.props.endpoints[this.state.selectedEndpointId]?.name}
          </div>
          {this.endpointPublishAndReject()}
          {this.checkEndpointState()}
        </div>

      )
    }
  }

  checkEndpointState () {
    if (this.state.endpoints[this.state.selectedEndpointId].state === 'Reject') {
      console.log('Reject')
      return (
        <DisplayEndpoint rejected endpointId={this.state.selectedEndpointId} groupId={this.state.selectedGroupId} {...this.props} />
      )
    } else {
      console.log('Not reject')
      return (
        <DisplayEndpoint endpointId={this.state.selectedEndpointId} groupId={this.state.selectedGroupId} {...this.props} />
      )
    }
  }

  endpointPublishAndReject () {
    if (this.state.endpoints[this.state.selectedEndpointId]?.state !== 'Approved' &&
      this.state.endpoints[this.state.selectedEndpointId]?.state !== 'Reject') {
      return (
        <div className='publish-reject'>
          <button class='btn default' onClick={() => this.handleRejectEndpointRequest(this.state.selectedEndpointId)}>Reject</button>
          <div className='publish-button'>  <Button variant='success' onClick={() => this.handleApproveEndpointRequest(this.state.selectedEndpointId)}>PUBLISH</Button>
          </div>
        </div>
      )
    }
  }

  pagePublishAndReject () {
    if (this.state.pages[this.state.selectedPageId]?.state !== 'Approved' &&
      this.state.pages[this.state.selectedPageId]?.state !== 'Reject'
    ) {
      return (
        <div className='publish-reject'>
          <button class='btn default' onClick={() => this.handleRejectPageRequest(this.state.selectedPageId)}>Reject</button>
          <div className='publish-button'>  <Button variant='success' onClick={() => this.handleApprovePageRequest(this.state.selectedPageId)}>PUBLISH</Button>
          </div>
        </div>
      )
    }
  }

  showPages () {
    if (this.state.selectedPageId) {
      return (
        <div>
          <div className='contacts'>{this.props.groups[this.state.selectedGroupId]?.name}</div>
          <div className='list-contacts'>
            {this.props.pages[this.state.selectedPageId]?.name}
          </div>
          {this.pagePublishAndReject()}
          {this.checkPageState()}
        </div>
      )
    }
  }

  checkPageState () {
    if (this.state.pages[this.state.selectedPageId].state === 'Reject') {
      return (
        <DisplayPage rejected pageId={this.state.selectedPageId} groupId={this.state.selectedGroupId} {...this.props} />
      )
    } else {
      return (
        <DisplayPage pageId={this.state.selectedPageId} groupId={this.state.selectedGroupId} {...this.props} />
      )
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
      return <div class='publish-collection-div'>Published</div>
    }
  }

  render () {
    return (
      <div className='publish-docs-container'>
        <div className='publish-docs-wrapper'>
          <div class='content-panel'>
            <div className='hosted-APIs'>
              <div class='title'>
                Hosted API's
              </div>
              <select
                name='selectedCollection'
                onChange={this.setSelectedCollection.bind(this)}
                value={this.state.selectedCollectionId}
              >
                {this.showCollections()}
              </select>
            </div>
            <div className='grid'>
              <PublishDocsForm
                {...this.props}
                selected_collection_id={this.state.selectedCollectionId}
              />
              <div className='publish-button'> <Button variant='success'>PUBLISH ALL</Button>
                <div>
                  {this.publishCollections()}
                </div>
              </div>
            </div>
            <div className='grid-two'>
              <div className='versions-section'>
                <select
                  className='selected-versio form-contorl light-orange-bg' onChange={this.setSelectedVersion.bind(this)}
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
