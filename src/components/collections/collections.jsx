import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import shortId from "shortid";
import { toast } from "react-toastify";
import CollectionForm from "./collectionForm";
import collectionsService from "./collectionsService";
import collectionVersionsService from "../collectionVersions/collectionVersionsService";
import CollectionVersions from "../collectionVersions/collectionVersions";
import CollectionVersionForm from "../collectionVersions/collectionVersionForm";
import GroupForm from "../groups/groupForm";
import groupsService from "../groups/groupsService";
import PageForm from "../pages/pageForm";
import pageService from "../pages/pageService";
import endpointService from "../endpoints/endpointService";
import ShareVersionForm from "../collectionVersions/shareVersionForm";
import ImportVersionForm from "../collectionVersions/importVersionForm";
import "react-toastify/dist/ReactToastify.css";
import { connect } from "react-redux";
import {
  fetchCollections,
  addCollection,
  updateCollection,
  deleteCollection
} from "./collectionsActions";
import { fetchGroups, deleteGroup } from "../groups/groupsActions";
import { fetchEndpoints } from "../endpoints/endpointsActions";
import { fetchVersions } from "../collectionVersions/collectionVersionsActions";

import { fetchPages, updatePage } from "../pages/pagesActions";
import { withRouter } from "react-router-dom";

