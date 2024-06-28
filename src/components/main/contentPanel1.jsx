import React, { useEffect, useState } from 'react'
import { Tab, Nav, Dropdown } from 'react-bootstrap'
import { connect } from 'react-redux'
import 'react-tabs/style/react-tabs.css'

import History from '../history/history.jsx'
import { ReactComponent as HistoryIcon } from '../../assets/icons/historyIcon.svg'
import {
  addNewTab,
  closeTab,
  fetchTabsFromRedux,
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
import { getCurrentUser } from '../auth/authServiceV2'
import LoginSignupModal from './loginSignupModal'
import Environments from '../environments/environments'
import { IoCodeSlashOutline } from 'react-icons/io5'
import { updateStateOfCurlSlider } from '../modals/redux/modalsActions.js'
import IconButton from '../common/iconButton.jsx'

const mapStateToProps = (state) => ({
  endpoints: state.pages,
  collections: state.collections,
  groups: state.groups,
  versions: state.versions,
  pages: state.pages,
  tabs: state.tabs,
  historySnapshots: state.history,
  curlSlider: state.modals?.curlSlider || false
})

const mapDispatchToProps = (dispatch) => ({
  add_new_tab: () => dispatch(addNewTab()),
  close_tab: (tabId) => dispatch(closeTab(tabId)),
  open_in_new_tab: (tab) => dispatch(openInNewTab(tab)),
  update_tab: (tab) => dispatch(updateTab(tab)),
  set_active_tab_id: (tabId) => dispatch(setActiveTabId(tabId)),
  set_tabs_order: (tabsOrder) => dispatch(setTabsOrder(tabsOrder)),
  fetch_tabs_from_redux: (tabsOrder) => dispatch(fetchTabsFromRedux(tabsOrder)),
  replace_tab: (oldTabId, newTab) => dispatch(replaceTab(oldTabId, newTab)),
  update_curl_slider: (payload) => dispatch(updateStateOfCurlSlider(payload))
})

function ContentPanel1(props) {
  const [showLoginSignupModal, setShowLoginSignupModal] = useState(false)
  const [saveEndpointFlag, setSaveEndpointFlag] = useState(false)
  const [savePageFlag, setSavePageFlag] = useState(false)
  const [selectedTabId, setSelectedTabId] = useState(null)

  useEffect(() => {
    props.fetch_tabs_from_redux({ ...props })
  }, [])

  useEffect(() => {
    const { endpointId, pageId, historyId, collectionId } = props.match.params
    if (props.tabs.loaded) {
      handleTabActivation(endpointId, 'endpoint')
      handleTabActivation(pageId, 'page')
      handleTabActivation(historyId, 'history')
      handleTabActivation(collectionId, 'collection')
    }
  }, [props.tabs.loaded, props.match.params])

  const handleTabActivation = (id, type) => {
    if (id && props.tabs.tabs[id]) {
      if (props.tabs.activeTabId !== id) {
        props.set_active_tab_id(id)
      }
    } else {
      let data = props[type + 's'] && props[type + 's'][id]
      if (data) {
        props.open_in_new_tab({
          id,
          type,
          status: tabStatusTypes.SAVED,
          previewMode: false,
          isModified: false,
          state: {}
        })
      }
    }
  }

  return (
    <main role='main' className='main'>
      {showLoginSignupModal && <LoginSignupModal show onHide={() => setShowLoginSignupModal(false)} title='Save Endpoint' />}
      <Tab.Container id='left-tabs-example' defaultActiveKey={props.tabs.activeTabId} activeKey={props.tabs.activeTabId}>
        {getCurrentUser() ? (
          <>
            <div className='content-header'>
              <div className='tabs-container d-flex justify-content-between'>
                <CustomTabs {...props} handle_save_endpoint={setSaveEndpointFlag} handle_save_page={setSavePageFlag} />
                <Environments {...props} />
                {props.match.params.endpointId && (
                  <div
                    className='d-flex justify-content-center align-items-center code-curl-icon'
                    onClick={() => props.update_curl_slider(!props.curlSlider)}
                  >
                    <IconButton>
                      <IoCodeSlashOutline
                        type='button'
                        data-bs-toggle='offcanvas'
                        data-bs-target='#offcanvasRight'
                        aria-controls='offcanvasRight'
                        size={18}
                      />
                    </IconButton>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
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
                <button className='btn' onClick={() => setShowLoginSignupModal(true)}>
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
                      <History {...props} />
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          </div>
        )}
        <div className='main-content'>
          <TabContent
            {...props}
            handle_save_endpoint={setSaveEndpointFlag}
            handle_save_page={setSavePageFlag}
            save_endpoint_flag={saveEndpointFlag}
            save_page_flag={savePageFlag}
            selected_tab_id={selectedTabId}
          />
        </div>
      </Tab.Container>
    </main>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPanel1)
