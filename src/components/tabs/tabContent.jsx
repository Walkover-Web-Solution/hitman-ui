import React, { Component } from 'react'
import { Tab } from 'react-bootstrap'
import { Route, Switch } from 'react-router-dom'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import DisplayPage from '../pages/displayPage'
import EditPage from '../pages/editPage'
import { getCurrentUser } from '../auth/authServiceV2'
import PublishDocsForm from './../publishDocs/publishDocsForm'
import { updateCollection } from '../collections/redux/collectionsActions'
import { connect } from 'react-redux'
import PublishDocsReview from './../publishDocs/publishDocsReview'

const mapDispatchToProps = (dispatch) => {
  return {
    update_collection: (editedCollection) =>
      dispatch(updateCollection(editedCollection))
  }
}
class TabContent extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  unPublishCollection (collectionId) {
    const selectedCollection = this.props.collections[collectionId]
    if (selectedCollection?.isPublic === true) {
      const editedCollection = { ...selectedCollection }
      editedCollection.isPublic = false
      this.props.update_collection(editedCollection)
    }
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
      case 'collection':
        if (this.props.location.pathname.split('/')[6] === 'settings') {
          return (
            <PublishDocsForm
              {...this.props}
              isCollectionPublished={() => { return this.props.collections[tabId]?.isPublic || false }}
              unPublishCollection={() => this.unPublishCollection(tabId)}
              selected_collection_id={tabId}
              onTab
            />
          )
        } else {
          return (
            <PublishDocsReview
              {...this.props}
              selected_collection_id={tabId}
            />
          )
        }
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
        {getCurrentUser() && this.props.tabs.loaded
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

export default connect(null, mapDispatchToProps)(TabContent)
