import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";

class Pages extends Component {
  state = {};

  async handleDelete (page) {
    this.props.history.push({
      pathname: "/dashboard/collections",
      deletePageId: page.id
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
          Object.keys(this.props.pages)
            .filter(
              pageId =>
                this.props.pages[pageId].versionId === this.props.version_id &&
                this.props.pages[pageId].groupId === null
            )

            .map(pageId => (
              <Accordion defaultActiveKey='1' key={pageId}>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle
                      onClick={() =>
                        this.handleDisplay(this.props.pages[pageId])
                      }
                      as={Button}
                      variant="link"
                      eventKey="1"
                    >
                      {this.props.pages[pageId].name}
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
                            this.handleDelete(this.props.pages[pageId])
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

export default Pages;
