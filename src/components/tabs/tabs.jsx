import React, { Component } from 'react'
import { Nav, Dropdown } from 'react-bootstrap'
import SavePromptModal from './savePromptModal'
import './tabs.scss'
import tabService from './tabService'
import { ReactComponent as HistoryIcon } from '../../assets/icons/historyIcon.svg'
import History from '../history/history.jsx'
import TabOptions from './tabOptions'
import { isElectron } from '../common/utility'
import Plus from '../../assets/icons/plus.svg'
import { onToggle } from '../common/redux/toggleResponse/toggleResponseActions.js'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { IoIosSettings } from "react-icons/io"
import { HiMiniDocumentText } from "react-icons/hi2";
import  IconButtons  from '../common/iconButton'
import { GrFormClose } from "react-icons/gr"

const mapStateToProps = (state) => {
  return {
    responseView: state.responseView,
    pages: state.pages,
    tabState: state.tabs.tabs,
    tabsOrder: state.tabs.tabsOrder
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    set_response_view: (view) => dispatch(onToggle(view))
  }
}
const withQuery = (WrappedComponent) => {
  return (props) => {
    return <WrappedComponent {...props} />
  }
}
class CustomTabs extends Component {
  constructor(props) {
    super(props)
    this.navRef = React.createRef()
    this.scrollRef = {}
    this.state = {
      showSavePromptFor: [],
      leftScroll: 0,
      clientScroll: this.navRef.current?.clientWidth,
      windowScroll: this.navRef.current?.scrollWidth,
      showHistoryContainer: false
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('TAB_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.removeListener('TAB_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  handleKeyDown = (e) => {
    const activeTabId = this.props?.tabs?.activeTabId;
    const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0;

    if ((isMacOS && (e.metaKey || e.ctrlKey)) || (isWindows && e.altKey)) {
      switch (e.key) {
        case 't':
          e.preventDefault();
          this.handleOpenNextTab();
          break;
        case 'w':
          e.preventDefault();
          this.handleCloseTabs([activeTabId]);
          break;
        case 'n':
          e.preventDefault();
          this.handleAddTab();
          break;
        default:
          break;
      }
    }
  }

  openTabAtIndex(index) {
    const { tabsOrder } = this.props.tabs
    if (tabsOrder[index]) tabService.selectTab({ ...this.props }, tabsOrder[index])
  }

  handleOpenNextTab() {
    const { activeTabId, tabsOrder } = this.props.tabs
    const index = (tabsOrder.indexOf(activeTabId) + 1) % tabsOrder.length
    this.openTabAtIndex(index)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.tabs.activeTabId !== prevProps.tabs.activeTabId) {
      const newRef = this.scrollRef[this.props.tabs.activeTabId] || null
      newRef && newRef.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    }
  }

  renderTabName(tabId) {
    const tab = this.props.tabState[tabId]
    if (!tab) return
    switch (tab.type) {
      case 'history':
        if (this.props.historySnapshots[tabId]) {
          if (tab.previewMode) {
            return (
              <>
                {this.props.historySnapshots[tabId].endpoint.name}
                <span className='sub-label'>History</span>
              </>
            )
          } else {
            return (
              <>
                {this.props.historySnapshots[tabId].endpoint.name ||
                  this.props.historySnapshots[tabId].endpoint.BASE_URL + this.props.historySnapshots[tabId].endpoint.uri ||
                  'Random Trigger'}
                <span className='sub-label'>History</span>
              </>
            )
          }
        } else {
          return <div className=''>{tab.state?.data?.name || 'Random Trigger'}</div>
        }

      case 'endpoint':
        if (this.props.pages[tabId]) {
          const endpoint = this.props.pages[tabId]
          if (tab.previewMode) {
            return (
              <>
                {this.props.pages[tabId]?.name}
                <span className='sub-label'>{this.props.groups[endpoint.groupId]?.name}</span>
              </>
            )
          } else {
            return (
              <>
                {this.props.pages[tabId]?.name}
                <span className='sub-label'>{this.props.groups[endpoint.groupId]?.name}</span>
              </>
            )
          }
        } else {
          return <>{tab.state?.data?.name || 'Untitled'}</>
        }

      case 'page':
        if (this.props.pages[tabId]) {
          const page = this.props.pages[tabId]
          if (tab.previewMode) {
            return (
              <>
                {this.props.pages[tabId].name}
                {/* <span>div</span> */}
                {/* <span className='sub-label'>{this.props.groups[page.groupId]?.name || this.props.versions[page.versionId]?.number}</span> */}
              </>
            )
          } else {
            return (
              <div className='d-flex'>
                <HiMiniDocumentText className='mr-1' size={16} />
                <span>{page.name}</span>
              </div>
            )
          }
        }
        break
      case 'collection': {
        const collectionName = this.props.collections[tabId]?.name || 'Collection'
        if (this.props.location.pathname.split('/')[6] === 'settings') {
          return (
            <>
              <span className='d-flex'>
                <IoIosSettings size={16} className='setting-icons mr-1' />
                <span>{collectionName}</span>
              </span>
            </>
          )
        } else {
          return (
            <div className='d-flex'>
              <IoIosSettings size={16} className='setting-icons mr-1' />
              <span>{collectionName}</span>
            </div>
          )
        }
      }
      default:
    }
  }

  closeSavePrompt() {
    this.setState({ showSavePromptFor: [] })
  }

  onDragStart(tId) {
    this.draggedItem = tId
  }

  handleOnDragOver(e) {
    e.preventDefault()
  }

  onDrop = (e, droppedOnItem) => {
    e.preventDefault()
    if (this.draggedItem === droppedOnItem) {
      this.draggedItem = null
      return
    }
    const tabsOrder = this.props.tabs.tabsOrder.filter((item) => item !== this.draggedItem)
    const index = this.props.tabs.tabsOrder.findIndex((tId) => tId === droppedOnItem)
    tabsOrder.splice(index, 0, this.draggedItem)
    this.props.set_tabs_order(tabsOrder)
  }

  handleMouseEnter(dir) {
    this.interval = setInterval(this.handleNav.bind(this, dir), 500)
  }

  handleMouseLeave() {
    clearInterval(this.interval)
  }

  handleNav(dir) {
    if (dir === 'left') {
      if (this.navRef) this.navRef.current.scrollLeft -= 200
    } else {
      if (this.navRef) this.navRef.current.scrollLeft += 200
    }
  }

  scrollLength() {
    this.setState({
      leftScroll: this.navRef.current?.scrollLeft,
      windowScroll: this.navRef.current?.scrollWidth,
      clientScroll: this.navRef.current?.clientWidth
    })
  }

  leftHideTabs() {
    return Number.parseInt(this.state.leftScroll / 200)
  }

  rightHideTabs() {
    return Number.parseInt((this.navRef.current?.scrollWidth - this.navRef.current?.clientWidth - this.state.leftScroll) / 200)
  }

  handleAddTab() {
    this.scrollLength()
    tabService.newTab({ ...this.props })
  }

  showScrollButton() {
    return this.navRef.current?.scrollWidth > this.navRef.current?.clientWidth + 10
  }

  renderHoverTab(tabId) {
    let x = 1
    const y = 1
    x -= this.navRef.current.scrollLeft
    const styles = {
      transform: `translate(${x}px, ${y}px)`
    }
    const tab = this.props.tabs.tabs[tabId]
    if (!tab) return
    if (tab.type === 'page') {
      if (this.props.pages[tabId]) {
        const page = this.props.pages[tabId]
        return (
          <div className='hover-div' style={styles}>
            {/* <div className='group-name'>{this.props.pages[this.props.pages?.[tabId]?.parentId]?.name}</div> */}
            <div className={`${page.groupId ? 'endpoint-name ml-4 arrow-top' : 'page-name'}`}>{this.props.pages[tabId]?.name}</div>
          </div>
        )
      }
    } else if (tab.type === 'endpoint') {
      if (this.props.pages[tabId]) {
        const endpoint = this.props.pages[tabId]
        return (
          <div className='hover-div' style={styles}>
            {/* <div className='group-name'>{this.props.pages[tabId]?.name}</div> */}
            <div className='d-flex align-items-center'>
              <div className={`api-label ${this.props.pages[tabId]?.requestType} request-type-bgcolor ml-4 mt-1 arrow-top`}>
                {' '}
                {this.props.pages[tabId]?.requestType}{' '}
              </div>
              <div className='endpoint-name ml-1'>{this.props.pages[tabId].name}</div>
            </div>
          </div>
        )
      }
    } else if (tab.type === 'collection') {
      return (
        <>
          <div className='hover-div' style={styles}>
            <div className='page-name'>{this.props.collections[tabId]?.name}</div>
          </div>
          <div className='hover-div' style={styles}>
            <div className='page-name'>{this.props.collections[tabId]?.name}</div>
          </div>
        </>
      )
      // }
    }
  }

  handleHistoryClick = () => {
    if (this.props.responseView === 'right' && this.state.showHistoryContainer === false) {
      this.props.set_response_view('bottom')
    }
    this.setState((prevState) => ({
      showHistoryContainer: !prevState.showHistoryContainer
    }))
  }

  handleCloseTabs(tabIds) {
    const showSavePromptFor = []
    const tabsData = this.props.tabs.tabs

    for (let i = 0; i < tabIds.length; i++) {
      const tabData = tabsData[tabIds[i]]

      if (tabData?.isModified) {
        showSavePromptFor.push(tabIds[i])
      } else {
        // Check if there's only one tab left before removing
        if (Object.keys(tabsData).length > 1) {
          tabService.removeTab(tabIds[i], { ...this.props })
        }
        //  else {
        //   toast.info("This Tab is by Default")
        // }
      }
    }
    this.setState({ showSavePromptFor })
  }

  handleOnConfirm(tabId) {
    this.setState({ showSavePromptFor: this.state.showSavePromptFor.filter((tab) => tab !== tabId) })
  }

  render() {
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
      top: '40px',
      right: '0px',
      height: '95vh',
      width: '24%',
      float: 'right'
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
    return (
      <>
        <div className='d-flex navs-container'>
          {this.showScrollButton() ? (
            <div
              className={`scroll-button scroll-button--left d-flex ${this.leftHideTabs() ? '' : 'disabled'}`}
              onMouseEnter={() => this.handleMouseEnter('left')}
              onMouseLeave={() => this.handleMouseLeave()}
            >
              <span className='mr-1'>
                <i className='fa fa-angle-left' aria-hidden='true' />
              </span>
              <span>{this.leftHideTabs() ? `${this.leftHideTabs()}+` : null}</span>
            </div>
          ) : null}
          <Nav
            variant='pills'
            className='flex-row flex-nowrap item-wrp'
            onScroll={() => this.scrollLength()}
            ref={this.navRef}
            style={{ scrollBehavior: 'smooth' }}
          >
            <div>
              {this.state.showSavePromptFor.length > 0 && (
                <SavePromptModal
                  {...this.props}
                  show
                  onHide={() => this.closeSavePrompt()}
                  onConfirm={this.handleOnConfirm.bind(this)}
                  tab_id={this.state.showSavePromptFor[0]}
                />
              )}
            </div>
            {this.props.tabsOrder.map((tabId, index) => (
              <div
                className=''
                key={tabId}
                ref={(newRef) => {
                  this.scrollRef[tabId] = newRef
                }}
              >
                <Nav.Item
                  key={tabId}
                  draggable
                  onDragOver={this.handleOnDragOver}
                  onDragStart={() => this.onDragStart(tabId)}
                  onDrop={(e) => this.onDrop(e, tabId)}
                  className={this.props.tabs?.activeTabId === tabId ? 'active' : ''}
                  onMouseEnter={() => this.setState({ showPreview: true, previewId: tabId })}
                  onMouseLeave={() => this.setState({ showPreview: false, previewId: null })}
                >
                  {this.props?.tabState[tabId]?.isModified ? <i className='fas fa-circle modified-dot-icon' /> : ''}
                  <Nav.Link eventKey={tabId}>
                    <button
                      className='btn truncate'
                      onClick={() => tabService.selectTab({ ...this.props }, tabId)}
                      onDoubleClick={() => {
                        tabService.disablePreviewMode(tabId)
                      }}
                    >
                      {this.renderTabName(tabId)}
                    </button>
                  <button className=' close' onClick={() => this.handleCloseTabs([tabId])}>
                    <IconButtons><i className='uil uil-multiply' /></IconButtons>
                  </button>
                  </Nav.Link>
                </Nav.Item>
                {this.state.showPreview && tabId === this.state.previewId && this.renderHoverTab(tabId, this.tabRef)}
              </div>
            ))}
          </Nav>
          {this.showScrollButton() ? (
            <div
              className={`scroll-button scroll-button--right d-flex ${this.rightHideTabs() ? '' : 'disabled'}`}
              onMouseEnter={() => this.handleMouseEnter('right')}
              onMouseLeave={() => this.handleMouseLeave()}
            >
              <span className='mr-1'>{this.rightHideTabs() ? `+${this.rightHideTabs()}` : null}</span>
              <span>
                <i className='fa fa-angle-right' aria-hidden='true' />
              </span>
            </div>
          ) : null}
          <Nav.Item className='tab-buttons newTabs' id='add-new-tab-button'>
            <button className='btn' onClick={() => this.handleAddTab()}>
              <img className='p-1' src={Plus} alt='' />
            </button>
          </Nav.Item>
          <div className='d-flex'>
            <Nav.Item className='tab-buttons' id='options-tab-button'>
              <TabOptions history={this.props.history} match={this.props.match} handleCloseTabs={this.handleCloseTabs.bind(this)} />
            </Nav.Item>
            <Nav.Item className='' id='history-tab-button'>
              <button onClick={this.handleHistoryClick} className='px-2' style={{ outline: 'none' }}>
                <HistoryIcon className='p-1' />{' '}
              </button>
            </Nav.Item>
            {this.state.showHistoryContainer && (
              <div style={history}>
                <div style={Heading}>
                  History
                  <div className='d-flex' style={closeButton} onClick={this.handleHistoryClick} aria-label='Close'>
                  <IconButtons><GrFormClose /></IconButtons>
                  </div>
                </div>
                <History {...this.props} />
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withQuery(CustomTabs)))
