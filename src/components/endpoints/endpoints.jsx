import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton,
  Table
} from "react-bootstrap";
import { deleteEndpoint } from "./endpointsActions";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { endpoints: state.endpoints };
};

const mapDispatchToProps = dispatch => {
  return {
    deleteEndpoint: deleteEndpointId =>
      dispatch(deleteEndpoint(deleteEndpointId))
  };
};

class Endpoints extends Component {
  state = {};

  onDragStart = (e, eId) => {
    this.props.group_dnd(false);
    this.draggedItem = eId;
    this.props.set_dnd(eId, this.props.group_id);
  };

  onDragOver = (e, eId) => {
    e.preventDefault();
    this.draggedOverItem = eId;
  };

  async onDragEnd(e, props) {
    this.props.group_dnd(true);
    if (this.draggedItem === this.draggedOverItem) {
      this.draggedItem = null;
      return;
    }
    let endpointIds = this.props.endpoints_order.filter(
      item => item !== this.draggedItem
    );
    const index = this.props.endpoints_order.findIndex(
      eId => eId === this.draggedOverItem
    );
    endpointIds.splice(index, 0, this.draggedItem);
    this.props.set_endpoint_id(this.props.group_id, endpointIds);
    this.draggedItem = null;
  }

  onDrop = e => {
    e.preventDefault();
    if (!this.draggedItem) {
      this.props.get_dnd(this.props.group_id);
    }
  };

  handleDelete(endpoint) {
    this.props.deleteEndpoint(endpoint);
    this.props.history.push({
      pathname: "/dashboard/collections"
    });
  }

  handleDuplicate(endpoint) {
    this.props.history.push({
      pathname: "/dashboard/collections",
      duplicateEndpoint: endpoint
    });
  }

  handleUpdate(endpoint) {
    this.props.history.push({
      pathname: `/dashboard/collections/${this.props.collection_id}/versions/${this.props.version_id}/groups/${this.props.group_id}/endpoints/${endpoint.id}/edit`,
      editEndpoint: endpoint
    });
  }
  handleDisplay(endpoint, groups, versions, groupId) {
    this.props.history.push({
      pathname: `/dashboard/collections/endpoints/${endpoint.id}`,
      title: "update endpoint",
      endpoint: endpoint,
      groupId: groupId,
      groups: groups,
      versions: versions,
      endpointFlag: true
    });
  }
  render() {
    if (this.props.endpoints_order.length == 0) {
      return (
        <Table
          striped
          bordered
          hover
          size="sm"
          onDragOver={e => this.onDragOver(e)}
          onDragStart={e => this.onDragStart(e)}
          onDragEnd={e => this.onDragEnd(e, this.props)}
          onDrop={e => this.onDrop(e)}
        >
          <thead>
            <tr>
              <th>This group is empty</th>
            </tr>
          </thead>
        </Table>
      );
    } else {
      return (
        <div>
          {Object.keys(this.props.endpoints)
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
                    onDragEnd={e => this.onDragEnd(e, endpointId, this.props)}
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
}

export default connect(mapStateToProps, mapDispatchToProps)(Endpoints);
