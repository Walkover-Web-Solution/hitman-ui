import React, { Component } from "react";
import { connect } from "react-redux";
import { setEndpointIds } from "../groups/redux/groupsActions";
import { deleteEndpoint, duplicateEndpoint } from "./redux/endpointsActions";
import { isDashboardRoute } from "../common/utility";
import endpointService from "./endpointService.js";

const mapStateToProps = state => {
  return { endpoints: state.endpoints, groups: state.groups };
};

const mapDispatchToProps = dispatch => {
  return {
    deleteEndpoint: endpoint => dispatch(deleteEndpoint(endpoint)),
    duplicateEndpoint: endpoint => dispatch(duplicateEndpoint(endpoint)),
    setEndpointIds: (endpointsOrder, groupId) =>
      dispatch(setEndpointIds(endpointsOrder, groupId))
  };
};

class Endpoints extends Component {
  state = {
    endpointState: "Make Public"
  };

  onDragStart = (e, eId) => {
    this.draggedItem = eId;
    this.props.set_source_group_id(eId, this.props.group_id);
  };

  onDragOver = (e, eId) => {
    e.preventDefault();
  };
  onDrop = (e, droppedOnItem) => {
    e.preventDefault();
    if (!this.draggedItem) {
    } else {
      if (this.draggedItem === droppedOnItem) {
        this.draggedItem = null;
        return;
      }
      let endpointIds = this.props.endpoints_order.filter(
        item => item !== this.draggedItem
      );
      const index = this.props.endpoints_order.findIndex(
        eId => eId === droppedOnItem
      );
      endpointIds.splice(index, 0, this.draggedItem);
      this.props.setEndpointIds(endpointIds, this.props.group_id);
      this.draggedItem = null;
    }
  };

  handleDelete(endpoint) {
    this.props.deleteEndpoint(endpoint);
    this.props.history.push({
      pathname: "/dashboard"
    });
  }

  handleDuplicate(endpoint) {
    this.props.duplicateEndpoint(endpoint);
    this.props.history.push({
      pathname: "/dashboard"
    });
  }

  handleUpdate(endpoint) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${this.props.version_id}/groups/${this.props.group_id}/endpoints/${endpoint.id}/edit`,
      editEndpoint: endpoint
    });
  }

  async handlePublicEndpointState(endpoint) {
    console.log("state", endpoint.state);
    if (this.state.endpointState === "Make Public") {
      console.log("state");
      //endpoint.nextState = "Pending for Approval";
      endpoint.currentState = "Make Public";
      let updatedEndpoint = await endpointService.updateEndpointState(endpoint);
      this.setState({ endpointState: updatedEndpoint.data.state });
    }
  }

  handleDisplay(endpoint, groups, versions, groupId, collectionId) {
    if (isDashboardRoute(this.props)) {
      this.props.history.push({
        pathname: `/dashboard/endpoints/${endpoint.id}`,
        title: "update endpoint",
        endpoint: endpoint,
        groupId: groupId,
        groups: groups,
        versions: versions,
        endpointFlag: true
      });
    } else {
      this.props.history.push({
        pathname: `/public/${collectionId}/endpoints/${endpoint.id}`,
        title: "update endpoint",
        endpoint: endpoint,
        groupId: groupId,
        groups: groups,
        versions: versions,
        endpointFlag: true
      });
    }
  }

  render() {
    if (isDashboardRoute(this.props)) {
      return (
        <React.Fragment>
          {Object.keys(this.props.endpoints).length !== 0 &&
            this.props.endpoints_order
              .filter(
                eId => this.props.endpoints[eId].groupId === this.props.group_id
              )
              .map(endpointId => (
                <div className="endpoint-list-item">
                  <button
                    className="btn "
                    draggable
                    onDragOver={e => this.onDragOver(e, endpointId)}
                    onDragStart={e => this.onDragStart(e, endpointId)}
                    onDrop={e => this.onDrop(e)}
                    onClick={() =>
                      this.handleDisplay(
                        this.props.endpoints[endpointId],
                        this.props.groups,
                        this.props.versions,
                        this.props.group_id,
                        this.props.collection_id
                      )
                    }
                  >
                    <div
                      className={this.props.endpoints[endpointId].requestType}
                    >
                      {this.props.endpoints[endpointId].requestType}
                    </div>
                    {this.props.endpoints[endpointId].name}
                  </button>
                  <div className="btn-group">
                    <button
                      className="btn "
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="fas fa-ellipsis-h"></i>
                    </button>
                    <div className="dropdown-menu dropdown-menu-right">
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          this.handleDelete(this.props.endpoints[endpointId])
                        }
                      >
                        Delete
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          this.handleDuplicate(this.props.endpoints[endpointId])
                        }
                      >
                        Duplicate
                      </button>

                      <button
                        className="dropdown-item"
                        onClick={() =>
                          this.handlePublicEndpointState(
                            this.props.endpoints[endpointId]
                          )
                        }
                      >
                        {this.props.endpoints[endpointId].state}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </React.Fragment>
      );
    } else {
      return (
        <div>
          {Object.keys(this.props.endpoints).length !== 0 &&
            this.props.endpoints_order
              .filter(
                eId => this.props.endpoints[eId].groupId === this.props.group_id
              )
              .map(endpointId => (
                <div className="endpoint-list-item">
                  <button
                    className="btn "
                    onClick={() =>
                      this.handleDisplay(
                        this.props.endpoints[endpointId],
                        this.props.groups,
                        this.props.versions,
                        this.props.group_id,
                        this.props.collection_id
                      )
                    }
                  >
                    <div
                      className={this.props.endpoints[endpointId].requestType}
                    >
                      {this.props.endpoints[endpointId].requestType}
                    </div>
                    {this.props.endpoints[endpointId].name}
                  </button>
                </div>
              ))}
        </div>
      );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Endpoints);
