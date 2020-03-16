import React, { Component } from "react";
import { connect } from "react-redux";

import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import { deletePage, duplicatePage } from "./pagesActions";

const mapStateToProps = state => {
  return {
    pages: state.pages
  };
};
const mapDispatchToProps = dispatch => {
  return {
    deletePage: page => dispatch(deletePage(page)),
    duplicatePage: page => dispatch(duplicatePage(page))
  };
};

class GroupPages extends Component {
  state = {};

  async handleDelete(page) {
    this.props.deletePage(page);
    this.props.history.push({
      pathname: "/dashboard"
    });
  }

  handleUpdate(page) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${this.props.versionId}/pages/${page.id}/edit`,
      editPage: page
    });
  }

  handleDisplay(page) {
    this.props.history.push({
      pathname: `/dashboard/pages/${page.id}`,
      page: page
    });
  }

  handleDuplicate(page) {
    this.props.duplicatePage(page);
    this.props.history.push({
      pathname: "/dashboard"
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
                this.props.pages[pageId].groupId === this.props.group_id
            )

            .map(pageId => (
              <Accordion defaultActiveKey="1" key={pageId}>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle
                      as={Button}
                      onClick={() => {
                        const page = this.props.pages[pageId];
                        this.handleDisplay(page);
                      }}
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
                            this.handleDelete(pageId);
                        }}
                      >
                        Delete
                      </Dropdown.Item>

                      <Dropdown.Item
                        eventKey="2"
                        onClick={() => {
                          this.handleDuplicate(this.props.pages[pageId]);
                        }}
                      >
                        Duplicate
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

export default connect(mapStateToProps, mapDispatchToProps)(GroupPages);
