import React, { Component } from "react";
import { connect } from "react-redux";

import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";

const mapStateToProps = state => {
  return {
    pages: state.pages
  };
};
class Pages extends Component {
  state = {};

  onDragStart = (e, pageId) => {
    this.props.version_dnd(false);
    this.draggedItem = pageId;
  };

  onDragOver = (e, pageId) => {
    e.preventDefault();
    this.draggedOverItem = pageId;
  };

  async onDragEnd(e) {
    this.props.version_dnd(true);
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
    this.props.history.push({
      pathname: "/dashboard/collections",
      deletePage: page
    });
  }
  handleDisplay(page) {
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${page.id}`,
      page: page
    });
  }

  handleDuplicate(page) {
    this.props.history.push({
      pathname: "/dashboard/collections",
      duplicatePage: page
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
                      onClick={() =>
                        this.handleDisplay(this.props.pages[pageId])
                      }
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
export default connect(mapStateToProps)(Pages);
