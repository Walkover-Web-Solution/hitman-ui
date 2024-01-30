import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'
import { connect } from 'react-redux'
import { ReactComponent as MoreVerticalIcon } from '../../assets/icons/more-vertical.svg'
import { openInNewTab, setActiveTabId } from '../tabs/redux/tabsActions'
import shortid from 'shortid'
import tabStatusTypes from '../tabs/tabStatusTypes'
import * as _ from 'lodash'

const mapStateToProps = (state) => {
  return {
    tabs: state.tabs
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab)),
    set_active_tab_id: (tabId) => dispatch(setActiveTabId(tabId))
  }
}

class TabOptions extends Component {
  state = {}

  renderMenuOptions() {
    const { tabs, activeTabId } = this.props.tabs
    const options = [
      { title: 'Close all tabs', handleOnClick: this.handleCloseAllTabs.bind(this), show: true },
      { title: 'Close all tabs but current', handleOnClick: this.handleCloseAllButCurrent.bind(this), show: true },
      { title: 'Duplicate Current Tab', handleOnClick: this.handleDuplicateTab.bind(this), show: tabs[activeTabId]?.type !== 'page' }
    ]
    return options.map(
      (option, index) =>
        option.show && (
          <Dropdown.Item disabled={option.disabled} key={index} onClick={option.handleOnClick}>
            {option.title}
          </Dropdown.Item>
        )
    )
  }

  handleDuplicateTab() {
    const { orgId } = this.props.match.params
    const { tabs, activeTabId } = this.props.tabs
    const tab = _.cloneDeep(tabs[activeTabId])
    tab.id = shortid.generate()
    tab.status = tabStatusTypes.NEW
    tab.previewMode = false
    tab.isModified = true
    tab.state.endpoint = {}
    tab.state.data.name = tab.state.data.name + ' Copy'

    this.props.open_in_new_tab(tab)

    this.props.history.push({
      pathname: `/orgs/${orgId}/dashboard/${tab.type}/new`
    })
  }

  async handleCloseAllTabs() {
    const tabIdsToClose = this.props.tabs.tabsOrder
    this.props.handleCloseTabs(tabIdsToClose)
  }

  handleCloseAllButCurrent() {
    const { tabsOrder, activeTabId } = this.props.tabs
    const tabIdsToClose = tabsOrder.filter((tabId) => tabId !== activeTabId)
    this.props.handleCloseTabs(tabIdsToClose)
  }

  render() {
    return (
      <Dropdown>
        <Dropdown.Toggle bsPrefix='dropdown' variant='default' id='dropdown-basic'>
          <MoreVerticalIcon />
        </Dropdown.Toggle>
        <Dropdown.Menu className='tab-options-drop-down'>{this.renderMenuOptions()}</Dropdown.Menu>
      </Dropdown>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TabOptions)
