import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import CollectionForm from "./collectionForm";
import collectionsService from "../services/collectionsService";
import collectionVersionsService from "../services/collectionVersionsService";
import CollectionVersions from "./collectionVersions";
import CollectionVersionForm from "./collectionVersionForm";
import GroupForm from "./groupForm";
import groupsService from "../services/groupsService";
import PageForm from "./pageForm";
import EndpointForm from "./endpointForm";
import pageService from "../services/pageService";
import shortId from "shortid";
import endpointService from "../services/endpointService";
class Collections extends Component {
  state = {
    collections: [],
    versions: [],
    groups: [],
    pages: [],
    endpoints: [],
    selectedCollection: {}
  };

  async componentDidMount() {
    const { data: collections } = await collectionsService.getCollections();
    this.setState({ collections });
    const versions = await this.fetchVersions(collections);
    const groups = await this.fetchGroups(versions);
    const pages = await this.fetchPagesVersion(versions);
    const endpoints = await this.fetchEndpoints(groups);
    this.setState({ versions, groups, pages, endpoints });
  }

  async handleAdd(newCollection) {
    newCollection.requestId = shortId.generate();
    const originalCollections = [...this.state.collections];
    const collections = [...this.state.collections, newCollection];
    console.log({ collections });
    this.setState({ collections });
    try {
      const { data: collection } = await collectionsService.saveCollection(
        newCollection
      );
      const index = collections.findIndex(
        c => c.requestId === collection.requestId
      );
      collections[index] = collection;
      console.log({ collections });
      this.setState({ collections });
    } catch (ex) {
      alert(ex.response.data);
      this.setState({ collections: originalCollections });
    }
  }

  async handleDelete(collection) {
    this.props.history.replace({ newCollection: null });
    const collections = this.state.collections.filter(
      c => c.id !== collection.id
    );
    this.setState({ collections });
    await collectionsService.deleteCollection(collection.id);
  }

  async handleUpdate(editedCollection) {
    // const body = { ...editedCollection };
    // delete body.id;
    // const index = this.state.collections.findIndex(
    //   collection => collection.id === newCollection.id
    // );
    // await collectionsService.updateCollection(newCollection.id, body);
    // const collections = [...this.state.collections];
    // collections[index] = newCollection;
    // this.setState({ collections });
  }

  handleAddVersion(collection) {
    this.state.selectedCollection = collection;
    this.props.history.push(
      `/dashboard/collections/${collection.name}/versions/new`
    );
  }

  async handleDeleteVersion(deletedCollectionVersionId) {
    const versions = this.state.versions.filter(
      v => v.id !== deletedCollectionVersionId
    );
    this.setState({ versions });
    await collectionVersionsService.deleteCollectionVersion(
      deletedCollectionVersionId
    );
  }

  async handleAddGroup(versionId, newGroup) {
    console.log(versionId, newGroup);
    const { data: group } = await groupsService.saveGroup(versionId, newGroup);
    let groups = [...this.state.groups, { ...group }];
    this.setState({ groups });
  }

  async handleDeleteGroup(deletedGroupId) {
    const groups = this.state.groups.filter(g => g.id !== deletedGroupId);
    this.setState({ groups });
    await groupsService.deleteGroup(deletedGroupId);
  }

  async handleUpdateGroup(editedGroup, groupId, versionId) {
    const groups = [
      ...this.state.groups.filter(g => g.id !== groupId),
      { ...editedGroup, id: groupId, versionId }
    ];
    this.setState({ groups });
    await groupsService.updateGroup(groupId, editedGroup);
  }

