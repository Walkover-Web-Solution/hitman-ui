import React, { Component } from "react";
import { Tab } from "react-bootstrap";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import Environments from "../environments/environments";
import {
  addNewTab,
  closeTab,
  openInNewTab,
  setActiveTabId,
  updateTab,
  setTabsOrder,
  fetchTabsFromIdb,
  replaceTab,
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
    setTabsOrder: (tabsOrder) => dispatch(setTabsOrder(tabsOrder)),
    fetchTabsFromIdb: (tabsOrder) => dispatch(fetchTabsFromIdb(tabsOrder)),
    replaceTab: (oldTabId, newTab) => dispatch(replaceTab(oldTabId, newTab)),
  };
};

class ContentPanel extends Component {
  state = { saveEndpointFlag: false };
  async componentDidMount() {
    this.props.fetchTabsFromIdb({ ...this.props });

    // if (
    //   this.props.location.pathname.split("/")[3] === "new" &&
    //   (Object.keys(this.props.tabs.tabs).length === 0 ||
    //     this.props.tabs.tabs[this.props.tabs.activeTabId].status !== "NEW")
    // ) {
    //   tabService.newTab({ ...this.props });
    // }
  }

  handleSaveEndpoint(flag, tabId) {
    this.setState({ saveEndpointFlag: flag, selectedTabId: tabId });
  }

  render() {
    if (
      this.props.location.pathname.split("/")[2] === "endpoint" &&
      this.props.location.pathname.split("/")[3] !== "new"
    ) {
      const endpointId = this.props.location.pathname.split("/")[3];

      if (this.props.tabs.tabs[endpointId]) {
        if (this.props.tabs.activeTabId !== endpointId) {
          this.props.setActiveTabId(endpointId);
        }
      } else {
        if (
          this.props.endpoints &&
          this.props.endpoints[endpointId] &&
          this.props.endpoints[endpointId].requestId
        ) {
          const requestId = this.props.endpoints[endpointId].requestId;
          this.props.replaceTab(requestId, {
            id: endpointId,
            type: "endpoint",
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
          });
        } else {
          this.props.openInNewTab({
            id: endpointId,
            type: "endpoint",
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
          });
        }
      }
    }

    if (this.props.location.pathname.split("/")[2] === "page") {
      const pageId = this.props.location.pathname.split("/")[3];
      if (this.props.tabs.tabs[pageId]) {
        if (this.props.tabs.activeTabId !== pageId)
          this.props.setActiveTabId(pageId);
      } else {
        this.props.openInNewTab({
          id: pageId,
          type: "page",
          status: tabStatusTypes.SAVED,
          previewMode: false,
          isModified: false,
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
              selected_tab_id={this.state.selectedTabId}
            />
          </div>
        </Tab.Container>
      </main>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPanel);
