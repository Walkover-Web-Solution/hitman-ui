import React, { Component } from "react";
import { connect } from "react-redux";
import { setEndpointIds } from "../groups/redux/groupsActions";
import { deleteEndpoint, duplicateEndpoint } from "./redux/endpointsActions";
import endpointService from "./endpointService";

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
  state = {};

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
    let tabs = [...this.props.tabs];
    const tab = tabs[this.props.default_tab_index - 1];

    tabs.splice(this.props.default_tab_index, 1);
    const newIndex = this.props.default_tab_index - 1;
    console.log(tabs, newIndex);
    this.props.set_tabs(tabs, newIndex);

    this.props.deleteEndpoint(endpoint);

    if (tab.type === "endpoint") {
      if (tab.isSaved) {
        this.props.history.push({
          pathname: `/dashboard/${tab.type}/${tab.id}`,
          title: "update endpoint"
        });
      } else {
        this.props.history.push({
          pathname: `/dashboard/endpoint/new`
        });
      }
    }
  }

  handleDuplicate(endpoint) {
    this.props.duplicateEndpoint(endpoint);
    this.props.history.push({
      pathname: "/dashboard"
    });
  }

  handleUpdate(endpoint) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${this.props.version_id}/groups/${this.props.group_id}/endpoint/${endpoint.id}/edit`,
      editEndpoint: endpoint
    });
  }
  handleDisplay(endpoint, groups, versions, groupId) {
    this.props.history.push({
      pathname: `/dashboard/endpoint/${endpoint.id}`,
      title: "update endpoint",
      endpoint: endpoint,
      groupId: groupId
    });
  }

  openDeleteModal(endpointId) {
    this.setState({
      showDeleteModal: true,
      selectedEndpoint: {
        ...this.props.endpoints[endpointId]
      }
    });
  }

  closeDeleteEndpointModal() {
    this.setState({ showDeleteModal: false });
  }

  render() {
    console.log(this.props);
    return (
      <React.Fragment>
        <div>
          {this.state.showDeleteModal &&
            endpointService.showDeleteEndpointModal(
              this.props,
              this.closeDeleteEndpointModal.bind(this),
              "Delete Endpoint",
              this.state.selectedEndpoint
            )}
        </div>

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
                      this.props.group_id
                    )
                  }
                >
                  <div className={this.props.endpoints[endpointId].requestType}>
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

                      // onClick={() => {
                      //   this.openDeleteModal(endpointId);
                      // }}
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
                  </div>
                </div>
              </div>
            ))}
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Endpoints);
