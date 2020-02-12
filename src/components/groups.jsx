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

  handleAddPage(groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId
    });
  }

  handleAddEndpoint(groupId, versionId, collectionId, versions, groups) {
    this.props.history.push({
      pathname: `/dashboard/collections/endpoints`,
      versions: versions,
      groups: groups,
      groupId: groupId,
      title: "Add New Endpoint"
    });
  }

  render() {
    return (
      <div>
        {Object.keys(this.props.groups)
          .filter(
            gId => this.props.groups[gId].versionId === this.props.version_id
          )
          .map(groupId => (
            <Accordion defaultActiveKey="0" key={groupId}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey="1">
                    {this.props.groups[groupId].name}
                  </Accordion.Toggle>
                  <DropdownButton
                    alignRight
                    title=""
                    id="dropdown-menu-align-right"
                    style={{ float: "right" }}
                  >
                    <Dropdown.Item
                      eventKey="1"
                      onClick={() => {
                        this.props.history.push({
                          pathname: `/dashboard/collections/${this.props.collection_id}/versions/${this.props.version_id}/groups/${groupId}/edit`,
                          editGroup: this.props.groups[groupId]
                        });
                      }}
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
                          this.props.history.push({
                            pathname: "/dashboard/collections",
                            deletedGroupId: groupId
                          });
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() =>
                        this.handleAddPage(
                          groupId,
                          this.props.groups[groupId].versionId,
                          this.props.collection_id
                        )
                      }
                    >
                      Add Page
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() =>
                        this.handleAddEndpoint(
                          groupId,
                          this.props.groups[groupId].versionId,
                          this.props.collection_id,
                          this.props.versions,
                          this.props.groups
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
                      version_id={this.props.groups[groupId].versionId}
                      group_id={parseInt(groupId)}
                    />
                  </Card.Body>
                </Accordion.Collapse>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
<<<<<<< HEAD
                    <Endpoints {...this.props} group_id={parseInt(groupId)} />
=======
                    <Endpoints
                      {...this.props}
                      group_id={parseInt(groupId)}
                    />
>>>>>>> cf44bff257b5f06ae42e2815c4c82e1d7656576d
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
