import React, { Component } from 'react'
import { Nav, Dropdown } from 'react-bootstrap'
import SavePromptModal from './savePromptModal'
import './tabs.scss'

import tabService from './tabService'
import { ReactComponent as HistoryIcon } from '../../assets/icons/historyIcon.svg'
import History from '../history/history.jsx'

class CustomTabs extends Component {
  constructor (props) {
    super(props)
    this.navRef = React.createRef()
    this.state = {
      showSavePrompt: false,
      leftScroll: 0,
      clientScroll: this.navRef.current?.clientWidth,
      windowScroll: this.navRef.current?.scrollWidth
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
                <label className='endpoint-name-italic font-weight-bold'>
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
          return <div className='font-weight-bold'>Untitled</div>
        }
      case 'endpoint':
        if (this.props.endpoints[tabId]) {
          const endpoint = this.props.endpoints[tabId]
          if (tab.previewMode) {
            return (
              <div className='tabs-name'>
                <label className='endpoint-name-italic font-weight-bold'>
                  {this.props.endpoints[tabId].name}
                </label>
                <br />
                <lable className='endpoint-name-italic sub-label'>{this.props.groups[endpoint.groupId].name}</lable>
              </div>

            )
          } else {
            return (
              <div className='tabs-name'>
                <label className='endpoint-name'>{this.props.endpoints[tabId].name}</label>
                <br />
                <label className='sub-label'>{this.props.groups[endpoint.groupId].name}</label>
              </div>
            )
          }
        } else {
          return <div className='font-weight-bold'>Untitled</div>
        }

      case 'page':
        if (this.props.pages[tabId]) {
          const page = this.props.pages[tabId]
          if (tab.previewMode) {
            return (
              <div className='endpoint-name-italic font-weight-bold'>
                <label style={{ fontStyle: 'italic' }}>
                  {this.props.pages[tabId].name}
                </label>
                <lable className='sub-label'>{this.props.groups[page.groupId]?.name}</lable>
              </div>
            )
          } else {
            return (
              <div className='tabs-name'>
                <label className='endpoint-name'>{page.name}</label>
                <br />
                <lable className='sub-label'>{this.props.groups[page.groupId]?.name}</lable>
              </div>
            )
          }
        }
        break
      default:
    }
  }

  removeTab (tabId) {
    if (this.props.tabs.tabs[tabId].isModified) {
      this.setState({ showSavePrompt: true, selectedTabId: tabId })
    } else {
      tabService.removeTab(tabId, { ...this.props })
    }
  }

  closeSavePrompt () {
    this.setState({ showSavePrompt: false })
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
    this.interval = setInterval(this.handleNav.bind(this, dir), 1000)
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
    this.setState({ leftScroll: this.navRef.current.scrollLeft, windowScroll: this.navRef.current?.scrollWidth, clientScroll: this.navRef.current?.clientWidth })
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

  renderEndpointName (tabId) {
    const tab = this.props.tabs.tabs[tabId]
    if (!tab) return
    if (tab.type === 'page') {
      if (this.props.pages[tabId]) {
        const page = this.props.pages[tabId]
        return (
          <div className='hover-div'>
            <div className=''>{this.props.groups[page.groupId]?.name}</div>
            <div className=''>{page.name}</div>
          </div>
        )
      }
    } else if (tab.type === 'endpoint') {
      if (this.props.endpoints[tabId]) {
        const endpoint = this.props.endpoints[tabId]
        return (
          <div className='hover-div'>
            <div className='group-name'>{this.props.groups[endpoint.groupId].name}</div>
            <div className='d-flex'>
              <div className={`api-label ${endpoint.requestType} request-type-bgcolor ml-4 mt-1`}> {endpoint.requestType} </div>
              <div className='endpoint-name ml-1'>{this.props.endpoints[tabId].name}</div>
            </div>
          </div>
        )
      } else {
        return (
          <div className='hover-div'>
            <div className='endpoint-name '>Untitled</div>
          </div>
        )
      }
    }
  }

  render () {
    return (

      <>
        {this.navRef.current?.scrollWidth > this.navRef.current?.clientWidth
          ? (
            <div
              className={`scroll-button d-flex mr-2 ${this.leftHideTabs() ? '' : 'disabled'}`}
              onMouseEnter={() => this.handleMouseEnter('left')}
              onMouseLeave={() => this.handleMouseLeave()}
            >
              <span className='mr-1'><i class='fa fa-angle-left' aria-hidden='true' /></span>
              <span>{this.leftHideTabs() ? `${this.leftHideTabs()}+` : null}</span>
            </div>)
          : null}
        <Nav variant='pills' className='flex-row flex-nowrap item-wrp' onScroll={() => this.scrollLength()} ref={this.navRef} style={{ scrollBehavior: 'smooth' }}>
          <div>
            {this.state.showSavePrompt && (
              <SavePromptModal
                {...this.props}
                show
                onHide={() => this.closeSavePrompt()}
                tab_id={this.state.selectedTabId}
              />
            )}
          </div>
          {this.props.tabs.tabsOrder.map((tabId, index) => (
            <Nav.Item
              key={tabId}
              draggable
              onDragOver={this.handleOnDragOver}
              onDragStart={() => this.onDragStart(tabId)}
              onDrop={(e) => this.onDrop(e, tabId)}
              className={this.props.tabs?.activeTabId === tabId ? 'active' : ''}
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
                  onMouseEnter={() => this.setState({ showPreview: true, previewId: tabId })}
                  onMouseLeave={() => this.setState({ showPreview: false, previewId: null })}
                >
                  {this.renderTabName(tabId)}
                </button>
                {/* {this.state.showPreview && tabId === this.state.previewId && */}
                <div className='hover-div'>
                  {this.renderEndpointName(tabId)}
                </div>
              </Nav.Link>
              <button className='btn' onClick={() => this.removeTab(tabId)}>
                <i className='uil uil-multiply' />
              </button>
            </Nav.Item>
          ))}
          {/* <Nav.Item className='tab-buttons' id='tabs-menu-button'>
          <div className='dropdown'>
            <button
              className='btn '
              type='button'
              id='tabs-menu'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            >
              <i className='uil uil-ellipsis-h' />
            </button>
            <div
              className='dropdown-menu dropdown-menu-right'
              aria-labelledby='tabs-menu'
            >
              <button
                className='btn'
                onClick={() =>
                  tabService.removeTab(this.props.tabs.activeTabId, {
                    ...this.props
                  })}
              >
                Close Current Tab
              </button>
              <button
                className='btn'
                onClick={() => tabService.removeAllTabs({ ...this.props })}
              >
                Close All Tabs
              </button>
            </div>
          </div>
        </Nav.Item> */}
        </Nav>
        {this.navRef.current?.scrollWidth > this.navRef.current?.clientWidth
          ? (
            <div
              className={`scroll-button d-flex ml-2 mr-2 ${this.rightHideTabs() ? '' : 'disabled'}`}
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
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z' stroke='#BDBDBD' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              <path d='M12 8V16' stroke='#BDBDBD' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              <path d='M8 12H16' stroke='#BDBDBD' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
            </svg>
          </button>
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
