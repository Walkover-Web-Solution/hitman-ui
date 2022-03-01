import React, { Component } from 'react'
import { Nav, Dropdown } from 'react-bootstrap'
import SavePromptModal from './savePromptModal'
import './tabs.scss'

import tabService from './tabService'
import { ReactComponent as HistoryIcon } from '../../assets/icons/historyIcon.svg'
import History from '../history/history.jsx'
import TabOptions from './tabOptions'
import { isElectron } from '../common/utility'

class CustomTabs extends Component {
  constructor (props) {
    super(props)
    this.navRef = React.createRef()
    this.scrollRef = {}
    this.state = {
      showSavePromptFor: [],
      leftScroll: 0,
      clientScroll: this.navRef.current?.clientWidth,
      windowScroll: this.navRef.current?.scrollWidth
    }
  }

  componentDidMount () {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('TAB_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  componentWillUnmount () {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.removeListener('TAB_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  handleShortcuts = (e, { type, payload }) => {
    const { activeTabId } = this.props.tabs
    switch (type) {
      case 'OPEN_TAB_AT_INDEX':
        this.openTabAtIndex(payload - 1)
        break
      case 'SWITCH_NEXT_TAB':
        this.handleOpenNextTab()
        break
      case 'CLOSE_CURRENT_TAB':
        this.handleCloseTabs([activeTabId])
        break
      case 'OPEN_NEW_TAB':
        this.handleAddTab()
        break
      default:
    }
  }

  openTabAtIndex (index) {
    const { tabsOrder } = this.props.tabs
    if (tabsOrder[index]) tabService.selectTab({ ...this.props }, tabsOrder[index])
  }

  handleOpenNextTab () {
    const { activeTabId, tabsOrder } = this.props.tabs
    const index = (tabsOrder.indexOf(activeTabId) + 1) % tabsOrder.length
    this.openTabAtIndex(index)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.tabs.activeTabId !== prevProps.tabs.activeTabId) {
      const newRef = this.scrollRef[this.props.tabs.activeTabId] || null
      newRef && newRef.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    }
  }

  renderTabName (tabId) {
    const tab = this.props.tabs.tabs[tabId]
    if (!tab) return
    switch (tab.type) {
      case 'history':
        if (this.props.historySnapshots[tabId]) {
          if (tab.previewMode) {
            return (
              <div className='tabs-name'>
                <label className='endpoint-name-italic'>
                  {this.props.historySnapshots[tabId].endpoint.name}
                </label>
                <br />
                <label className='endpoint-name-italic sub-label'>History</label>
              </div>
            )
          } else {
            return (
              <div className='tabs-name'>
                <label className='endpoint-name'>{this.props.historySnapshots[tabId].endpoint.name || this.props.historySnapshots[tabId].endpoint.BASE_URL + this.props.historySnapshots[tabId].endpoint.uri || 'Random Trigger'}</label>
                <br />
                <label className='sub-label'>History</label>
              </div>
            )
          }
        } else {
          return <div className=''>{tab.state?.data?.name || 'Random Trigger'}</div>
        }
      case 'endpoint':
        if (this.props.endpoints[tabId]) {
          const endpoint = this.props.endpoints[tabId]
          if (tab.previewMode) {
            return (
              <div className='tabs-name'>
                <label className='endpoint-name-italic'>
                  {this.props.endpoints[tabId]?.name}
                </label>
                <br />
                <label className='endpoint-name-italic sub-label'>{this.props.groups[endpoint.groupId]?.name}</label>
              </div>

            )
          } else {
            return (
              <div className='tabs-name'>
                <label className='endpoint-name'>{this.props.endpoints[tabId]?.name}</label>
                <br />
                <label className='sub-label'>{this.props.groups[endpoint.groupId]?.name}</label>
              </div>
            )
          }
        } else {
          return <div className=''>{tab.state?.data?.name || 'Untitled'}</div>
        }

      case 'page':
        if (this.props.pages[tabId]) {
          const page = this.props.pages[tabId]
          if (tab.previewMode) {
            return (
              <div className='tabs-name'>
                <label className=' truncate tab-width'>
                  {this.props.pages[tabId].name}
                </label>
                <br />
                <label className='sub-label'>{this.props.groups[page.groupId]?.name || this.props.versions[page.versionId]?.number}</label>
              </div>
            )
          } else {
            return (
              <div className='tabs-name'>
                <label className='endpoint-name'>{page.name}</label>
                <br />
                <label className='sub-label'>{this.props.groups[page.groupId]?.name || this.props.versions[page.versionId]?.name}</label>
              </div>
            )
          }
        }
        break
      default:
    }
  }

  closeSavePrompt () {
    this.setState({ showSavePromptFor: [] })
  }

  onDragStart (tId) {
    this.draggedItem = tId
  }

  handleOnDragOver (e) {
    e.preventDefault()
  }

  onDrop = (e, droppedOnItem) => {
    e.preventDefault()
    if (this.draggedItem === droppedOnItem) {
      this.draggedItem = null
      return
    }
    const tabsOrder = this.props.tabs.tabsOrder.filter(
      (item) => item !== this.draggedItem
    )
    const index = this.props.tabs.tabsOrder.findIndex(
      (tId) => tId === droppedOnItem
    )
    tabsOrder.splice(index, 0, this.draggedItem)
    this.props.set_tabs_order(tabsOrder)
  };

  handleMouseEnter (dir) {
    this.interval = setInterval(this.handleNav.bind(this, dir), 500)
  }

  handleMouseLeave () {
    clearInterval(this.interval)
  }

  handleNav (dir) {
    if (dir === 'left') {
      if (this.navRef) this.navRef.current.scrollLeft -= 200
    } else {
      if (this.navRef) this.navRef.current.scrollLeft += 200
    }
  }

  scrollLength () {
    this.setState({ leftScroll: this.navRef.current?.scrollLeft, windowScroll: this.navRef.current?.scrollWidth, clientScroll: this.navRef.current?.clientWidth })
  }

  leftHideTabs () {
    return Number.parseInt(this.state.leftScroll / 200)
  }

  rightHideTabs () {
    return Number.parseInt((this.navRef.current?.scrollWidth - this.navRef.current?.clientWidth - this.state.leftScroll) / 200)
  }

  handleAddTab () {
    this.scrollLength()
    tabService.newTab({ ...this.props })
  }

  showScrollButton () {
    return this.navRef.current?.scrollWidth > this.navRef.current?.clientWidth + 10
  }

  renderHoverTab (tabId) {
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
            <div className='group-name'>{this.props.groups[page.groupId]?.name}</div>
            <div className={`${page.groupId ? 'endpoint-name ml-4 arrow-top' : 'page-name'}`}>{page.name}</div>
          </div>
        )
      }
    } else if (tab.type === 'endpoint') {
      if (this.props.endpoints[tabId]) {
        const endpoint = this.props.endpoints[tabId]
        return (
          <div className='hover-div' style={styles}>
            <div className='group-name'>{this.props.groups[endpoint.groupId]?.name}</div>
            <div className='d-flex align-items-center'>
              <div className={`api-label ${endpoint.requestType} request-type-bgcolor ml-4 mt-1 arrow-top`}> {endpoint.requestType} </div>
              <div className='endpoint-name ml-1'>{this.props.endpoints[tabId].name}</div>
            </div>
          </div>
        )
      } else {
        return (
          <div className='hover-div' style={styles}>
            <div className='page-name'>{tab.state?.data?.name || 'Untitled'}</div>
          </div>
        )
      }
    }
  }

  handleCloseTabs (tabIds) {
    const showSavePromptFor = []
    const tabsData = this.props.tabs.tabs
    for (let i = 0; i < tabIds.length; i++) {
      const tabData = tabsData[tabIds[i]]
      if (tabData.isModified) {
        showSavePromptFor.push(tabIds[i])
      } else {
        tabService.removeTab(tabIds[i], { ...this.props })
      }
    }
    this.setState({ showSavePromptFor })
  }

  handleOnConfirm (tabId) {
    this.setState({ showSavePromptFor: this.state.showSavePromptFor.filter((tab) => tab !== tabId) })
  }

  render () {
    return (

      <>
        {this.showScrollButton()
          ? (
            <div
              className={`scroll-button scroll-button--left d-flex mr-2 ${this.leftHideTabs() ? '' : 'disabled'}`}
              onMouseEnter={() => this.handleMouseEnter('left')}
              onMouseLeave={() => this.handleMouseLeave()}
            >
              <span className='mr-1'><i class='fa fa-angle-left' aria-hidden='true' /></span>
              <span>{this.leftHideTabs() ? `${this.leftHideTabs()}+` : null}</span>
            </div>)
          : null}
        <Nav variant='pills' className='flex-row flex-nowrap item-wrp' onScroll={() => this.scrollLength()} ref={this.navRef} style={{ scrollBehavior: 'smooth' }}>
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
          {this.props.tabs.tabsOrder.map((tabId, index) => (
            <div class='' key={tabId} ref={(newRef) => { this.scrollRef[tabId] = newRef }}>
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
                {
                this.props.tabs.tabs[tabId].isModified
                  ? (
                    <i className='fas fa-circle modified-dot-icon' />
                    )
                  : (
                      ''
                    )
              }
                <Nav.Link eventKey={tabId}>
                  <button
                    className='btn'
                    onClick={() => tabService.selectTab({ ...this.props }, tabId)}
                    onDoubleClick={() => {
                      tabService.disablePreviewMode(tabId)
                    }}
                  >
                    {this.renderTabName(tabId)}
                  </button>
                </Nav.Link>
                <button className='btn' onClick={() => this.handleCloseTabs([tabId])}>
                  <i className='uil uil-multiply' />
                </button>
              </Nav.Item>
              {this.state.showPreview && tabId === this.state.previewId &&
              (this.renderHoverTab(tabId, this.tabRef))}
            </div>
          ))}
        </Nav>
        {this.showScrollButton()
          ? (
            <div
              className={`scroll-button scroll-button--right d-flex ml-2 mr-0 ${this.rightHideTabs() ? '' : 'disabled'}`}
              onMouseEnter={() => this.handleMouseEnter('right')}
              onMouseLeave={() => this.handleMouseLeave()}
            >
              <span className='mr-1'>{this.rightHideTabs() ? `+${this.rightHideTabs()}` : null}</span>
              <span><i class='fa fa-angle-right' aria-hidden='true' /></span>
            </div>)
          : null}
        <Nav.Item className='tab-buttons newTabs' id='add-new-tab-button'>
          <button
            className='btn'
            onClick={() => this.handleAddTab()}
          >
            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M9 3V15' stroke='#808080' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              <path d='M3 9H15' stroke='#808080' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
            </svg>

          </button>
        </Nav.Item>

        <Nav.Item className='' id='options-tab-button'>
          <TabOptions history={this.props.history} match={this.props.match} handleCloseTabs={this.handleCloseTabs.bind(this)} />
        </Nav.Item>

        <Nav.Item className='' id='history-tab-button'>
          <Dropdown>
            <Dropdown.Toggle
              bsPrefix='dropdown'
              variant='default'
              id='dropdown-basic'
            >
              <HistoryIcon />
            </Dropdown.Toggle>
            <Dropdown.Menu className='history-drop-down'>
              <div className='history-heading'>History</div>
              <History {...this.props} />
            </Dropdown.Menu>
          </Dropdown>
        </Nav.Item>
      </>
    )
  }
}

export default CustomTabs
