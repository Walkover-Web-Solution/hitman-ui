import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import { connect } from "react-redux";
import { moveEndpoint } from "./endpoints/redux/endpointsActions";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "./sidebar";
import Navbar from "./Navbar";
import ContentPanel from "./contentPanel";

const mapDispatchToProps = dispatch => {
  return {
    moveEndpoint: (endpointId, sourceGroupId, destinationGroupId) =>
      dispatch(moveEndpoint(endpointId, sourceGroupId, destinationGroupId))
  };
};

class Main extends Component {
  state = {
    currentEnvironment: { id: null, name: "No Environment" },
    tabs: [
      { id: "wZfiEZg_A", type: "endpoint", isSaved: true },
      { id: "ZgVJFgXi5", type: "endpoint", isSaved: true }
    ],
    defaultTabIndex: 0
  };
  setTabs(tabs, defaultTabIndex) {
    console.log(tabs, defaultTabIndex);
    if (defaultTabIndex) {
      this.setState({ defaultTabIndex });
    }
    if (tabs) {
      this.setState({ tabs });
    }
  }
  setEnvironment(environment) {
    this.setState({ currentEnvironment: environment });
  }

  setSourceGroupId(draggedEndpoint, groupId) {
    this.draggedEndpoint = draggedEndpoint;
    this.sourceGroupId = groupId;
  }

  setDestinationGroupId(destinationGroupId) {
    this.dndMoveEndpoint(
      this.draggedEndpoint,
      this.sourceGroupId,
      destinationGroupId
    );
  }

  dndMoveEndpoint(endpointId, sourceGroupId, destinationGroupId) {
    if (sourceGroupId !== destinationGroupId)
      this.props.moveEndpoint(endpointId, sourceGroupId, destinationGroupId);
  }

  render() {
    console.log(this);
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start"
        }}
      >
        <ToastContainer />
        <Navbar {...this.props} />
        <div className="wrapper">
          <SideBar
            {...this.props}
            set_source_group_id={this.setSourceGroupId.bind(this)}
            set_destination_group_id={this.setDestinationGroupId.bind(this)}
            tabs={[...this.state.tabs]}
            set_tabs={this.setTabs.bind(this)}
          />
          <ContentPanel
            {...this.props}
            set_environment={this.setEnvironment.bind(this)}
            tabs={[...this.state.tabs]}
            set_tabs={this.setTabs.bind(this)}
            default_tab_index={this.state.defaultTabIndex}
          />
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Main);
