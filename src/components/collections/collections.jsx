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

const mapStateToProps = state => {
  return { collections: state.collections };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCollections: () => dispatch(fetchCollections()),
    addCollection: newCollection => dispatch(addCollection(newCollection)),
    updateCollection: editedCollection => dispatch(updateCollection(editedCollection)),
    deleteCollection:collection => dispatch(deleteCollection(collection))
  };
};

class CollectionsComponent extends Component {
  state = {
    collections: {},
    versions: {},
    groups: {},
    pages: {},
    endpoints: {},
    collectionIds: [],
    versionIds: [],
    groupIds: [],
    pageIds: [],
    collectionDnDFlag: true,
    showCollectionForm: false,
    collectionFormName: "",
    selectedCollection: {}
  };

  async componentDidMount() {
    console.log(this.props);
    this.props.fetchCollections();
  }

  async fetchVersions(collections) {
    let versions = {};
    const collectionIds = Object.keys(collections);
    for (let i = 0; i < collectionIds.length; i++) {
      const {
        data: versions1
      } = await collectionVersionsService.getCollectionVersions(
        collectionIds[i]
      );
      versions = { ...versions, ...versions1 };
    }
    return versions;
  }

  async fetchGroups(versions) {
    let groups = {};
    const versionIds = Object.keys(versions);
    for (let i = 0; i < versionIds.length; i++) {
      const { data: groups1 } = await groupsService.getGroups(versionIds[i]);
      groups = { ...groups, ...groups1 };
    }
    return groups;
  }

  async fetchPages(versions) {
    let pages = {};
    const versionIds = Object.keys(versions);
    for (let i = 0; i < versionIds.length; i++) {
      let { data: newPages } = await pageService.getVersionPages(versionIds[i]);
      pages = { ...pages, ...newPages };
    }
    return pages;
  }

  async fetchEndpoints(groups) {
    let endpoints = {};
    const groupIds = Object.keys(groups);
    for (let i = 0; i < groupIds.length; i++) {
      let { data: newEndpoints } = await endpointService.getEndpoints(
        groupIds[i]
      );
      endpoints = { ...endpoints, ...newEndpoints };
    }
    return endpoints;
  }

  

  closeCollectionForm() {
    this.setState({ showCollectionForm: false });
  }

  collectionDnD(collectionDnDFlag) {
    this.setState({ collectionDnDFlag });
  }

  setVersionIds(versionIds) {
    this.setState({ versionIds });
  }

  setGroupIds(groupIds) {
    this.setState({ groupIds });
  }

  setPageIds(pageIds) {
    this.setState({ pageIds });
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
    this.props.deleteCollection(collection)
  }

  async handleUpdateCollection(editedCollection) {
    this.props.updateCollection(editedCollection);
  }

  async handleAddVersion(newCollectionVersion, collectionId) {
    newCollectionVersion.requestId = shortId.generate();
    const originalVersions = { ...this.state.versions };
    const originalVersionIds = [...this.state.versionIds];
    let versions = { ...this.state.versions };
    const requestId = newCollectionVersion.requestId;
    versions[requestId] = { ...newCollectionVersion, collectionId };
    this.setState({ versions });
    try {
      const {
        data: version
      } = await collectionVersionsService.saveCollectionVersion(
        collectionId,
        newCollectionVersion
      );
      versions[version.id] = version;
      delete versions[requestId];
      const versionIds = [...this.state.versionIds, version.id.toString()];
      this.setState({ versions, versionIds });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({
        versions: originalVersions,
        versionIds: originalVersionIds
      });
    }
  }

  async handleDeleteVersion(deletedCollectionVersionId) {
    const originalVersions = { ...this.state.versions };
    const originalVersionIds = [...this.state.versionIds];
    let versions = { ...this.state.versions };
    delete versions[deletedCollectionVersionId];
    const versionIds = this.state.versionIds.filter(
      vId => vId !== deletedCollectionVersionId.toString()
    );
    await this.setState({ versions, versionIds });
    try {
      await collectionVersionsService.deleteCollectionVersion(
        deletedCollectionVersionId
      );
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({
        versions: originalVersions,
        versionIds: originalVersionIds
      });
    }
  }

