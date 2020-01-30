import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import Groups from "./groups";

class CollectionVersions extends Component {
  state = {};

  async handleDelete(collectionVersion) {
    this.props.history.push({
      pathname: "/collections",
      deletedCollectionVersionId: collectionVersion.id
    });
  }

  handleUpdate(collectionVersion) {
    this.props.history.push({
      pathname: `/collections/${this.props.collectionId}/versions/${collectionVersion.number}/edit`,
      editCollectionVersion: collectionVersion
    });
  }

  handleAddGroup(versionId, collectionId) {
    this.props.history.push({
      pathname: `/collections/${collectionId}/versions/${versionId}/groups/new`,
      versionId: versionId
    });
  }

  render() {
    return (
      <div>
        {this.props.versions &&
          this.props.versions
            .filter(version => version.collectionId === this.props.collectionId)
            .map((collectionVersion, index) => (
              <Accordion defaultActiveKey="0" key={collectionVersion.id}>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="1">
                      {collectionVersion.number}
                    </Accordion.Toggle>
                    <DropdownButton
                      alignRight
                      title=""
                      id="dropdown-menu-align-right"
                      style={{ float: "right" }}
                    >
                      <Dropdown.Item
                        eventKey="1"
                        onClick={() => this.handleUpdate(collectionVersion)}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="2"
                        onClick={() => this.handleDelete(collectionVersion)}
                      >
                        Delete
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="3"
                        onClick={() =>
                          this.handleAddGroup(
                            collectionVersion.id,
                            this.props.collectionId
                          )
                        }
                      >
                        Add Group
                      </Dropdown.Item>
                    </DropdownButton>
                  </Card.Header>
                  <Accordion.Collapse eventKey="1">
                    <Card.Body>
                      <Groups
                        {...this.props}
                        versionId={collectionVersion.id}
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
export default CollectionVersions;
