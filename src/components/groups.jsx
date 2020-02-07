import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import GroupPages from "./groupPages";
import Endpoints from "./endpoints";

class Groups extends Component {
  state = {};

  handleDelete(group) {
    this.props.history.push({
      pathname: "/dashboard/collections",
      deletedGroupId: group.id
    });
  }

  handleUpdate(group) {
    this.props.history.push({
      pathname: `/dashboard/collections/${this.props.collectionId}/versions/${this.props.versionId}/groups/${group.id}/edit`,
      editGroup: group
    });
  }

  handleAddPage(groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId
    });
  }

  handleAddEndpoint(groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/groups/${groupId}/endpoints/new`,
      groupId: groupId
    });
  }

  render() {
    return (
      <div>
        {this.props.groups
          .filter(g => g.versionId === this.props.versionId)
          .map(group => (
            <Accordion defaultActiveKey="0" key={group.id}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey="1">
                    {group.name}
                  </Accordion.Toggle>
                  <DropdownButton
                    alignRight
                    title=""
                    id="dropdown-menu-align-right"
                    style={{ float: "right" }}
                  >
                    <Dropdown.Item
                      eventKey="1"
                      onClick={() => this.handleUpdate(group)}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="2"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you wish to delete this group? " +
                              "\n" +
                              "All your pages and endpoints present in this group will be deleted."
                          )
                        )
                          this.handleDelete(group);
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() =>
                        this.handleAddPage(
                          group.id,
                          group.versionId,
                          this.props.collectionId
                        )
                      }
                    >
                      Add Page
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() =>
                        this.handleAddEndpoint(
                          group.id,
                          group.versionId,
                          this.props.collectionId
                        )
                      }
                    >
                      Add Endpoint
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <GroupPages
                      {...this.props}
                      versionId={group.versionId}
                      pages={this.props.pages}
                      groupId={group.id}
                      title={"Group Pages"}
                    />
                  </Card.Body>
                </Accordion.Collapse>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <Endpoints
                      {...this.props}
                      endpoints={this.props.endpoints}
                    />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          ))}
      </div>
    );
  }
}

export default Groups;
