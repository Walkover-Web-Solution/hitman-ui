import React, { Component } from "react";
import {
  Dropdown,
  Accordion,
  Card,
  Button,
  DropdownButton
} from "react-bootstrap";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import shortId from "shortid";
import CollectionVersions from "../collectionVersions/collectionVersions";
import collectionVersionsService from "../collectionVersions/collectionVersionsService";
import ImportVersionForm from "../collectionVersions/importVersionForm";
import { fetchAllVersions } from "../collectionVersions/redux/collectionVersionsActions";
import endpointService from "../endpoints/endpointService";
import { fetchEndpoints } from "../endpoints/redux/endpointsActions";
import { fetchGroups } from "../groups/redux/groupsActions";
import { fetchPages } from "../pages/redux/pagesActions";
import {
  fetchAllUsersOfTeam,
  shareCollection
} from "../team/redux/teamsActions";
import collectionsService from "./collectionsService";
import {
  addCollection,
  deleteCollection,
  duplicateCollection,
  fetchCollections,
  updateCollection
} from "./redux/collectionsActions";
import ShareCollectionForm from "./shareCollectionForm";

const mapStateToProps = state => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCollections: () => dispatch(fetchCollections()),
    fetchAllVersions: () => dispatch(fetchAllVersions()),
    fetchGroups: () => dispatch(fetchGroups()),
    fetchEndpoints: () => dispatch(fetchEndpoints()),
    fetchPages: () => dispatch(fetchPages()),
    addCollection: newCollection => dispatch(addCollection(newCollection)),
    shareCollection: teamMemberData =>
      dispatch(shareCollection(teamMemberData)),
    updateCollection: editedCollection =>
      dispatch(updateCollection(editedCollection)),
    deleteCollection: collection => dispatch(deleteCollection(collection)),
    duplicateCollection: collection =>
      dispatch(duplicateCollection(collection)),
    fetchAllUsersOfTeam: teamIdentifier =>
      dispatch(fetchAllUsersOfTeam(teamIdentifier))
    // deleteUserFromTeam: teamData => dispatch(deleteUserFromTeam(teamData))
  };
};

class CollectionsComponent extends Component {
  state = {
    showCollectionForm: false,
    collectionFormName: "",
    selectedCollection: {}
  };

  async componentDidMount() {
    this.props.fetchCollections();
    this.props.fetchAllVersions();
    this.props.fetchGroups();
    this.props.fetchEndpoints();
    this.props.fetchPages();
  }

  closeCollectionForm() {
    this.setState({ showCollectionForm: false, showImportVersionForm: false });
  }

  async dndMoveEndpoint(endpointId, sourceGroupId, destinationGroupId) {
    const groups = { ...this.state.groups };
    const endpoints = { ...this.state.endpoints };
    const originalEndpoints = { ...this.state.endpoints };
    const originalGroups = { ...this.state.groups };
    const endpoint = endpoints[endpointId];
    endpoint.groupId = destinationGroupId;
    endpoints[endpointId] = endpoint;
    groups[sourceGroupId].endpointsOrder = groups[
      sourceGroupId
    ].endpointsOrder.filter(gId => gId !== endpointId.toString());
    groups[destinationGroupId].endpointsOrder.push(endpointId);
    this.setState({ endpoints, groups });
    try {
      delete endpoint.id;
      await endpointService.updateEndpoint(endpointId, endpoint);
    } catch (error) {
      this.setState({ endpoints: originalEndpoints, groups: originalGroups });
    }
  }

  async handleAddCollection(newCollection) {
    newCollection.requestId = shortId.generate();
    this.props.addCollection(newCollection);
  }

  async handleDelete(collection) {
    if (
      window.confirm(
        "Are you sure you wish to delete this collection?" +
          "\n" +
          " All your versions, groups, pages and endpoints present in this collection will be deleted."
      )
    )
      this.props.deleteCollection(collection);
  }

  async handleUpdateCollection(editedCollection) {
    this.props.updateCollection(editedCollection);
  }

  async handleDeleteGroup(deletedGroupId) {
    this.props.deleteGroup(deletedGroupId);
  }

  async handleAddVersionPage(versionId, newPage) {
    newPage.requestId = shortId.generate();
    this.props.addPage(versionId, newPage);
  }

  async handleDuplicateCollection(collectionCopy) {
    this.props.duplicateCollection(collectionCopy);
  }

