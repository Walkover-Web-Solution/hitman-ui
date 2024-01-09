import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import { fetchCollections, fetchCollectionsFromIdb } from '../collections/redux/collectionsActions'
import { fetchAllVersions, fetchAllVersionsFromIdb } from '../collectionVersions/redux/collectionVersionsActions'
import {
  fetchEndpoint,
  fetchEndpoints,
  moveEndpoint,
  fetchEndpointsFromIdb
} from '../endpoints/redux/endpointsActions'
import { fetchGroups, fetchGroupsFromIdb } from '../groups/redux/groupsActions'
import indexedDbService from '../indexedDb/indexedDbService'
import { fetchPage, fetchPages, fetchPagesFromIdb } from '../pages/redux/pagesActions'
import { fetchHistoryFromIdb } from '../history/redux/historyAction'
import ContentPanel from './contentPanel'
import './main.scss'
import SideBarV2 from './sideBarV2'
import { loadWidget } from '../../services/widgetService'
import { fetchAllCookies, fetchAllCookiesFromLocalStorage } from '../cookies/redux/cookiesActions'
import { isDesktop } from 'react-device-detect'
import OnlineSatus from '../onlineStatus/onlineStatus'
import { getOrgUpdatedAt } from '../../services/orgApiService'
import moment from 'moment'
// import Header from './header'
import { loadfeedioWidget } from '../../services/feedioWidgetService'
// import { loadHelloWidget } from '../../services/helloWidgetService'
import DesktopAppDownloadModal from './desktopAppPrompt'
import { sendAmplitudeData } from '../../services/amplitude'
import UpdateStatus from './updateStatus'
import { isValidDomain } from '../common/utility'
import CollectionModal from '../collections/collectionsModal'
import SplitPane from 'react-split-pane'
import NoCollectionIcon from '../../assets/icons/collection.svg'
import { getCurrentUser, getCurrentOrg, getOrgList, getProxyToken } from '../auth/authServiceV2'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    endpoints: state.endpoints
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    // fetch_collections_from_idb: (orgId) => dispatch(fetchCollectionsFromIdb(orgId)),
    // fetch_all_versions_from_idb: (orgId) => dispatch(fetchAllVersionsFromIdb(orgId)),
    fetch_groups_from_idb: (orgId) => dispatch(fetchGroupsFromIdb(orgId)),
    fetch_endpoints_from_idb: (orgId) => dispatch(fetchEndpointsFromIdb(orgId)),
    fetch_pages_from_idb: (orgId) => dispatch(fetchPagesFromIdb(orgId)),
    fetch_collections: (orgId) => dispatch(fetchCollections(orgId)),
    // fetch_all_versions: (orgId) => dispatch(fetchAllVersions(orgId)),
    // fetch_groups: (orgId) => dispatch(fetchGroups(orgId)),
    fetch_endpoints: (orgId) => dispatch(fetchEndpoints(orgId)),
    fetch_pages: (orgId) => dispatch(fetchPages(orgId)),
    fetch_history: () => dispatch(fetchHistoryFromIdb()),
    move_endpoint: (endpointId, sourceGroupId, destinationGroupId) =>
      dispatch(moveEndpoint(endpointId, sourceGroupId, destinationGroupId)),
    fetch_all_cookies: () => dispatch(fetchAllCookies()),
    fetch_all_cookies_from_local: () => dispatch(fetchAllCookiesFromLocalStorage()),
    fetch_endpoint: (endpointId) => dispatch(fetchEndpoint(endpointId)),
    fetch_page: (pageId) => dispatch(fetchPage(pageId))
  }
}

