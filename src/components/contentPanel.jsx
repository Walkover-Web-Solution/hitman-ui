import React, { Component } from "react";
import { Link, Route, Switch } from "react-router-dom";
import DisplayEndpoint from "./endpoints/displayEndpoint";
import Environments from "./environments/environments";
import DisplayPage from "./pages/displayPage";
import EditPage from "./pages/editPage";
// import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { Tabs, Tab, Row, Col, Nav } from "react-bootstrap";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import shortId from "shortid";
import CustomTabs from "./tabs";
import TabContent from "./tabContent";

const mapStateToProps = state => {
  return { endpoints: state.endpoints, groups: state.groups };
};
class ContentPanel extends Component {
  state = {};
  componentDidMount() {
    if (
      this.props.location.pathname.split("/")[3] === "new" &&
      (this.props.tabs.length === 0 ||
        this.props.tabs[this.props.default_tab_index].isSaved == true)
    ) {
      const newTabId = shortId.generate();
      const tabs = [
        ...this.props.tabs,
        { id: newTabId, type: "endpoint", isSaved: false }
      ];

      this.props.set_tabs(tabs, tabs.length - 1);
    }
  }
  render() {
    if (
      this.props.location.pathname.split("/")[2] === "endpoint" &&
      this.props.location.pathname.split("/")[3] !== "new"
    ) {
      const endpointId = this.props.location.pathname.split("/")[3];
      const index = this.props.tabs.findIndex(tab => tab.id === endpointId);
      let tabs = [...this.props.tabs];
      if (index < 0) {
        if (this.props.endpoints[endpointId]) {
          const requestId = this.props.endpoints[endpointId].requestId;
          console.log(requestId);
          const tabIndex = this.props.tabs.findIndex(
            tab => tab.id === requestId
          );
          if (tabIndex >= 0) {
            tabs[this.props.default_tab_index] = {
              id: endpointId,
              type: "endpoint",
              isSaved: true
            };
          } else {
            tabs.push({ id: endpointId, type: "endpoint", isSaved: true });
          }
          this.props.set_tabs(tabs, tabs.length - 1);
        }
      } else if (
        this.props.tabs.length &&
        this.props.tabs[this.props.default_tab_index].id !== endpointId
      ) {
        this.props.set_tabs(null, index);
      }
    }

    return (
      <main role="main" className="main ml-sm-auto col-lg-10 ">
        <Tab.Container
          id="left-tabs-example"
          defaultActiveKey={
            this.props.tabs.length &&
            this.props.tabs[this.props.default_tab_index].id
          }
          activeKey={
            this.props.tabs.length &&
            this.props.tabs[this.props.default_tab_index].id
          }
        >
          <div className="content-header">
            <div className="tabs-container">
              <CustomTabs {...this.props} />
            </div>
            <Environments {...this.props} />
          </div>

          <div className="main-content">
            <TabContent {...this.props} />

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

export default connect(mapStateToProps, null)(ContentPanel);
