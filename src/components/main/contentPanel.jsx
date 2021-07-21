import React, { Component } from 'react'
import { Tab, Nav, Dropdown } from 'react-bootstrap'

import { connect } from 'react-redux'
import 'react-tabs/style/react-tabs.css'
import Environments from '../environments/environments'
import History from '../history/history.jsx'
import { ReactComponent as HistoryIcon } from '../../assets/icons/historyIcon.svg'
import {
  addNewTab,
  closeTab,
  fetchTabsFromIdb,
  openInNewTab,
  replaceTab,
  setActiveTabId,
  setTabsOrder,
  updateTab
} from '../tabs/redux/tabsActions'
import TabContent from '../tabs/tabContent'
import CustomTabs from '../tabs/tabs'
import tabStatusTypes from '../tabs/tabStatusTypes'
import './main.scss'
import { getCurrentUser } from '../auth/authService'
import LoginSignupModal from './loginSignupModal'
import Footer from '../main/Footer'
import UserInfo from './userInfo'
import { isElectron, openExternalLink } from '../common/utility'
import socketLogo from '../../assets/icons/socketIcon.svg'
import cloudImage from '../../assets/icons/cloud.svg'
import feedio from '../../assets/icons/feedio.svg'

const mapStateToProps = (state) => {
  return {
    endpoints: state.endpoints,
    groups: state.groups,
    pages: state.pages,
    tabs: state.tabs,
    historySnapshots: state.history
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    add_new_tab: () => dispatch(addNewTab()),
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab)),
    update_tab: (tab) => dispatch(updateTab(tab)),
    set_active_tab_id: (tabId) => dispatch(setActiveTabId(tabId)),
    set_tabs_order: (tabsOrder) => dispatch(setTabsOrder(tabsOrder)),
    fetch_tabs_from_idb: (tabsOrder) => dispatch(fetchTabsFromIdb(tabsOrder)),
    replace_tab: (oldTabId, newTab) => dispatch(replaceTab(oldTabId, newTab))
  }
}

class ContentPanel extends Component {
  constructor (props) {
    super(props)
    this.state = { saveEndpointFlag: false }
  }

  async componentDidMount () {
    this.props.fetch_tabs_from_idb({ ...this.props })
    // this.props.history.push({
    //   dashboardEnvironment: true,
    // });
  }

  openLink () {
    const url = `${process.env.REACT_APP_UI_URL}/browser-login`
    window.require('electron').shell.openExternal(url)
  }

  handleSaveEndpoint (flag, tabId) {
    this.setState({ saveEndpointFlag: flag, selectedTabId: tabId })
  }

  openLoginSignupModal () {
    this.setState({ showLoginSignupModal: true })
  }

  closeLoginSignupModal () {
    this.setState({ showLoginSignupModal: false })
  }

