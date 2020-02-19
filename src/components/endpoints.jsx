import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";

class Endpoints extends Component {
  state = {};

  onDragStart = (e, eId) => {
    this.props.group_dnd(false);
    this.draggedItem = eId;
  };

  onDragOver = (e, eId) => {
    e.preventDefault();
    this.draggedOverItem = eId;
  };

  async onDragEnd(e, props) {
    this.props.version_dnd(true);
    if (this.draggedItem === this.draggedOverItem) {
      return;
    }
    let endpointIds = this.props.endpoint_ids.filter(
      item => item !== this.draggedItem
    );
    const index = this.props.endpoint_ids.findIndex(
      eId => eId === this.draggedOverItem
    );
    endpointIds.splice(index, 0, this.draggedItem);
    this.props.set_endpoint_id(endpointIds);
  }
  handleDelete(endpoint) {
    this.props.history.push({
      pathname: "/dashboard/collections",
      deleteEndpointId: endpoint.id
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
      endpointFlag: true,
      getEnvironment: this.props.get_environment
    });
  }
  render() {
    return (
      <div>
        {this.props.endpoints &&
          this.props.endpoint_ids
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
                    </DropdownButton>
                  </Card.Header>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body></Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            ))}
      </div>
    );
  }
}

export default Endpoints;
