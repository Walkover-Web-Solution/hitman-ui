import React, { Component } from "react";
import { Link, Route, Switch } from "react-router-dom";
import DisplayEndpoint from "./endpoints/displayEndpoint";
import Environments from "./environments/environments";
import DisplayPage from "./pages/displayPage";
import EditPage from "./pages/editPage";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

class ContentPanel extends Component {
  state = {};
  render() {
    return (
      <main role="main" className="main ml-sm-auto col-lg-10 ">
        <div className="content-header">
          <div className="tabs-container"> </div>
          <Environments {...this.props} />
        </div>

        <div className="main-content">
          <Switch>
            <Route
              path="/dashboard/endpoints"
              render={props => <DisplayEndpoint {...props} environment={{}} />}
            />
            <Route
              path="/dashboard/endpoints/:endpointId"
              render={props => <DisplayEndpoint {...props} environment={{}} />}
            />
            <Route
              path="/dashboard/pages/:pageid/edit"
              render={props => <EditPage {...props} />}
            />
            <Route
              path="/dashboard/pages/:pageid"
              render={props => <DisplayPage {...props} />}
            />
          </Switch>
        </div>
      </main>
    );
  }
}

export default ContentPanel;
