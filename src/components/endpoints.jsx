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

  handleDisplay(endpoint) {
    this.props.history.push({
      pathname: `/dashboard/collections/endpoints/${endpoint.id}`,
      endpoint: endpoint
    });
  }
  state = {};
  render() {
    return (
      <div>
        {this.props.endpoints.map(endpoint => (
          <Accordion defaultActiveKey="1">
            <Card>
              <Card.Header>
                <Accordion.Toggle
                  onClick={() => this.handleDisplay(endpoint)}
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
