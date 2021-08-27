import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'
import { connect } from 'react-redux'
import { ReactComponent as MoreVerticalIcon } from '../../assets/icons/more-vertical.svg'

const mapStateToProps = (state) => {
  return {
    tabs: state.tabs
  }
}

class TabOptions extends Component {
  state = {}

  renderMenuOptions () {
    const options = [
      { title: 'Close all tabs', handleOnClick: this.handleCloseAllTabs.bind(this) },
      { title: 'Close all tabs but current', handleOnClick: this.handleCloseAllButCurrent.bind(this) }
    ]
    return (
      options.map((option, index) => (
        <Dropdown.Item key={index} onClick={option.handleOnClick}>{option.title}</Dropdown.Item>
      ))
    )
  }

  async handleCloseAllTabs () {
    const tabIdsToClose = this.props.tabs.tabsOrder
    this.props.handleCloseTabs(tabIdsToClose)
  }

  handleCloseAllButCurrent () {
    const { tabsOrder, activeTabId } = this.props.tabs
    const tabIdsToClose = tabsOrder.filter(tabId => tabId !== activeTabId)
    this.props.handleCloseTabs(tabIdsToClose)
  }

  render () {
    return (
      <Dropdown>
        <Dropdown.Toggle bsPrefix='dropdown' variant='default' id='dropdown-basic'>
          <MoreVerticalIcon />
        </Dropdown.Toggle>
        <Dropdown.Menu className='tab-options-drop-down'>
          {this.renderMenuOptions()}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

export default connect(mapStateToProps, null)(TabOptions)
