import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import { fetchCollections, fetchCollectionsFromIdb } from '../collections/redux/collectionsActions'
import { fetchAllVersions, fetchAllVersionsFromIdb } from '../collectionVersions/redux/collectionVersionsActions'
import {
  fetchEndpoints,
  moveEndpoint,
  fetchEndpointsFromIdb
} from '../endpoints/redux/endpointsActions'
import { fetchGroups, fetchGroupsFromIdb } from '../groups/redux/groupsActions'
import indexedDbService from '../indexedDb/indexedDbService'
import { fetchPages, fetchPagesFromIdb } from '../pages/redux/pagesActions'
import { fetchHistoryFromIdb } from '../history/redux/historyAction'
import ContentPanel from './contentPanel'
import './main.scss'
import SideBar from './sidebar'
import { getCurrentUser, login } from '../auth/authService'
import PublishDocs from '../publishDocs/publishDocs'
import { loadWidget } from '../../services/widgetService'
import { fetchAllCookies, fetchAllCookiesFromLocalStorage } from '../cookies/redux/cookiesActions'
import { isDesktop } from 'react-device-detect'
import OnlineSatus from '../onlineStatus/onlineStatus'
import { getOrgUpdatedAt } from '../../services/orgApiService'
import moment from 'moment'
import Cookies from 'universal-cookie'
import Header from './header'
import { loadfeedioWidget } from '../../services/feedioWidgetService'

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
    fetch_all_cookies_from_local: () => dispatch(fetchAllCookiesFromLocalStorage())
  }
}

class Main extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabs: [],
      defaultTabIndex: 0
    }
  }

  async componentDidMount () {
    const token = this.getTokenFromCookie()
    if (getCurrentUser()) {
      loadWidget()
      loadfeedioWidget()
      await this.fetchAll()
    } else if (token) {
      login(token).then(() => this.fetchAll())
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

  getTokenFromCookie () {
    const cookies = new Cookies()
    return cookies.get('token')
  }

  render () {
    return (
      <div>{!isDesktop &&
        <div className='mobile-warning'>
          Looks like you have opened it on a mobile device. It looks better on a desktop device.
        </div>}
        <div className='custom-main-container'>
          <Header {...this.props} />
          <OnlineSatus fetchFromBackend={this.fetchFromBackend.bind(this)} isIdbUpdated={this.isIdbUpdated.bind(this)} />
          <div className='main-panel-wrapper'>
            <SideBar
              {...this.props}
              tabs={[...this.state.tabs]}
              set_tabs={this.setTabs.bind(this)}
              default_tab_index={this.state.defaultTabIndex}
            />
            {this.props.location.pathname.split('/')[4] === 'publish'
              ? <PublishDocs {...this.props} />
              : <ContentPanel
                  {...this.props}
                  set_environment={this.setEnvironment.bind(this)}
                  set_tabs={this.setTabs.bind(this)}
                  default_tab_index={this.state.defaultTabIndex}
                />}
          </div>
        </div>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(Main)
