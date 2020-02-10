import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";

class Endpoints extends Component {
  handleDelete(endpoint) {
    this.props.history.push({
      pathname: "/dashboard/collections",
      deleteEndpointId: endpoint.id
    });
  }
  handleUpdate(endpoint) {
    console.log("dfg");
    this.props.history.push({
      pathname: `/dashboard/collections/${this.props.collectionId}/versions/${this.props.versionId}/groups/${this.props.groupId}/endpoints/${endpoint.id}/edit`,
      editEndpoint: endpoint
    });
  }
  handleDisplay(endpoint, groups, versions) {
    this.props.history.push({
      pathname: `/dashboard/collections/endpoints/${endpoint.id}`,
      endpoint: endpoint,
      groups: groups,
      versions: versions
    });
  }
  state = {};
  render() {
    return (
      <div>
        {this.props.endpoints
          .filter(endpoint => endpoint.groupId === this.props.groupId)
          .map(endpoint => (
            <Accordion defaultActiveKey="1">
              <Card>
                <Card.Header>
                  <Accordion.Toggle
                    onClick={() =>
                      this.handleDisplay(
                        endpoint,
                        this.props.groups,
                        this.props.versions
                      )
                    }
                    as={Button}
                    variant="link"
                    eventKey="1"
                  >
                    {endpoint.name}
                  </Accordion.Toggle>
                  <DropdownButton
                    alignRight
                    title=""
                    id="dropdown-menu-align-right"
                    style={{ float: "right" }}
                  >
                    {/* <Dropdown.Item
                      eventKey="1"
                      onClick={() => this.handleUpdate(endpoint)}
                    >
                      Edit
                    </Dropdown.Item> */}
                    <Dropdown.Item
                      eventKey="2"
                      onClick={() => this.handleDelete(endpoint)}
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