  showShareCollectionForm() {
    return (
      this.state.showCollectionShareForm && (
        <ShareCollectionForm
          {...this.props}
          show={true}
          onHide={() => {
            this.setState({ showCollectionShareForm: false });
          }}
          team_id={this.state.selectedCollection.teamId}
          title="Share Collection"
        />
      )
    );
  }

  shareCollection(collectionId) {
    this.props.fetchAllUsersOfTeam(this.props.collections[collectionId].teamId);
    this.setState({
      showCollectionShareForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId]
      },
      collectionFormName: "Share Collection"
    });
  }
  openAddCollectionForm() {
    this.setState({
      showCollectionForm: true,
      collectionFormName: "Add new Collection"
    });
  }
  openEditCollectionForm(collectionId) {
    this.setState({
      showCollectionForm: true,
      collectionFormName: "Edit Collection",
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    });
  }

  openAddVersionForm(collectionId) {
    this.setState({
      showVersionForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    });
  }
  openImportVersionForm(collectionId) {
    this.setState({
      showImportVersionForm: true,
      collectionFormName: "Import Version",
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    });
  }
  showImportVersionForm() {
    return (
      this.state.showImportVersionForm && (
        <ImportVersionForm
          {...this.props}
          show={this.state.showImportVersionForm}
          onHide={() => this.closeCollectionForm()}
          title={this.state.collectionFormName}
          selected_collection={this.state.selectedCollection}
        />
      )
    );
  }

  closeVersionForm() {
    this.setState({ showVersionForm: false });
  }

  render() {
    return (
      <div>
        <div className="App-Nav">
          <div className="tabs">
            {this.state.showVersionForm &&
              collectionVersionsService.showVersionForm(
                this.props,
                this.closeVersionForm.bind(this),
                this.state.selectedCollection.id,
                "Add new Collection Version"
              )}
            {this.state.showCollectionForm &&
              collectionsService.showCollectionForm(
                this.props,
                this.closeCollectionForm.bind(this),
                this.state.collectionFormName,
                this.state.selectedCollection
              )}
            {this.showImportVersionForm()}
            {this.showShareCollectionForm()}
          </div>
        </div>

        <div className="App-Side">
          <div
            style={{
              color: "tomato",
              borderBottom: "1px solid rgba(0, 0, 0, 0.125) ",
              width: "100%"
            }}
          >
            <button
              className="btn btn-default"
              onClick={() => this.openAddCollectionForm()}
              style={{
                color: "tomato"
              }}
            >
              <i className="fas fa-plus" style={{ paddingRight: "10px" }}></i>
              New Collection
            </button>
          </div>
          {Object.keys(this.props.collections).map((collectionId, index) => (
            <Accordion key={collectionId}>
              <Card>
                <Card.Header>
                  <i
                    className="fas fa-folder-open"
                    style={{ margin: "5px" }}
                  ></i>
                  <Accordion.Toggle as={Button} variant="default" eventKey="1">
                    {this.props.collections[collectionId].name}
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
                          this.openEditCollectionForm(collectionId)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          this.handleDelete(
                            this.props.collections[collectionId]
                          );
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => this.openAddVersionForm(collectionId)}
                      >
                        Add Version
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          this.handleDuplicateCollection(
                            this.props.collections[collectionId]
                          )
                        }
                      >
                        Duplicate
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => this.openImportVersionForm(collectionId)}
                      >
                        Import Version
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          this.shareCollection(collectionId);
                        }}
                      >
                        Share
                      </button>
                    </div>
                  </div>
                  {/* <DropdownButton
                    alignRight
                    title=""
                    id="dropdown-menu-align-right"
                    style={{ float: "right" }}
                  >
                    <Dropdown.Item
                      eventKey="1"
                      onClick={() => this.openEditCollectionForm(collectionId)}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="0"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you wish to delete this collection?" +
                              "\n" +
                              " All your versions, groups, pages and endpoints present in this collection will be deleted."
                          )
                        )
                          this.handleDelete(
                            this.props.collections[collectionId]
                          );
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() => this.openAddVersionForm(collectionId)}
                    >
                      Add Version
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() =>
                        this.handleDuplicateCollection(
                          this.props.collections[collectionId]
                        )
                      }
                    >
                      Duplicate
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() => this.openImportVersionForm(collectionId)}
                    >
                      Import Version
                    </Dropdown.Item>
                  </DropdownButton> */}
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <CollectionVersions
                      {...this.props}
                      collection_id={collectionId}
                    />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CollectionsComponent)
);
