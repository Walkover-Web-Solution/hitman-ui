import React, { Component } from 'react'
import { Tab, Nav, Dropdown } from 'react-bootstrap'

import { connect } from 'react-redux'
import 'react-tabs/style/react-tabs.css'

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
    const { endpointId, pageId, historyId } = this.props.match.params
    if (endpointId && endpointId !== 'new') {
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
        }
      }
    }

    if (pageId) {
      if (this.props.tabs.tabs[pageId]) {
        if (this.props.tabs.activeTabId !== pageId) { this.props.set_active_tab_id(pageId) }
      } else {
        if (this.props.pages && this.props.pages[pageId]) {
          this.props.open_in_new_tab({
            id: pageId,
            type: 'page',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false
          })
        }
      }
    }

    if (historyId) {
      if (this.props.tabs.tabs[historyId]) {
        if (this.props.tabs.activeTabId !== historyId) { this.props.set_active_tab_id(historyId) }
      } else if (this.props.historySnapshots && this.props.historySnapshots[historyId]) {
        this.props.open_in_new_tab({
          id: historyId,
          type: 'history',
          status: tabStatusTypes.SAVED,
          previewMode: false,
          isModified: false
        })
      }
    }

    if (this.props.match.path === '/orgs/:orgId/dashboard/') {
      if (this.props.tabs?.tabsOrder?.length) {
        const tabId = this.props.tabs.activeTabId || this.props.tabs.tabsOrder[0]
        const tab = this.props.tabs.tabs[tabId]
        this.props.set_active_tab_id(tabId)
        this.props.history.push({
          pathname: `dashboard/${tab.type}/${tab.status === 'NEW' ? 'new' : tabId}`
        })
      }
    }

    return (
      <main role='main' className='main'>
        {this.state.showLoginSignupModal && (
          <LoginSignupModal
            show
            onHide={() => this.closeLoginSignupModal()}
            title='Save Endpoint'
          />
        )}
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
