import React, { Component } from "react";
import { connect } from "react-redux";
import { isDashboardRoute } from "../common/utility";
import { setEndpointIds } from "../groups/redux/groupsActions";
import {
  approveEndpoint,
  draftEndpoint,
  pendingEndpoint,
  rejectEndpoint,
} from "../publicEndpoint/redux/publicEndpointsActions";
import tabService from "../tabs/tabService";
import { deleteEndpoint, duplicateEndpoint } from "./redux/endpointsActions";

const mapStateToProps = (state) => {
  return {
    endpoints: state.endpoints,
    groups: state.groups,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    deleteEndpoint: (endpoint) => dispatch(deleteEndpoint(endpoint)),
    duplicateEndpoint: (endpoint) => dispatch(duplicateEndpoint(endpoint)),
    setEndpointIds: (endpointsOrder, groupId) =>
      dispatch(setEndpointIds(endpointsOrder, groupId)),
    pendingEndpoint: (endpoint) => dispatch(pendingEndpoint(endpoint)),
    approveEndpoint: (endpoint) => dispatch(approveEndpoint(endpoint)),
    draftEndpoint: (endpoint) => dispatch(draftEndpoint(endpoint)),
    rejectEndpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
  };
};

class Endpoints extends Component {
  state = {
    endpointState: "Make Public",
  };

