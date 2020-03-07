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
import { deleteVersion } from "../collectionVersions/collectionVersionsActions";
import ShareVersionForm from "../collectionVersions/shareVersionForm";
import GroupForm from "../groups/groupForm";
import { withRouter } from 'react-router-dom';

const mapStateToProps = state => {
  return {
    versions: state.versions
  };
};

const mapDispatchToProps = dispatch => {
  return {
    deleteVersion: version => dispatch(deleteVersion(version))
  };
};

class CollectionVersions extends Component {
  state = {
    versionDnDFlag: true,
    showShareVersionForm:false,
    versionFormName: "",
    selectedVersion: {},
    showVersionForm:{addGroup:false,addPage:false,share:false,edit:false}
    };

  versionDnD(versionDnDFlag) {
    this.setState({ versionDnDFlag });
  }

  onDragStart = (e, versionId) => {
    if (!this.state.versionDnDFlag) return;
    this.props.collection_dnd(false);
    this.draggedItem = versionId;
  };

  onDragOver = (e, versionId) => {
    if (!this.state.versionDnDFlag) return;
    e.preventDefault();
    this.draggedOverItem = versionId;
  };

  async onDragEnd(e) {
    if (!this.state.versionDnDFlag) return;
    this.props.collection_dnd(true);
    if (this.draggedItem === this.draggedOverItem) {
      return;
    }
    let versionIds = this.props.version_ids.filter(
      item => item !== this.draggedItem
    );
    const index = this.props.version_ids.findIndex(
      vId => vId === this.draggedOverItem
    );
    versionIds.splice(index, 0, this.draggedItem);

    this.props.set_version_id(versionIds);
  }

  async handleDelete(collectionVersion) {
    this.props.deleteVersion(collectionVersion);
    this.props.history.push({
      pathname: "/dashboard/collections"
    });
  }
  closeVersionForm() {
    let share=false;
    let addGroup=false
    let showVersionForm={share,addGroup};
    this.setState({ showVersionForm});
    }

  handleUpdate(collectionVersion) {
    this.props.history.push({
      pathname: `/dashboard/collections/${this.props.collection_id}/versions/${collectionVersion.id}/edit`,
      editCollectionVersion: collectionVersion
    });
  }

  handleAddPage(versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/pages/new`,
      versionId: versionId
    });
  }

  handleDuplicate(version) {
    this.props.history.push({
      pathname: "/dashboard/collections",
      duplicateVersion: version
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
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/share`,
      shareIdentifier: shareIdentifier
    });
  }
  closeVersionForm(){
    let share=false;
    let showVersionForm={share};
    this.setState({showVersionForm});
  }

  render() {
    return (
      <div>
         { this.state.showVersionForm.share &&(
              <ShareVersionForm
              show={this.state.showVersionForm.share}
              onHide={() => this.closeVersionForm()}
              title={this.state.versionFormName}
              selectedVersion={this.state.selectedVersion}

              />
            )}
            { this.state.showVersionForm.addGroup &&(
          <GroupForm
          show={this.state.showVersionForm.addGroup}
          onHide={() => this.closeVersionForm()}
          title={this.state.versionFormName}
         selectedVersion={this.state.selectedVersion}
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
                  <Card.Header
                    draggable={this.state.versionDnDFlag}
                    onDragOver={e => this.onDragOver(e, versionId)}
                    onDragStart={e => this.onDragStart(e, versionId)}
                    onDragEnd={e => this.onDragEnd(e, versionId)}
                  >
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
                          this.handleUpdate(this.props.versions[versionId])
                        }
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="2"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this versions? " +
                                "\n" +
                                "All your groups, pages and endpoints present in this version will be deleted."
                            )
                          )
                            this.handleDelete(this.props.versions[versionId]);
                        }}
                      >
                        Delete
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="3"
                        onClick={() => {
                          let addGroup=true;
                          let showVersionForm={addGroup};
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
                          let share=true;
                          let showVersionForm={share};
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
                      <Groups
                        {...this.props}
                        version_id={versionId}
                        version_dnd={this.versionDnD.bind(this)}
                      />
                      <VersionPages
                        {...this.props}
                        version_id={versionId}
                        version_dnd={this.versionDnD.bind(this)}
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

export default withRouter(connect(mapStateToProps)(CollectionVersions));
