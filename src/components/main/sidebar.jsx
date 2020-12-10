import React, { Component } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Collections from '../collections/collections'
import ProtectedRoute from '../common/protectedRoute'
import { isDashboardRoute } from '../common/utility'
import { getCurrentUser } from '../auth/authService'
import CollectionVersions from '../collectionVersions/collectionVersions'
// import endpointApiService from '../endpoints/endpointApiService'
import './main.scss'
import './sidebar.scss'
import { Tabs, Tab, Button } from 'react-bootstrap'
import LoginSignupModal from './loginSignupModal'
import hitmanIcon from '../../assets/icons/hitman.svg'
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

  // async dndMoveEndpoint (endpointId, sourceGroupId, destinationGroupId) {
  //   const groups = { ...this.state.groups }
  //   const endpoints = { ...this.state.endpoints }
  //   const originalEndpoints = { ...this.state.endpoints }
  //   const originalGroups = { ...this.state.groups }
  //   const endpoint = endpoints[endpointId]
  //   endpoint.groupId = destinationGroupId
  //   endpoints[endpointId] = endpoint
  //   groups[sourceGroupId].endpointsOrder = groups[
  //     sourceGroupId
  //   ].endpointsOrder.filter((gId) => gId !== endpointId.toString())
  //   groups[destinationGroupId].endpointsOrder.push(endpointId)
  //   this.setState({ endpoints, groups })
  //   try {
  //     delete endpoint.id
  //     await endpointApiService.updateEndpoint(endpointId, endpoint)
  //   } catch (error) {
  //     this.setState({ endpoints: originalEndpoints, groups: originalGroups })
  //   }
  // }

  handleOnChange = (e) => {
    this.setState({ data: { ...this.state.data, filter: e.target.value } })
    let obj = Object.values(this.props.historySnapshot)
    if (this.props.historySnapshot) {
      obj = obj.filter(
        (o) =>
          o.endpoint.name?.includes(e.target.value) ||
          o.endpoint.BASE_URL?.includes(e.target.value) ||
          o.endpoint.uri?.includes(e.target.value)
      )
    }
    this.setState({ historySnapshot: obj })
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

  renderHistoryList () {
    return (
      <div className='mt-3'>
        {this.state.historySnapshot &&
          this.props.historySnapshot &&
          this.state.historySnapshot.sort(compareByCreatedAt).map(
            (history) =>
              Object.keys(history).length !== 0 && (
                <div
                  key={history.id}
                  className='btn d-flex align-items-center mb-2'
                  onClick={() => { this.openHistorySnapshot(history.id) }}
                >
                  {/* <div className={`api-label lg-label ${history.endpoint.requestType}`}>
                    <div className='endpoint-request-div'>
                      {history.endpoint.requestType}
                    </div>
                  </div> */}
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
                  key={history.id}
                  className='btn d-flex align-items-center mb-2'
                  onClick={() => { this.openHistorySnapshot(history.id) }}
                >
                  {/* <div className={`api-label lg-label ${history.endpoint.requestType}`}>
                    <div className='endpoint-request-div'>
                      {history.endpoint.requestType}
                    </div>
                  </div> */}
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
        <div>
          {getCurrentUser() &&
            <div>
              Collection
              <Collections
                {...this.props}
                empty_filter={this.emptyFilter.bind(this)}
                collection_selected={this.openCollection.bind(this)}
                filter={this.state.data.filter}
              />
            </div>}
          <div>
            History
            {this.state.historySnapshot.length > 0 ? this.renderHistoryList() : <div style={{ marginLeft: '10px' }}>No history found!</div>}
          </div>
        </div>
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
              selectedCollectionId={this.collectionId}
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
              selectedCollectionId={this.collectionId}
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
        <Tab
          eventKey='collection'
          title={
            <span>
              <svg width='16' height='16' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M15.75 11.9999V5.99993C15.7497 5.73688 15.6803 5.47853 15.5487 5.2508C15.417 5.02306 15.2278 4.83395 15 4.70243L9.75 1.70243C9.52197 1.57077 9.2633 1.50146 9 1.50146C8.7367 1.50146 8.47803 1.57077 8.25 1.70243L3 4.70243C2.7722 4.83395 2.58299 5.02306 2.45135 5.2508C2.31971 5.47853 2.25027 5.73688 2.25 5.99993V11.9999C2.25027 12.263 2.31971 12.5213 2.45135 12.7491C2.58299 12.9768 2.7722 13.1659 3 13.2974L8.25 16.2974C8.47803 16.4291 8.7367 16.4984 9 16.4984C9.2633 16.4984 9.52197 16.4291 9.75 16.2974L15 13.2974C15.2278 13.1659 15.417 12.9768 15.5487 12.7491C15.6803 12.5213 15.7497 12.263 15.75 11.9999Z' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M2.45239 5.22021L8.99989 9.00772L15.5474 5.22021' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M9 16.56V9' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              </svg> Collection
            </span>
          }
        >
          {
            !getCurrentUser()
              ? (this.renderEmptyCollectionsIfNotLoggedIn())
              : (this.renderCollections())
          }
        </Tab>
        <Tab
          eventKey='history'
          title={
            <span>
              <svg width='16' height='16' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M9 4.5V9L12 10.5' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              </svg> History
            </span>
          }
        >
          {this.renderHistoryList()}
        </Tab>
        <Tab
          eventKey='randomTrigger'
          title={
            <span>
              <svg width='16' height='16' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M12 2.25H15.75V6' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M3 15L15.75 2.25' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M15.75 12V15.75H12' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M11.25 11.25L15.75 15.75' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M3 3L6.75 6.75' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              </svg> Random Trigger
            </span>
          }
        >
          {this.renderTriggerList()}
        </Tab>
      </Tabs>
    )
  }

  renderUserNotification () {
    return (
      <div className='userInfowrapper'>
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
          <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z' stroke='#828282' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M15.75 15.7498L12.4875 12.4873' stroke='#828282' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' />
          </svg>

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
