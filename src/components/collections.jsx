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
import pageService from "../services/pageService";
import EndpointForm from "./endpointForm";
import endpointService from "../services/endpointService";
import shortId from "shortid";
import { toast } from "react-toastify";

class Collections extends Component {
  state = {
    collections: {},
    versions: {},
    groups: {},
    pages: {},
    endpoints: {}
  }

  async fetchVersions (collections) {
    let versions = {}
    const collectionIds = Object.keys(collections)
    for (let i = 0; i < collectionIds.length; i++) {
      const {
        data: versions1
      } = await collectionVersionsService.getCollectionVersions(
        collectionIds[i]
      )

      versions = { ...versions, ...versions1 }
    }
    return versions;
  }

  async fetchGroups (versions) {
    let groups = {}
    const versionIds = Object.keys(versions)
    for (let i = 0; i < versionIds.length; i++) {
      const { data: groups1 } = await groupsService.getGroups(versionIds[i])

      groups = { ...groups, ...groups1 }
    }
    return groups
  }

  async fetchPagesVersion (versions) {
    let pages = {}
    const versionIds = Object.keys(versions)
    for (let i = 0; i < versionIds.length; i++) {
      let { data: newPages } = await pageService.getVersionPages(versionIds[i])
      pages = { ...pages, ...newPages }
    }
    return pages;
  }

  async fetchEndpoints(groups) {
    let endpoints = {};
    const groupIds = Object.keys(groups)
    for (let i = 0; i < groupIds.length; i++) {
      let { data: newEndpoint } = await endpointService.getEndpoints(groupIds[i]);
      endpoints = {...endpoints, ...newEndpoint};
    }
    return endpoints;
  }

  async componentDidMount () {
    const { data: collections } = await collectionsService.getCollections()
    this.setState({ collections })
    const versions = await this.fetchVersions(collections)
    const groups = await this.fetchGroups(versions)
    const pages = await this.fetchPagesVersion(versions)
    const endpoints = await this.fetchEndpoints(groups)
    this.setState({ versions, groups, pages,endpoints })
  }

  async handleAdd (newCollection) {
    newCollection.requestId = shortId.generate()
    const originalCollections = { ...this.state.collections }
    const collections = { ...this.state.collections }
    const requestId = newCollection.requestId
    collections[requestId] = { ...newCollection }
    this.setState({ collections })
    try {
      const { data: collection } = await collectionsService.saveCollection(
        newCollection
      )
      collections[collection.id] = collection
      delete collections[requestId]
      const {
        data: version
      } = await collectionVersionsService.getCollectionVersions(collection.id)
      const versions = { ...this.state.versions, ...version }
      this.setState({ collections, versions })
    } catch (ex) {
      toast.error(ex.response.data);
      this.setState({ collections: originalCollections });
    }
  }

  async handleDelete (collection) {
    const originalCollections = { ...this.state.collections }
    let collections = { ...this.state.collections }
    delete collections[collection.id]
    this.setState({ collections })
    try {
      await collectionsService.deleteCollection(collection.id);
    } catch (ex) {
      toast.error(ex);
      this.setState({ collections: originalCollections });
    }
  }

  async handleUpdate (editedCollection) {
    const originalCollections = { ...this.state.collections }
    const body = { ...editedCollection }
    delete body.id
    const collections = { ...this.state.collections }
    collections[editedCollection.id] = editedCollection
    this.setState({ collections })
    try {
      await collectionsService.updateCollection(editedCollection.id, body);
    } catch (ex) {
      toast.error(ex.response.data);
      this.setState({ collections: originalCollections });
    }
  }

  async handleAddVersion(newCollectionVersion, collectionId) {
    newCollectionVersion.requestId = shortId.generate();

    const originalVersions = { ...this.state.versions }
    let versions = { ...this.state.versions }
    const requestId = newCollectionVersion.requestId
    versions[requestId] = newCollectionVersion
    this.setState({ versions })
    try {
      const {
        data: version
      } = await collectionVersionsService.saveCollectionVersion(
        collectionId,
        newCollectionVersion
      )
      versions[version.id] = version
      delete versions[requestId]
      this.setState({ versions })
    } catch (ex) {
      toast.error(ex.response.data);
      this.setState({ versions: originalVersions });
    }
  }

