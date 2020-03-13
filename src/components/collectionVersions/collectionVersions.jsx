import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import Groups from "../groups/groups";
import VersionPages from "../pages/versionPages";
import { connect } from "react-redux";
import {
  deleteVersion,
  duplicateVersion
} from "../collectionVersions/collectionVersionsActions";
import ShareVersionForm from "../collectionVersions/shareVersionForm";
import GroupForm from "../groups/groupForm";
import { withRouter } from "react-router-dom";
import CollectionVersionForm from "../collectionVersions/collectionVersionForm";

const mapStateToProps = state => {
  return {
    versions: state.versions
  };
};

const mapDispatchToProps = dispatch => {
  return {
    deleteVersion: version => dispatch(deleteVersion(version)),
    duplicateVersion: version => dispatch(duplicateVersion(version))
  };
};

class CollectionVersions extends Component {
  state = {
    showShareVersionForm: false,
    versionFormName: "",
    selectedVersion: {},
    showVersionForm: {
      addGroup: false,
      addPage: false,
      share: false,
      edit: false
    }
  };

  async handleDelete(collectionVersion) {
    const confirm = window.confirm(
      "Are you sure you want to delete this versions? " +
        "\n" +
        "All your groups, pages and endpoints present in this version will be deleted."
    );
    if (confirm) {
      this.props.deleteVersion(collectionVersion);
      this.props.history.push({
        pathname: "/dashboard"
      });
    }
  }
  closeVersionForm() {
    let share = false;
    let addGroup = false;
    let showVersionForm = { share, addGroup };
    this.setState({ showVersionForm });
  }

  handleUpdate(collectionVersion) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${collectionVersion.id}/edit`,
      editCollectionVersion: collectionVersion
    });
  }

  handleAddPage(versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/${collectionId}/versions/${versionId}/pages/new`,
      versionId: versionId
    });
  }

  handleDuplicate(version) {
    this.props.duplicateVersion(version);
    this.props.history.push({
      pathname: "/dashboard"
      // duplicateVersion: version
    });
  }

  handleShare(version) {
    this.handleShareVersion(
      version.shareIdentifier,
      version.collectionId,
      version.id
    );
  }
  handleShareVersion(shareIdentifier, collectionId, versionId) {
    this.props.history.push({
      pathname: `/dashboard/${collectionId}/versions/${versionId}/share`,
      shareIdentifier: shareIdentifier
    });
  }

  closeVersionForm() {
    let share = false;
    let showVersionForm = { share };
    this.setState({ showVersionForm });
  }

  render() {
    return (
      <div>
        {this.state.showVersionForm.share && (
          <ShareVersionForm
            show={this.state.showVersionForm.share}
            onHide={() => this.closeVersionForm()}
            title={this.state.versionFormName}
            selectedVersion={this.state.selectedVersion}
          />
        )}
        {this.state.showVersionForm.addGroup && (
          <GroupForm
            show={this.state.showVersionForm.addGroup}
            onHide={() => this.closeVersionForm()}
            title={this.state.versionFormName}
            selectedVersion={this.state.selectedVersion}
          />
        )}
        {this.state.showCollectionForm && (
          <CollectionVersionForm
            {...this.props}
            show={true}
            onHide={() => {
              this.setState({ showCollectionForm: false });
            }}
            title="Edit Collection Version"
            selected_version={this.state.selectedVersion}
          />
        )}
        {this.props.versions &&
          Object.keys(this.props.versions) &&
          Object.keys(this.props.versions)
            .filter(
              versionId =>
                this.props.versions[versionId].collectionId ===
                this.props.collection_id
            )
            .map(versionId => (
              <Accordion defaultActiveKey="0" key={versionId}>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="1">
                      {this.props.versions[versionId].number}
                    </Accordion.Toggle>
                    <DropdownButton
                      alignRight
                      title=""
                      id="dropdown-menu-align-right"
                      style={{ float: "right" }}
                    >
                      <Dropdown.Item
                        eventKey="1"
                        onClick={() =>
                          this.setState({
                            showCollectionForm: true,
                            selectedVersion: this.props.versions[versionId]
                          })
                        }
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="2"
                        onClick={() =>
                          this.handleDelete(this.props.versions[versionId])
                        }
                      >
                        Delete
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="3"
                        onClick={() => {
                          let addGroup = true;
                          let showVersionForm = { addGroup };
                          this.setState({
                            showVersionForm,
                            versionFormName: "Add new Group",
                            selectedVersion: {
                              ...this.props.versions[versionId]
                            }
                          });
                        }}
                      >
                        Add Group
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="3"
                        onClick={() =>
                          this.handleAddPage(
                            versionId,
                            this.props.collection_id
                          )
                        }
                      >
                        Add Page
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="2"
                        onClick={() => {
                          this.handleDuplicate(this.props.versions[versionId]);
                        }}
                      >
                        Duplicate
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="3"
                        onClick={() => {
                          let share = true;
                          let showVersionForm = { share };
                          this.setState({
                            showVersionForm,
                            versionFormName: "Share Version",
                            selectedVersion: {
                              ...this.props.versions[versionId]
                            }
                          });
                        }}
                      >
                        Share
                      </Dropdown.Item>
                    </DropdownButton>
                  </Card.Header>
                  <Accordion.Collapse eventKey="1">
                    <Card.Body>
                      <Groups {...this.props} version_id={versionId} />
                      <VersionPages {...this.props} version_id={versionId} />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            ))}
      </div>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CollectionVersions)
);