const mapStateToProps = state => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchCollections: () => dispatch(fetchCollections()),
    fetchVersions: () => dispatch(fetchVersions()),
    fetchGroups: () => dispatch(fetchGroups()),
    fetchEndpoints: () => dispatch(fetchEndpoints()),
    fetchPages: () => dispatch(fetchPages()),
    addCollection: newCollection => dispatch(addCollection(newCollection)),
    updateCollection: editedCollection =>
      dispatch(updateCollection(editedCollection)),
    deleteCollection: collection => dispatch(deleteCollection(collection)),
    deleteGroup: groupId => dispatch(deleteGroup(groupId)),
    updatePage: (editedPage, pageId) =>
      dispatch(updatePage(ownProps.history, editedPage, pageId))
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
    this.props.fetchVersions();
    this.props.fetchGroups();
    this.props.fetchEndpoints();
    this.props.fetchPages();
  }

  closeCollectionForm() {
    this.setState({ showCollectionForm: false });
  }

  async setEndpointIds(groupId, endpointsOrder) {
    const groups = { ...this.state.groups };
    groups[groupId].endpointsOrder = endpointsOrder;
    this.setState({ groups });
    const { name, host } = groups[groupId];
    const group = { name, host, endpointsOrder };
    try {
      await groupsService.updateGroup(groupId, group);
    } catch (e) {
      toast.error(e);
    }
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

  async handleUpdatePage(editedPage, pageId) {
    this.props.updatePage(editedPage, pageId);
  }

  async handleDuplicateEndpoint(endpointCopy) {
    let originalEndpoints = { ...this.state.endpoints };
    let endpoints = { ...this.state.endpoints };
    let originalGroups = { ...this.state.groups };
    let groups = { ...this.state.groups };

    try {
      const { data } = await endpointService.duplicateEndpoint(endpointCopy.id);
      let endpoint = data;
      endpoints[endpoint.id] = endpoint;
      groups[endpoint.groupId].endpointsOrder.push(endpoint.id.toString());
      this.setState({ endpoints, groups });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ endpoints: originalEndpoints, groups: originalGroups });
    }
  }

  async handleDuplicatePage(pageCopy) {
    let originalPage = { ...this.state.pages };
    let pages = { ...this.state.pages };
    let page = {};
    try {
      const { data } = await pageService.duplicatePage(pageCopy.id);
      page = data;
      pages[page.id] = page;
      const pageIds = [...this.state.pageIds, page.id.toString()];
      this.setState({ pages, pageIds });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ originalPage });
    }
  }

  async handleDuplicateGroup(groupCopy) {
    let originalGroup = { ...this.state.groups };
    let groups = { ...this.state.groups };
    let group = {};
    let endpoints = {};
    let pages = {};
    try {
      const { data } = await groupsService.duplicateGroup(groupCopy.id);
      endpoints = { ...this.state.endpoints, ...data.endpoints };
      pages = { ...this.state.pages, ...data.pages };
      group = data.groups;
      groups[group.id] = group;
      const groupIds = [...this.state.groupIds, group.id.toString()];
      const pageIds = [...this.state.pageIds, ...Object.keys(data.pages)];
      this.setState({ groups, groupIds, endpoints, pages, pageIds });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ originalGroup });
    }
  }

  async handleDuplicateVersion(versionCopy) {
    let orignalVersion = { ...this.state.versions };
    let versions = { ...this.state.versions };
    let version = {};
    let endpoints = {};
    let pages = {};
    let groups = {};
    try {
      const { data } = await collectionVersionsService.duplicateVersion(
        versionCopy.id
      );
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
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ orignalVersion });
    }
  }

  async handleDuplicateCollection(collectionCopy) {
    let originalCollection = { ...this.state.collections };
    let collections = { ...this.state.collections };
    let versions = {};
    let endpoints = {};
    let pages = {};
    let groups = {};
    let collection = {};
    try {
      const { data } = await collectionsService.duplicateCollection(
        collectionCopy.id
      );
      collection = data.collection;
      collections[collection.id] = collection;
      versions = { ...this.state.versions, ...data.versions };
      groups = { ...this.state.groups, ...data.groups };
      endpoints = { ...this.state.endpoints, ...data.endpoints };
      pages = { ...this.state.pages, ...data.pages };
      const collectionIds = [
        ...this.state.collectionIds,
        collection.id.toString()
      ];
      const versionIds = [
        ...this.state.versionIds,
        ...Object.keys(data.versions)
      ];
      const groupIds = [...this.state.groupIds, ...Object.keys(data.groups)];
      const pageIds = [...this.state.pageIds, ...Object.keys(data.pages)];
      this.setState({
        collections,
        collectionIds,
        versions,
        versionIds,
        groups,
        groupIds,
        endpoints,
        pages,
        pageIds
      });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ originalCollection });
    }
  }

  render() {
    const { location } = this.props;

    if (location.duplicateEndpoint) {
      const duplicateEndpoint = location.duplicateEndpoint;
      this.props.history.replace({ duplicateEndpoint: null });
      this.handleDuplicateEndpoint(duplicateEndpoint);
    }

    if (location.editedPage && location.groupId) {
      const { id: pageId } = location.editedPage;
      this.props.history.replace({ editedPage: null });
      this.handleUpdatePage(location.editedPage, pageId);
    } else if (location.editedPage) {
      const { id: pageId } = location.editedPage;
      this.props.history.replace({ editedPage: null });
      this.handleUpdatePage(location.editedPage, pageId);
    }

    if (location.duplicatePage) {
      const duplicatePage = location.duplicatePage;
      this.props.history.replace({ duplicatePage: null });
      this.handleDuplicatePage(duplicatePage);
    }

    if (location.duplicateGroup) {
      const duplicateGroup = location.duplicateGroup;
      this.props.history.replace({ duplicateGroup: null });
      this.handleDuplicateGroup(duplicateGroup);
    }

    if (location.duplicateVersion) {
      const duplicateVersion = location.duplicateVersion;
      this.props.history.replace({ duplicateVersion: null });
      this.handleDuplicateVersion(duplicateVersion);
    }
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
            {this.state.showCollectionForm && (
              <CollectionForm
                {...this.props}
                show={this.state.showCollectionForm}
                onHide={() => this.closeCollectionForm()}
                title={this.state.collectionFormName}
                edited_collection={this.state.selectedCollection}
              />
            )}
            <Switch>
              <Route
                path="/dashboard/collections/:id/versions/:versionId/groups/:groupId/pages/new"
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: "/dashboard/collections"
                      });
                    }}
                    title="Add new Group Page"
                    versionId={this.props.location.versionId}
                    groupId={this.props.location.groupId}
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:id/versions/:versionId/pages/:pageId/edit"
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    title="Edit Page"
                    editPage={this.props.location.editPage}
                    versionId={this.props.location.versionId}
                  />
                )}
              />

              <Route
                path="/dashboard/collections/:id/versions/:versionId/pages/new"
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: "/dashboard/collections"
                      });
                    }}
                    title="Add New Version Page"
                    versionId={this.props.location.versionId}
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:collectionId/versions/:versionId/groups/:groupId/edit"
                render={props => (
                  <GroupForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: "/dashboard/collections"
                      });
                    }}
                    title="Edit Group"
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:collectionId/versions/:versionId/groups/new"
                render={props => (
                  <GroupForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: "/dashboard/collections"
                      });
                    }}
                    title="Add new Group"
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:id/versions/new"
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: "/dashboard/collections"
                      });
                    }}
                    title="Add new Collection Version"
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:collectionId/versions/:versionId/edit"
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: "/dashboard/collections"
                      });
                    }}
                    title="Edit Collection Version"
                  />
                )}
              />
              <Route
                path="/dashboard/:collectionId/versions/import"
                render={props => (
                  <ImportVersionForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: "/dashboard/collections"
                      });
                    }}
                    title="Import Version"
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:id/edit"
                render={props => (
                  <CollectionForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: "/dashboard/collections"
                      });
                    }}
                    title="Edit Collection"
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:collectionId/versions/:versionId/share"
                render={props => (
                  <ShareVersionForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: "/dashboard/collections"
                      });
                    }}
                    title="Share Version"
                  />
                )}
              />
            </Switch>
          </div>
        </div>
        <div className="App-Side">
          <button
            className="btn btn-default btn-lg"
            onClick={() =>
              this.setState({
                showCollectionForm: true,
                collectionFormName: "Add new Collection"
              })
            }
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
                      onClick={() => {
                        this.setState({
                          showCollectionForm: true,
                          collectionFormName: "Edit Collection",
                          selectedCollection: {
                            ...this.props.collections[collectionId]
                          }
                        });
                      }}
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
                      onClick={() => {
                        this.props.history.push({
                          pathname: `/dashboard/collections/${collectionId}/versions/new`,
                          collectionId
                        });
                      }}
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
