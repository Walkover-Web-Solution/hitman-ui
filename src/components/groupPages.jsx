import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";

class GroupPages extends Component {
  state = {};

  async handleDelete(page) {
    this.props.history.push({
      pathname: "/dashboard/collections",
      deletePageId: page.id
    });
  }

  handleUpdate(page) {
    this.props.history.push({
      pathname: `/dashboard/collections/${this.props.collection_id}/versions/${this.props.versionId}/pages/${page.id}/edit`,
      editPage: page
    });
  }

  handleDisplay(page) {
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${page.id}`,
      page: page
    });
  }

  render() {
    return (
      <div>
        {this.props.pages &&
          this.props.pages
            .filter(
              page =>
                page.versionId === this.props.versionId &&
                page.groupId === this.props.groupId
            )

            .map((page, index) => (
              <Accordion defaultActiveKey="0" key={page.id}>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle
                      as={Button}
                      onClick={() => this.handleDisplay(page)}
                      variant="link"
                      eventKey="1"
                    >
                      {page.name}
                    </Accordion.Toggle>
                    <DropdownButton
                      alignRight
                      title=""
                      id="dropdown-menu-align-right"
                      style={{ float: "right" }}
                    >
                      <Dropdown.Item
                        eventKey="2"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you wish to delete this item?"
                            )
                          )
                            this.handleDelete(page);
                        }}
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

export default GroupPages;
