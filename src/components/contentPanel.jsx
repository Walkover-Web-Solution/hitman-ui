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

  render() {
    if (
      this.props.location.pathname.split("/")[2] === "endpoints" &&
      this.props.location.pathname.split("/")[3] !== "new"
    ) {
      const endpointId = this.props.location.pathname.split("/")[3];
      const index = this.props.tabs.findIndex(tab => tab.id === endpointId)
      if () {
        const tabs = [
          ...this.props.tabs,
          { id: endpointId, type: "endpoint", isSaved: true }
        ];
        this.props.set_tabs(tabs);
        this.setState({ key: endpointId });
      } else if (
        this.props.tabs.length &&
        this.props.tabs[this.props.default_tab_index].id !== endpointId
      ) {
        this.set_tabs({ null, endpointId });
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
