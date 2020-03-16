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
class Pages extends Component {
  state = {};

  onDragStart = (e, pageId) => {
    this.draggedItem = pageId;
  };

  onDragOver = (e, pageId) => {
    e.preventDefault();
    this.draggedOverItem = pageId;
  };

  async onDragEnd(e) {
    if (this.draggedItem === this.draggedOverItem) {
      return;
    }
    let pageIds = this.props.page_ids.filter(item => item !== this.draggedItem);
    const index = this.props.page_ids.findIndex(
      vId => vId === this.draggedOverItem
    );
    pageIds.splice(index, 0, this.draggedItem);
    this.props.set_page_id(pageIds);
  }

  handleDelete(page) {
    this.props.deletePage(page);
    this.props.history.push({
      pathname: "/dashboard"
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
                this.props.pages[pageId].groupId === null
            )
            .map(pageId => (
              <Accordion
                defaultActiveKey="1"
                key={pageId}
                draggable
                onDragOver={e => this.onDragOver(e, pageId)}
                onDragStart={e => this.onDragStart(e, pageId)}
                onDragEnd={e => this.onDragEnd(e, pageId)}
              >
                <Card>
                  <Card.Header
                    draggable
                    onDragOver={e => this.onDragOver(e, pageId)}
                    onDragStart={e => this.onDragStart(e, pageId)}
                    onDragEnd={e => this.onDragEnd(e, pageId)}
                  >
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
                            this.handleDelete(this.props.pages[pageId]);
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
                </Card>
              </Accordion>
            ))}
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Pages);
