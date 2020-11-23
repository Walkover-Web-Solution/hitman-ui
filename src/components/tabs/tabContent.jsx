import React, { Component } from "react";
import { Tab } from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import DisplayEndpoint from "../endpoints/displayEndpoint";
import DisplayPage from "../pages/displayPage";
import EditPage from "../pages/editPage";
import { getCurrentUser } from "../auth/authService";

class TabContent extends Component {
  state = {};

  renderContent(tabId) {
    const tab = this.props.tabs.tabs[tabId];
    switch (tab.type) {
      case "endpoint":
        return <DisplayEndpoint {...this.props} environment={{}} tab={tab} />;
      case "page":
        return (
          <Switch>
            <Route
              path={`/dashboard/page/${tab.id}/edit`}
              render={(props) => <EditPage {...props} tab={tab} />}
            />
            <Route
              path={`/dashboard/page/${tab.id}`}
              render={(props) => <DisplayPage {...props} tab={tab} />}
            />
          </Switch>
        );
      default:
        break;
    }
  }

  renderEndpoint() {
    return <DisplayEndpoint {...this.props} environment={{}} tab="" />
  }

  render() {
    return (
      <Tab.Content>
        {getCurrentUser() ? (
          Object.keys(this.props.tabs.tabs).map((tabId) => (
            <Tab.Pane eventKey={tabId} key={tabId}>
              {this.renderContent(tabId)}
            </Tab.Pane>
          ))) : this.renderEndpoint()
        }
      </Tab.Content>
    );
  }
}

export default TabContent;
