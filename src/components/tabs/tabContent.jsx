import React, { Component } from 'react'
import { Tab } from 'react-bootstrap'
import { Route, Switch } from 'react-router-dom'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import DisplayPage from '../pages/displayPage'
import EditPage from '../pages/editPage'
import { getCurrentUser } from '../auth/authService'

class TabContent extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  renderContent (tabId) {
    const tab = this.props.tabs.tabs[tabId]
    switch (tab?.type) {
      case 'history':
        return <DisplayEndpoint {...this.props} environment={{}} tab={tab} historySnapshotFlag historySnapshot={this.props.historySnapshots[tab.id]} />
      case 'endpoint':
        return <DisplayEndpoint {...this.props} environment={{}} tab={tab} />
      case 'page':
        return (
          <Switch>
            <Route
              path='/orgs/:orgId/dashboard/page/:pageId/edit'
              render={(props) => <EditPage {...this.props} {...props} tab={tab} />}
            />
            <Route
              path='/orgs/:orgId/dashboard/page/:pageId'
              render={(props) => <DisplayPage {...props} tab={tab} />}
            />
          </Switch>
        )
      default:
        break
    }
  }

  renderEndpoint () {
    return <DisplayEndpoint {...this.props} environment={{}} tab='' />
  }

  render () {
    return (
      <Tab.Content>
        {getCurrentUser()
          ? (
              Object.keys(this.props.tabs.tabs).map((tabId) =>
                (
                  <Tab.Pane eventKey={tabId} key={tabId}>
                    {this.renderContent(tabId)}
                  </Tab.Pane>
                )
              )
            )
          : this.renderEndpoint()}
      </Tab.Content>
    )
  }
}

export default TabContent