  async handleDeleteVersion (deletedCollectionVersionId) {
    const originalVersions = { ...this.state.versions }
    let versions = { ...this.state.versions }
    delete versions[deletedCollectionVersionId]
    this.setState({ versions })
    try {
      await collectionVersionsService.deleteCollectionVersion(
        deletedCollectionVersionId
      );
    } catch (ex) {
      toast.error(ex);
      this.setState({ versions: originalVersions });
    }
  }

  async handleUpdateVersion (version) {
    const originalVersions = { ...this.state.versions }
    const body = { ...version }
    delete body.id
    delete body.collectionId
    const versions = { ...this.state.versions }
    versions[version.id] = version
    this.setState({ versions })
    try {
      await collectionVersionsService.updateCollectionVersion(version.id, body);
    } catch (ex) {
      toast.error(ex.response.data);
      this.setState({ versions: originalVersions });
    }
  }

  async handleAddGroup (versionId, newGroup) {
    newGroup.requestId = shortId.generate()
    const requestId = newGroup.requestId
    const originalGroups = { ...this.state.groups }
    const groups = { ...this.state.groups }
    groups[newGroup.requestId] = { ...newGroup, versionId }
    this.setState({ groups })
    try {
      const { data: group } = await groupsService.saveGroup(versionId, newGroup)
      groups[group.id] = group
      delete groups[requestId]
      this.setState({ groups })
    } catch (ex) {
      toast.error(ex)
      this.setState({ groups: originalGroups })
    }
  }

  async handleDeleteGroup (deletedGroupId) {
    const originalGroups = { ...this.state.groups }
    const groups = { ...this.state.groups }
    delete groups[deletedGroupId]
    this.setState({ groups })
    try {
      await groupsService.deleteGroup(deletedGroupId);
    } catch (ex) {
      toast.error(ex);
      this.setState({ groups: originalGroups });
    }
  }

  async handleUpdateGroup (editedGroup) {
    const originalGroups = { ...this.state.groups }
    const groups = { ...this.state.groups }
    groups[editedGroup.id] = editedGroup
    this.setState({ groups })

    try {
      const body = { ...editedGroup }
      delete body.versionId
      delete body.id
      const { data: group } = await groupsService.updateGroup(
        editedGroup.id,
        body
      )
      groups[editedGroup.id] = group
      this.setState({ groups })
    } catch (ex) {
      toast.error(ex.response.data);
      this.setState({ groups: originalGroups });
    }
  }