  async handleUpdateVersion(version) {
    const originalVersions = { ...this.state.versions };
    const body = { ...version };
    delete body.id;
    delete body.collectionId;
    const versions = { ...this.state.versions };
    versions[version.id] = version;
    this.setState({ versions });
    try {
      await collectionVersionsService.updateCollectionVersion(version.id, body);
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ versions: originalVersions });
    }
  }
  async handleImportVersion(importLink, shareIdentifier, collectionId) {
    let orignalVersion = { ...this.state.versions };
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

  async handleAddGroup(versionId, newGroup) {
    newGroup.requestId = shortId.generate();
    newGroup.endpointsOrder = [];
    const requestId = newGroup.requestId;
    const originalGroupIds = [...this.state.groupIds];
    const originalGroups = { ...this.state.groups };
    const groups = { ...this.state.groups };
    groups[newGroup.requestId] = { ...newGroup, versionId };
    this.setState({ groups });
    try {
      const { data: group } = await groupsService.saveGroup(
        versionId,
        newGroup
      );
      groups[group.id] = group;
      delete groups[requestId];
      const groupIds = [...this.state.groupIds, group.id.toString()];
      this.setState({ groups, groupIds });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ groups: originalGroups, groupIds: originalGroupIds });
    }
  }

  async handleDeleteGroup(deletedGroupId) {
    const originalGroups = { ...this.state.groups };
    const originalGroupIds = [...this.state.groupIds];
    const groups = { ...this.state.groups };
    delete groups[deletedGroupId];
    const groupIds = this.state.groupIds.filter(
      gId => gId !== deletedGroupId.toString()
    );
    this.setState({ groups, groupIds });
    try {
      await groupsService.deleteGroup(deletedGroupId);
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ groups: originalGroups, groupIds: originalGroupIds });
    }
  }

  async handleUpdateGroup(editedGroup) {
    editedGroup.endpointsOrder = this.state.groups[
      editedGroup.id
    ].endpointsOrder;
    const originalGroups = { ...this.state.groups };
    const groups = { ...this.state.groups };
    groups[editedGroup.id] = editedGroup;
    this.setState({ groups });

    try {
      const body = { ...editedGroup };
      delete body.versionId;
      delete body.id;
      const { data: group } = await groupsService.updateGroup(
        editedGroup.id,
        body
      );
      groups[editedGroup.id] = group;
      this.setState({ groups });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ groups: originalGroups });
    }
  }

  async handleAddVersionPage(versionId, newPage) {
    newPage.requestId = shortId.generate();
    const requestId = newPage.requestId;
    const originalPageIds = [...this.state.pageIds];
    const originalPages = { ...this.state.pages };
    let pages = { ...this.state.pages };
    pages[requestId] = { ...newPage, versionId };
    this.setState({ pages });
    try {
      const { data: page } = await pageService.saveVersionPage(
        versionId,
        newPage
      );
      pages[page.id] = page;
      delete pages[requestId];
      const pageIds = [...this.state.pageIds, page.id.toString()];
      this.setState({ pages, pageIds });
      this.props.history.push({
        pathname: `/dashboard/collections/pages/${page.id}/edit`,
        page: page
      });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ pages: originalPages, pageIds: originalPageIds });
    }
  }

  async handleAddGroupPage(versionId, groupId, newPage) {
    newPage.requestId = shortId.generate();
    const requestId = newPage.requestId;
    const originalPageIds = [...this.state.pageIds];
    const originalPages = { ...this.state.pages };
    let pages = { ...this.state.pages };
    pages[requestId] = { ...newPage, versionId };
    this.setState({ pages });
    try {
      const { data: page } = await pageService.saveGroupPage(groupId, newPage);
      pages[page.id] = page;
      delete pages[requestId];
      const pageIds = [...this.state.pageIds, page.id.toString()];
      this.setState({ pages, pageIds });
      this.props.history.push({
        pathname: `/dashboard/collections/pages/${page.id}/edit`,
        page: page
      });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ pages: originalPages, pageIds: originalPageIds });
    }
  }

  async handleDeletePage(deletedPageId) {
    const originalPages = { ...this.state.pages };
    const originalPageIds = [...this.state.pageIds];
    let pages = { ...this.state.pages };
    delete pages[deletedPageId];
    const pageIds = this.state.pageIds.filter(
      pId => pId !== deletedPageId.toString()
    );
    this.setState({ pages, pageIds });
    try {
      await pageService.deletePage(deletedPageId);
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ pages: originalPages, pageIds: originalPageIds });
    }
  }

  async handleUpdatePage(editedPage, pageId) {
    let editPage = { ...editedPage };
    delete editPage.id;
    delete editPage.versionId;
    delete editPage.groupId;
    const originalPages = { ...this.state.pages };
    let pages = { ...this.state.pages };
    pages[pageId] = editedPage;
    this.setState({ pages });
    try {
      await pageService.updatePage(pageId, editPage);
      this.props.history.push({
        pathname: `/dashboard/collections/pages/${pageId}`,
        page: editedPage
      });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ pages: originalPages });
    }
  }

  async handleAddEndpoint(groupId, newEndpoint, versions) {
    const originalEndpoints = { ...this.state.endpoints };
    const originalGroups = { ...this.state.groups };
    newEndpoint.requestId = shortId.generate();
    const requestId = newEndpoint.requestId;
    const endpoints = { ...this.state.endpoints };
    const groups = { ...this.state.groups };
    endpoints[requestId] = newEndpoint;
    newEndpoint.groupId = groupId;

    this.setState({ endpoints });
    let endpoint = {};
    try {
      delete newEndpoint.groupId;
      const { data } = await endpointService.saveEndpoint(groupId, newEndpoint);
      endpoint = data;
      endpoints[endpoint.id] = endpoint;
      delete endpoints.requestId;
      groups[groupId].endpointsOrder.push(endpoint.id.toString());
      this.setState({ endpoints, groups });
      this.props.history.push({
        pathname: `/dashboard/collections/endpoints/${endpoint.id}`,
        endpoint: endpoint,
        groups: this.state.groups,
        title: "update endpoint",
        versions: versions,
        groupId: groupId
      });
    } catch (ex) {
      this.props.history.push({
        pathname: "/dashboard/collections/endpoints",
        endpoint: endpoint,
        versions: versions,
        groupId: groupId,
        title: "Add New Endpoint",
        groups: this.state.groups
      });
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ endpoints: originalEndpoints });
    }
  }

  async updateEndpoint(endpointId, groupId, newEndpoint, versions) {
    const originalEndpoints = { ...this.state.endpoints };
    let currentEndpoint = { ...newEndpoint };
    delete currentEndpoint.groupId;
    try {
      let endpoint = newEndpoint;
      endpoint.groupId = groupId;
      endpoint.id = endpointId;
      let endpoints = { ...this.state.endpoints };
      endpoints[endpointId] = endpoint;

      await endpointService.updateEndpoint(endpointId, currentEndpoint);
      this.props.history.push({
        pathname: `/dashboard/collections/endpoints/${endpointId}`,
        endpoint: newEndpoint,
        versions: versions,
        groupId: groupId,
        title: "update endpoint",
        groups: this.state.groups
      });
      this.setState({ endpoints });
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ endpoints: originalEndpoints });
    }
  }

  async handleDeleteEndpoint(deletedEndpointId, groupId) {
    const originalEndpoints = { ...this.state.endpoints };
    const originalGroups = { ...this.state.groups };
    const endpoints = { ...this.state.endpoints };
    const groups = { ...this.state.groups };
    delete endpoints[deletedEndpointId];
    groups[groupId].endpointsOrder = groups[groupId].endpointsOrder.filter(
      eId => eId !== deletedEndpointId.toString()
    );
    this.setState({ endpoints, groups });
    try {
      await endpointService.deleteEndpoint(deletedEndpointId);
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : "Something went wrong");
      this.setState({ endpoints: originalEndpoints, groups: originalGroups });
    }
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

  onDragStart = (e, index) => {
    if (!this.state.collectionDnDFlag) return;

    this.draggedItem = this.state.collectionIds[index];
  };

  onDragOver = (e, index) => {
    if (!this.state.collectionDnDFlag) return;
    e.preventDefault();
    const draggedOverItem = this.state.collectionIds[index];
    if (this.draggedItem === draggedOverItem) {
      return;
    }
    let collectionIds = this.state.collectionIds.filter(
      item => item !== this.draggedItem
    );
    collectionIds.splice(index, 0, this.draggedItem);
    this.setState({ collectionIds });
  };

  render() {
    const { location } = this.props;

    if (location.editedEndpoint) {
      const { editedEndpoint, groupId, versionId } = location;
      this.props.history.replace({ editedEndpoint: null });
      this.handleUpdateEndpoint(editedEndpoint, groupId, versionId);
    }

    if (location.deleteEndpointId) {
      const deleteEndpointId = location.deleteEndpointId;
      const groupId = location.groupId;
      this.props.history.replace({ deleteEndpointId: null });
      this.handleDeleteEndpoint(deleteEndpointId, groupId);
    }

    if (location.duplicateEndpoint) {
      const duplicateEndpoint = location.duplicateEndpoint;
      this.props.history.replace({ duplicateEndpoint: null });
      this.handleDuplicateEndpoint(duplicateEndpoint);
    }

    if (location.title === "Add Endpoint") {
      const { endpoint, groupId } = location;
      this.props.history.replace({
        title: null,
        groupId: null,
        endpoint: null
      });
      this.handleAddEndpoint(groupId, endpoint, this.props.location.versions);
    }

    if (location.title === "update Endpoint") {
      const { endpoint, groupId, endpointId } = location;
      this.props.history.replace({
        title: null,
        groupId: null,
        endpoint: null,
        endpointId: null
      });
      this.updateEndpoint(
        endpointId,
        groupId,
        endpoint,
        this.props.location.versions
      );
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

    if (location.duplicatePage) {
      const duplicatePage = location.duplicatePage;
      this.props.history.replace({ duplicatePage: null });
      this.handleDuplicatePage(duplicatePage);
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

    if (location.duplicateGroup) {
      const duplicateGroup = location.duplicateGroup;
      this.props.history.replace({ duplicateGroup: null });
      this.handleDuplicateGroup(duplicateGroup);
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

    if (location.editedCollection) {
      const editedCollection = location.editedCollection;
      this.props.history.replace({ editedCollection: null });
      this.handleUpdate(editedCollection);
    }

    if (location.newCollection) {
      const newCollection = location.newCollection;
      this.props.history.replace({ newCollection: null });
      this.handleAddCollection(newCollection);
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
                add_new_collection={this.handleAddCollection.bind(this)}
                edited_collection={this.state.selectedCollection}
                edit_collection={this.handleUpdateCollection.bind(this)}
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
                          pathname: `/dashboard/collections/${collectionId}/versions/new`
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
                      versions={this.state.versions}
                      groups={this.state.groups}
                      pages={this.state.pages}
                      endpoints={this.state.endpoints}
                      version_ids={this.state.versionIds}
                      group_ids={this.state.groupIds}
                      page_ids={this.state.pageIds}
                      set_version_id={this.setVersionIds.bind(this)}
                      set_endpoint_id={this.setEndpointIds.bind(this)}
                      set_group_id={this.setGroupIds.bind(this)}
                      set_page_id={this.setPageIds.bind(this)}
                      collection_dnd={this.collectionDnD.bind(this)}
                      dnd_move_endpoint={this.dndMoveEndpoint.bind(this)}
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

export default connect(mapStateToProps,mapDispatchToProps)(CollectionsComponent)
