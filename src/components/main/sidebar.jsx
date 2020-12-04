import React, { Component } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Collections from '../collections/collections'
import ProtectedRoute from '../common/protectedRoute'
import { isDashboardRoute } from '../common/utility'
import { getCurrentUser } from '../auth/authService'
import CollectionVersions from '../collectionVersions/collectionVersions'
import endpointApiService from '../endpoints/endpointApiService'
import './main.scss'
import './sidebar.scss'
import { Tabs, Tab, Button } from 'react-bootstrap'
import LoginSignupModal from './loginSignupModal'
import hitmanIcon from '../../assets/icons/hitman.svg'
import collectionIcon from '../../assets/icons/collectionIcon.svg'
import historyIcon from '../../assets/icons/historyIcon.svg'
import randomTriggerIcon from '../../assets/icons/randomTriggerIcon.svg'
import emptyCollections from '../../assets/icons/emptyCollections.svg'
import UserNotification from '../collections/userNotification'
import moment from 'moment'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    endpoints: state.endpoints,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    historySnapshot: state.history,
    filter: ''
  }
}

function compareByCreatedAt (a, b) {
  const t1 = a?.createdAt
  const t2 = b?.createdAt
  let comparison = 0
  if (t1 < t2) {
    comparison = 1
  } else if (t1 > t2) {
    comparison = -1
  }
  return comparison
}

class SideBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: {
        filter: ''
      },
      name: '',
      email: '',
      historySnapshot: null
    }
  }

  componentDidMount () {
    if (getCurrentUser()) {
      const user = getCurrentUser()
      const name = user.first_name + user.last_name
      const email = user.email
      this.setState({ name, email })
    }
    if (this.props.historySnapshot) {
      this.setState({
        historySnapshot: Object.values(this.props.historySnapshot)
      })
    }
    if (this.props.endpoints) {
      this.setState({
        endpoints: Object.values(this.props.endpoints)
      })
    }
    if (this.props.pages) {
      this.setState({
        pages: Object.values(this.props.pages)
      })
    }
    if (this.props.location.collectionId) {
      this.collectionId = this.props.location.collectionId
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.historySnapshot !== prevProps.historySnapshot) {
      this.setState({
        historySnapshot: Object.values(this.props.historySnapshot)
      })
    }
    if (this.props.endpoints !== prevProps.endpoints) {
      this.setState({
        endpoints: Object.values(this.props.endpoints)
      })
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

  async dndMoveEndpoint (endpointId, sourceGroupId, destinationGroupId) {
    const groups = { ...this.state.groups }
    const endpoints = { ...this.state.endpoints }
    const originalEndpoints = { ...this.state.endpoints }
    const originalGroups = { ...this.state.groups }
    const endpoint = endpoints[endpointId]
    endpoint.groupId = destinationGroupId
    endpoints[endpointId] = endpoint
    groups[sourceGroupId].endpointsOrder = groups[
      sourceGroupId
    ].endpointsOrder.filter((gId) => gId !== endpointId.toString())
    groups[destinationGroupId].endpointsOrder.push(endpointId)
    this.setState({ endpoints, groups })
    try {
      delete endpoint.id
      await endpointApiService.updateEndpoint(endpointId, endpoint)
    } catch (error) {
      this.setState({ endpoints: originalEndpoints, groups: originalGroups })
    }
  }

  handleOnChange = (e) => {
    this.setState({ data: { ...this.state.data, filter: e.target.value } })
    let obj = Object.values(this.props.historySnapshot)
    if (this.props.historySnapshot) {
      obj = obj.filter(
        (o) =>
          o.endpoint.name?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          o.endpoint.BASE_URL?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          o.endpoint.uri?.toLowerCase().includes(e.target.value.toLowerCase())
      )
    }
    let obj2 = Object.values(this.props.endpoints)
    if (this.props.endpoints) {
      obj2 = obj2.filter(
        (o) =>
          o.name?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          o.BASE_URL?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          o.uri?.toLowerCase().includes(e.target.value.toLowerCase())
      )
    }
    let obj3 = Object.values(this.props.pages)
    if (this.props.pages) {
      obj3 = obj3.filter(
        (o) => o.name?.toLowerCase().includes(e.target.value.toLowerCase())
      )
    }
    this.setState({ historySnapshot: obj, endpoints: obj2, pages: obj3 })
  };

  emptyFilter () {
    const data = { ...this.state.data }
    data.filter = ''
    this.setState({ data })
  }

  openCollection (collectionId) {
    this.collectionId = collectionId
  }

  openApiForm () {
    this.setState({ showOpenApiForm: true })
  }

  closeOpenApiFormModal () {
    this.setState({ showOpenApiForm: false })
  }

  closeLoginSignupModal () {
    this.setState({
      showLoginSignupModal: false
    })
  }

  openHistorySnapshot (id) {
    this.props.history.push({
      pathname: `/dashboard/history/${id}`,
      historySnapshotId: id
    })
  }

  openEndpoint (id) {
    this.props.history.push({
      pathname: `/dashboard/endpoint/${id}`
    })
  }

  openPage (id) {
    this.props.history.push({
      pathname: `/dashboard/page/${id}`
    })
  }

  renderPath (id, type) {
    let path = ''
    let groupId = null
    let versionId = null
    let collectionId = null
    let endpointId = null
    let pageId = null
    switch (type) {
      case 'endpoint':
        endpointId = id
        groupId = this.props.endpoints[endpointId]?.groupId
        versionId = this.props.groups[groupId]?.versionId
        collectionId = this.props.versions[versionId]?.collectionId
        path = this.props.collections[collectionId]?.name + ' > ' + this.props.versions[versionId]?.number + ' > ' + this.props.groups[groupId]?.name
        break
      case 'page':
        pageId = id
        groupId = this.props.pages[pageId]?.groupId
        versionId = this.props.pages[pageId]?.versionId
        collectionId = this.props.versions[versionId]?.collectionId
        if (groupId) {
          path = this.props.collections[collectionId]?.name + ' > ' + this.props.versions[versionId]?.number + ' > ' + this.props.groups[groupId]?.name
        } else {
          path = this.props.collections[collectionId]?.name + ' > ' + this.props.versions[versionId]?.number
        }
        break
      default: path = ''
        break
    }
    if (path) { return <div style={{ fontSize: '11px' }} className='text-muted'>{path}</div> } else return <p />
  }

  renderHistoryList () {
    return (
      <div className='py-3'>
        {this.state.historySnapshot &&
          this.props.historySnapshot &&
          this.state.historySnapshot.sort(compareByCreatedAt).map(
            (history) =>
              Object.keys(history).length !== 0 && (
                <div
                  className='btn d-flex align-items-center mb-2'
                  onClick={() => { this.openHistorySnapshot(history.id) }}
                >
                  <div className={`api-label lg-label ${history.endpoint.requestType}`}>
                    <div className='endpoint-request-div'>
                      {history.endpoint.requestType}
                    </div>
                  </div>
                  <div className='ml-3'>
                    <div className='sideBarListWrapper'>
                      <div className='text-left'>
                        <p>   {history.endpoint.name ||
                          history.endpoint.BASE_URL + history.endpoint.uri ||
                          'Random Trigger'}
                        </p>
                      </div>
                      <small className='text-muted'>
                        {moment(history.createdAt).format('ddd, Do MMM h:mm a')}
                      </small>
                    </div>
                  </div>
                </div>
              )
          )}
      </div>
    )
  }

  renderEndpointsList () {
    return (
      <div>
        <div className='px-3'>Endpoints</div>
        <div className='py-3'>
          {this.state.endpoints &&
            this.props.endpoints &&
            this.state.endpoints.map(
              (endpoint) =>
                Object.keys(endpoint).length !== 0 && (
                  <div
                    className='btn d-flex align-items-center mb-2'
                    onClick={() => { this.openEndpoint(endpoint.id) }}
                  >
                    <div className={`api-label lg-label ${endpoint.requestType}`}>
                      <div className='endpoint-request-div'>
                        {endpoint.requestType}
                      </div>
                    </div>
                    <div className='ml-3'>
                      <div className='sideBarListWrapper'>
                        <div className='text-left'>
                          <p>   {endpoint.name ||
                            endpoint.BASE_URL + endpoint.uri}
                          </p>
                        </div>
                        {this.renderPath(endpoint.id, 'endpoint')}
                      </div>
                    </div>
                  </div>
                )
            )}
        </div>
      </div>
    )
  }

  renderPagesList () {
    return (
      <div>
        <div className='px-3'>Pages</div>
        <div className='py-3'>
          {this.state.pages &&
            this.props.pages &&
            this.state.pages.map(
              (page) =>
                Object.keys(page).length !== 0 && (
                  <div
                    className='btn d-flex align-items-center mb-2'
                    onClick={() => { this.openPage(page.id) }}
                  >
                    <div>
                      <i className='uil uil-file-alt' aria-hidden='true' />
                    </div>
                    <div className='ml-3'>
                      <div className='sideBarListWrapper'>
                        <div className='text-left'>
                          <p>   {page.name}
                          </p>
                        </div>
                        {this.renderPath(page.id, 'page')}
                      </div>
                    </div>
                  </div>
                )
            )}
        </div>
      </div>
    )
  }

  renderTriggerList () {
    return (
      <div className='mt-3'>
        {
          this.state.historySnapshot &&
          this.props.historySnapshot &&
          this.state.historySnapshot.sort(compareByCreatedAt).map(
            (history) =>
              Object.keys(history).length !== 0 && history.endpoint.status === 'NEW' && (
                <div
                  className='btn d-flex align-items-center mb-2'
                  onClick={() => { this.openHistorySnapshot(history.id) }}
                >
                  <div className={`api-label lg-label ${history.endpoint.requestType}`}>
                    <div className='endpoint-request-div'>
                      {history.endpoint.requestType}
                    </div>
                  </div>
                  <div className='ml-3'>
                    <div className='sideBarListWrapper'>
                      <div className='text-left'>
                        <p>{history.endpoint.name ||
                          history.endpoint.BASE_URL + history.endpoint.uri ||
                          'Random Trigger'}
                        </p>
                      </div>
                      <small className='text-muted'>
                        {moment(history.createdAt).format('ddd, Do MMM h:mm a')}
                      </small>
                    </div>
                  </div>
                </div>
              )
          )
        }
      </div>
    )
  }

  renderSearchList () {
    if (this.state.data.filter !== '') {
      return (
        (this.state.pages.length > 0 || this.state.endpoints.length > 0 || this.state.historySnapshot.length > 0)
          ? (
            <div>
              {this.state.pages.length > 0 ? this.renderPagesList() : null}
              {this.state.endpoints.length > 0 ? this.renderEndpointsList() : null}
              {this.state.historySnapshot.length > 0 ? <div><div className='px-3'>History</div>{this.renderHistoryList()}</div> : null}
            </div>
            )
          : <div className='text-center'>No Results</div>
      )
    }
  }

  findPendingEndpointsCollections (pendingEndpointIds) {
    const groupsArray = []
    for (let i = 0; i < pendingEndpointIds.length; i++) {
      const endpointId = pendingEndpointIds[i]
      if (this.props.endpoints[endpointId]) {
        const groupId = this.props.endpoints[endpointId].groupId
        groupsArray.push(groupId)
      }
    }

    const versionsArray = []
    for (let i = 0; i < groupsArray.length; i++) {
      const groupId = groupsArray[i]
      if (this.props.groups[groupId]) {
        const versionId = this.props.groups[groupId].versionId
        versionsArray.push(versionId)
      }
    }
    const collectionsArray = []
    for (let i = 0; i < versionsArray.length; i++) {
      const versionId = versionsArray[i]
      if (this.props.versions[versionId]) {
        const collectionId = this.props.versions[versionId].collectionId
        collectionsArray.push(collectionId)
      }
    }
    return collectionsArray
  }

  findPendingPagesCollections (pendingPageIds) {
    const versionsArray = []
    for (let i = 0; i < pendingPageIds.length; i++) {
      const pageId = pendingPageIds[i]
      if (this.props.pages[pageId]) {
        const versionId = this.props.pages[pageId].versionId
        versionsArray.push(versionId)
      }
    }
    const collectionsArray = []
    for (let i = 0; i < versionsArray.length; i++) {
      const versionId = versionsArray[i]
      if (this.props.versions[versionId]) {
        const collectionId = this.props.versions[versionId].collectionId
        collectionsArray.push(collectionId)
      }
    }
    return collectionsArray
  }

  getPublicCollections () {
    if (this.dataFetched()) {
      const pendingEndpointIds = Object.keys(this.props.endpoints).filter(
        (eId) => this.props.endpoints[eId].state === 'Pending' || (this.props.endpoints[eId].state === 'Draft' && this.props.endpoints[eId].isPublished)
      )
      const pendingPageIds = Object.keys(this.props.pages).filter(
        (pId) => this.props.pages[pId].state === 'Pending' || (this.props.pages[pId].state === 'Draft' && this.props.pages[pId].isPublished)
      )
      const endpointCollections = this.findPendingEndpointsCollections(
        pendingEndpointIds
      )
      const pageCollections = this.findPendingPagesCollections(pendingPageIds)
      const allCollections = [
        ...new Set([...endpointCollections, ...pageCollections])
      ]
      return allCollections
    }
  }

  getNotificationCount () {
    const collections = this.getPublicCollections()
    return collections?.length || 0
  }

  openPublishDocs (collection) {
    if (collection?.id) {
      this.props.history.push({
        pathname: '/admin/publish',
        search: `?collectionId=${collection.id}`
      })
    } else {
      const collection = this.props.collections[
        Object.keys(this.props.collections)[0]
      ]
      this.props.history.push({
        pathname: '/admin/publish',
        search: `?collectionId=${collection.id}`
      })
    }
  }

  renderEmptyCollectionsIfNotLoggedIn () {
    return (
      <div className='empty-collections'>
        <div>
          <img src={emptyCollections} />
        </div>
        <div className='content'>
          <h5>  Your collection is Empty.</h5>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <Button className='btn-lg' variant='primary' onClick={() => this.setState({ showLoginSignupModal: true })}>+ Add here</Button>{' '}
      </div>
    )
  }

  renderCollections () {
    return (
      <Switch>
        <ProtectedRoute
          path='/dashboard/'
          render={(props) => (
            <Collections
              {...this.props}
              empty_filter={this.emptyFilter.bind(this)}
              collection_selected={this.openCollection.bind(this)}
              filter={this.state.data.filter}
            />
          )}
        />
        <ProtectedRoute
          path='/admin/publish'
          render={(props) => (
            <Collections
              {...this.props}
              empty_filter={this.emptyFilter.bind(this)}
              collection_selected={this.openCollection.bind(this)}
              filter={this.state.data.filter}
            />
          )}
        />
      </Switch>
    )
  }

  renderSidebarTabs () {
    return (
      <Tabs
        defaultActiveKey={
          getCurrentUser() ? 'collection' : 'randomTrigger'
        }
        id='uncontrolled-tab-example'
      >
        <Tab eventKey='collection' title={<span><img src={collectionIcon} /> Collection </span>}>
          {
            !getCurrentUser()
              ? (this.renderEmptyCollectionsIfNotLoggedIn())
              : (this.renderCollections())
          }
        </Tab>
        <Tab eventKey='history' title={<span><img src={historyIcon} /> History</span>}>
          {this.renderHistoryList()}
        </Tab>
        <Tab eventKey='randomTrigger' title={<span> <img src={randomTriggerIcon} /> Random Trigger</span>}>
          {this.renderTriggerList()}
        </Tab>
      </Tabs>
    )
  }

  renderUserNotification () {
    return (
      <div className='fixed'>
        <UserNotification
          {...this.props}
          get_notification_count={this.getNotificationCount.bind(this)}
          get_public_collections={this.getPublicCollections.bind(this)}
          open_publish_docs={this.openPublishDocs.bind(this)}
          open_collection={this.openCollection.bind(this)}
        />
      </div>
    )
  }

  renderDashboardSidebar () {
    return (
      <>
        <div className='app-name'>
          <img className='icon' src={hitmanIcon} />
          HITMAN
        </div>
        <div className='search-box'>
          <i className='fas fa-search' id='search-icon' />
          <input
            value={this.state.data.filter}
            type='text'
            name='filter'
            placeholder='Search'
            onChange={(e) => this.handleOnChange(e)}
          />
        </div>
        {this.state.data.filter !== '' && this.renderSearchList()}
        {this.state.data.filter === '' && this.renderSidebarTabs()}
        {getCurrentUser() && this.renderUserNotification()}
      </>
    )
  }

  render () {
    return (
      <nav
        className={
          isDashboardRoute(this.props, true)
            ? 'sidebar'
            : 'public-endpoint-sidebar'
        }
      >
        {this.state.showLoginSignupModal && (
          <LoginSignupModal
            show
            onHide={() => this.closeLoginSignupModal()}
            title='Add Collection'
          />
        )}
        <div className='primary-sidebar'>
          {
            isDashboardRoute(this.props, true)
              ? (this.renderDashboardSidebar())
              : (
                <Route
                  path='/p/:collectionId'
                  render={(props) => <Collections {...this.props} />}
                />
                )
          }
        </div>
        {this.collectionId && isDashboardRoute(this.props, true) && (
          <div className='secondary-sidebar'>
            <CollectionVersions
              {...this.props}
              collection_id={this.collectionId}
            />
          </div>
        )}
      </nav>
    )
  }
}

export default withRouter(connect(mapStateToProps)(SideBar))
