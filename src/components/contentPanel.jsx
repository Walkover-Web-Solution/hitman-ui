import React, { Component } from "react";
import { Link, Route, Switch } from "react-router-dom";
import DisplayEndpoint from "./endpoints/displayEndpoint";
import Environments from "./environments/environments";
import DisplayPage from "./pages/displayPage";
import EditPage from "./pages/editPage";
// import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { Tabs, Tab, Row, Col, Nav } from "react-bootstrap";

import "react-tabs/style/react-tabs.css";
import shortId from "shortid";
import CustomTabs from "./tabs";
import TabContent from "./tabContent";

class ContentPanel extends Component {
  state = {
    tabs: {
      wZfiEZg_A: { id: "wZfiEZg_A", type: "endpoint" },
      ZgVJFgXi5: { id: "ZgVJFgXi5", type: "endpoint" }
    }
  };
  setTabs(tabs) {
    this.setState({ tabs });
  }
  render() {
    if (this.props.location.pathname.split("/")[2] === "endpoints") {
      const endpointId = this.props.location.pathname.split("/")[3];
      if (!endpointId && this.props.location.title === "Add New Endpoint") {
        const requestId = shortId.generate();
        const tabs = {
          ...this.state.tabs,
          [requestId]: { id: requestId, type: "endpoint" }
        };
        this.setState({ tabs, key: requestId });

        this.props.history.push({ groups: null });
      }
      if (!this.state.tabs[endpointId]) {
        const tabs = {
          ...this.state.tabs,
          [endpointId]: { id: endpointId, type: "endpoint" }
        };
        console.log("2");
        this.setState({ tabs, key: endpointId });
      } else {
        if (this.state.key !== endpointId) {
          this.setState({ key: endpointId });
        }
      }
    }
    return (
      <main role="main" className="main ml-sm-auto col-lg-10 ">
        <Tab.Container
          id="left-tabs-example"
          defaultActiveKey={this.state.defaultKey}
          activeKey={this.state.key}
        >
          <div className="content-header">
            <div className="tabs-container">
              <CustomTabs
                {...this.props}
                tabs={{ ...this.state.tabs }}
                set_tabs={this.setTabs.bind(this)}
              />
            </div>
            <Environments {...this.props} />
          </div>

          <div className="main-content">
            <TabContent {...this.props} tabs={{ ...this.state.tabs }} />

            {/* <Switch>
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
          </Switch> */}
          </div>
        </Tab.Container>
      </main>
    );
  }
}

export default ContentPanel;
