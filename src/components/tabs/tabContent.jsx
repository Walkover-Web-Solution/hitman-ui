import React, { Component } from "react";
import { Tab } from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import DisplayEndpoint from "../endpoints/displayEndpoint";
import DisplayPage from "../pages/displayPage";
import EditPage from "../pages/editPage";
class TabContent extends Component {
  state = {};

  renderContent(tab) {
    switch (tab.type) {
      case "endpoint":
        return <DisplayEndpoint {...this.props} environment={{}} tab={tab} />;
      case "page":
        return (
          <Switch>
            <Route
              path={`/dashboard/page/${tab.id}/edit`}
              render={(props) => <EditPage {...props} />}
            />
            <Route
              path={`/dashboard/page/${tab.id}`}
              render={(props) => <DisplayPage {...props} />}
            />
          </Switch>
        );
    }
  }

  render() {
    return (
      <Tab.Content>
        {this.props.tabs.map((tab) => (
          <Tab.Pane eventKey={tab.id} key={tab.id}>
            {this.renderContent(tab)}
            {/* <Switch>
              <Route
                path={`/dashboard/endpoint/${tab.id}`}
                render={(props) => (
                  <DisplayEndpoint {...this.props} environment={{}} />
                )}
              />
              <Route
                path={`/dashboard/endpoint/new/${tab.id}`}
                render={(props) => (
                  <DisplayEndpoint {...this.props} environment={{}} />
                )}
              />
              <Route
                path={`/dashboard/page/${tab.id}/edit`}
                render={(props) => <EditPage {...props} />}
              />
              <Route
                path={`/dashboard/page/${tab.id}`}
                render={(props) => <DisplayPage {...props} />}
              />
            </Switch> */}
          </Tab.Pane>
        ))}
      </Tab.Content>
    );
  }
}

export default TabContent;
