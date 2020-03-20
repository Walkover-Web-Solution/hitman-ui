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
    currentEnvironment: { id: null, name: "No Environment" }
  };
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
        <div>
          <SideBar
            {...this.props}
            set_source_group_id={this.setSourceGroupId.bind(this)}
            set_destination_group_id={this.setDestinationGroupId.bind(this)}
          />
          <ContentPanel
            {...this.props}
            set_environment={this.setEnvironment.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Main);
