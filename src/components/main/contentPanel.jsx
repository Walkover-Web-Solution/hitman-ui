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
      this.props.location.pathname.split('/')[2] === 'endpoint' &&
      this.props.location.pathname.split('/')[3] !== 'new'
    ) {
      const endpointId = this.props.location.pathname.split('/')[3]

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

    if (this.props.location.pathname.split('/')[2] === 'page') {
      const pageId = this.props.location.pathname.split('/')[3]
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

    if (this.props.location.pathname.split('/')[2] === 'history') {
      const historyId = this.props.location.pathname.split('/')[3]
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
                  <div className='float-right d-flex communti-btn-wrapper community-btn-1'>
                    <a href='http://forum.viasocket.com/' rel='noreferrer' target='_blank'>Community </a>
                  </div>
                  <div
                    id='sokt-sso'
                    data-redirect-uri={redirectionUrl}
                    data-source='sokt-app'
                    data-token-key='sokt-auth-token'
                    data-view='button'
                    data-app-logo-url='https://hitman.app/wp-content/uploads/2020/12/123.png'
                    signup_uri={redirectionUrl + '?signup=true'}
                  />
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
                  <div className='env-wrapper'>
                    <div className='float-right d-flex'>
                      <div className='float-right d-flex communti-btn-wrapper'>
                        <a href='http://forum.viasocket.com/' rel='noreferrer' target='_blank'>Community </a>
                      </div>
                      <Environments {...this.props} />
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
                  <div className='tabs-container tabs-width d-flex'>
                    <Nav variant='pills' className=''>
                      <Nav.Item>
                        <Nav.Link className='active'>
                          <button className='btn font-weight-bold'>Untitled</button>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item className='tab-buttons newTabs' id='add-new-tab-button'>
                        <button
                          className='btn'
                          id = 'add_environment_btn'
                          onClick={() => { this.openLoginSignupModal() }}
                        >
                          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path d='M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z' stroke='#BDBDBD' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                            <path d='M12 8V16' stroke='#BDBDBD' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                            <path d='M8 12H16' stroke='#BDBDBD' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                          </svg>
                        </button>
                      </Nav.Item>
                    </Nav>
                  </div>
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
