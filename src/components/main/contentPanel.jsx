import React, { Component } from "react"
import { Tab, Nav, Dropdown } from "react-bootstrap"

import { connect } from "react-redux"
import "react-tabs/style/react-tabs.css"

import History from "../history/history.jsx"
import { ReactComponent as HistoryIcon } from "../../assets/icons/historyIcon.svg"
import { addNewTab, closeTab, fetchTabsFromRedux, openInNewTab, replaceTab, setActiveTabId, setTabsOrder, updateTab } from "../tabs/redux/tabsActions"
import TabContent from "../tabs/tabContent"
import CustomTabs from "../tabs/tabs"
import tabStatusTypes from "../tabs/tabStatusTypes"
import "./main.scss"
import { getCurrentUser } from "../auth/authServiceV2"
import LoginSignupModal from "./loginSignupModal"
import Environments from "../environments/environments"
import { IoCodeSlashOutline } from "react-icons/io5"
import { updateStateOfCurlSlider } from "../modals/redux/modalsActions.js"
import IconButton from "../common/iconButton.jsx"

const mapStateToProps = (state) => {
  return {
    endpoints: state.pages,
    collections: state.collections,
    groups: state.groups,
    versions: state.versions,
    pages: state.pages,
    tabs: state.tabs,
    historySnapshots: state.history,
    curlSlider: state.modals?.curlSlider || false,
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
    fetch_tabs_from_redux: (tabsOrder) => dispatch(fetchTabsFromRedux(tabsOrder)),
    replace_tab: (oldTabId, newTab) => dispatch(replaceTab(oldTabId, newTab)),
    update_curl_slider: (payload) => dispatch(updateStateOfCurlSlider(payload)),
  }
}

class ContentPanel extends Component {
  constructor(props) {
    super(props)
    this.state = { saveEndpointFlag: false, savePageFlag: false }
  }

  async componentDidMount() {
    this.props.fetch_tabs_from_redux({ ...this.props })
  }

  componentDidUpdate() {
    const { endpointId, pageId, historyId, collectionId } = this.props.match.params
    if (this.props.tabs.loaded && endpointId && endpointId !== "new") {
      if (this.props.tabs.tabs[endpointId]) {
        if (this.props.tabs.activeTabId !== endpointId) {
          this.props.set_active_tab_id(endpointId)
        }
      } else {
        if (this.props.endpoints && this.props.endpoints[endpointId]) {
          this.props.open_in_new_tab({
            id: endpointId,
            type: "endpoint",
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: {},
          })
        }
      }
    }

    if (this.props.tabs.loaded && pageId) {
      if (this.props.tabs.tabs[pageId]) {
        if (this.props.tabs.activeTabId !== pageId) {
          this.props.set_active_tab_id(pageId)
        }
      } else {
        if (this.props.pages && this.props.pages[pageId]) {
          this.props.open_in_new_tab({
            id: pageId,
            type: "page",
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: {},
          })
        }
      }
    }

    if (this.props.tabs.loaded && historyId) {
      if (this.props.tabs.tabs[historyId]) {
        if (this.props.tabs.activeTabId !== historyId) {
          this.props.set_active_tab_id(historyId)
        }
      } else if (this.props.historySnapshots && this.props.historySnapshots[historyId]) {
        this.props.open_in_new_tab({
          id: historyId,
          type: "history",
          status: tabStatusTypes.SAVED,
          previewMode: false,
          isModified: false,
          state: {},
        })
      }
    }

    if (this.props.tabs.loaded && collectionId) {
      if (this.props.tabs.tabs[collectionId]) {
        if (this.props.tabs.activeTabId !== collectionId) {
          this.props.set_active_tab_id(collectionId)
        }
      } else if (this.props.collections && this.props.collections[collectionId]) {
        let pageType
        if (this.props.location.pathname.split("/")[6] === "settings") {
          pageType = "SETTINGS"
        } else {
          pageType = "FEEDBACK"
        }
        this.props.open_in_new_tab({
          id: collectionId,
          type: "collection",
          status: tabStatusTypes.SAVED,
          previewMode: false,
          isModified: false,
          state: { pageType },
        })
      }
    }

    if (this.props.tabs.loaded && this.props.match.path === "/orgs/:orgId/dashboard/") {
      const { orgId } = this.props.match.params
      if (this.props.tabs?.tabsOrder?.length) {
        const { tabs, activeTabId, tabsOrder } = this.props.tabs

        let tabId = activeTabId
        if (!tabs[tabId]) tabId = tabsOrder[0]

        const tab = tabs[tabId]
        if (tabId !== activeTabId) this.props.set_active_tab_id(tabId)

        const collectionLength = Object.keys(this.props.collections).length
        if (collectionLength > 0) {
          this.props.history.push({
            pathname: tab.type !== "collection" ? `/orgs/${orgId}/dashboard/${tab.type}/${tab.status === "NEW" ? "new" : tabId}${tab.isModified ? "/edit" : ""}` : `/orgs/${orgId}/dashboard/collection/${tabId}/settings`,
          })
        }
      } else {
        this.props.add_new_tab()
      }
    }
  }

