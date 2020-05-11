import React, { Component } from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import shortId from "shortid";
import CollectionVersions from "../collectionVersions/collectionVersions";
import collectionVersionsService from "../collectionVersions/collectionVersionsService";
import ImportVersionForm from "../collectionVersions/importVersionForm";
import { isDashboardRoute } from "../common/utility";
import endpointApiService from "../endpoints/endpointApiService";
import {
  fetchAllUsersOfTeam,
  shareCollection,
} from "../teamUsers/redux/teamUsersActions";
import collectionsService from "./collectionsService";
import {
  addCollection,
  deleteCollection,
  duplicateCollection,
  updateCollection,
} from "./redux/collectionsActions";
import ShareCollectionForm from "./shareCollectionForm";
import { uiUrl } from "../../config.json";
import "./collections.scss";
import CustomDomainModal from "../publicEndpoint/customDomainModal";

const mapStateToProps = (state) => {
  return {
    teams: state.teams,
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    teamUsers: state.teamUsers,
    groups: state.groups,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    add_collection: (newCollection) => dispatch(addCollection(newCollection)),
    share_collection: (teamMemberData) =>
      dispatch(shareCollection(teamMemberData)),
    update_collection: (editedCollection) =>
      dispatch(updateCollection(editedCollection)),
    delete_collection: (collection, props) =>
      dispatch(deleteCollection(collection, props)),
    duplicate_collection: (collection) =>
      dispatch(duplicateCollection(collection)),
    fetch_all_users_of_team: (teamIdentifier) =>
      dispatch(fetchAllUsersOfTeam(teamIdentifier)),
  };
};

