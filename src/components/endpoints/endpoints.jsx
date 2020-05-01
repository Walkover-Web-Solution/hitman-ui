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
import { closeTab, openInNewTab } from "../tabs/redux/tabsActions";
import tabService from "../tabs/tabService";
import tabStatusTypes from "../tabs/tabStatusTypes";
import "./endpoints.scss";
import { deleteEndpoint, duplicateEndpoint } from "./redux/endpointsActions";
import filterService from "../../services/filterService";

const mapStateToProps = (state) => {
  return {
    endpoints: state.endpoints,
    groups: state.groups,
    tabs: state.tabs,
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
    closeTab: (tabId) => dispatch(closeTab(tabId)),
    openInNewTab: (tab) => dispatch(openInNewTab(tab)),
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

  onDragOver = (e) => {
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

  handleDelete(endpoint) {
    this.props.deleteEndpoint(endpoint);
    if (this.props.tabs.tabs[endpoint.id]) {
      tabService.removeTab(endpoint.id, { ...this.props });
    }
  }

  handleDuplicate(endpoint) {
    this.props.duplicateEndpoint(endpoint);
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
    if (
      this.props.teams !== undefined &&
      teamId !== undefined &&
      this.props.teams[teamId] !== undefined
    )
      return this.props.teams[teamId].role;
  }

  checkAccess(collectionId) {
    const role = this.getCurrentUserRole(collectionId);
    if (role === "Admin" || role === "Owner") return true;
    else return false;
  }

  async handlePublicEndpointState(endpoint) {
    if (endpoint.state === "Draft") {
      if (this.checkAccess(this.props.collection_id)) {
        this.handleApproveRequest(endpoint);
      } else {
        this.props.pendingEndpoint(endpoint);
      }
    }
  }

  async handleCancelRequest(endpoint) {
    this.props.draftEndpoint(endpoint);
  }
  async handleApproveRequest(endpoint) {
    // if (
    //   endpoint.body.type === "JSON" &&
    //   Object.keys(endpoint.bodyDescription).length === 0
    // ) {
    //   let { value } = endpoint.body;
    //   let body = JSON.parse(value);
    //   let bodyDescription = this.generateBodyDescription(body);
    //   endpoint.bodyDescription = bodyDescription;
    // }
    this.props.approveEndpoint(endpoint);
  }
  async handleRejectRequest(endpoint) {
    this.props.rejectEndpoint(endpoint);
  }

  // generateBodyDescription(body) {
  //   let bodyDescription = null;
  //   if (Array.isArray(body)) bodyDescription = [];
  //   else bodyDescription = {};

  //   const keys = Object.keys(body);
  //   for (let i = 0; i < keys.length; i++) {
  //     const value = body[keys[i]];
  //     if (
  //       typeof value === "string" ||
  //       typeof value === "number" ||
  //       typeof value === "boolean"
  //     ) {
  //       bodyDescription[keys[i]] = {
  //         value,
  //         type: typeof value,
  //         description: null,
  //       };
  //     } else {
  //       if (Array.isArray(value))
  //         bodyDescription[keys[i]] = {
  //           value: this.generateBodyDescription(value),
  //           type: "array",
  //         };
  //       else
  //         bodyDescription[keys[i]] = {
  //           value: this.generateBodyDescription(value),
  //           type: "object",
  //         };
  //     }
  //   }
  //   return bodyDescription;
  // }

  handleDisplay(endpoint, groupId, collectionId, previewMode) {
    if (isDashboardRoute(this.props)) {
      if (!this.props.tabs.tabs[endpoint.id]) {
        const previewTabId = Object.keys(this.props.tabs.tabs).filter(
          (tabId) => this.props.tabs.tabs[tabId].previewMode === true
        )[0];
        if (previewTabId) this.props.closeTab(previewTabId);
        this.props.openInNewTab({
          id: endpoint.id,
          type: "endpoint",
          status: tabStatusTypes.SAVED,
          previewMode,
          isModified: false,
        });
      } else if (
        this.props.tabs.tabs[endpoint.id].previewMode === true &&
        previewMode === false
      ) {
        tabService.disablePreviewMode(endpoint.id);
      }
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

  filterEndpoints() {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== "" &&
      this.filterFlag === false
    ) {
      this.filterFlag = true;
      let groupIds = [];
      groupIds = filterService.filter(
        this.props.endpoints,
        this.props.filter,
        "endpoints"
      );
      this.setState({ filter: this.props.filter });
      if (groupIds.length !== 0) {
        this.props.show_filter_groups(groupIds, "endpoints");
      } else {
        this.props.show_filter_groups(null, "endpoints");
      }
    }
  }

  render() {
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false;
    }
    if (isDashboardRoute(this.props)) {
      return (
        <React.Fragment>
          {this.filterEndpoints()}

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
                    onDragOver={this.onDragOver}
                    onDragStart={(e) => this.onDragStart(e, endpointId)}
                    onDrop={(e) => this.onDrop(e)}
                    onClick={() =>
                      this.handleDisplay(
                        this.props.endpoints[endpointId],
                        this.props.group_id,
                        this.props.collection_id,
                        true
                      )
                    }
                    onDoubleClick={() =>
                      this.handleDisplay(
                        this.props.endpoints[endpointId],
                        this.props.group_id,
                        this.props.collection_id,
                        false
                      )
                    }
                  >
                    <div
                      className={this.props.endpoints[endpointId].requestType}
                    >
                      {this.props.endpoints[endpointId].requestType}
                    </div>

                    <div style={{ width: "100%", textAlign: "left" }}>
                      {this.props.endpoints[endpointId].name}
                    </div>
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
                <div className="endpoint-list-item" key={endpointId}>
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