class MainV2 extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabs: [],
      defaultTabIndex: 0,
      showAddCollectionModal: false,
      loading: true,
      showAddCollectionPage: true
    }
    const { endpointId, pageId } = this.props.match.params
    if (endpointId && endpointId !== 'new') {
      this.props.fetch_endpoint(endpointId)
    }
    if (pageId) {
      this.props.fetch_page(pageId)
    }
  }

  async componentDidMount () {

    const token = getProxyToken()
    if (!token) {
      this.setState({ loading: false })
      return
    }
    /** Token Exists */
    if (getCurrentUser() && getOrgList() && getCurrentOrg()) {
      /** For Logged in User */
      let orgId = this.props.match.params.orgId
      if (!orgId) {
        orgId = getOrgList()[0]?.id
        this.props.history.push({
          pathname: `/orgs/${orgId}/dashboard`
        })
      } else {
        const orgName = getOrgList()[0]?.name
        if (isValidDomain()) {
          loadWidget()
          loadfeedioWidget()
          // loadHelloWidget() commenting to hide helloWidget
        }
        sendAmplitudeData('Dashboard Landing', {
          orgId: orgId,
          orgName: orgName
        })
        await this.fetchAll()
      }
    } else {
      /** Perform Login Procedure for Token */
      this.props.history.push({
        pathname: '/login'
      })
    }
    this.setState({ loading: false })
  }

  async fetchAll () {
    indexedDbService.getDataBase()
    if (!navigator.onLine) {
      this.fetchFromIdb()
      this.props.fetch_all_cookies_from_local()
    } else {
      const { fetchFromIdb, timestampBackend } = await this.isIdbUpdated()
      if (fetchFromIdb) {
        this.fetchFromIdb()
      } else {
        this.fetchFromBackend(timestampBackend)
      }
      this.props.fetch_all_cookies()
    }
    this.props.fetch_history()
  }

  async isIdbUpdated () {
    const orgId = this.props.match.params.orgId
    let timestampBackend, timestampIdb
    try {
      timestampBackend = await getOrgUpdatedAt(orgId)
      timestampBackend = timestampBackend.data?.updatedAt
      timestampIdb = await indexedDbService.getValue('meta_data', 'updated_at')
    } catch (err) {}
    let fetchFromIdb
    if ((timestampIdb && moment(timestampIdb).isValid() && moment(timestampIdb).diff(moment(timestampBackend)) >= 0)) {
      fetchFromIdb = true
    } else {
      fetchFromIdb = false
    }
    return { fetchFromIdb, timestampBackend }
  }

  fetchFromIdb () {
    const orgId = this.props.match.params.orgId
    // this.props.fetch_collections_from_idb(orgId)
    this.props.fetch_all_versions_from_idb(orgId)
    this.props.fetch_groups_from_idb(orgId)
    this.props.fetch_endpoints_from_idb(orgId)
    this.props.fetch_pages_from_idb(orgId)
  }

  fetchFromBackend (timestampBackend) {
    const orgId = this.props.match.params.orgId
    this.props.fetch_collections(orgId)
    // this.props.fetch_all_versions(orgId)
    // this.props.fetch_groups(orgId)
    this.props.fetch_endpoints(orgId)
    this.props.fetch_pages(orgId)
    indexedDbService.addData('meta_data', timestampBackend, 'updated_at')
  }

  setVisitedOrgs () {
    const orgId = this.props.match.params.orgId
    const org = {}
    org[orgId] = true
    window.localStorage.setItem('visitedOrgs', JSON.stringify(org))
  }

  showCollectionDashboard () {
    if (!getCurrentUser()) {
      return false
    }
    const collectionLength = Object.keys(this.props.collections).length
    const orgId = this.props.match.params.orgId
    const temp = JSON.parse(window.localStorage.getItem('visitedOrgs'))
    if ((temp && temp[orgId]) || collectionLength > 0 || !this.state.showAddCollectionPage) { return false } else { return true }
  }

  setTabs (tabs, defaultTabIndex) {
    if (defaultTabIndex >= 0) this.setState({ defaultTabIndex })
    
    if (tabs) this.setState({ tabs })
  }

  setEnvironment (environment) {
    this.setState({ currentEnvironment: environment })
  }

  addCollectionDialog () {
    return (
      this.state.showAddCollectionModal &&
        <CollectionModal
          title='Add Collection'
          onHide={() => { this.setState({ showAddCollectionModal: false }) }}
          show={this.state.showAddCollectionModal}
        />
    )
  }

  renderLandingDashboard () {
    return (
      <>
        {this.addCollectionDialog()}
        <div className='no-collection h-100 d-flex flex-d-col justify-content-center align-items-center flex-wrap'>
          <img src={NoCollectionIcon} alt='' />
          <p className='mb-4'>Add your first collection for API testing and Public API Doc</p>
          <button onClick={() => this.setState({ showAddCollectionModal: true })} className='btn btn-primary'>+ Add collection</button>
          <p className='mt-3'>Or</p>
          <div className='text-link' onClick={() => { this.setVisitedOrgs(); this.setState({ showAddCollectionPage: false }) }}>Try Out Without a Collection</div>
        </div>
      </>
    )
  }

  render () {
    return (
      <>
        {this.state.loading
          ? (
            <div className='custom-loading-container'>
              <div className='loading-content'>
                <button className='spinner-border' />
                <p className='mt-3'>Loading</p>
              </div>
            </div>
            )
          : (
            <div>
              {!isDesktop &&
                <div className='mobile-warning'>
                  Looks like you have opened it on a mobile device. It looks better on a desktop device.
                </div>}
              {
                <div className='custom-main-container'>
                  {/* <Header {...this.props} /> */}
                  <DesktopAppDownloadModal history={this.props.history} location={this.props.location} match={this.props.match} />
                  <OnlineSatus fetchFromBackend={this.fetchFromBackend.bind(this)} isIdbUpdated={this.isIdbUpdated.bind(this)} />
                  <div className='main-panel-wrapper'>
                    <SplitPane split='vertical' className='split-sidebar'>
                      <SideBarV2
                        {...this.props}
                        tabs={[...this.state.tabs]}
                        set_tabs={this.setTabs.bind(this)}
                        default_tab_index={this.state.defaultTabIndex}
                      />
                      {this.showCollectionDashboard()
                        ? this.renderLandingDashboard()
                        : <ContentPanel
                            {...this.props}
                            set_environment={this.setEnvironment.bind(this)}
                            set_tabs={this.setTabs.bind(this)}
                            default_tab_index={this.state.defaultTabIndex}
                          />}
                    </SplitPane>
                  </div>
                  <UpdateStatus />
                  
                </div>
            }
            </div>)}

      </>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(MainV2)