class CollectionsComponent extends Component {
  state = {
    showCollectionForm: false,
    collectionFormName: "",
    selectedCollection: {},
    showCustomDomainModal: false,
  };
  keywords = {};
  names = {};

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
    ].endpointsOrder.filter((gId) => gId !== endpointId.toString());
    groups[destinationGroupId].endpointsOrder.push(endpointId);
    this.setState({ endpoints, groups });
    try {
      delete endpoint.id;
      await endpointApiService.updateEndpoint(endpointId, endpoint);
    } catch (error) {
      this.setState({ endpoints: originalEndpoints, groups: originalGroups });
    }
  }

  async handleAddCollection(newCollection) {
    newCollection.requestId = shortId.generate();
    this.props.add_collection(newCollection);
  }

  async handleUpdateCollection(editedCollection) {
    this.props.update_collection(editedCollection);
  }

  async handleDeleteGroup(deletedGroupId) {
    this.props.delete_group(deletedGroupId);
  }

  async handleAddVersionPage(versionId, newPage) {
    newPage.requestId = shortId.generate();
    this.props.add_page(versionId, newPage);
  }

  async handleDuplicateCollection(collectionCopy) {
    this.props.duplicate_collection(collectionCopy);
  }
  async handleGoToDocs(collection) {
    const publicDocsUrl = `${uiUrl}/public/${collection.id}`;
    window.open(publicDocsUrl, "_blank");
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
          collection_id={this.state.selectedCollection.id}
        />
      )
    );
  }

  shareCollection(collectionId) {
    this.props.fetch_all_users_of_team(
      this.props.collections[collectionId].teamId
    );
    this.setState({
      showCollectionShareForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
      collectionFormName: "Share Collection",
    });
  }

  openAddCollectionForm() {
    this.setState({
      showCollectionForm: true,
      collectionFormName: "Add new Collection",
    });
  }

  openEditCollectionForm(collectionId) {
    this.setState({
      showCollectionForm: true,
      collectionFormName: "Edit Collection",
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
    });
  }

  openAddVersionForm(collectionId) {
    this.setState({
      showVersionForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
    });
  }
  openImportVersionForm(collectionId) {
    this.setState({
      showImportVersionForm: true,
      collectionFormName: "Import Version",
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
    });
  }

  openDeleteCollectionModal(collectionId) {
    if (this.state.openSelectedCollection === true) {
      this.setState({ openSelectedCollection: false });
    }
    this.setState({
      showDeleteModal: true,
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
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

  handlePublicCollectionDescription(collection) {
    this.props.history.push({
      pathname: `/public/${collection.id}/description`,
      collection,
    });
  }

  closeVersionForm() {
    this.setState({ showVersionForm: false });
  }

  handlePublic(collection) {
    collection.isPublic = !collection.isPublic;
    delete collection.teamId;
    this.props.update_collection({ ...collection });
  }

  closeDeleteCollectionModal() {
    this.setState({ showDeleteModal: false });
  }
  openSelectedCollection(collectionId) {
    this.props.empty_filter();
    this.collectionId = collectionId;
    this.setState({ openSelectedCollection: true });
  }
  openAllCollections() {
    this.props.empty_filter();
    this.collectionId = null;
    this.setState({ openSelectedCollection: false });
  }

  renderBody(collectionId, collectionState) {
    let eventkeyValue = "";
    if (this.props.filter !== "") {
      eventkeyValue = "0";
    } else {
      eventkeyValue = null;
    }

    if (document.getElementById("collection-collapse")) {
      if (
        document
          .getElementById("collection-collapse")
          .className.split(" ")[1] !== "show" &&
        this.props.filter
      ) {
        document.getElementById("collection-collapse").className =
          "collapse show";
      }
    }

    return (
      <React.Fragment key={collectionId}>
        {collectionState === "singleCollection" ? (
          <button
            id="back-to-all-collections-button"
            className="btn"
            onClick={() => this.openAllCollections()}
          >
            <i class="fas fa-arrow-left"></i>
            <label>All Collections</label>
          </button>
        ) : null}

        <Accordion
          defaultActiveKey="0"
          key={collectionId}
          id="parent-accordion"
        >
          <Card>
            <Card.Header>
              <i className="fas fa-folder-open"></i>
              <Accordion.Toggle
                as={Button}
                variant="default"
                eventKey={eventkeyValue !== null ? eventkeyValue : "0"}
              >
                {collectionState === "singleCollection" ? (
                  <div>{this.props.collections[collectionId].name}</div>
                ) : (
                  <div
                    onClick={() => this.openSelectedCollection(collectionId)}
                  >
                    {this.props.collections[collectionId].name}
                  </div>
                )}
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
                    onClick={() => this.openEditCollectionForm(collectionId)}
                  >
                    Edit
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      this.openDeleteCollectionModal(collectionId);
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
                  {this.props.collections[collectionId].isPublic && (
                    <button
                      className="dropdown-item"
                      onClick={() =>
                        this.handleGoToDocs(
                          this.props.collections[collectionId]
                        )
                      }
                    >
                      Go to Docs
                    </button>
                  )}
                  {this.props.collections[collectionId].isPublic && (
                    <button
                      className="dropdown-item"
                      onClick={() =>
                        this.handleCustomDomain(
                          this.props.collections[collectionId]
                        )
                      }
                    >
                      Add Custom Domain
                    </button>
                  )}
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
            </Card.Header>
            {collectionState === "singleCollection" ? (
              <Accordion.Collapse id="collection-collapse" eventKey="0">
                <Card.Body>
                  <CollectionVersions
                    {...this.props}
                    collection_id={collectionId}
                    selectedCollection={true}
                  />
                </Card.Body>
              </Accordion.Collapse>
            ) : null}
          </Card>
        </Accordion>
      </React.Fragment>
    );
  }

  handleCustomDomain(collection) {
    console.log(collection);
    this.setState({
      showCustomDomainModal: true,
      selectedCollection: collection.id,
    });
  }

  openCustomDomainModal(onHide) {
    return (
      <CustomDomainModal
        {...this.props}
        show={true}
        onHide={onHide}
        collection_id={this.state.selectedCollection}
        // add_new_endpoint={this.handleAddEndpoint.bind(this)}
        // open_collection_form={this.openCollectionForm.bind(this)}
        // open_environment_form={this.openEnvironmentForm.bind(this)}
      />
    );
  }

  render() {
    if (isDashboardRoute(this.props)) {
      let finalCollections = [];
      this.names = {};
      let finalnames = [];
      this.keywords = {};
      let finalKeywords = [];
      let collections = { ...this.props.collections };
      let CollectionIds = Object.keys(collections);

      for (let i = 0; i < CollectionIds.length; i++) {
        const { keyword } = this.props.collections[CollectionIds[i]];
        const splitedKeywords = keyword.split(",");

        for (let j = 0; j < splitedKeywords.length; j++) {
          let keyword = splitedKeywords[j];

          if (keyword !== "") {
            if (this.keywords[keyword]) {
              const ids = this.keywords[keyword];
              if (ids.indexOf(CollectionIds[i]) === -1) {
                this.keywords[keyword] = [...ids, CollectionIds[i]];
              }
            } else {
              this.keywords[keyword] = [CollectionIds[i]];
            }
          }
        }
      }
      let keywords = Object.keys(this.keywords);
      finalKeywords = keywords.filter((key) => {
        return (
          key.toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1
        );
      });

      let keywordFinalCollections = [];
      for (let i = 0; i < finalKeywords.length; i++) {
        keywordFinalCollections = [
          ...keywordFinalCollections,
          ...this.keywords[finalKeywords[i]],
        ];
      }
      keywordFinalCollections = [...new Set(keywordFinalCollections)];

      for (let i = 0; i < CollectionIds.length; i++) {
        const { name } = this.props.collections[CollectionIds[i]];
        this.names[name] = CollectionIds[i];
      }
      let names = Object.keys(this.names);
      finalnames = names.filter((name) => {
        return (
          name.toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1
        );
      });
      let namesFinalCollections = finalnames.map((name) => this.names[name]);
      namesFinalCollections = [...new Set(namesFinalCollections)];
      finalCollections = [...keywordFinalCollections, ...namesFinalCollections];

      finalCollections = [...new Set(finalCollections)];
      return (
        <div>
          {this.state.showCustomDomainModal &&
            this.openCustomDomainModal(() =>
              this.setState({
                showCustomDomainModal: false,
              })
            )}
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
              {this.state.showDeleteModal &&
                collectionsService.showDeleteCollectionModal(
                  { ...this.props },
                  this.closeDeleteCollectionModal.bind(this),
                  "Delete Collection",
                  `Are you sure you wish to delete this collection? All your versions,
                   groups, pages and endpoints present in this collection will be deleted.`,
                  this.state.selectedCollection
                )}
            </div>
          </div>

          <div className="App-Side">
            <div className="custom-add-collection-button-container">
              <button
                className="btn btn-default"
                onClick={() => this.openAddCollectionForm()}
              >
                <i className="fas fa-plus"></i>
                New Collection
              </button>
            </div>
            {this.state.openSelectedCollection &&
              this.renderBody(this.collectionId, "singleCollection")}
            {!this.state.openSelectedCollection &&
              finalCollections.map((collectionId, index) =>
                this.renderBody(collectionId, "allCollections")
              )}
          </div>
        </div>
      );
    } else {
      console.log(this.state.showCustomDomainModal);
      return (
        <div>
          <div className="App-Side">
            {Object.keys(this.props.collections).map((collectionId, index) => (
              <div id="parent-accordion" key={index}>
                <div>
                  <h4
                    style={{
                      color: "tomato",
                      textAlign: "center",
                      padding: "35px",
                    }}
                    onClick={() =>
                      this.handlePublicCollectionDescription(
                        this.props.collections[collectionId]
                      )
                    }
                  >
                    {this.props.collections[collectionId].name}
                  </h4>

                  <CollectionVersions
                    {...this.props}
                    collection_id={collectionId}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CollectionsComponent)
);
