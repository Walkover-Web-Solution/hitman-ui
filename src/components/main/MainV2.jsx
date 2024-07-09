import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import ContentPanel from './contentPanel'
import './main.scss'
import SideBarV2 from './sideBarV2'
import { fetchAllCookies, fetchAllCookiesFromLocalStorage } from '../cookies/redux/cookiesActions'
import { isDesktop } from 'react-device-detect'
import OnlineSatus from '../onlineStatus/onlineStatus'
import DesktopAppDownloadModal from './desktopAppPrompt'
import UpdateStatus from './updateStatus'
import CollectionModal from '../collections/collectionsModal'
import NoCollectionIcon from '../../assets/icons/collection.svg'
import { getCurrentUser, getUserData, getCurrentOrg, getOrgList, getProxyToken } from '../auth/authServiceV2'
import { addCollectionAndPages } from '../redux/generalActions'
import SplitPane from '../splitPane/splitPane'
import { addUserData } from '../auth/redux/usersRedux/userAction'
import withRouter from '../common/withRouter'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    endpoints: state.endpoints
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_all_cookies: () => dispatch(fetchAllCookies()),
    fetch_all_cookies_from_local: () => dispatch(fetchAllCookiesFromLocalStorage()),
    add_collection_and_pages: (orgId) => dispatch(addCollectionAndPages(orgId)),
    add_user: (userData) => dispatch(addUserData(userData))
  }
}

class MainV2 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tabs: [],
      defaultTabIndex: 0,
      showAddCollectionModal: false,
      loading: true,
      showAddCollectionPage: true
    }
  }

  async componentDidMount() {
    const scriptId = 'chatbot-main-script'
    const chatbot_token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI1OTgyIiwiY2hhdGJvdF9pZCI6IjY2NTQ3OWE4YmQ1MDQxYWU5M2ZjZDNjNSIsInVzZXJfaWQiOiIxMjQifQ.aI4h6OmkVvQP5dyiSNdtKpA4Z1TVNdlKjAe5D8XCrew'
    const scriptSrc = 'https://chatbot-embed.viasocket.com/chatbot-prod.js'
    if (chatbot_token && !document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.setAttribute('embedToken', chatbot_token)
      script.id = scriptId
      document.head.appendChild(script)
      script.src = scriptSrc
    }
    const token = getProxyToken()
    if (!token) {
      this.setState({ loading: false })
      return
    }

    let users = await getUserData(token)
    if (users) this.props.add_user(users)

    /** Token Exists */
    if (getCurrentUser() && getOrgList() && getCurrentOrg()) {
      /** For Logged in User */
      let orgId = this.props.params.orgId
      if (!orgId) {
        orgId = getOrgList()[0]?.id
        this.props.navigate(`/orgs/${orgId}/dashboard`)
      } else {
        await this.fetchAll()
        this.props.add_collection_and_pages(orgId)
      }
    } else {
      /** Perform Login Procedure for Token */
      this.props.navigate('/login')
    }
    this.setState({ loading: false })
  }

  async fetchAll() {
    this.props.fetch_all_cookies()
  }

  setVisitedOrgs() {
    const orgId = this.props.params.orgId
    const org = {}
    org[orgId] = true
    window.localStorage.setItem('visitedOrgs', JSON.stringify(org))
  }

  showCollectionDashboard() {
    if (!getCurrentUser()) {
      return false
    }
    const collectionLength = Object.keys(this.props.collections).length
    const orgId = this.props.params.orgId
    const temp = JSON.parse(window.localStorage.getItem('visitedOrgs'))
    if ((temp && temp[orgId]) || collectionLength > 0 || !this.state.showAddCollectionPage) {
      return false
    } else {
      return true
    }
  }

  setTabs(tabs, defaultTabIndex) {
    if (defaultTabIndex >= 0) this.setState({ defaultTabIndex })

    if (tabs) this.setState({ tabs })
  }

  setEnvironment(environment) {
    this.setState({ currentEnvironment: environment })
  }

  addCollectionDialog() {
    return (
      this.state.showAddCollectionModal && (
        <CollectionModal
          title='Add Collection'
          onHide={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          show={this.state.showAddCollectionModal}
        />
      )
    )
  }

  renderLandingDashboard() {
    return (
      <>
        {this.addCollectionDialog()}
        <div className='no-collection h-100 d-flex flex-d-col justify-content-center align-items-center flex-wrap'>
          <img src={NoCollectionIcon} alt='' />
          <p className='mb-4'>Add your first collection for API testing and Public API Doc</p>
          <button onClick={() => this.setState({ showAddCollectionModal: true })} className='btn btn-primary'>
            + Add collection
          </button>
          <p className='mt-3'>Or</p>
          <div
            className='text-link'
            onClick={() => {
              this.setVisitedOrgs()
              this.setState({ showAddCollectionPage: false })
            }}
          >
            Try Out Without a Collection
          </div>
        </div>
      </>
    )
  }

  render() {
    return (
      <>
        {this.state.loading ? (
          <div className='custom-loading-container'>
            <div className='loading-content'>
              <button className='spinner-border' />
              <p className='mt-3'>Loading</p>
            </div>
          </div>
        ) : (
          <div>
            {!isDesktop && (
              <div className='mobile-warning'>Looks like you have opened it on a mobile device. It looks better on a desktop device.</div>
            )}
            {
              <div className='custom-main-container'>
                {/* <Header {...this.props} /> */}
                <DesktopAppDownloadModal />
                <OnlineSatus />
                <div className='main-panel-wrapper'>
                  <SplitPane split='vertical' className='split-sidebar'>
                    <SideBarV2
                      tabs={[...this.state.tabs]}
                      set_tabs={this.setTabs.bind(this)}
                      default_tab_index={this.state.defaultTabIndex}
                    />
                    {this.showCollectionDashboard() ? (
                      this.renderLandingDashboard()
                    ) : (
                      <ContentPanel
                        {...this.props}
                        set_environment={this.setEnvironment.bind(this)}
                        set_tabs={this.setTabs.bind(this)}
                        default_tab_index={this.state.defaultTabIndex}
                      />
                    )}
                  </SplitPane>
                </div>
                <UpdateStatus />
              </div>
            }
          </div>
        )}
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MainV2))