  render () {
    if (
      this.props.location.pathname.split('/')[4] === 'endpoint' &&
      this.props.location.pathname.split('/')[5] !== 'new'
    ) {
      const endpointId = this.props.location.pathname.split('/')[5]

      if (this.props.tabs.tabs[endpointId]) {
        if (this.props.tabs.activeTabId !== endpointId) {
          this.props.set_active_tab_id(endpointId)
        }
      } else {
        if (
          this.props.endpoints &&
          this.props.endpoints[endpointId] &&
          this.props.endpoints[endpointId].requestId
        ) {
          const requestId = this.props.endpoints[endpointId].requestId
          this.props.replace_tab(requestId, {
            id: endpointId,
            type: 'endpoint',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false
          })
        } else {
          this.props.open_in_new_tab({
            id: endpointId,
            type: 'endpoint',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false
          })
        }
      }
    }

    if (this.props.location.pathname.split('/')[4] === 'page') {
      const pageId = this.props.location.pathname.split('/')[5]
      if (this.props.tabs.tabs[pageId]) {
        if (this.props.tabs.activeTabId !== pageId) { this.props.set_active_tab_id(pageId) }
      } else {
        this.props.open_in_new_tab({
          id: pageId,
          type: 'page',
          status: tabStatusTypes.SAVED,
          previewMode: false,
          isModified: false
        })
      }
    }

    if (this.props.location.pathname.split('/')[4] === 'history') {
      const historyId = this.props.location.pathname.split('/')[5]
      if (this.props.tabs.tabs[historyId]) {
        if (this.props.tabs.activeTabId !== historyId) { this.props.set_active_tab_id(historyId) }
      } else {
        this.props.open_in_new_tab({
          id: historyId,
          type: 'history',
          status: tabStatusTypes.SAVED,
          previewMode: false,
          isModified: false
        })
      }
    }

    const redirectionUrl = process.env.REACT_APP_UI_URL + '/login'
    return (
      <main role='main' className='main'>
        {this.state.showLoginSignupModal && (
          <LoginSignupModal
            show
            onHide={() => this.closeLoginSignupModal()}
            title='Save Endpoint'
          />
        )}
        <div className='login-sso'>
          {
            !getCurrentUser()
              ? (
                <div className='row align-items-center'>
                  <div className='float-right d-flex communti-btn-wrapper community-btn-1' onClick={() => openExternalLink(process.env.REACT_APP_COMMUNITY_URL)}>
                    <a>Community</a>
                  </div>
                  {isElectron()
                    ? <div className='float-right d-flex btn btn-primary' onClick={() => { this.openLink() }}>Login/SignUp</div>
                    : <div
                        id='sokt-sso'
                        data-redirect-uri={redirectionUrl}
                        data-source='hitman'
                        data-token-key='sokt-auth-token'
                        data-view='button'
                        data-app-logo-url='https://hitman.app/wp-content/uploads/2020/12/123.png'
                        signup_uri={redirectionUrl + '?signup=true'}
                      />}
                </div>
                )
              : null
          }
        </div>
        {/* <main role="main" className="main ml-sm-auto custom-main"> */}
        <Tab.Container
          id='left-tabs-example'
          defaultActiveKey={
            this.props.tabs.length &&
            this.props.tabs[this.props.default_tab_index].id
          }
          activeKey={this.props.tabs.activeTabId}
        >
          {
            getCurrentUser()
              ? (
                <>
                  <div className='env-wrapper header d-flex justify-space-between '>
                    <div className='logo d-flex align-items-center'>
                      <img src={socketLogo} alt='' width='30' height='30' />
                      <span>Hitman</span>
                    </div>
                    <div className='float-right d-flex align-items-center'>
                      <Environments {...this.props} />
                      <div className='mx-3'>
                        <img src={cloudImage} alt='' />
                      </div>
                      <div className='float-right d-flex communti-btn-wrapper' onClick={() => openExternalLink(process.env.REACT_APP_COMMUNITY_URL)}>
                        <a>
                          <svg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M3.24999 12.4584C3.24627 13.8882 3.58034 15.2987 4.22499 16.575C4.98936 18.1044 6.16443 19.3908 7.61859 20.2901C9.07275 21.1894 10.7486 21.666 12.4583 21.6667C13.8882 21.6704 15.2987 21.3364 16.575 20.6917L22.75 22.75L20.6917 16.575C21.3363 15.2987 21.6704 13.8882 21.6667 12.4584C21.666 10.7486 21.1893 9.07279 20.2901 7.61863C19.3908 6.16447 18.1044 4.9894 16.575 4.22503C15.2987 3.58037 13.8882 3.2463 12.4583 3.25003H11.9167C9.65862 3.37461 7.52587 4.32769 5.92676 5.92679C4.32765 7.5259 3.37457 9.65865 3.24999 11.9167V12.4584Z' stroke='#D6D6D6' stroke-linecap='round' stroke-linejoin='round' /><path d='M3.24999 12.4584C3.24627 13.8882 3.58034 15.2987 4.22499 16.575C4.98936 18.1044 6.16443 19.3908 7.61859 20.2901C9.07275 21.1894 10.7486 21.666 12.4583 21.6667C13.8882 21.6704 15.2987 21.3364 16.575 20.6917L22.75 22.75L20.6917 16.575C21.3363 15.2987 21.6704 13.8882 21.6667 12.4584C21.666 10.7486 21.1893 9.07279 20.2901 7.61863C19.3908 6.16447 18.1044 4.9894 16.575 4.22503C15.2987 3.58037 13.8882 3.2463 12.4583 3.25003H11.9167C9.65862 3.37461 7.52587 4.32769 5.92676 5.92679C4.32765 7.5259 3.37457 9.65865 3.24999 11.9167V12.4584Z' stroke='#D6D6D6' stroke-linecap='round' stroke-linejoin='round' />
                            <g clip-path='url(#clip0)'>
                              <path d='M9.47916 15.4377V14.6102C9.47916 14.1712 9.6361 13.7502 9.91545 13.4398C10.1948 13.1295 10.5737 12.9551 10.9687 12.9551H13.9479C14.343 12.9551 14.7219 13.1295 15.0012 13.4398C15.2806 13.7502 15.4375 14.1712 15.4375 14.6102V15.4377' stroke='#D6D6D6' stroke-linecap='round' stroke-linejoin='round' /><path d='M12.4577 11.4655C11.635 11.4655 10.9681 10.7986 10.9681 9.97591C10.9681 9.15324 11.635 8.48633 12.4577 8.48633C13.2804 8.48633 13.9473 9.15324 13.9473 9.97591C13.9473 10.7986 13.2804 11.4655 12.4577 11.4655Z' stroke='#D6D6D6' stroke-linecap='round' stroke-linejoin='round' /><path d='M6.99522 15.4377V14.5918C6.99544 14.217 7.09309 13.8529 7.27283 13.5566C7.45257 13.2604 7.70422 13.0488 7.98828 12.9551' stroke='#D6D6D6' stroke-linecap='round' stroke-linejoin='round' /><path d='M17.9188 15.4377V14.5918C17.9186 14.217 17.821 13.8529 17.6412 13.5566C17.4615 13.2604 17.2098 13.0488 16.9258 12.9551' stroke='#D6D6D6' stroke-linecap='round' stroke-linejoin='round' /><path d='M9.97461 8.48633C9.5485 8.57101 9.17083 8.76337 8.90113 9.03308C8.63142 9.30278 8.48503 9.63449 8.48503 9.97591C8.48503 10.3173 8.63142 10.649 8.90113 10.9187C9.17083 11.1884 9.5485 11.3808 9.97461 11.4655' stroke='#D6D6D6' stroke-linecap='round' stroke-linejoin='round' /><path d='M14.9414 8.48633C15.3675 8.57101 15.7452 8.76337 16.0149 9.03308C16.2846 9.30278 16.431 9.63449 16.431 9.97591C16.431 10.3173 16.2846 10.649 16.0149 10.9187C15.7452 11.1884 15.3675 11.3808 14.9414 11.4655' stroke='#D6D6D6' stroke-linecap='round' stroke-linejoin='round' />
                            </g>
                            <defs>
                              <clipPath id='clip0'>
                                <rect width='11.9167' height='11.9167' fill='white' transform='matrix(-1 0 0 1 18.416 6.5)' />
                              </clipPath>
                            </defs>
                          </svg>
                        </a>
                      </div>
                      <div className='switchPrd'>
                        <Dropdown>
                          <Dropdown.Toggle variant='success' id='dropdown-basic'>
                            <svg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='0.5' y='0.500977' width='6.64705' height='6.64705' rx='0.5' stroke='#D6D6D6' /><rect x='9.67578' y='0.5' width='6.64705' height='6.64705' rx='0.5' stroke='#D6D6D6' /><rect x='9.67578' y='9.67676' width='6.64705' height='6.64705' rx='0.5' stroke='#D6D6D6' /><rect x='18.8516' y='9.67676' width='6.64705' height='6.64705' rx='0.5' stroke='#D6D6D6' /><rect x='18.8516' y='18.8535' width='6.64705' height='6.64705' rx='0.5' stroke='#D6D6D6' /><rect x='9.67578' y='18.8535' width='6.64705' height='6.64705' rx='0.5' stroke='#D6D6D6' /><rect x='0.5' y='18.8535' width='6.64705' height='6.64705' rx='0.5' stroke='#D6D6D6' /><rect x='0.5' y='9.67676' width='6.64705' height='6.64705' rx='0.5' stroke='#D6D6D6' /><rect x='18.8516' y='0.5' width='6.64705' height='6.64705' rx='3.32352' stroke='#D6D6D6' /></svg>
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item href='#' className='dropHeader'>
                              Switch Products
                            </Dropdown.Item>
                            <Dropdown.Item href='#'>
                              <img src={feedio} alt='' />
                              Feedio
                            </Dropdown.Item>
                            <Dropdown.Item href='#'>
                              <img src={feedio} alt='' />
                              EBL
                            </Dropdown.Item>
                            <Dropdown.Item href=''>
                              <img src={feedio} alt='' />
                              SheetasDB
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                      <div className='ml-3'>
                        <UserInfo {...this.props} />
                      </div>
                    </div>
                  </div>
                  <div className='content-header'>
                    <div className='tabs-container d-flex'>
                      <CustomTabs
                        {...this.props}
                        handle_save_endpoint={this.handleSaveEndpoint.bind(this)}
                      />
                    </div>
                  </div>
                </>
                )
              : (
                // rendered a static single tab mimicking the original, instead of tabs component if user is not signed
                <div className='content-header'>
                  <div className='tabs-container tabs-width d-flex dashboard-wrp w-auto'>
                    <Nav variant='pills' className=''>
                      <Nav.Item className='px-0'>
                        <Nav.Link className='active'>
                          <button className='btn font-weight-bold'>Untitled</button>
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>

                  <div className='custom-btn-group d-flex'>
                    <button
                      className='btn'
                      onClick={() => { this.openLoginSignupModal() }}
                    >

                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M9 3V15' stroke='#808080' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M3 9H15' stroke='#808080' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                      </svg>
                    </button>
                    <div className='btn-divider' />
                    <Dropdown>
                      <Dropdown.Toggle
                        bsPrefix='dropdown'
                        variant='default'
                        id='dropdown-basic'
                      >
                        <HistoryIcon />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className='history-drop-down'>
                        <History {...this.props} />
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
                )
          }
          <div className='main-content'>
            <TabContent
              {...this.props}
              handle_save_endpoint={this.handleSaveEndpoint.bind(this)}
              save_endpoint_flag={this.state.saveEndpointFlag}
              selected_tab_id={this.state.selectedTabId}
            />
          </div>
        </Tab.Container>
        <div className='adminfooter'>
          <Footer />
        </div>
      </main>

    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPanel)
