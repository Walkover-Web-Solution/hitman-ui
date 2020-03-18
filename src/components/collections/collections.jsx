import React, { Component } from "react";
import {
  Accordion,
  Button,
  Card,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import { connect } from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import shortId from "shortid";
import CollectionVersions from "../collectionVersions/collectionVersions";
import CollectionVersionForm from "../collectionVersions/collectionVersionForm";
import ImportVersionForm from "../collectionVersions/importVersionForm";
import ShareVersionForm from "../collectionVersions/shareVersionForm";
import CollectionForm from "./collectionForm";
import PageForm from "../pages/pageForm";
import collectionVersionsService from "../collectionVersions/collectionVersionsService";
import endpointService from "../endpoints/endpointService";
import { fetchAllVersions } from "../collectionVersions/redux/collectionVersionsActions";
import { fetchEndpoints } from "../endpoints/redux/endpointsActions";
import { fetchGroups } from "../groups/redux/groupsActions";
import { fetchPages } from "../pages/redux/pagesActions";
import ShareCollectionForm from "./shareCollectionForm";
import {
  addCollection,
  deleteCollection,
  duplicateCollection,
  fetchCollections,
  updateCollection
} from "./redux/collectionsActions";

import {
  shareCollection,
  fetchAllUsersOfTeam,
  deleteUserFromTeam
} from "../team/redux/teamsActions";

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
    shareCollection: sharedCollection =>
      dispatch(shareCollection(sharedCollection)),
    updateCollection: editedCollection =>
      dispatch(updateCollection(editedCollection)),
    deleteCollection: collection => dispatch(deleteCollection(collection)),
    duplicateCollection: collection =>
      dispatch(duplicateCollection(collection)),
    fetchAllUsersOfTeam: teamIdentifier =>
      dispatch(fetchAllUsersOfTeam(teamIdentifier)),
    deleteUserFromTeam: teamData => dispatch(deleteUserFromTeam(teamData))
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
    this.setState({ showCollectionForm: false });
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
    this.props.deleteCollection(collection);
  }

  async handleUpdateCollection(editedCollection) {
    this.props.updateCollection(editedCollection);
  }

  async handleImportVersion(importLink, shareIdentifier, collectionId) {
    let versions = { ...this.state.versions };
    let version = {};
    let endpoints = {};
    let pages = {};
    let groups = {};
    try {
      let { data } = await collectionVersionsService.exportCollectionVersion(
        importLink,
        shareIdentifier
      );
      data.collectionId = collectionId;
      let importVersion = await collectionVersionsService.importCollectionVersion(
        importLink,
        shareIdentifier,
        data
      );
      data = importVersion.data;
      version = data.version;
      versions[version.id] = version;
      groups = { ...this.state.groups, ...data.groups };
      endpoints = { ...this.state.endpoints, ...data.endpoints };
      pages = { ...this.state.pages, ...data.pages };
      const versionIds = [...this.state.versionIds, version.id.toString()];
      const groupIds = [...this.state.groupIds, ...Object.keys(data.groups)];
      const pageIds = [...this.state.pageIds, ...Object.keys(data.pages)];
      this.setState({
        versions,
        versionIds,
        groups,
        groupIds,
        endpoints,
        pages,
        pageIds
      });
    } catch (ex) {
      toast.error(
        ex.response
          ? ex.response.data
          : "Something went wrong,can't import version"
      );
    }
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

  showAddCollectionForm() {
    return (
      this.state.showVersionForm && (
        <CollectionVersionForm
          {...this.props}
          show={true}
          onHide={() => {
            this.setState({ showVersionForm: false });
          }}
          collection_id={this.state.selectedCollection.id}
          title="Add new Collection Version"
        />
      )
    );
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

  showEditCollectionForm() {
    return (
      this.state.showCollectionForm && (
        <CollectionForm
          {...this.props}
          show={this.state.showCollectionForm}
          onHide={() => this.closeCollectionForm()}
          title={this.state.collectionFormName}
          edited_collection={this.state.selectedCollection}
        />
      )
    );
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

  routeToAddNewGroupPage() {
    return (
      <Route
        path="/dashboard/:id/versions/:versionId/groups/:groupId/pages/new"
        render={props => (
          <PageForm
            {...props}
            show={true}
            onHide={() => {
              this.props.history.push({
                pathname: "/dashboard"
              });
            }}
            title="Add new Group Page"
            versionId={this.props.location.versionId}
            groupId={this.props.location.groupId}
          />
        )}
      />
    );
  }

  routeToAddNewVersionPage() {
    return (
      <Route
        path="/dashboard/:id/versions/:versionId/pages/new"
        render={props => (
          <PageForm
            {...props}
            show={true}
            onHide={() => {
              this.props.history.push({
                pathname: "/dashboard"
              });
            }}
            title="Add New Version Page"
            versionId={this.props.location.versionId}
          />
        )}
      />
    );
  }

  routeToImportVersionForm() {
    return (
      <Route
        path="/dashboard/:collectionId/versions/import"
        render={props => (
          <ImportVersionForm
            {...props}
            show={true}
            onHide={() => {
              this.props.history.push({
                pathname: "/dashboard"
              });
            }}
            title="Import Version"
          />
        )}
      />
    );
  }

  routeToShareVersionForm() {
    return (
      <Route
        path="/dashboard/:collectionId/versions/:versionId/share"
        render={props => (
          <ShareVersionForm
            {...props}
            show={true}
            onHide={() => {
              this.props.history.push({
                pathname: "/dashboard"
              });
            }}
            title="Share Version"
          />
        )}
      />
    );
  }

  render() {
    const { location } = this.props;

    if (location.importVersionLink) {
      let importLink = location.importVersionLink;
      let collectionId = location.collectionId;
      importLink = importLink.shareVersionLink;
      let shareIdentifier = importLink.split("/")[4];
      this.props.history.replace({ importVersionLink: null });
      this.handleImportVersion(importLink, shareIdentifier, collectionId);
    }

    return (
      <div>
        <div className="App-Nav">
          <div className="tabs">
            {this.showAddCollectionForm()}
            {this.showEditCollectionForm()}
            {this.showShareCollectionForm()}

            <Switch>
              {this.routeToAddNewGroupPage()}
              {this.routeToAddNewVersionPage()}
              {this.routeToImportVersionForm()}
              {this.routeToShareVersionForm()}
            </Switch>
          </div>
        </div>
        <div className="App-Side">
          <button
            className="btn btn-default btn-lg"
            onClick={() => this.openAddCollectionForm()}
          >
            + New Collection
          </button>
          {Object.keys(this.props.collections).map((collectionId, index) => (
            <Accordion key={collectionId}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey="1">
                    {this.props.collections[collectionId].name}
                  </Accordion.Toggle>
                  <DropdownButton
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
                      onClick={() => {
                        this.props.history.push({
                          pathname: `/dashboard/${collectionId}/versions/import`,
                          importCollection: this.state.collections[collectionId]
                        });
                      }}
                    >
                      Import Version
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() => {
                        this.shareCollection(collectionId);
                      }}
                    >
                      Share
                    </Dropdown.Item>
                  </DropdownButton>
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
