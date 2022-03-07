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
import SideBar from './sidebar'
import PublishDocs from '../publishDocs/publishDocs'
import { loadWidget } from '../../services/widgetService'
import { fetchAllCookies, fetchAllCookiesFromLocalStorage } from '../cookies/redux/cookiesActions'
import { isDesktop } from 'react-device-detect'
import OnlineSatus from '../onlineStatus/onlineStatus'
import { getOrgUpdatedAt } from '../../services/orgApiService'
import moment from 'moment'
// import Header from './header'
import { loadfeedioWidget } from '../../services/feedioWidgetService'
import { loadHelloWidget } from '../../services/helloWidgetService'
import auth from '../auth/authService'
import DesktopAppDownloadModal from './desktopAppPrompt'
import { sendAmplitudeData } from '../../services/amplitude'
import UpdateStatus from './updateStatus'
import { isValidDomain } from '../common/utility'
import SplitPane from 'react-split-pane'
import PublishDocsReview from '../publishDocs/publishDocsReview'

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_collections_from_idb: (orgId) => dispatch(fetchCollectionsFromIdb(orgId)),
    fetch_all_versions_from_idb: (orgId) => dispatch(fetchAllVersionsFromIdb(orgId)),
    fetch_groups_from_idb: (orgId) => dispatch(fetchGroupsFromIdb(orgId)),
    fetch_endpoints_from_idb: (orgId) => dispatch(fetchEndpointsFromIdb(orgId)),
    fetch_pages_from_idb: (orgId) => dispatch(fetchPagesFromIdb(orgId)),
    fetch_collections: (orgId) => dispatch(fetchCollections(orgId)),
    fetch_all_versions: (orgId) => dispatch(fetchAllVersions(orgId)),
    fetch_groups: (orgId) => dispatch(fetchGroups(orgId)),
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

class Main extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabs: [],
      defaultTabIndex: 0
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
    const token = auth.getJwt()
    if (!token) return
    /** Token Exists */
    if (auth.getCurrentUser() && auth.getOrgList() && auth.getCurrentOrg()) {
      /** For Logged in User */
      let orgId = this.props.match.params.orgId
      if (!orgId) {
        orgId = auth.getOrgList()[0]?.identifier
        this.props.history.push({
          pathname: `/orgs/${orgId}/dashboard`
        })
      } else {
        const orgName = auth.getOrgList()[0]?.name
        if (isValidDomain()) {
          loadWidget()
          loadfeedioWidget()
          loadHelloWidget()
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
    this.props.fetch_collections_from_idb(orgId)
    this.props.fetch_all_versions_from_idb(orgId)
    this.props.fetch_groups_from_idb(orgId)
    this.props.fetch_endpoints_from_idb(orgId)
    this.props.fetch_pages_from_idb(orgId)
  }

  fetchFromBackend (timestampBackend) {
    const orgId = this.props.match.params.orgId
    this.props.fetch_collections(orgId)
    this.props.fetch_all_versions(orgId)
    this.props.fetch_groups(orgId)
    this.props.fetch_endpoints(orgId)
    this.props.fetch_pages(orgId)
    indexedDbService.addData('meta_data', timestampBackend, 'updated_at')
  }

  setTabs (tabs, defaultTabIndex) {
    if (defaultTabIndex >= 0) {
      this.setState({ defaultTabIndex })
    }
    if (tabs) {
      this.setState({ tabs })
    }
  }

  setEnvironment (environment) {
    this.setState({ currentEnvironment: environment })
  }

  render () {
    return (
      <div>{!isDesktop &&
        <div className='mobile-warning'>
          Looks like you have opened it on a mobile device. It looks better on a desktop device.
        </div>}
        <div className='custom-main-container'>
          {/* <Header {...this.props} /> */}
          <DesktopAppDownloadModal history={this.props.history} location={this.props.location} match={this.props.match} />
          <OnlineSatus fetchFromBackend={this.fetchFromBackend.bind(this)} isIdbUpdated={this.isIdbUpdated.bind(this)} />
          <div className='main-panel-wrapper'>
            <SplitPane split='vertical' className='split-sidebar'>
              <SideBar
                {...this.props}
                tabs={[...this.state.tabs]}
                set_tabs={this.setTabs.bind(this)}
                default_tab_index={this.state.defaultTabIndex}
              />
              {this.props.location.pathname.split('/')[4] === 'publish'
                ? <PublishDocs {...this.props} />
                : this.props.location.pathname.split('/')[4] === 'feedback'
                  ? <PublishDocsReview {...this.props} />
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
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(Main)
