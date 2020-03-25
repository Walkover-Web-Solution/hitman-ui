import React, { Component } from "react";
import { Link, Route, Switch } from "react-router-dom";
import DisplayEndpoint from "./endpoints/displayEndpoint";
import Environments from "./environments/environments";
import DisplayPage from "./pages/displayPage";
import { Tabs, Tab, Row, Col, Nav } from "react-bootstrap";
import EditPage from "./pages/editPage";

class TabContent extends Component {
  state = {};
  render() {
    return (
      <Tab.Content>
        {this.props.tabs.map(tab => (
          <Tab.Pane eventKey={tab.id}>
            <Switch>
              <Route
                path={`/dashboard/endpoints/${tab.id}`}
                render={props => (
                  <DisplayEndpoint {...props} environment={{}} />
                )}
              />
            </Switch>
          </Tab.Pane>
        ))}
      </Tab.Content>
    );
  }
}

export default TabContent;
