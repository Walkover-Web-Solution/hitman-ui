import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import { connect } from "react-redux";
import { moveEndpoint } from "../endpoints/redux/endpointsActions";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "../sidebar";
import PublicEndPointSrvice from "./publicEndpointsService.js";
//import Navbar from "./Navbar";
import ContentPanel from "../contentPanel";
import { fetchAllPublicEndpoints } from "./redux/publicEndpointsActions.js";
const mapDispatchToProps = dispatch => {
  return {
    moveEndpoint: (endpointId, sourceGroupId, destinationGroupId) =>
      dispatch(moveEndpoint(endpointId, sourceGroupId, destinationGroupId)),
    fetchAllPublicEndpoints: collectionIdentifier =>
      dispatch((fetchAllPublicEndpoints: collectionIdentifier))
  };
};

class PublicEndpoint extends Component {
  state = {
    currentEnvironment: { id: null, name: "No Environment" }
  };

  componentDidMount() {
    if (this.props.location.pathname) {
      let collectionIdentifier = this.props.location.pathname.split("/")[2];
      this.props.fetchAllPublicEndpoints(collectionIdentifier);
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
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start"
        }}
      >
        <ToastContainer />
        <div className="wrapper">
          <SideBar
            {...this.props}
            set_source_group_id={this.setSourceGroupId.bind(this)}
            set_destination_group_id={this.setDestinationGroupId.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(PublicEndpoint);