  async handleAddVersionPage (versionId, newPage) {
    const { data: page } = await pageService.saveVersionPage(versionId, newPage)
    let pages = { ...this.state.pages }
    pages[page.id] = page
    let pageId = page.id
    this.setState({ pages })
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${pageId}/edit`,
      page: page
    });
  }
  async handleAddGroupPage (versionId, groupId, newPage) {
    const { data: page } = await pageService.saveGroupPage(groupId, newPage)
    let pages = { ...this.state.pages }
    pages[page.id] = page
    let pageId = page.id
    this.setState({ pages })
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${pageId}/edit`,
      page: page
    });
  }

  async handleAddEndpoint(groupId, newEndpoint, versions) {
    const originalEndpoints = {...this.state.endpoints};
    newEndpoint.requestId = shortId.generate();
    const requestId = newEndpoint.requestId
    const endpoints = {...this.state.endpoints};
    endpoints[requestId] = newEndpoint
    this.setState({ endpoints });
    let endpoint = {};
    try {
      const { data: endpoint } = await endpointService.saveEndpoint(groupId, newEndpoint)
      endpoints[endpoint.id] = endpoint;
      delete endpoints.requestId
      this.setState({ endpoints });
    } catch (ex) {
      this.setState({ originalEndpoints });
    }
    this.props.history.push({
      pathname: `/dashboard/collections/endpoints/${endpoint.id}`,
      endpoint: endpoint,
      groups: this.state.groups,
      title: "update endpoint",
      versions: versions,
      groupId: groupId
    });
  }

  async handleDeletePage (deletedPageId) {
    const originalPages = { ...this.state.pages }
    let pages = { ...this.state.pages }
    delete pages[deletedPageId]
    this.setState({ pages })
    try {
      await pageService.deletePage(deletedPageId);
    } catch (ex) {
      toast.error(ex);
      this.setState({ pages: originalPages });
    }
  }

  async handleDeleteEndpoint(deleteEndpointId) {
    await endpointService.deleteEndpoint(deleteEndpointId);
    const endpoints = this.state.endpoints.filter(
      endpoint => endpoint.id !== deleteEndpointId
    );
    this.setState({ endpoints });
  }

  async handleUpdatePage (editedPage, pageId) {
    const originalPages = { ...this.state.pages }
    let pages = { ...this.state.pages }
    pages[pageId] = editedPage
    this.setState({ pages })
    try {
      await pageService.updatePage(pageId, editedPage);
    } catch (ex) {
      toast.error(ex.response.data);
      this.setState({ pages: originalPages });
    }
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${pageId}`,
      page: editedPage
    });
  }

  render() {
    const { location } = this.props;
    if (location.editedEndpoint) {
      const { editedEndpoint, groupId, versionId } = location;
      this.props.history.replace({ editedEndpoint: null });
      this.handleUpdateEndpoint(editedEndpoint, groupId, versionId);
    }

    if (location.deleteEndpointId) {
      const deleteEndpointId = location.deleteEndpointId;
      this.props.history.replace({ deleteEndpointId: null });
      this.handleDeleteEndpoint(deleteEndpointId);
    }

    if (location.title == "Add Endpoint") {
      const { endpoint, groupId } = location;
      this.props.history.replace({
        title: null,
        groupId: null,
        endpoint: null
      });

      this.handleAddEndpoint(groupId, endpoint, this.props.location.versions);
    }

    if (location.newPage && location.groupId) {
      const { versionId, newPage, groupId } = location;
      this.props.history.replace({
        versionId: null,
        groupId: null,
        newPage: null
      });
      this.handleAddGroupPage(versionId, groupId, newPage);
    } else if (location.newPage) {
      const { versionId, newPage } = location;
      this.props.history.replace({ newPage: null });
      this.handleAddVersionPage(versionId, newPage);
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

    if (location.deletePageId) {
      const deletePageId = location.deletePageId;
      this.props.history.replace({ deletedPageId: null });
      this.handleDeletePage(deletePageId);
    }

    if (location.editedGroup) {
      const { editedGroup } = location;
      this.props.history.replace({ editedGroup: null });
      this.handleUpdateGroup(editedGroup);
    }

    if (location.deletedGroupId) {
      const deletedGroupId = location.deletedGroupId;
      this.props.history.replace({ deletedGroupId: null });
      this.handleDeleteGroup(deletedGroupId);
    }

    if (location.newGroup) {
      const { versionId, newGroup } = location;
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
      this.handleUpdateVersion(version);
    }

    if (location.newCollectionVersion) {
      const newCollectionVersion = location.newCollectionVersion;
      const collectionId = location.collectionId;
      this.props.history.replace({ newCollectionVersion: null });
      this.handleAddVersion(newCollectionVersion, collectionId);
    }

    if (location.editedCollection) {
      const editedCollection = location.editedCollection;
      this.props.history.replace({ editedCollection: null });
      this.handleUpdate(editedCollection);
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
                path="/dashboard/collections/:collectionId/versions/:versionId/groups/:groupId/endpoints/:endpointId/edit"
                render={props => (
                  <EndpointForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title="Edit Endpoint"
                  />
                )}
              />
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
                    title='Edit Collection Version'
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
          {Object.keys(this.state.collections).map(collectionId => (
            <Accordion key={collectionId}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                    {this.state.collections[collectionId].name}
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
                          pathname: `/dashboard/collections/${collectionId}/edit`,
                          edited_collection: this.state.collections[
                            collectionId
                          ]
                        })
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
                          this.handleDelete(
                            this.state.collections[collectionId]
                          )
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() => {
                        this.props.history.push({
                          pathname: `/dashboard/collections/${collectionId}/versions/new`
                        })
                      }}
                    >
                      Add Version
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <CollectionVersions
                      {...this.props}
                      collection_id={collectionId}
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
