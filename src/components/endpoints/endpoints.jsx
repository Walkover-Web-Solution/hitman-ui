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
    delete_endpoint: (endpoint) => dispatch(deleteEndpoint(endpoint)),
    duplicate_endpoint: (endpoint) => dispatch(duplicateEndpoint(endpoint)),
    set_endpoint_ids: (endpointsOrder, groupId) =>
      dispatch(setEndpointIds(endpointsOrder, groupId)),
    pending_endpoint: (endpoint) => dispatch(pendingEndpoint(endpoint)),
    approve_endpoint: (endpoint) => dispatch(approveEndpoint(endpoint)),
    draft_endpoint: (endpoint) => dispatch(draftEndpoint(endpoint)),
    reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab)),
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

  sequencingOnFilter() {
    let filteredEndpointKeys = this.filteredEndpoints ? Object.keys(this.filteredEndpoints) : [];
    this.filteredEndpointsOrder = [];
    for (let i = 0; i < this.props.endpoints_order.length; i++) {
      for (let j = 0; j < filteredEndpointKeys.length; j++) {
        if (this.props.endpoints_order[i] === filteredEndpointKeys[j]) {
          this.filteredEndpointsOrder.push(this.props.endpoints_order[i]);
          break;
        }
      }
    }
  }
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
      this.props.set_endpoint_ids(endpointIds, this.props.group_id);
      this.draggedItem = null;
    }
  };

  handleDelete(endpoint) {
    this.props.delete_endpoint(endpoint);
    if (this.props.tabs.tabs[endpoint.id]) {
      tabService.removeTab(endpoint.id, { ...this.props });
    }
  }

  handleDuplicate(endpoint) {
    this.props.duplicate_endpoint(endpoint);
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
        this.props.pending_endpoint(endpoint);
      }
    }
  }

  async handleCancelRequest(endpoint) {
    this.props.draft_endpoint(endpoint);
  }
  async handleApproveRequest(endpoint) {
    this.props.approve_endpoint(endpoint);
  }
  async handleRejectRequest(endpoint) {
    this.props.reject_endpoint(endpoint);
  }

  handleDisplay(endpoint, groupId, collectionId, previewMode) {
    if (isDashboardRoute(this.props)) {
      if (!this.props.tabs.tabs[endpoint.id]) {
        const previewTabId = Object.keys(this.props.tabs.tabs).filter(
          (tabId) => this.props.tabs.tabs[tabId].previewMode === true
        )[0];
        if (previewTabId) this.props.close_tab(previewTabId);
        this.props.open_in_new_tab({
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
        Environment: "publicCollectionEnvironment",
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
      let groupIdsAndFilteredEndpoints = [];
      groupIdsAndFilteredEndpoints = filterService.filter(
        this.props.endpoints,
        this.props.filter,
        "endpoints"
      );
      this.filteredEndpoints = groupIdsAndFilteredEndpoints[0];
      groupIds = groupIdsAndFilteredEndpoints[1];
      this.setState({ filter: this.props.filter });
      if (groupIds.length !== 0) {
        this.props.show_filter_groups(groupIds, "endpoints");
      } else {
        this.props.show_filter_groups(null, "endpoints");
      }
    }
  }

  render() {
    console.log('ENDPOINTS this.props', this.props);
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false;
    }
    if (this.props.filter === "") {
      this.filteredEndpoints = { ...this.props.endpoints };
      this.filteredEndpointsOrder = [...this.props.endpoints_order];
    }

    if (isDashboardRoute(this.props)) {
      return (
        <React.Fragment>
          {this.filterEndpoints()}
          {this.sequencingOnFilter()}
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
          {this.filteredEndpoints && Object.keys(this.filteredEndpoints) && Object.keys(this.filteredEndpoints).length !== 0 &&
            this.filteredEndpointsOrder
              .filter(
                (eId) =>
                  this.props.endpoints[eId].groupId === this.props.group_id
              )
              .map((endpointId) => (
                <div className="sidebar-accordion" key={endpointId}>
                  <div className={this.props.endpoints[endpointId].state}></div>
                  <button
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
                    <div className="sidebar-accordion-item">
                      <div
                        className={`api-label ${this.props.endpoints[endpointId].requestType}`}
                        >
                        <div className="endpoint-request-div">
                          {this.props.endpoints[endpointId].requestType}
                        </div>
                      </div>
                      {this.props.endpoints[endpointId].name}
                    </div>
                    <div className="sidebar-item-action">
                      <div
                        className="sidebar-item-action-btn"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="uil uil-ellipsis-v"></i>
                      </div>
                      <div className="dropdown-menu dropdown-menu-right">
                        <a
                          className="dropdown-item"
                          onClick={() =>
                            this.handleDelete(this.props.endpoints[endpointId])
                          }
                        >
                          Delete
                        </a>
                        <a
                          className="dropdown-item"
                          onClick={() =>
                            this.handleDuplicate(this.props.endpoints[endpointId])
                          }
                        >
                          Duplicate
                        </a>
                        {this.props.endpoints[endpointId].state === "Draft" ? (
                          <a
                            className="dropdown-item"
                            onClick={() =>
                              this.handlePublicEndpointState(
                                this.props.endpoints[endpointId]
                              )
                            }
                          >
                            Make Public
                          </a>
                        ) : null}

                        {!this.checkAccess(this.props.collection_id) &&
                        this.props.endpoints[endpointId].state === "Pending" ? (
                          <a
                            className="dropdown-item"
                            onClick={() =>
                              this.handleCancelRequest(
                                this.props.endpoints[endpointId]
                              )
                            }
                          >
                            Cancel Request
                          </a>
                        ) : null}

                        {this.checkAccess(this.props.collection_id) &&
                        (this.props.endpoints[endpointId].state === "Approved" ||
                          this.props.endpoints[endpointId].state === "Reject") ? (
                          <a
                            className="dropdown-item"
                            onClick={() =>
                              this.handleCancelRequest(
                                this.props.endpoints[endpointId]
                              )
                            }
                          >
                            Move to Draft
                          </a>
                        ) : null}
                        {this.checkAccess(this.props.collection_id) &&
                        this.props.endpoints[endpointId].state === "Pending" ? (
                          <div>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                this.handleApproveRequest(
                                  this.props.endpoints[endpointId]
                                )
                              }
                            >
                              Approve Request
                            </a>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                this.handleRejectRequest(
                                  this.props.endpoints[endpointId]
                                )
                              }
                            >
                              Reject Request
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {Object.keys(this.props.endpoints).length !== 0 &&
            this.props.endpoints_order
              .filter(
                (eId) =>
                  this.props.endpoints[eId].groupId === this.props.group_id
              )
              .map((endpointId) => (
                <div className="hm-sidebar-item" key={endpointId} onClick={() =>
                  this.handleDisplay(
                    this.props.endpoints[endpointId],
                    this.props.group_id,
                    this.props.collection_id
                  )
                }>
                  <div className={`api-label ${this.props.endpoints[endpointId].requestType}`}>
                    <div className="endpoint-request-div">
                      {this.props.endpoints[endpointId].requestType}
                    </div>
                  </div>
                  <div className="endpoint-name-div">
                    {this.props.endpoints[endpointId].name}
                  </div>
                </div>
              ))}
        </React.Fragment>
      );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Endpoints);
