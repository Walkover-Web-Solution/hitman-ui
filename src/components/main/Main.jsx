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

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_collections: () => dispatch(fetchCollections()),
    fetch_all_versions: () => dispatch(fetchAllVersions()),
    fetch_groups: () => dispatch(fetchGroups()),
    fetch_endpoints: () => dispatch(fetchEndpoints()),
    fetch_pages: () => dispatch(fetchPages()),
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
    await indexedDbService.createDataBase()
  }

  fetchAll () {
    this.props.fetch_collections()
    this.props.fetch_all_versions()
    this.props.fetch_groups()
    this.props.fetch_endpoints()
    this.props.fetch_pages()
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
