import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import { deleteEndpoint, duplicateEndpoint } from "./endpointsActions";
import { connect } from "react-redux";
import { setEndpointIds } from "../groups/groupsActions";

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
  handleDisplay(endpoint, groups, versions, groupId) {
    this.props.history.push({
      pathname: `/dashboard/endpoints/${endpoint.id}`,
      title: "update endpoint",
      endpoint: endpoint,
      groupId: groupId,
      groups: groups,
      versions: versions,
      endpointFlag: true
    });
  }
  render() {
    return (
      <div>
        {Object.keys(this.props.endpoints).length !== 0 &&
          this.props.endpoints_order
            .filter(
              eId => this.props.endpoints[eId].groupId === this.props.group_id
            )
            .map(endpointId => (
              <Accordion defaultActiveKey="1" key={endpointId}>
                <Card>
                  <Card.Header
                    draggable
                    onDragOver={e => this.onDragOver(e, endpointId)}
                    onDragStart={e => this.onDragStart(e, endpointId)}
                    onDrop={e => this.onDrop(e)}
                  >
                    <Accordion.Toggle
                      onClick={() =>
                        this.handleDisplay(
                          this.props.endpoints[endpointId],
                          this.props.groups,
                          this.props.versions,
                          this.props.group_id
                        )
                      }
                      as={Button}
                      variant="link"
                      eventKey="1"
                    >
                      {this.props.endpoints[endpointId].name}
                    </Accordion.Toggle>
                    <DropdownButton
                      alignRight
                      title=""
                      id="dropdown-menu-align-right"
                      style={{ float: "right" }}
                    >
                      <Dropdown.Item
                        eventKey="2"
                        onClick={() =>
                          this.handleDelete(this.props.endpoints[endpointId])
                        }
                      >
                        Delete
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="3"
                        onClick={() =>
                          this.handleDuplicate(this.props.endpoints[endpointId])
                        }
                      >
                        Duplicate
                      </Dropdown.Item>
                    </DropdownButton>
                  </Card.Header>
                </Card>
              </Accordion>
            ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Endpoints);
