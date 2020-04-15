import React, { Component } from "react";
import { Tab, ThemeProvider } from "react-bootstrap";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import shortId from "shortid";
import Environments from "../environments/environments";
import TabContent from "../tabs/tabContent";
import CustomTabs from "../tabs/tabs";
import indexedDbService from "../indexedDb/indexedDbService";
import "./main.scss";
import tabService from "../tabs/tabService";
import {
  addNewTab,
  closeTab,
  openInNewTab,
  updateTab,
  setActiveTabId,
} from "../tabs/redux/tabsActions";
import tabStatusTypes from "../tabs/tabStatusTypes";

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
  state = {};
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

  render() {
    if (
      this.props.location.pathname.split("/")[2] === "endpoint" &&
      this.props.location.pathname.split("/")[3] !== "new"
    ) {
      const endpointId = this.props.location.pathname.split("/")[3];
      // const index = this.props.tabs.findIndex((tab) => tab.id === endpointId);
      // let tabs = [...this.props.tabs];

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
          });
        } else {
          this.props.openInNewTab({
            id: endpointId,
            type: "endpoint",
            status: tabStatusTypes.SAVED,
          });
        }
      }

      // if (index < 0) {
      //   if (this.props.endpoints[endpointId]) {
      //     const requestId = this.props.endpoints[endpointId].requestId;
      //     const tabIndex = this.props.tabs.findIndex(
      //       (tab) => tab.id === requestId
      //     );
      //     if (tabIndex >= 0) {
      //       tabs[this.props.default_tab_index] = {
      //         id: endpointId,
      //         type: "endpoint",
      //         isSaved: true,
      //       };
      //       indexedDbService.deleteData("tabs", requestId);
      //       // indexedDbService.addData("tabs", {
      //       //   id: endpointId,
      //       //   type: "endpoint",
      //       //   isSaved: true,
      //       // });
      //     } else {
      //       tabs.push({ id: endpointId, type: "endpoint", isSaved: true });
      //       // indexedDbService.addData("tabs", {
      //       //   id: endpointId,
      //       //   type: "endpoint",
      //       //   isSaved: true,
      //       // });
      //     }
      //     this.props.set_tabs(tabs, tabs.length - 1);
      //   }
      // } else if (
      //   this.props.tabs.length &&
      //   this.props.tabs[this.props.default_tab_index].id !== endpointId
      // ) {
      //   this.props.set_tabs(null, index);
      // }
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
              <CustomTabs {...this.props} />
            </div>
            <Environments {...this.props} />
          </div>

          <div className="main-content">
            <TabContent {...this.props} />
          </div>
        </Tab.Container>
      </main>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPanel);