  handleSaveEndpoint(flag, tabId) {
    this.setState({ saveEndpointFlag: flag, selectedTabId: tabId })
  }

  handleSavePage(flag, tabId) {
    this.setState({ savePageFlag: flag, selectedTabId: tabId })
  }

  openLoginSignupModal() {
    this.setState({ showLoginSignupModal: true })
  }

  closeLoginSignupModal() {
    this.setState({ showLoginSignupModal: false })
  }

  handleCodeCurlClick() {
    this.props.update_curl_slider(!this.props.curlSlider)
  }

  render() {
    const { activeTabId } = this.props.tabs
    return (
      <main role='main' className='main'>
        {this.state.showLoginSignupModal && <LoginSignupModal show onHide={() => this.closeLoginSignupModal()} title='Save Endpoint' />}
        {/* <main role="main" className="main ml-sm-auto custom-main"> */}
        <Tab.Container id='left-tabs-example' defaultActiveKey={activeTabId} activeKey={activeTabId}>
          {getCurrentUser() ? (
            <>
              <div className='content-header'>
                <div className='tabs-container d-flex justify-content-between'>
                  <CustomTabs {...this.props} handle_save_endpoint={this.handleSaveEndpoint.bind(this)} handle_save_page={this.handleSavePage.bind(this)} />
                  <Environments {...this.props} />
                  {this.props.match.params.endpointId && (
                    <div className='d-flex justify-content-center align-items-center code-curl-icon' onClick={() => this.handleCodeCurlClick()}>
                      <IconButton>
                        <IoCodeSlashOutline type='button' data-bs-toggle='offcanvas' data-bs-target='#offcanvasRight' aria-controls='offcanvasRight' size={18} />
                      </IconButton>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // rendered a static single tab mimicking the original, instead of tabs component if user is not signed
            <div className='content-header'>
              <div className='tabs-container tabs-width d-flex dashboard-wrp'>
                <Nav variant='pills' className=''>
                  <Nav.Item className='px-0'>
                    <Nav.Link className='active'>
                      <button className='btn font-weight-bold'>Untitled</button>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <div className='custom-btn-group d-flex'>
                  <button
                    className='btn'
                    onClick={() => {
                      this.openLoginSignupModal()
                    }}
                  >
                    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M9 3V15' stroke='#808080' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M3 9H15' stroke='#808080' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  </button>
                  <div className='btn-divider' />
                  {getCurrentUser() && (
                    <Dropdown>
                      <Dropdown.Toggle bsPrefix='dropdown' variant='default' id='dropdown-basic'>
                        <HistoryIcon />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className='history-drop-down'>
                        <History {...this.props} />
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className='main-content'>
            <TabContent {...this.props} handle_save_endpoint={this.handleSaveEndpoint.bind(this)} handle_save_page={this.handleSavePage.bind(this)} save_endpoint_flag={this.state.saveEndpointFlag} save_page_flag={this.state.savePageFlag} selected_tab_id={this.state.selectedTabId} />
          </div>
        </Tab.Container>
      </main>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPanel)
