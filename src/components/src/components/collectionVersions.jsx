import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import Groups from "./groups";
import VersionPages from "./pages";

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

  handleAddPage(versionId, collectionId) {
    this.props.history.push({
      pathname: `/collections/${collectionId}/versions/${versionId}/pages/new`,
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
                      <Dropdown.Item
                        eventKey="3"
                        onClick={() =>
                          this.handleAddPage(
                            collectionVersion.id,
                            this.props.collectionId
                          )
                        }
                      >
                        Add Page
                      </Dropdown.Item>
                    </DropdownButton>
                  </Card.Header>
                  <Accordion.Collapse eventKey="1">
                    <Card.Body>
                      <Groups
                        {...this.props}
                        collectionId={collectionVersion.collectionId}
                        versionId={collectionVersion.id}
                        pages={this.props.pages}
                        endpoints={this.props.endpoints}
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                  <Accordion.Collapse eventKey="1">
                    <Card.Body>
                      <VersionPages
                        {...this.props}
                        versionId={collectionVersion.id}
                        pages={this.props.pages}
                        title={"Version Pages"}
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
