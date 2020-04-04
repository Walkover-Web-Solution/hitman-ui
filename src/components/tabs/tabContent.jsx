import React, { Component } from "react";
import { Tab } from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import DisplayEndpoint from "../endpoints/displayEndpoint";
import DisplayPage from "../pages/displayPage";
import EditPage from "../pages/editPage";
class TabContent extends Component {
  state = {};
  render() {
    return (
      <Tab.Content>
        {this.props.tabs.map((tab) => (
          <Tab.Pane eventKey={tab.id}>
            <Switch>
              <Route
                path={`/dashboard/endpoint/${tab.id}`}
                render={(props) => (
                  <DisplayEndpoint {...this.props} environment={{}} />
                )}
              />
              <Route
                path={`/dashboard/endpoint/new`}
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
            </Switch>
          </Tab.Pane>
        ))}
      </Tab.Content>
    );
  }
}

export default TabContent;