  componentDidMount() {}

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
        (item) => item !== this.draggedItem
      );
      const index = this.props.endpoints_order.findIndex(
        (eId) => eId === droppedOnItem
      );
      endpointIds.splice(index, 0, this.draggedItem);
      this.props.setEndpointIds(endpointIds, this.props.group_id);
      this.draggedItem = null;
    }
  };

  // deleteTab(index) {
  //   let tabs = [...this.props.tabs];
  //   tabs.splice(index, 1);
  //   if (this.props.default_tab_index === index) {
  //     if (index !== 0) {
  //       const newIndex = this.props.default_tab_index - 1;
  //       this.props.set_tabs(tabs, newIndex);
  //       this.changeRoute(tabs[newIndex], "update endpoint");
  //     } else {
  //       if (tabs.length > 0) {
  //         const newIndex = index;
  //         this.props.set_tabs(tabs, newIndex);
  //         this.changeRoute(tabs, "update endpoint");
  //       } else {
  //         const newTabId = shortId.generate();
  //         tabs = [...tabs, { id: newTabId, type: "endpoint", isSaved: false }];

  //         this.props.set_tabs(tabs, tabs.length - 1);
  //         this.props.history.push({
  //           pathname: `/dashboard/endpoint/new`
  //         });
  //       }
  //     }
  //   } else {
  //     if (index < this.props.default_tab_index) {
  //       this.props.set_tabs(tabs, this.props.default_tab_index - 1);
  //     } else this.props.set_tabs(tabs);
  //   }
  // }

  // changeRoute(tab, title) {
  //   if (tab.isSaved) {
  //     this.props.history.push({
  //       pathname: `/dashboard/${tab.type}/${tab.id}`,
  //       title
  //     });
  //   } else {
  //     this.props.history.push({
  //       pathname: `/dashboard/${tab.type}/new`
  //     });
  //   }
  // }

  handleDelete(endpoint) {
    const index = this.props.tabs.findIndex((t) => t.id === endpoint.id);
    this.props.deleteEndpoint(endpoint);
    if (index >= 0) {
      tabService.closeTab({ ...this.props }, index);
    }
  }

  handleDuplicate(endpoint) {
    this.props.duplicateEndpoint(endpoint);
    this.props.history.push({
      pathname: "/dashboard",
    });
  }

  handleUpdate(endpoint) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${this.props.version_id}/groups/${this.props.group_id}/endpoint/${endpoint.id}/edit`,
      editEndpoint: endpoint,
    });
  }

  openDeleteModal(endpointId) {
    this.setState({
      showDeleteModal: true,
      selectedEndpoint: {
        ...this.props.endpoints[endpointId],
      },
    });
  }

  closeDeleteEndpointModal() {
    this.setState({ showDeleteModal: false });
  }
  getCurrentUserRole(collectionId) {
    const teamId = this.props.collections[collectionId].teamId;
    if (teamId !== undefined) return this.props.teams[teamId].role;
  }

  checkAccess(collectionId) {
    const role = this.getCurrentUserRole(collectionId);
    if (role === "Admin" || role === "Owner") return true;
    else return false;
  }

  async handlePublicEndpointState(endpoint) {
    const role = this.getCurrentUserRole(this.props.collection_id);
    if (endpoint.state === "Draft") {
      if (role === "Owner" || role === "Admin") {
        this.props.approveEndpoint(endpoint);
      } else {
        this.props.pendingEndpoint(endpoint);
      }
    }
  }

  async handleCancelRequest(endpoint) {
    this.props.draftEndpoint(endpoint);
  }
  async handleApproveRequest(endpoint) {
    this.props.approveEndpoint(endpoint);
  }
  async handleRejectRequest(endpoint) {
    this.props.rejectEndpoint(endpoint);
  }

  handleDisplay(endpoint, groupId, collectionId) {
    if (isDashboardRoute(this.props)) {
      this.props.history.push({
        pathname: `/dashboard/endpoint/${endpoint.id}`,
        title: "update endpoint",
        endpoint: endpoint,
        groupId: groupId,
      });
    } else {
      this.props.history.push({
        pathname: `/public/${collectionId}/endpoints/${endpoint.id}`,
        title: "update endpoint",
        endpoint: endpoint,
        groupId: groupId,
      });
    }
  }

  render() {
    if (isDashboardRoute(this.props)) {
      return (
        <React.Fragment>
          {/* <div>
          {this.state.showDeleteModal &&
            endpointService.showDeleteEndpointModal(
              this.props,
              this.handleDelete.bind(this),
              this.closeDeleteEndpointModal.bind(this),
              "Delete Endpoint",
              "Are you sure you wish to delete this endpoint? ",
              this.state.selectedEndpoint
            )}
        </div> */}
          {Object.keys(this.props.endpoints).length !== 0 &&
            this.props.endpoints_order
              .filter(
                (eId) =>
                  this.props.endpoints[eId].groupId === this.props.group_id
              )
              .map((endpointId) => (
                <div className="endpoint-list-item" key={endpointId}>
                  <div className={this.props.endpoints[endpointId].state}></div>
                  <button
                    className="btn "
                    draggable
                    onDragOver={(e) => this.onDragOver(e, endpointId)}
                    onDragStart={(e) => this.onDragStart(e, endpointId)}
                    onDrop={(e) => this.onDrop(e)}
                    onClick={() =>
                      this.handleDisplay(
                        this.props.endpoints[endpointId],
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
                      {this.props.endpoints[endpointId].state === "Draft" ? (
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            this.handlePublicEndpointState(
                              this.props.endpoints[endpointId]
                            )
                          }
                        >
                          Make Public
                        </button>
                      ) : null}

                      {!this.checkAccess(this.props.collection_id) &&
                      this.props.endpoints[endpointId].state === "Pending" ? (
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            this.handleCancelRequest(
                              this.props.endpoints[endpointId]
                            )
                          }
                        >
                          Cancel Request
                        </button>
                      ) : null}

                      {this.checkAccess(this.props.collection_id) &&
                      (this.props.endpoints[endpointId].state === "Approved" ||
                        this.props.endpoints[endpointId].state === "Reject") ? (
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            this.handleCancelRequest(
                              this.props.endpoints[endpointId]
                            )
                          }
                        >
                          Move to Draft
                        </button>
                      ) : null}
                      {this.checkAccess(this.props.collection_id) &&
                      this.props.endpoints[endpointId].state === "Pending" ? (
                        <div>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              this.handleApproveRequest(
                                this.props.endpoints[endpointId]
                              )
                            }
                          >
                            Approve Request
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              this.handleRejectRequest(
                                this.props.endpoints[endpointId]
                              )
                            }
                          >
                            Reject Request
                          </button>
                        </div>
                      ) : null}
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
                (eId) =>
                  this.props.endpoints[eId].groupId === this.props.group_id
              )
              .map((endpointId) => (
                <div className="endpoint-list-item">
                  <button
                    className="btn "
                    onClick={() =>
                      this.handleDisplay(
                        this.props.endpoints[endpointId],
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
