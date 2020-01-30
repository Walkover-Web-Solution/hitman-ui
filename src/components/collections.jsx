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

class Collections extends Component {
  state = {
    collections: [],
    versions: [],
    groups: [],
    pages: [],
    selectedCollection: {}
  };

  async fetchVersions(collections) {
    let versions = [];
    for (let i = 0; i < collections.length; i++) {
      const {
        data: versions1
      } = await collectionVersionsService.getCollectionVersions(
        collections[i].identifier
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

  async componentDidMount() {
    const { data: collections } = await collectionsService.getCollections();
    this.setState({ collections });
    const versions = await this.fetchVersions(collections);
    const groups = await this.fetchGroups(versions);
    const pages = await this.fetchPagesVersion(versions);
    this.setState({ versions, groups, pages });
  }

  async handleAdd(newCollection) {
    if (newCollection.id) {
      const body = { ...newCollection };
      delete body.id;
      const index = this.state.collections.findIndex(
        collection => collection.id === newCollection.id
      );
      await collectionsService.updateCollection(newCollection.id, body);
      const collections = [...this.state.collections];
      collections[index] = newCollection;
      this.setState({ collections });
    } else {
      const { data: collection } = await collectionsService.saveCollection(
        newCollection
      );
      const collections = [...this.state.collections, collection];
      this.setState({ collections });
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

  handleUpdate(collection) {
    this.state.selectedCollection = collection;
    this.props.history.push(`/collections/${collection.name}/edit`);
  }

  handleAddVersion(collection) {
    this.state.selectedCollection = collection;
    this.props.history.push(`/collections/${collection.name}/versions/new`);
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
    let groups = [...this.state.groups, { ...newGroup, versionId }];
    this.setState({ groups });
    await groupsService.saveGroup(versionId, newGroup);
  }

  async handleAddPage(versionId, newPage) {
    let pages = [...this.state.pages, { ...newPage, versionId, id: 23 }];
    console.log(pages);
    this.setState({ pages });
    await pageService.saveVersionPage(versionId, newPage);
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
    let pages = [...this.state.pages, { ...newPage, versionId, id: 23 }];
    console.log(pages);
    this.setState({ pages });
    await pageService.saveVersionPage(versionId, newPage);
  }
  async handleAddGroupPage(versionId, groupId, newPage) {
    const { data: page } = await pageService.saveGroupPage(
      versionId,
      groupId,
      newPage
    );
    let pages = [...this.state.pages, page];
    console.log("passssssessss", pages);
    // let pages = [...this.state.pages, newPage];
    this.setState({ pages });
  }
  async handleDeletePage(deletedPageId) {
    await pageService.deletePage(deletedPageId);
    const pages = this.state.pages.filter(page => page.id !== deletedPageId);
    this.setState({ pages });
  }

  async handleUpdatePage(editedPage, pageId, versionId) {
    const pages = [
      ...this.state.pages.filter(page => page.id !== pageId),
      { ...editedPage, id: pageId, versionId }
    ];
    this.setState({ pages });
    await pageService.updatePage(pageId, editedPage);
  }

  render() {
    const { location } = this.props;

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

    if (location.deletedPageId) {
      const deletedPageId = location.deletedPageId;
      this.props.history.replace({ deletedPageId: null });
      this.handleDeletePage(deletedPageId);
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
                path="/collections/:id/versions/:versionId/groups/:groupId/pages/new"
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
                path="/collections/:id/versions/:versionId/pages/:pageId/edit"
                render={props => (
                  <PageForm
                    show={true}
                    onHide={() => {}}
                    title="Edit Page"
                    editPage={this.props.location.editPage}
                    versionId={this.props.location.versionId}
                  />
                )}
              />

              <Route
                path="/collections/:id/versions/:versionId/pages/new"
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
                path="/collections/:collectionId/versions/:versionId/groups/:groupId/edit"
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
                path="/collections/:collectionId/versions/:versionId/groups/new"
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
                path="/collections/:id/versions/new"
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
                path="/collections/:collectionId/versions/:versionId/edit"
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
                path="/collections/new"
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
                path="/collections/:id/edit"
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
            <Link to="/collections/new">+ New Collection</Link>
          </button>
          {this.state.collections.map((collection, index) => (
            <Accordion key={collection.id}>
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
                      onClick={() => this.handleUpdate(collection)}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="2"
                      onClick={() => this.handleDelete(collection)}
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
