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
  render() {
    console.log(this.props);
    return (
      <div>
        {this.props.endpoints.map(endpoint => (
          <Accordion defaultActiveKey="1">
            <Card>
              <Card.Header>
                <Accordion.Toggle
                  // onClick={() => this.handleDisplay(page)}
                  as={Button}
                  variant="link"
                  eventKey="1"
                >
                  {endpoint}
                </Accordion.Toggle>
                <DropdownButton
                  alignRight
                  title=""
                  id="dropdown-menu-align-right"
                  style={{ float: "right" }}
                >
                  <Dropdown.Item
                    eventKey="1"
                    // onClick={() => this.handleUpdate(page)}
                  >
                    Edit
                  </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="2"
                    //   onClick={() => this.handleDelete(page)}
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
