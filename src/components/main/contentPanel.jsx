import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Tab, Nav, Dropdown } from 'react-bootstrap'

import History from '../history/history.jsx'
import TabContent from '../tabs/tabContent'
import CustomTabs from '../tabs/tabs'
import tabStatusTypes from '../tabs/tabStatusTypes'
import LoginSignupModal from './loginSignupModal'
import Environments from '../environments/environments'
import IconButton from '../common/iconButton.jsx'

import { ReactComponent as HistoryIcon } from '../../assets/icons/historyIcon.svg'
import { addNewTab, fetchTabsFromRedux, openInNewTab, setActiveTabId } from '../tabs/redux/tabsActions'
import { getCurrentUser } from '../auth/authServiceV2'
import { updateStateOfCurlSlider } from '../modals/redux/modalsActions.js'
import { IoCodeSlashOutline } from 'react-icons/io5'
import './main.scss'
import 'react-tabs/style/react-tabs.css'

const ContentPanel = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const [saveEndpointFlag, setSaveEndpointFlag] = useState(false)
  const [savePageFlag, setSavePageFlag] = useState(false)
  const [showLoginSignupModal, setShowLoginSignupModal] = useState(false)
  const [selectedTabId, setSelectedTabId] = useState(null)

  const { endpoints, collections, pages, tabs, historySnapshots, curlSlider } = useSelector((state) => ({
    endpoints: state.pages,
    collections: state.collections,
    groups: state.groups,
    versions: state.versions,
    pages: state.pages,
    tabs: state.tabs,
    historySnapshots: state.history,
    curlSlider: state.modals?.curlSlider || false
  }))

  useEffect(() => {
    dispatch(fetchTabsFromRedux())
  }, [dispatch])

  useEffect(() => {
    const { endpointId, pageId, historyId, collectionId } = params

    if (tabs.loaded) {
      if (endpointId && endpointId !== 'new') {
        if (tabs.tabs[endpointId]) {
          if (tabs.activeTabId !== endpointId) {
            dispatch(setActiveTabId(endpointId))
          }
        } else if (endpoints && endpoints[endpointId]) {
          dispatch(openInNewTab({
            id: endpointId,
            type: 'endpoint',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: {}
          }))
        }
      }

      if (pageId) {
        if (tabs.tabs[pageId]) {
          if (tabs.activeTabId !== pageId) {
            dispatch(setActiveTabId(pageId))
          }
        } else if (pages && pages[pageId]) {
          dispatch(openInNewTab({
            id: pageId,
            type: 'page',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: {}
          }))
        }
      }

      if (historyId) {
        if (tabs.tabs[historyId]) {
          if (tabs.activeTabId !== historyId) {
            dispatch(setActiveTabId(historyId))
          }
        } else if (historySnapshots && historySnapshots[historyId]) {
          dispatch(openInNewTab({
            id: historyId,
            type: 'history',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: {}
          }))
        }
      }

      if (collectionId) {
        if (tabs.tabs[collectionId]) {
          if (tabs.activeTabId !== collectionId) {
            dispatch(setActiveTabId(collectionId))
          }
        } else if (collections && collections[collectionId]) {
          let pageType = location.pathname.split('/')[6] === 'settings' ? 'SETTINGS' : 'FEEDBACK'
          dispatch(openInNewTab({
            id: collectionId,
            type: 'collection',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: { pageType }
          }))
        }
      }

      if (window.location.pathname === `/orgs/${params.orgId}/dashboard`) {
        const { orgId } = params
        if (tabs?.tabsOrder?.length) {
          const { tabs: tabsData, activeTabId, tabsOrder } = tabs

          let tabId = activeTabId
          if (!tabsData[tabId]) tabId = tabsOrder[0]

          const tab = tabsData[tabId]
          if (tabId !== activeTabId) dispatch(setActiveTabId(tabId))

          const collectionLength = Object.keys(collections).length
          if (collectionLength > 0) {
            navigate(
              tab.type !== 'collection'
                ? `/orgs/${orgId}/dashboard/${tab.type}/${tab.status === 'NEW' ? 'new' : tabId}${tab.isModified ? '/edit' : ''}`
                : `/orgs/${orgId}/dashboard/collection/${tabId}/settings`
            )
          }
        } else {
          dispatch(addNewTab())
        }
      }
    }
  }, [dispatch, tabs, endpoints, pages, historySnapshots, collections, params, location.pathname, navigate])

  const handleSaveEndpoint = (flag, tabId) => {
    setSaveEndpointFlag(flag)
    setSelectedTabId(tabId)
  }

  const handleSavePage = (flag, tabId) => {
    setSavePageFlag(flag)
    setSelectedTabId(tabId)
  }

  const handleCodeCurlClick = () => {
    dispatch(updateStateOfCurlSlider(!curlSlider))
  }

  return (
    <main role='main' className='main'>
      {showLoginSignupModal && <LoginSignupModal show onHide={() => setShowLoginSignupModal(false)} title='Save Endpoint' />}
      <Tab.Container id='left-tabs-example' defaultActiveKey={tabs.activeTabId} activeKey={tabs.activeTabId}>
        {getCurrentUser() ? (
          <>
            <div className='content-header'>
              <div className='tabs-container d-flex justify-content-between'>
                <CustomTabs
                  handle_save_endpoint={handleSaveEndpoint}
                  handle_save_page={handleSavePage}
                />
                <Environments />
                {params.endpointId && (
                  <div
                    className='d-flex justify-content-center align-items-center code-curl-icon'
                    onClick={handleCodeCurlClick}
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
              <Nav variant='pills'>
                <Nav.Item className='px-0'>
                  <Nav.Link className='active'>
                    <button className='btn font-weight-bold'>Untitled</button>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <div className='custom-btn-group d-flex'>
                <button
                  className='btn'
                  onClick={() => setShowLoginSignupModal(true)}
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
                      <History />
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          </div>
        )}
        <div className='main-content'>
          <TabContent
            handle_save_endpoint={handleSaveEndpoint}
            handle_save_page={handleSavePage}
            save_endpoint_flag={saveEndpointFlag}
            save_page_flag={savePageFlag}
            selected_tab_id={selectedTabId}
          />
        </div>
      </Tab.Container>
    </main>
  )
}

export default ContentPanel