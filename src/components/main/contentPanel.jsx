import React, { Component } from "react";
import { Tab } from "react-bootstrap";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import Environments from "../environments/environments";
import {
  addNewTab,
  closeTab,
  fetchTabsFromIdb,
  openInNewTab,
  replaceTab,
  setActiveTabId,
  setTabsOrder,
  updateTab,
} from "../tabs/redux/tabsActions";
import TabContent from "../tabs/tabContent";
import CustomTabs from "../tabs/tabs";
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
    add_new_tab: () => dispatch(addNewTab()),
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab)),
    update_tab: (tab) => dispatch(updateTab(tab)),
    set_active_tab_id: (tabId) => dispatch(setActiveTabId(tabId)),
    set_tabs_order: (tabsOrder) => dispatch(setTabsOrder(tabsOrder)),
    fetch_tabs_from_idb: (tabsOrder) => dispatch(fetchTabsFromIdb(tabsOrder)),
    replace_tab: (oldTabId, newTab) => dispatch(replaceTab(oldTabId, newTab)),
  };
};

class ContentPanel extends Component {
  state = { saveEndpointFlag: false };
  async componentDidMount() {
    this.props.fetch_tabs_from_idb({ ...this.props });
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
          this.props.set_active_tab_id(endpointId);
        }
      } else {
        if (
          this.props.endpoints &&
          this.props.endpoints[endpointId] &&
          this.props.endpoints[endpointId].requestId
        ) {
          const requestId = this.props.endpoints[endpointId].requestId;
          this.props.replace_tab(requestId, {
            id: endpointId,
            type: "endpoint",
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
          });
        } else {
          this.props.open_in_new_tab({
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
          this.props.set_active_tab_id(pageId);
      } else {
        this.props.open_in_new_tab({
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
