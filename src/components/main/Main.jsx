import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import { fetchCollections } from '../collections/redux/collectionsActions'
import { fetchAllVersions } from '../collectionVersions/redux/collectionVersionsActions'
import {
  fetchEndpoints,
  moveEndpoint
} from '../endpoints/redux/endpointsActions'
import { fetchGroups } from '../groups/redux/groupsActions'
import indexedDbService from '../indexedDb/indexedDbService'
import { fetchPages } from '../pages/redux/pagesActions'
import { fetchHistoryFromIdb } from '../history/redux/historyAction'
import ContentPanel from './contentPanel'
import './main.scss'
import SideBar from './sidebar'
import { getCurrentUser } from '../auth/authService'
import PublishDocs from '../publishDocs/publishDocs'
import { loadWidget } from '../../services/widgetService'
import { fetchAllCookies } from '../cookies/redux/cookiesActions'
import { isDesktop } from 'react-device-detect'
import { willFetch } from '../indexedDb/helpers'
import OnlineSatus from '../onlineStatus/onlineStatus'

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_collections: (orgId) => dispatch(fetchCollections(orgId)),
    fetch_all_versions: (orgId) => dispatch(fetchAllVersions(orgId)),
    fetch_groups: (orgId) => dispatch(fetchGroups(orgId)),
    fetch_endpoints: (orgId) => dispatch(fetchEndpoints(orgId)),
    fetch_pages: (orgId) => dispatch(fetchPages(orgId)),
    fetch_history: () => dispatch(fetchHistoryFromIdb()),
    move_endpoint: (endpointId, sourceGroupId, destinationGroupId) =>
      dispatch(moveEndpoint(endpointId, sourceGroupId, destinationGroupId)),
    fetch_all_cookies: () => dispatch(fetchAllCookies())
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
    if (getCurrentUser()) {
      loadWidget()
      this.fetchAll()
    }
    // await indexedDbService.createDataBase()
  }

  fetchAll () {
    const orgId = this.props.match.params.orgId
    indexedDbService.getDataBase()
    console.log('WILL_FETCH', willFetch('2021-07-01'))
    this.props.fetch_collections(orgId)
    this.props.fetch_all_versions(orgId)
    this.props.fetch_groups(orgId)
    this.props.fetch_endpoints(orgId)
    this.props.fetch_pages(orgId)
    this.props.fetch_history()
    this.props.fetch_all_cookies()
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
          <OnlineSatus />
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
