import React, { Component } from "react";
import { Tab } from "react-bootstrap";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import Environments from "../environments/environments";
import indexedDbService from "../indexedDb/indexedDbService";
import {
  addNewTab,
  closeTab,
  openInNewTab,
  setActiveTabId,
  updateTab,
} from "../tabs/redux/tabsActions";
import TabContent from "../tabs/tabContent";
import CustomTabs from "../tabs/tabs";
import tabService from "../tabs/tabService";
import tabStatusTypes from "../tabs/tabStatusTypes";
import "./main.scss";

const mapStateToProps = (state) => {
  return {
    endpoints: state.endpoints,
    groups: state.groups,
    pages: state.pages,
    tabs: state.tabs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNewTab: () => dispatch(addNewTab()),
    closeTab: (tabId) => dispatch(closeTab(tabId)),
    openInNewTab: (tab) => dispatch(openInNewTab(tab)),
    updateTab: (tab) => dispatch(updateTab(tab)),
    setActiveTabId: (tabId) => dispatch(setActiveTabId(tabId)),
  };
};

class ContentPanel extends Component {
  state = { saveEndpointFlag: false };
  async componentDidMount() {
    await indexedDbService.getDataBase();
    // const tabs = await indexedDbService.getAllValues("tabs");
    // this.props.set_tabs(tabs);
    if (
      this.props.location.pathname.split("/")[3] === "new" &&
      (Object.keys(this.props.tabs.tabs).length === 0 ||
        this.props.tabs.tabs[this.props.tabs.activeTabId].status !== "NEW")
    ) {
      tabService.newTab({ ...this.props });
    }
  }

  handleSaveEndpoint(flag) {
    this.setState({ saveEndpointFlag: flag });
  }

  render() {
    if (
      this.props.location.pathname.split("/")[2] === "endpoint" &&
      this.props.location.pathname.split("/")[3] !== "new"
    ) {
      const endpointId = this.props.location.pathname.split("/")[3];

      if (this.props.tabs.tabs[endpointId]) {
        if (this.props.tabs.activeTabId !== endpointId)
          this.props.setActiveTabId(endpointId);
      } else {
        if (
          this.props.endpoints &&
          this.props.endpoints[endpointId] &&
          this.props.endpoints[endpointId].requestId
        ) {
          this.props.closeTab(this.props.endpoints[endpointId].requestId);
          this.props.openInNewTab({
            id: endpointId,
            type: "endpoint",
            status: tabStatusTypes.SAVED,
            previewMode: false,
          });
        } else {
          this.props.openInNewTab({
            id: endpointId,
            type: "endpoint",
            status: tabStatusTypes.SAVED,
            previewMode: false,
          });
        }
      }
    }

    if (this.props.location.pathname.split("/")[2] === "page") {
      const pageId = this.props.location.pathname.split("/")[3];
      if (this.props.tabs.tabs[pageId]) {
        // indexedDbService.addData("tabs", {
        //   id: pageId,
        //   type: "page",
        //   isSaved: true,
        // });
        this.props.setActiveTabId(pageId);
      } else {
        this.props.openInNewTab({
          id: pageId,
          type: "page",
          status: tabStatusTypes.SAVED,
          previewMode: false,
        });
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
          activeKey={this.props.tabs.activeTabId}
        >
          <div className="content-header">
            <div className="tabs-container">
              <CustomTabs
                {...this.props}
                handle_save_endpoint={this.handleSaveEndpoint.bind(this)}
              />
            </div>
            <Environments {...this.props} />
          </div>

          <div className="main-content">
            <TabContent
              {...this.props}
              handle_save_endpoint={this.handleSaveEndpoint.bind(this)}
              save_endpoint_flag={this.state.saveEndpointFlag}
            />
          </div>
        </Tab.Container>
      </main>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPanel);
