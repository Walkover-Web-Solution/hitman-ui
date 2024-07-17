// add useCallbacks in the end
import React, { useRef, useState, useEffect } from 'react'
import { Nav } from 'react-bootstrap'
import SavePromptModal from './savePromptModal'
import { setTabsOrder } from './redux/tabsActions.js'
import tabService from './tabService'
import { ReactComponent as HistoryIcon } from '../../assets/icons/historyIcon.svg'
import History from '../history/history.jsx'
import TabOptions from './tabOptions'
import Plus from '../../assets/icons/plus.svg'
import { onToggle } from '../common/redux/toggleResponse/toggleResponseActions.js'
import { connect } from 'react-redux'
import IconButtons from '../common/iconButton'
import { IoIosChatboxes } from 'react-icons/io'
import { CiSettings } from 'react-icons/ci'
import { GrFormClose } from 'react-icons/gr'
import { IoDocumentTextOutline } from 'react-icons/io5'
import { LuHistory } from 'react-icons/lu'
import { GrGraphQl } from 'react-icons/gr'
import withRouter from '../common/withRouter.jsx'
import './tabs.scss'

const mapStateToProps = (state) => {
  return {
    responseView: state.responseView,
    pages: state.pages,
    tabState: state.tabs.tabs,
    tabsOrder: state.tabs.tabsOrder,
    tabs: state.tabs,
    historySnapshots: state.history,
    collections: state.collections,
    history: state.history
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    set_response_view: (view) => dispatch(onToggle(view)),
    set_tabs_order: (tabsOrder) => dispatch(setTabsOrder(tabsOrder))
  }
}
const withQuery = (WrappedComponent) => {
  return (props) => {
    return <WrappedComponent {...props} />
  }
}
const CustomTabs = (props) => {

  const sideBar = {
    position: 'fixed',
    background: 'white',
    top: '40px',
    right: '0px',
    height: '95vh',
    width: '24%',
    float: 'right'
  }
  const history = {
    position: 'fixed',
    background: '#f7f6f3',
    top: '41px',
    right: '0px',
    height: '95vh',
    width: '445px',
    float: 'right',
    zIndex: '9999'
  }
  const Heading = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '0.5px solid #ddd'
  }
  const closeButton = {
    background: 'none',
    border: 'none',
    fontSize: '1.5em',
    cursor: 'pointer'
  }

  const navRef = useRef(null);
  const scrollRef = useRef({});
  const [showSavePromptFor, setShowSavePromptFor] = useState([]);
  const [leftScroll, setLeftScroll] = useState(0);
  const [clientScroll, setClientScroll] = useState(navRef.current?.clientWidth);
  const [windowScroll, setWindowScroll] = useState(navRef.current?.scrollWidth);
  const [showHistoryContainer, setShowHistoryContainer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  const draggedItem = useRef(null);
  const interval = useRef(null)

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const newRef = scrollRef[props.tabs.activeTabId] || null
    newRef && newRef.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
  }, [props.tabs.activeTabId])            // use useSelector

  // useCallback
  const handleKeyDown = (e) => {
    const activeTabId = props?.tabs?.activeTabId
    const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0

    if ((isMacOS && (e.metaKey || e.ctrlKey)) || (isWindows && e.altKey)) {
      switch (e.key) {
        case 't':
          e.preventDefault()
          handleOpenNextTab()
          break
        case 'w':
          e.preventDefault()
          handleCloseTabs([activeTabId])
          break
        case 'n':
          e.preventDefault()
          handleAddTab()
          break
        default:
          break
      }
    }
  }

  // useCallback
  const openTabAtIndex = (index) => {
    const { tabsOrder } = props.tabs
    if (tabsOrder[index]) tabService.selectTab({ ...props }, tabsOrder[index])
  }

  const handleOpenNextTab = () => {
    const { activeTabId, tabsOrder } = props.tabs
    const index = (tabsOrder.indexOf(activeTabId) + 1) % tabsOrder.length
    openTabAtIndex(index)
  }



  const renderTabName = (tabId) => {
    const tab = props.tabState[tabId]
    if (!tab) return
    switch (tab.type) {
      case 'history':
        if (props.historySnapshots[tabId]) {
          if (tab.previewMode) {
            return (
              <>
                <div className='d-flex mr-2'>
                  <LuHistory />
                  {props.historySnapshots[tabId].endpoint.name}
                </div>
              </>
            )
          } else {
            return (
              <>
                <div className='d-flex'>
                  <LuHistory className='mr-1' size={16} />
                  {props.historySnapshots[tabId].endpoint.name ||
                    props.historySnapshots[tabId].endpoint.BASE_URL + props.historySnapshots[tabId].endpoint.uri ||
                    'Random Trigger'}
                </div>
              </>
            )
          }
        } else {
          return <div className=''>{tab.state?.data?.name || 'Random Trigger'}</div>
        }

      case 'endpoint':
        if (props.pages[tabId]) {
          const endpoint = props.pages[tabId]
          if (tab.previewMode) {
            return (
              <div className='d-flex justify-content-center align-items-center'>
                {endpoint.protocolType === 1 && (
                  <div className={`${props.tabState[tabId]?.draft?.data?.method}-TAB mr-2 request-type-bgcolor`}>
                    {props.tabState[tabId]?.draft?.data?.method}
                  </div>
                )}
                {endpoint.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
                <span>{props.pages[tabId]?.name}</span>
              </div>
            )
          } else {
            return (
              <div className='d-flex justify-content-center align-items-center'>
                {endpoint.protocolType === 1 && (
                  <div className={`${props.tabState[tabId]?.draft?.data?.method}-TAB mr-2 request-type-bgcolor`}>
                    {props.tabState[tabId]?.draft?.data?.method}
                  </div>
                )}
                {endpoint.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
                <span>{props.pages[tabId]?.name}</span>
              </div>
            )
          }
        } else {
          const endpoint = props?.tabState?.[tabId]
          return (
            <div className='d-flex align-items-center'>
              {endpoint?.draft?.protocolType === 1 && (
                <div className={`${endpoint?.draft?.data?.method}-TAB mr-2 request-type-bgcolor`}>{endpoint?.draft?.data?.method}</div>
              )}
              {endpoint?.draft?.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
              {tab.state?.data?.name || 'Untitled'}
            </div>
          )
        }

      case 'page':
        if (props.pages[tabId]) {
          const page = props.pages[tabId]
          if (tab.previewMode) {
            return (
              <div className='d-flex align-items-center'>
                <IoDocumentTextOutline size={14} className='mr-1 mb-1' />
                <span>{page.name}</span>
              </div>
            )
          } else {
            return (
              <div className='d-flex align-items-center'>
                <IoDocumentTextOutline size={14} className='mr-1 mb-1' />
                <span>{page.name}</span>
              </div>
            )
          }
        }
        break
      case 'collection': {
        const collectionName = props.collections[tabId]?.name || 'Collection'
        if (props.location.pathname.split('/')[6] === 'settings') {
          return (
            <>
              <span className='d-flex align-items-center'>
                <CiSettings size={18} className='setting-icons mr-1 mb-1' />
                <span>{collectionName}</span>
              </span>
            </>
          )
        } else {
          return (
            <div className='d-flex align-items-center'>
              <CiSettings size={18} className='setting-icons mr-1 mb-1' />
              <span>{collectionName}</span>
            </div>
          )
        }
      }
      case 'feedback': {
        return (
          <>
            <div className='d-flex align-items-center'>
              <IoIosChatboxes className='mr-1' size={16} />
              <span>Feedback</span>
            </div>
          </>
        )
      }
      default:
    }
  }

  const closeSavePrompt = () => {
    setShowSavePromptFor([]);
  }

  const onDragStart = (tId) => {
    draggedItem.current = tId
  }

  const handleOnDragOver = (e) => {
    e.preventDefault()
  }

  const onDrop = (e, droppedOnItem) => {
    e.preventDefault()
    if (draggedItem.current === droppedOnItem) {
      draggedItem.current = null
      return
    }
    const tabsOrder = props.tabs.tabsOrder.filter((item) => item !== draggedItem.current)
    const index = props.tabs.tabsOrder.findIndex((tId) => tId === droppedOnItem)
    tabsOrder.splice(index, 0, draggedItem.current)
    props.set_tabs_order(tabsOrder)
  }

  const handleMouseEnter = (dir) => {
    interval.current = setInterval(handleNav(dir), 500)
  }

  const handleMouseLeave = () => {
    if (interval.current) {
      clearInterval(interval.current)
      interval.current = null
    }
  }

  const handleNav = (dir) => {
    if (dir === 'left') {
      if (navRef.current) navRef.current.scrollLeft -= 200
    } else {
      if (navRef.current) navRef.current.scrollLeft += 200
    }
  }

  const scrollLength = () => {
    setLeftScroll(navRef.current?.scrollLeft);
    setWindowScroll(navRef.current?.scrollWidth);
    setClientScroll(navRef.current?.clientWidth)
  }

  const leftHideTabs = () => {
    return Number.parseInt(leftScroll / 200)
  }

  const rightHideTabs = () => {
    return Number.parseInt((navRef.current?.scrollWidth - navRef.current?.clientWidth - leftScroll) / 200)
  }

  const handleAddTab = () => {
    scrollLength()
    tabService.newTab({ ...props })
  }

  const showScrollButton = () => {
    return navRef.current?.scrollWidth > navRef.current?.clientWidth + 10
  }

  const renderHoverTab = (tabId) => {
    let x = 1
    const y = 1
    x -= navRef.current.scrollLeft
    const styles = {
      transform: `translate(${x}px, ${y}px)`
    }
    const tab = props.tabs.tabs[tabId]
    if (!tab) return
    if (tab.type === 'page') {
      if (props.pages[tabId]) {
        const page = props.pages[tabId]
        return (
          <div className='hover-div' style={styles}>
            {/* <div className='group-name'>{props.pages[props.pages?.[tabId]?.parentId]?.name}</div> */}
            <div className={`${page.groupId ? 'endpoint-name ml-4 arrow-top' : 'page-name'}`}>Page</div>
          </div>
        )
      }
    } else if (tab.type === 'endpoint') {
      if (props.pages[tabId]) {
        const endpoint = props.pages[tabId]
        return (
          <div className='hover-div' style={styles}>
            <div className='d-flex align-items-center'>
              {endpoint.protocolType === 1 && (
                <div className={`api-label ${props.tabState[tabId]?.draft?.data?.method} request-type-bgcolor ml-4 mt-1 arrow-top`}>
                  {props.tabState[tabId]?.draft?.data?.method}{' '}
                </div>
              )}
              {endpoint.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
              <div className='endpoint-name ml-1'>{props.pages[tabId].name}</div>
            </div>
          </div>
        )
      }
    } else if (tab.type === 'collection') {
      return (
        <>
          <div className='hover-div' style={styles}>
            <div className='page-name'>Setting</div>
          </div>
          <div className='hover-div' style={styles}>
            <div className='page-name'>Setting</div>
          </div>
        </>
      )
    } else if (tab.type === 'history') {
      return (
        <>
          <div className='hover-div' style={styles}>
            <div className='page-name'>history</div>
          </div>
          <div className='hover-div' style={styles}>
            <div className='page-name'>history</div>
          </div>
        </>
      )
    } else if (tab.type === 'feedback') {
      return (
        <>
          <div className='hover-div' style={styles}>
            <div className='page-name'>feedback</div>
          </div>
          <div className='hover-div' style={styles}>
            <div className='page-name'>feedback</div>
          </div>
        </>
      )
    }
  }

  const handleHistoryClick = () => {
    if (props.responseView === 'right' && showHistoryContainer === false) {
      props.set_response_view('bottom')
    }
    setShowHistoryContainer(!showHistoryContainer)
  }

  const handleCloseTabs = (tabIds) => {
    const showSavePromptFor = []
    const tabsData = props.tabs.tabs

    for (let i = 0; i < tabIds.length; i++) {
      const tabData = tabsData[tabIds[i]]

      if (tabData?.isModified) {
        showSavePromptFor.push(tabIds[i])
      } else {
        // Check if there's only one tab left before removing
        if (Object.keys(tabsData).length > 1) {
          tabService.removeTab(tabIds[i], { ...props })
        }
      }
    }
    setShowSavePromptFor(showSavePromptFor)
  }

  const handleOnConfirm = (tabId) => {
    const show_save_prompt_for = showSavePromptFor.filter((tab) => tab != tabId)
    setShowSavePromptFor(show_save_prompt_for)
  }

  return (
    <>
      <div className='d-flex navs-container'>
        {showScrollButton() ? (
          <div
            className={`scroll-button scroll-button--left d-flex ${leftHideTabs() ? '' : 'disabled'}`}
            onMouseEnter={() => handleMouseEnter('left')}
            onMouseLeave={() => handleMouseLeave()}
          >
            <span className='mr-1'>
              <i className='fa fa-angle-left' aria-hidden='true' />
            </span>
            <span>{leftHideTabs() ? `${leftHideTabs()}+` : null}</span>
          </div>
        ) : null}
        <Nav
          variant='pills'
          className='flex-row flex-nowrap item-wrp'
          onScroll={() => scrollLength()}
          ref={navRef}
          style={{ scrollBehavior: 'smooth' }}
        >
          <div>
            {showSavePromptFor.length > 0 && (
              <SavePromptModal
                {...props}
                show
                onHide={() => closeSavePrompt()}
                onConfirm={handleOnConfirm}
                tab_id={showSavePromptFor[0]}
              />
            )}
          </div>
          {props.tabsOrder.map((tabId, index) => (
            <div
              className=''
              key={tabId}
              ref={(newRef) => {
                scrollRef.current[tabId] = newRef
              }}
            >
              <Nav.Item
                key={tabId}
                draggable
                onDragOver={handleOnDragOver}
                onDragStart={() => onDragStart(tabId)}
                onDrop={(e) => onDrop(e, tabId)}
                className={props.tabs?.activeTabId === tabId ? 'active' : ''}
                onMouseEnter={() => { setShowPreview(true); setPreviewId(tabId) }}
                onMouseLeave={() => { setShowPreview(false); setPreviewId(null) }}
              >
                {props?.tabState[tabId]?.isModified ? <i className='fas fa-circle modified-dot-icon' /> : ''}
                <Nav.Link eventKey={tabId}>
                  <button
                    className='btn truncate'
                    onClick={() => tabService.selectTab({ ...props }, tabId)}
                    onDoubleClick={() => {
                      tabService.disablePreviewMode(tabId)
                    }}
                  >
                    {renderTabName(tabId)}
                  </button>
                  <button className=' close' onClick={() => handleCloseTabs([tabId])}>
                    <IconButtons>
                      <i className='uil uil-multiply' />
                    </IconButtons>
                  </button>
                </Nav.Link>
              </Nav.Item>
              {showPreview && tabId === previewId && renderHoverTab(tabId)}
            </div>
          ))}
        </Nav>
        {showScrollButton() ? (
          <div
            className={`scroll-button scroll-button--right d-flex ${rightHideTabs() ? '' : 'disabled'}`}
            onMouseEnter={() => handleMouseEnter('right')}
            onMouseLeave={() => handleMouseLeave()}
          >
            <span className='mr-1'>{rightHideTabs() ? `+${rightHideTabs()}` : null}</span>
            <span>
              <i className='fa fa-angle-right' aria-hidden='true' />
            </span>
          </div>
        ) : null}
        <Nav.Item className='tab-buttons newTabs' id='add-new-tab-button'>
          <button className='btn' onClick={() => handleAddTab()}>
            <img className='p-1' src={Plus} alt='' />
          </button>
        </Nav.Item>
        <div className='d-flex'>
          <Nav.Item className='tab-buttons' id='options-tab-button'>
            <TabOptions history={props.history} handleCloseTabs={handleCloseTabs} />
          </Nav.Item>
          <Nav.Item className='' id='history-tab-button'>
            <button onClick={handleHistoryClick} className='px-2' style={{ outline: 'none' }}>
              <HistoryIcon className='p-1' />{' '}
            </button>
          </Nav.Item>
          {showHistoryContainer && (
            <div className='history-main-container' style={history}>
              <div style={Heading}>
                History
                <div className='d-flex' style={closeButton} onClick={handleHistoryClick} aria-label='Close'>
                  <IconButtons>
                    <GrFormClose />
                  </IconButtons>
                </div>
              </div>
              <History {...props} />
            </div>
          )}
        </div>
      </div>
    </>
  )

}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withQuery(CustomTabs)))