import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import CollectionVersionForm from "../collectionVersions/collectionVersionForm";
import {
  deleteVersion,
  duplicateVersion
} from "../collectionVersions/redux/collectionVersionsActions";
import ShareVersionForm from "../collectionVersions/shareVersionForm";
import GroupForm from "../groups/groupForm";
import Groups from "../groups/groups";
import PageForm from "../pages/pageForm";
import VersionPages from "../pages/versionPages";

import { Accordion, Card, Button } from "react-bootstrap";

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
    });
  }

  showAddVersionPageForm() {
    return (
      this.state.showVersionForm.addPage && (
        <PageForm
          {...this.props}
          show={this.state.showVersionForm.addPage}
          onHide={() => this.closeVersionForm()}
          title={this.state.versionFormName}
          selectedVersion={this.state.selectedVersion}
        />
      )
    );
  }
  openShareVersionForm(version) {
    let showVersionForm = { share: true };
    this.setState({
      showVersionForm,
      versionFormName: "Share Version",
      selectedVersion: version
    });
  }
  openAddVersionPageForm(version) {
    let showVersionForm = { addPage: true };
    this.setState({
      showVersionForm,
      versionFormName: "Add New Version Page",
      selectedVersion: version
    });
  }
  openAddGroupForm(version) {
    let showVersionForm = { addGroup: true };
    this.setState({
      showVersionForm,
      versionFormName: "Add new Group",
      selectedVersion: version
    });
  }
  openEditVersionForm(version) {
    this.setState({
      showCollectionForm: true,
      selectedVersion: version
    });
  }
  showShareVersionForm() {
    return (
      this.state.showVersionForm.share && (
        <ShareVersionForm
          show={this.state.showVersionForm.share}
          onHide={() => this.closeVersionForm()}
          title={this.state.versionFormName}
          selectedVersion={this.state.selectedVersion}
        />
      )
    );
  }
  showAddGroupForm() {
    return (
      this.state.showVersionForm.addGroup && (
        <GroupForm
          show={this.state.showVersionForm.addGroup}
          onHide={() => this.closeVersionForm()}
          title={this.state.versionFormName}
          selectedVersion={this.state.selectedVersion}
        />
      )
    );
  }
  showEditVersionForm() {
    return (
      this.state.showCollectionForm && (
        <CollectionVersionForm
          {...this.props}
          show={true}
          onHide={() => {
            this.setState({ showCollectionForm: false });
          }}
          title="Edit Collection Version"
          selected_version={this.state.selectedVersion}
        />
      )
    );
  }

  closeVersionForm() {
    let showVersionForm = { share: false, addGroup: false, addPage: false };
    this.setState({ showVersionForm });
  }
  render() {
    return (
      <div>
        {this.showShareVersionForm()}
        {this.showAddGroupForm()}
        {this.showEditVersionForm()}
        {this.showAddVersionPageForm()}
        {this.props.versions &&
          Object.keys(this.props.versions) &&
          Object.keys(this.props.versions)
            .filter(
              versionId =>
                this.props.versions[versionId].collectionId ===
                this.props.collection_id
            )
            .map((versionId, index) => (
              <Accordion key={versionId}>
                <Card>
                  <Card.Header>
                    <i
                      className="fas fa-folder-open"
                      style={{ margin: "5px" }}
                    ></i>
                    <Accordion.Toggle
                      as={Button}
                      variant="default"
                      eventKey="1"
                    >
                      {this.props.versions[versionId].number}
                    </Accordion.Toggle>
                    <div className="btn-group">
                      <button
                        className="btn btn-secondary "
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                      <div className="dropdown-menu dropdown-menu-right">
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            this.openEditVersionForm(
                              this.props.versions[versionId]
                            )
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            this.handleDelete(this.props.versions[versionId])
                          }
                        >
                          Delete
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            this.openAddGroupForm(
                              this.props.versions[versionId]
                            )
                          }
                        >
                          Add Group
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            this.handleDuplicate(
                              this.props.versions[versionId]
                            );
                          }}
                        >
                          Duplicate
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            this.openAddVersionPageForm(
                              this.props.versions[versionId]
                            )
                          }
                        >
                          Add Page
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            this.openShareVersionForm(
                              this.props.versions[versionId]
                            )
                          }
                        >
                          Share
                        </button>
                      </div>
                    </div>
                    {/* </div> */}
                  </Card.Header>
                  <Accordion.Collapse eventKey="1">
                    <Card.Body>
                      <VersionPages {...this.props} version_id={versionId} />
                      <Groups {...this.props} version_id={versionId} />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            ))}
      </div>
      // </div>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CollectionVersions)
);
