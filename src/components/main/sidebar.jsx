import React, { Component } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import moment from 'moment'
import Collections from '../collections/collections'
import CollectionVersions from '../collectionVersions/collectionVersions'
import ProtectedRoute from '../common/protectedRoute'
import { isDashboardRoute, ADD_GROUP_MODAL_NAME, ADD_VERSION_MODAL_NAME } from '../common/utility'
import { getCurrentUser } from '../auth/authService'
import LoginSignupModal from './loginSignupModal'
import PublishColelctionInfo from './publishCollectionInfo'
import { ReactComponent as ArrowIcon } from '../../assets/icons/Vector.svg'
import { ReactComponent as HitmanIcon } from '../../assets/icons/hitman.svg'
import { ReactComponent as EmptyHistory } from '../../assets/icons/emptyHistroy.svg'
import { ReactComponent as NoInvocationsIcon } from '../../assets/icons/emptyrandom.svg'
import { ReactComponent as NoCollectionsIcon } from '../../assets/icons/noCollectionsIcon.svg'
import { ReactComponent as SearchIcon } from '../../assets/icons/searchIcon.svg'
import collectionVersionsService from '../collectionVersions/collectionVersionsService'
import './main.scss'
import './sidebar.scss'
import AddEntitySelectionModal from './addEntityModal'
import GroupForm from '../groups/groupForm'
import PageForm from '../pages/pageForm'
import EndpointForm from '../endpoints/endpointForm'

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
      historySnapshot: null,
      selectedCollectionId: null,
      secondarySidebarToggle: false,
      primarySidebar: null,
      totalEndpointsCount: 0
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
    this.setState({ selectedCollectionId: collectionId, primarySidebar: false, secondarySidebarToggle: false })
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
      <div className='mt-3'>
        {this.state.historySnapshot && this.state.historySnapshot.length > 0
          ? (this.state.historySnapshot.sort(compareByCreatedAt).map((history) => this.renderHistoryItem(history)))
          : (<div class='empty-collections'><div><EmptyHistory /></div><div class='content'><h5>  No History available.</h5><p /></div></div>)}
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

  renderHistoryItem (history) {
    return (
      Object.keys(history).length !== 0 && (
        <div
          key={history.id}
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

  renderTriggerList () {
    return (
      <div className='mt-3'>
        {
          this.state.historySnapshot && this.state.historySnapshot.filter(o => o.endpoint.status === 'NEW').length > 0
            ? (this.state.historySnapshot.filter(o => o.endpoint.status === 'NEW').sort(compareByCreatedAt).map((history) => this.renderHistoryItem(history)))
            : (
              <div class='empty-collections'>
                <div>
                  <NoInvocationsIcon />
                </div>
                <div class='content'>
                  <h5>  No invocation made</h5>
                  {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. 1</p> */}
                </div>
              </div>
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
            <div className='searchResult'>
              {this.state.pages.length > 0 ? this.renderPagesList() : null}
              {this.state.endpoints.length > 0 ? this.renderEndpointsList() : null}
              {this.state.historySnapshot.length > 0 ? <div><div className='px-3'>History</div>{this.renderHistoryList()}</div> : null}
            </div>
            )
          : <div className='text-center'>No Results</div>
      )
    }
  }

  renderEmptyCollectionsIfNotLoggedIn () {
    return (
      <div className='empty-collections'>
        <div>
          <NoCollectionsIcon />
        </div>
        <div className='content'>
          <h5>  Your collection is Empty.</h5>
          {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. 1</p> */}
        </div>
        <Button className='btn-lg mt-2' variant='primary' onClick={() => this.setState({ showLoginSignupModal: true })}>+ Add here</Button>{' '}
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
              selectedCollectionId={this.state.selectedCollectionId}
              empty_filter={this.emptyFilter.bind(this)}
              disable_secondary_sidebar={() => { this.setState({ secondarySidebarToggle: true }) }}
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
              selectedCollectionId={this.state.selectedCollectionId}
              empty_filter={this.emptyFilter.bind(this)}
              disable_secondary_sidebar={() => { this.setState({ secondarySidebarToggle: true }) }}
              collection_selected={this.openCollection.bind(this)}
              filter={this.state.data.filter}
            />
          )}
        />
      </Switch>
    )
  }

  getTotalEndpointsCount (count) {
    this.setState({ totalEndpointsCount: count })
  }

  renderSidebarContent () {
    const selectedCollectionName = this.props.collections[this.collectionId]?.name || ' '
    const isMarketplaceImported = this.props.collections[this.collectionId]?.importedFromMarketPlace
    return (
      <div className='sidebar-content'>
        {this.collectionId
          ? (
              isDashboardRoute(this.props, true) && (
                <div className='mx-3'>
                  <div className='d-flex collection-name my-2'>
                    <div className='d-flex cursor-pointer align-items-center' onClick={() => { this.openCollection(null) }}>
                      <div className='ml-1 mr-2'><ArrowIcon /></div>
                      <div className='hm-sidebar-outer-block heading-collection'>{selectedCollectionName}</div>
                    </div>
                    {(!isMarketplaceImported && this.state.totalEndpointsCount !== 0) && <button className='btn btn-primary' onClick={() => this.openAddEntitySelectionModal()}> ADD </button>}
                  </div>
                  <div>
                    <PublishColelctionInfo
                      {...this.props}
                      collectionId={this.collectionId}
                      getTotalEndpointsCount={this.getTotalEndpointsCount.bind(this)}
                    />
                  </div>
                  <div className='secondary-sidebar sidebar-content-scroll'>
                    <div className='collectionVersionWrp'>
                      <CollectionVersions
                        {...this.props}
                        collection_id={this.state.selectedCollectionId}
                        open_collection={this.openCollection.bind(this)}
                        selectedCollectionId={this.state.selectedCollectionId}
                        addVersion={this.openAddVersionForm.bind(this)}
                      />
                    </div>
                  </div>
                </div>
              )
            )
          : (
              !getCurrentUser()
                ? (this.renderEmptyCollectionsIfNotLoggedIn())
                : (this.renderCollections())
            )}
      </div>
    )
  }

  renderSidebarHeader () {
    return (
      <div className='m-3 d-flex align-items-center'>
        <div><HitmanIcon /></div>
        <div className='w-50 flex-grow-1 mx-3'>
          <div className='HITMAN-TITLE'>HITMAN</div>
        </div>
      </div>
    )
  }

  renderDashboardSidebar () {
    return (
      <>
        {this.renderSidebarHeader()}
        <div className='search-box'>
          <label htmlFor='search'>
            <SearchIcon onClick={() => { !this.state.primarySidebar && this.setState({ primarySidebar: true }) }} />
          </label>
          <input
            value={this.state.data.filter}
            type='text'
            name='filter'
            id='search'
            placeholder='Search'
            onChange={(e) => this.handleOnChange(e)}
          />
        </div>
        {this.state.data.filter !== '' && this.renderSearchList()}
        {this.state.data.filter === '' && this.renderSidebarContent()}
      </>
    )
  }

  getSidebarInteractionClass () {
    return (isDashboardRoute(this.props, true) ? 'sidebar' : 'public-endpoint-sidebar')
  }

  openAddVersionForm (collectionId) {
    this.setState({
      showVersionForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }

  closeVersionForm () {
    this.setState({ showVersionForm: false })
  }

  openAddEntitySelectionModal () {
    this.setState({ openAddEntitySelectionModal: true })
  }

  closeAddEntitySelectionModal () {
    this.setState({ openAddEntitySelectionModal: false })
  }

  showAddEntitySelectionModal () {
    return (
      this.state.openAddEntitySelectionModal &&
        <AddEntitySelectionModal
          {...this.props}
          title='ADD'
          show
          onHide={() => this.closeAddEntitySelectionModal()}
          openAddEntityModal={this.openAddEntityModal.bind(this)}
          collectionId={this.collectionId}
        />
    )
  }

  openAddEntityModal (entity) {
    this.setState({ openAddEntitySelectionModal: false, entity })
  }

  closeAddEntityModal (entity) {
    this.setState({ entity: false })
  }

  showAddEntityModal () {
    if (this.state.entity === 'version') {
      return collectionVersionsService.showVersionForm(
        this.props,
        this.closeAddEntityModal.bind(this),
        this.collectionId,
        ADD_VERSION_MODAL_NAME
      )
    }
    if (this.state.entity === 'group') {
      return (
        <GroupForm
          {...this.props}
          show
          onHide={() => this.closeAddEntityModal()}
          title={ADD_GROUP_MODAL_NAME}
          addEntity
          collectionId={this.collectionId}
        />
      )
    }
    if (this.state.entity === 'endpoint') {
      return (
        <EndpointForm
          {...this.props}
          show
          onHide={() => this.closeAddEntityModal()}
          title='Add new Endpoint'
          addEntity
          collectionId={this.collectionId}
        />
      )
    }
    if (this.state.entity === 'page') {
      return (
        <PageForm
          {...this.props}
          show
          onHide={() => this.closeAddEntityModal()}
          title='Add New Page'
          selectedCollection={this.collectionId}
          addEntity
        />
      )
    }
  }

  render () {
    return (
      <nav className={this.getSidebarInteractionClass()}>
        {this.showAddEntitySelectionModal()}
        {this.showAddEntityModal()}
        {this.state.showLoginSignupModal && (
          <LoginSignupModal
            show
            onHide={() => this.closeLoginSignupModal()}
            title='Add Collection'
          />
        )}
        {this.state.showVersionForm &&
          collectionVersionsService.showVersionForm(
            this.props,
            this.closeVersionForm.bind(this),
            this.state.selectedCollection.id,
            ADD_VERSION_MODAL_NAME
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
      </nav>
    )
  }
}

export default withRouter(connect(mapStateToProps)(SideBar))