  async handleAddVersionPage(versionId, newPage) {
    const { data: page } = await pageService.saveVersionPage(
      versionId,
      newPage
    );
    let pages = [...this.state.pages, { ...page }];
    this.setState({ pages });
    let pageId = page.id;
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${pageId}/edit`,
      page: page
    });
  }
  async handleAddGroupPage(versionId, groupId, newPage) {
    const { data: page } = await pageService.saveGroupPage(
      versionId,
      groupId,
      newPage
    );
    let pages = [...this.state.pages, page];
    this.setState({ pages });
    let pageId = page.id;
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${pageId}/edit`,
      page: page
    });
  }

  async handleAddEndpoint(groupId, newEndpoint) {
    const { data: endpoint } = await endpointService.saveEndpoint(
      groupId,
      newEndpoint
    );
    let endpoints = [...this.state.endpoints, endpoint];
    this.setState({ endpoints });
    // let endpointId = endpoint.id;
    // this.props.history.push({
    //   pathname: `/dashboard/collections/pages/${endpointId}/edit`,
    //   endpoint: endpoint
    // });
  }
  async handleDeletePage(deletePageId) {
    await pageService.deletePage(deletePageId);
    const pages = this.state.pages.filter(page => page.id !== deletePageId);
    this.setState({ pages });
  }

  async handleDeleteEndpoint(deleteEndpointId) {
    await endpointService.deleteEndpoint(deleteEndpointId);
    const endpoints = this.state.endpoints.filter(
      endpoint => endpoint.id !== deleteEndpointId
    );
    this.setState({ endpoints });
  }

  async handleUpdatePage(editedPage, pageId, versionId) {
    const { data: editPage } = await pageService.updatePage(pageId, editedPage);
    const pages = [
      ...this.state.pages.filter(page => page.id !== pageId),
      { ...editPage }
    ];
    this.setState({ pages });
  }

  async fetchVersions(collections) {
    let versions = [];
    for (let i = 0; i < collections.length; i++) {
      const {
        data: versions1
      } = await collectionVersionsService.getCollectionVersions(
        collections[i].id
      );

      versions = [...versions, ...versions1];
    }
    return versions;
  }

  async fetchGroups(versions) {
    let groups = [];
    for (let i = 0; i < versions.length; i++) {
      const { data: groups1 } = await groupsService.getGroups(versions[i].id);
      groups = [...groups, ...groups1];
    }
    return groups;
  }

  async fetchPagesVersion(versions) {
    let pages = [];
    for (let i = 0; i < versions.length; i++) {
      const version = versions[i];
      let { data: newPages } = await pageService.getVersionPages(version.id);
      pages = [...pages, ...newPages];
    }
    return pages;
  }

  async fetchEndpoints(groups) {
    let endpoints = [];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      let { data: newEndpoint } = await endpointService.getEndpoints(group.id);
      endpoints = [...endpoints, ...newEndpoint];
    }
    return endpoints;
  }

  render() {
    const { location } = this.props;

    if (location.deleteEndpointId) {
      console.log("Eee");
      const deleteEndpointId = location.deleteEndpointId;
      this.props.history.replace({ deleteEndpointId: null });
      this.handleDeleteEndpoint(deleteEndpointId);
    }

    if (location.newEndpoint) {
      const { newEndpoint, groupId } = location;
      this.props.history.replace({ groupId: null, newPage: null });

      this.handleAddEndpoint(groupId, newEndpoint);
    }
    if (location.editedPage) {
      const { editedPage, pageId, versionId } = location;
      this.props.history.replace({ editedPage: null });
      this.handleUpdatePage(editedPage, pageId, versionId);
    }

    if (location.newPage && location.groupId) {
      const { versionId, newPage, groupId } = location;

      this.props.history.replace({ groupId: null, newPage: null });

      this.handleAddGroupPage(versionId, groupId, newPage);
    } else if (location.newPage) {
      const { versionId, newPage } = location;
      this.props.history.replace({ newPage: null });
      this.handleAddVersionPage(versionId, newPage);
    }

    if (location.deletePageId) {
      const deletePageId = location.deletePageId;
      this.props.history.replace({ deletedPageId: null });
      this.handleDeletePage(deletePageId);
    }

    if (location.editedGroup) {
      const { editedGroup, groupId, versionId } = location;
      this.props.history.replace({ editedGroup: null });
      this.handleUpdateGroup(editedGroup, groupId, versionId);
    }

    if (location.deletedGroupId) {
      const deletedGroupId = location.deletedGroupId;
      this.props.history.replace({ deletedGroupId: null });
      this.handleDeleteGroup(deletedGroupId);
    }

    if (location.newGroup) {
      const { versionId, newGroup } = location;
      console.log(versionId, newGroup);
      this.props.history.replace({ newGroup: null });
      this.handleAddGroup(versionId, newGroup);
    }

    if (location.deletedCollectionVersionId) {
      const deletedCollectionVersionId = location.deletedCollectionVersionId;
      this.props.history.replace({ deletedCollectionVersionId: null });
      this.handleDeleteVersion(deletedCollectionVersionId);
    }

    if (location.editedCollectionVersion) {
      const version = location.editedCollectionVersion;
      this.props.history.replace({ editedCollectionVersion: null });
      const versions1 = this.state.versions.filter(v => v.id !== version.id);
      const versions = [...versions1, version];
      this.setState({ versions });
    }

    if (location.newCollectionVersion) {
      const newCollectionVersion = location.newCollectionVersion;
      this.props.history.replace({ newCollectionVersion: null });
      const versions = [...this.state.versions, newCollectionVersion];
      this.setState({ versions });
    }

    if (location.newCollection) {
      const newCollection = location.newCollection;
      this.props.history.replace({ newCollection: null });
      this.handleAdd(newCollection);
    }

    return (
      <div>
        <div className="App-Nav">
          <div className="tabs">
            <Switch>
              <Route
                path="/dashboard/collections/:collectionId/versions/:versionId/groups/:groupId/endpoints/new"
                render={props => (
                  <EndpointForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title="Add New Endpoint"
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:id/versions/:versionId/groups/:groupId/pages/new"
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title="Add New Page"
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:id/versions/:versionId/pages/:pageId/edit"
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    onHide={() => {}}
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
                    onHide={() => {}}
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
                    onHide={() => {}}
                    title="Edit Group"
                    editGroup={this.props.location.editGroup}
                    versionId={this.props.location.versionId}
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:collectionId/versions/:versionId/groups/new"
                render={props => (
                  <GroupForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title="Add new Group"
                    versionId={this.props.location.versionId}
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:id/versions/new"
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title="Add new Collection Version"
                    collectionId={this.state.selectedCollection.id}
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:collectionId/versions/:versionId/edit"
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title="Edit Collection Version"
                    editCollectionVersion={this.props.editCollectionVersion}
                  />
                )}
              />
              <Route
                path="/dashboard/collections/new"
                render={props => (
                  <CollectionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title="Add new Collection"
                  />
                )}
              />
              <Route
                path="/dashboard/collections/:id/edit"
                render={props => (
                  <CollectionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title="Edit Collection"
                    selectedCollection={this.state.selectedCollection}
                  />
                )}
              />
            </Switch>
          </div>
        </div>
        <div className="App-Side">
          <button className="btn btn-default btn-lg">
            <Link to="/dashboard/collections/new">+ New Collection</Link>
          </button>
          {this.state.collections.map(collection => (
            <Accordion key={collection.id || collection.requestId}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey="1">
                    {collection.name}
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
                          pathname: `/dashboard/collections/${collection.name}/edit`,
                          editedcollection: collection
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
                            "Are you sure you wish to delete this collection?" +
                              "\n" +
                              " All your versions, groups, pages and endpoints present in this collection will be deleted."
                          )
                        )
                          this.handleDelete(collection);
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() => this.handleAddVersion(collection)}
                    >
                      Add Version
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <CollectionVersions
                      {...this.props}
                      collectionId={collection.id}
                      versions={this.state.versions}
                      groups={this.state.groups}
                      pages={this.state.pages}
                      endpoints={this.state.endpoints}
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
export default Collections;
