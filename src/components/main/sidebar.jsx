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
import UserNotification from '../collections/userNotification'
import moment from 'moment'
import emptyHistory from '../../assets/icons/emptyHistroy.svg'
import emptyrandom from '../../assets/icons/emptyrandom.svg'

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
      primarySidebar: null
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
          : (<div class='empty-collections'><div><img src={emptyHistory} alt='' /></div><div class='content'><h5>  No History available.</h5><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div></div>)}
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
                  <img src={emptyrandom} />
                </div>
                <div class='content'>
                  <h5>  No invocation made</h5>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
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
          <svg width='138' height='134' viewBox='0 0 138 134' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path opacity='0.12' fill-rule='evenodd' clip-rule='evenodd' d='M94.8781 34.8829C106.111 43.6454 122.407 48.5835 124.47 62.7188C126.651 77.6721 116.385 91.6133 104.529 101.033C93.5821 109.729 79.4589 111.232 65.6436 109.452C51.0118 107.567 35.8753 103.496 27.8141 91.1478C19.1234 77.8355 18.7414 60.8859 24.1279 45.8586C29.8741 29.8283 40.1101 12.6124 56.8989 10.0079C72.6718 7.56103 82.3242 25.0898 94.8781 34.8829Z' fill='#E98A36' />
            <path d='M8.09912 58.2139V63.8933' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M10.9385 61.0537L5.25905 61.0537' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M106.069 19.8779V25.5574' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M108.909 22.7178L103.229 22.7178' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M108.84 110V115.679' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M111.679 112.84L106 112.84' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M73.0787 47L94 56.377L66.9913 64L46 53.746L73.0787 47Z' fill='#E0CFB5' />
            <path d='M73 47V75.7628L93.8595 84L94 56.385L73 47Z' fill='#CFB594' />
            <path d='M73.0787 47L94 56.377L67.0612 64L46 53.746L73.0787 47Z' fill='url(#paint0_linear)' />
            <path d='M73 47V75.7628L94 84V56.385L73 47Z' fill='url(#paint1_linear)' />
            <path d='M94 84.5174L67 94V63.8789L94 56V84.5174Z' fill='url(#paint2_linear)' />
            <path d='M46 54V81.3973L67 94V64.411L46 54Z' fill='url(#paint3_linear)' />
            <path d='M46.4818 54L73 47.0769L67.9293 45L41 51.7154L46.4818 54Z' fill='url(#paint4_linear)' />
            <path d='M93.542 57L73 47.3228L79.2519 46L100 55.6772L93.542 57Z' fill='url(#paint5_linear)' />
            <path d='M67 64.2131V65L63.7907 73L46 64.2131V61L67 64.2131Z' fill='#C7874E' />
            <path d='M67 63.9396V64.745L70.5065 73L94 65.7517V63L67 63.9396Z' fill='#C7874E' />
            <path d='M67 63.913L46.108 54L40 58.5652L60.6838 69L67 63.913Z' fill='url(#paint6_linear)' />
            <path d='M93.6912 56L67 63.91L72.8235 70L100 61.25L93.6912 56Z' fill='url(#paint7_linear)' />
            <defs>
              <linearGradient id='paint0_linear' x1='47.5' y1='49.5' x2='82' y2='71.5' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#FFCC9E' />
                <stop offset='0.0001' stop-color='#F7B275' />
                <stop offset='1' stop-color='#FEDAB7' />
              </linearGradient>
              <linearGradient id='paint1_linear' x1='73' y1='47' x2='125.452' y2='66.1773' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#FFC693' />
                <stop offset='0.0001' stop-color='#FFB471' />
                <stop offset='1' stop-color='#FFE296' />
              </linearGradient>
              <linearGradient id='paint2_linear' x1='58' y1='64.5' x2='96.4721' y2='71.5948' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#FFCDA1' />
                <stop offset='0.0001' stop-color='#F2994A' />
                <stop offset='1' stop-color='#FFDDBD' />
              </linearGradient>
              <linearGradient id='paint3_linear' x1='39.5' y1='82' x2='52.2895' y2='60.6768' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#F6AD6B' />
                <stop offset='0.0001' stop-color='#F2994A' />
                <stop offset='1' stop-color='#FED9B6' />
              </linearGradient>
              <linearGradient id='paint4_linear' x1='67' y1='54' x2='65.2723' y2='44.6714' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#F7B275' />
                <stop offset='0.0001' stop-color='#FFBD82' />
                <stop offset='1' stop-color='#FED9B6' />
              </linearGradient>
              <linearGradient id='paint5_linear' x1='81.5' y1='45' x2='84.5362' y2='60.1077' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#F7B275' />
                <stop offset='0.0001' stop-color='#F2994A' />
                <stop offset='1' stop-color='#FFDAB9' />
              </linearGradient>
              <linearGradient id='paint6_linear' x1='40.675' y1='54.375' x2='53.0925' y2='76.7264' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#F7B375' />
                <stop offset='0.0001' stop-color='#F2994A' />
                <stop offset='1' stop-color='#FFDBB9' />
              </linearGradient>
              <linearGradient id='paint7_linear' x1='67.825' y1='56.35' x2='71.5987' y2='68.1471' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#F4A660' />
                <stop offset='0.0001' stop-color='#F2994A' />
                <stop offset='1' stop-color='#FEDAB8' />
              </linearGradient>
            </defs>
          </svg>

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

  renderSidebarTabs () {
    return (
      <Tabs
        defaultActiveKey={
          getCurrentUser() ? 'collection' : 'randomTrigger'
        }
        id='uncontrolled-tab-example'
        onSelect={() => { !this.state.primarySidebar && this.setState({ selectedCollectionId: null, primarySidebar: true }) }}
      >
        <Tab
          eventKey='collection'
          title={
            <span>
              <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M15.75 11.9999V5.99993C15.7497 5.73688 15.6803 5.47853 15.5487 5.2508C15.417 5.02306 15.2278 4.83395 15 4.70243L9.75 1.70243C9.52197 1.57077 9.2633 1.50146 9 1.50146C8.7367 1.50146 8.47803 1.57077 8.25 1.70243L3 4.70243C2.7722 4.83395 2.58299 5.02306 2.45135 5.2508C2.31971 5.47853 2.25027 5.73688 2.25 5.99993V11.9999C2.25027 12.263 2.31971 12.5213 2.45135 12.7491C2.58299 12.9768 2.7722 13.1659 3 13.2974L8.25 16.2974C8.47803 16.4291 8.7367 16.4984 9 16.4984C9.2633 16.4984 9.52197 16.4291 9.75 16.2974L15 13.2974C15.2278 13.1659 15.417 12.9768 15.5487 12.7491C15.6803 12.5213 15.7497 12.263 15.75 11.9999Z' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M2.45239 5.22021L8.99989 9.00772L15.5474 5.22021' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M9 16.56V9' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              </svg> <span className='tabs-Text'> Collection</span>
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
              <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M9 4.5V9L12 10.5' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              </svg> <span className='tabs-Text'> History</span>
            </span>
          }
        >
          {this.renderHistoryList()}
        </Tab>
        <Tab
          eventKey='randomTrigger'
          title={
            <span>
              <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M12 2.25H15.75V6' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M3 15L15.75 2.25' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M15.75 12V15.75H12' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M11.25 11.25L15.75 15.75' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                <path d='M3 3L6.75 6.75' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              </svg>
              <span className='tabs-Text'> Random Trigger</span>
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

  getSidebarInteractionClass () {
    // let classes = this.state.sidebarStateClasses
    return (
      this.collectionId && 'enable-sidebar'
    )
  }

  render () {
    return (
      <nav
        className={
          isDashboardRoute(this.props, true)
            ? this.state.primarySidebar ? 'sidebar enable-primary-sidebar' : this.state.selectedCollectionId ? this.state.secondarySidebarToggle ? 'sidebar enable-secondary-sidebar secondary-collapse' : 'sidebar enable-secondary-sidebar' : 'sidebar'
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
            <p className='hm-sidebar-outer-block'>{this.props.collections[this.state.selectedCollectionId]?.name || ''}</p>
            <button className='btn close' onClick={() => { this.setState({ secondarySidebarToggle: !this.state.secondarySidebarToggle }) }}><svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9 3.75V14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /><path d='M3.75 9H14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /></svg></button>
            <CollectionVersions
              {...this.props}
              collection_id={this.state.selectedCollectionId}
              open_collection={this.openCollection.bind(this)}
              selectedCollectionId={this.state.selectedCollectionId}
            />
          </div>
        )}
      </nav>
    )
  }
}

export default withRouter(connect(mapStateToProps)(SideBar))
