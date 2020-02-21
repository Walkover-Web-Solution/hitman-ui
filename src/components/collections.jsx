import React, { Component } from 'react'
import { Link } from 'react-router-dom'
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
import endpointService from "../services/endpointService";
import shortId from "shortid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class Collections extends Component {
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
    collectionDnDFlag: true
  }

  async fetchVersions(collections) {
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
    return versions
  }

  async fetchGroups(versions) {
    let groups = {}
    const versionIds = Object.keys(versions)
    for (let i = 0; i < versionIds.length; i++) {
      const { data: groups1 } = await groupsService.getGroups(versionIds[i]);
      groups = { ...groups, ...groups1 };
    }
    return groups
  }

  async fetchPages(versions) {
    let pages = {}
    const versionIds = Object.keys(versions)
    for (let i = 0; i < versionIds.length; i++) {
      let { data: newPages } = await pageService.getVersionPages(versionIds[i])
      pages = { ...pages, ...newPages }
    }
    return pages
  }

  async fetchEndpoints(groups) {
    let endpoints = {}
    const groupIds = Object.keys(groups)
    for (let i = 0; i < groupIds.length; i++) {
      let { data: newEndpoints } = await endpointService.getEndpoints(
        groupIds[i]
      );
      endpoints = { ...endpoints, ...newEndpoints };
    }
    return endpoints;
  }

  async componentDidMount() {
    const { data: collections } = await collectionsService.getCollections();
    const collectionIds = Object.keys(collections);
    this.setState({ collections, collectionIds });
    const versions = await this.fetchVersions(collections);
    const groups = await this.fetchGroups(versions);
    const pages = await this.fetchPages(versions);
    const endpoints = await this.fetchEndpoints(groups);
    const versionIds = Object.keys(versions);
    const groupIds = Object.keys(groups);
    const pageIds = Object.keys(pages);
    this.setState({
      versions,
      groups,
      pages,
      endpoints,
      versionIds,
      groupIds,
      pageIds
    });
  }

  collectionDnD(collectionDnDFlag) {
    this.setState({ collectionDnDFlag })
  }

  setVersionIds(versionIds) {
    this.setState({ versionIds })
  }

  setGroupIds(groupIds) {
    this.setState({ groupIds })
  }

  setPageIds(pageIds) {
    this.setState({ pageIds })
  }

  async setEndpointIds(groupId, endpointsOrder) {
    const groups = { ...this.state.groups }
    groups[groupId].endpointsOrder = endpointsOrder
    this.setState({ groups });
    const { name, host } = groups[groupId]
    const group = { name, host, endpointsOrder }
    try {
      await groupsService.updateGroup(groupId, group)
    }
    catch (e) {
      toast.error(e)
    }
  }
  async handleAdd(newCollection) {
    newCollection.requestId = shortId.generate()
    const originalCollections = { ...this.state.collections }
    const originalCollectionIds = [...this.state.collectionIds]
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
      const versionIds = [...this.state.versionIds, Object.keys(version)[0]]
      const collectionIds = [...this.state.collectionIds, collection.id]
      this.setState({ collections, versions, collectionIds, versionIds })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({
        collections: originalCollections,
        collectionIds: originalCollectionIds
      })
    }
  }

  async handleDelete(collection) {
    const originalCollections = { ...this.state.collections }
    const originalCollectionIds = [...this.state.collectionIds]
    let collections = { ...this.state.collections }
    const collectionIds = this.state.collectionIds.filter(
      cId => cId !== collection.id
    )
    delete collections[collection.id]
    this.setState({ collections, collectionIds })
    try {
      await collectionsService.deleteCollection(collection.id)
      this.props.history.push('/dashboard/collections')
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({
        collections: originalCollections,
        collectionIds: originalCollectionIds
      })
    }
  }

  async handleUpdate(editedCollection) {
    const originalCollections = { ...this.state.collections }
    const body = { ...editedCollection }
    delete body.id
    const collections = { ...this.state.collections }
    collections[editedCollection.id] = editedCollection
    this.setState({ collections })
    try {
      await collectionsService.updateCollection(editedCollection.id, body)
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ collections: originalCollections })
    }
  }

  async handleAddVersion(newCollectionVersion, collectionId) {
    newCollectionVersion.requestId = shortId.generate()
    const originalVersions = { ...this.state.versions }
    const originalVersionIds = [...this.state.versionIds]
    let versions = { ...this.state.versions }
    const requestId = newCollectionVersion.requestId
    versions[requestId] = { ...newCollectionVersion, collectionId }
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
      const versionIds = [...this.state.versionIds, version.id.toString()]
      this.setState({ versions, versionIds })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({
        versions: originalVersions,
        versionIds: originalVersionIds
      })
    }
  }

  async handleDeleteVersion(deletedCollectionVersionId) {
    const originalVersions = { ...this.state.versions }
    const originalVersionIds = [...this.state.versionIds]
    let versions = { ...this.state.versions }
    delete versions[deletedCollectionVersionId]
    const versionIds = this.state.versionIds.filter(
      vId => vId !== deletedCollectionVersionId.toString()
    )
    await this.setState({ versions, versionIds })
    try {
      await collectionVersionsService.deleteCollectionVersion(
        deletedCollectionVersionId
      )
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({
        versions: originalVersions,
        versionIds: originalVersionIds
      })
    }
  }

  async handleUpdateVersion(version) {
    const originalVersions = { ...this.state.versions }
    const body = { ...version }
    delete body.id
    delete body.collectionId
    const versions = { ...this.state.versions }
    versions[version.id] = version
    this.setState({ versions })
    try {
      await collectionVersionsService.updateCollectionVersion(version.id, body)
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ versions: originalVersions })
    }
  }

  async handleAddGroup(versionId, newGroup) {
    newGroup.requestId = shortId.generate();
    newGroup.endpointsOrder = []
    const requestId = newGroup.requestId;
    const originalGroupIds = [...this.state.groupIds];
    const originalGroups = { ...this.state.groups };
    const groups = { ...this.state.groups };
    groups[newGroup.requestId] = { ...newGroup, versionId };
    this.setState({ groups });
    try {
      const { data: group } = await groupsService.saveGroup(versionId, newGroup)
      groups[group.id] = group
      delete groups[requestId]
      const groupIds = [...this.state.groupIds, group.id.toString()]
      this.setState({ groups, groupIds })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ groups: originalGroups, groupIds: originalGroupIds })
    }
  }

  async handleDeleteGroup(deletedGroupId) {
    const originalGroups = { ...this.state.groups }
    const originalGroupIds = [...this.state.groupIds]
    const groups = { ...this.state.groups }
    delete groups[deletedGroupId]
    const groupIds = this.state.groupIds.filter(
      gId => gId !== deletedGroupId.toString()
    )
    this.setState({ groups, groupIds })
    try {
      await groupsService.deleteGroup(deletedGroupId)
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ groups: originalGroups, groupIds: originalGroupIds })
    }
  }

  async handleUpdateGroup(editedGroup) {
    editedGroup.endpointsOrder = this.state.groups[editedGroup.id].endpointsOrder
    const originalGroups = { ...this.state.groups };
    const groups = { ...this.state.groups };
    groups[editedGroup.id] = editedGroup;
    this.setState({ groups });

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
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ groups: originalGroups })
    }
  }

  async handleAddVersionPage(versionId, newPage) {
    newPage.requestId = shortId.generate()
    const requestId = newPage.requestId
    const originalPageIds = [...this.state.pageIds]
    const originalPages = { ...this.state.pages }
    let pages = { ...this.state.pages }
    pages[requestId] = { ...newPage, versionId }
    this.setState({ pages })
    try {
      const { data: page } = await pageService.saveVersionPage(
        versionId,
        newPage
      )
      pages[page.id] = page
      delete pages[requestId]
      const pageIds = [...this.state.pageIds, page.id.toString()]
      this.setState({ pages, pageIds })
      this.props.history.push({
        pathname: `/dashboard/collections/pages/${page.id}/edit`,
        page: page
      })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ pages: originalPages, pageIds: originalPageIds })
    }
  }

  async handleAddGroupPage(versionId, groupId, newPage) {
    newPage.requestId = shortId.generate()
    const requestId = newPage.requestId
    const originalPageIds = [...this.state.pageIds]
    const originalPages = { ...this.state.pages }
    let pages = { ...this.state.pages }
    pages[requestId] = { ...newPage, versionId }
    this.setState({ pages })
    try {
      const { data: page } = await pageService.saveGroupPage(groupId, newPage)
      pages[page.id] = page
      delete pages[requestId]
      const pageIds = [...this.state.pageIds, page.id.toString()]
      this.setState({ pages, pageIds })
      this.props.history.push({
        pathname: `/dashboard/collections/pages/${page.id}/edit`,
        page: page
      })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ pages: originalPages, pageIds: originalPageIds })
    }
  }

  async handleDeletePage(deletedPageId) {
    const originalPages = { ...this.state.pages }
    const originalPageIds = [...this.state.pageIds]
    let pages = { ...this.state.pages }
    delete pages[deletedPageId]
    const pageIds = this.state.pageIds.filter(
      pId => pId !== deletedPageId.toString()
    )
    this.setState({ pages, pageIds })
    try {
      await pageService.deletePage(deletedPageId)
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ pages: originalPages, pageIds: originalPageIds })
    }
  }

  async handleUpdatePage(editedPage, pageId) {
    let editPage = { ...editedPage }
    delete editPage.id
    delete editPage.versionId
    delete editPage.groupId
    console.log(editPage, editedPage)
    const originalPages = { ...this.state.pages }
    let pages = { ...this.state.pages }
    pages[pageId] = editedPage
    this.setState({ pages })
    try {
      await pageService.updatePage(pageId, editPage)
      this.props.history.push({
        pathname: `/dashboard/collections/pages/${pageId}`,
        page: editedPage
      })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ pages: originalPages })
    }
  }

  async handleAddEndpoint(groupId, newEndpoint, versions) {
    const originalEndpoints = { ...this.state.endpoints };
    const originalGroups = { ...this.state.groups }
    newEndpoint.requestId = shortId.generate();
    const requestId = newEndpoint.requestId;
    const endpoints = { ...this.state.endpoints };
    const groups = { ...this.state.groups };
    endpoints[requestId] = newEndpoint;
    this.setState({ endpoints });
    let endpoint = {};
    try {
      const { data } = await endpointService.saveEndpoint(groupId, newEndpoint);
      endpoint = data;
      endpoints[endpoint.id] = endpoint;
      delete endpoints.requestId;
      groups[groupId].endpointsOrder.push(endpoint.id.toString())
      this.setState({ endpoints, groups });
      this.props.history.push({
        pathname: `/dashboard/collections/endpoints/${endpoint.id}`,
        endpoint: endpoint,
        groups: this.state.groups,
        title: 'update endpoint',
        versions: versions,
        groupId: groupId
      })
    } catch (ex) {
      this.props.history.push({
        pathname: '/dashboard/collections/endpoints',
        endpoint: endpoint,
        versions: versions,
        groupId: groupId,
        title: 'Add New Endpoint',
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
      let endpoint = newEndpoint
      endpoint.groupId = groupId
      endpoint.id = endpointId
      let endpoints = { ...this.state.endpoints }
      endpoints[endpointId] = endpoint

      await endpointService.updateEndpoint(endpointId, currentEndpoint)
      this.props.history.push({
        pathname: `/dashboard/collections/endpoints/${endpointId}`,
        endpoint: newEndpoint,
        versions: versions,
        groupId: groupId,
        title: 'update endpoint',
        groups: this.state.groups
      })
      this.setState({ endpoints })
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

    let originalEndpoints = { ...this.state.endpoints }
    let endpoints = { ...this.state.endpoints }

    try {
      const { data } = await endpointService.duplicateEndpoint(endpointCopy.id);
      console.log('data', data);
      let endpoint = data
      endpoints[endpoint.id] = endpoint
      console.log('endpoints', endpoints)
      const endpointIds = [...this.state.endpointIds, endpoint.id.toString()]
      this.setState({ endpoints, endpointIds })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ originalEndpoints })
    }
  }

  async handleDuplicatePage(pageCopy) {
    let originalPage = { ...this.state.pages }
    let pages = { ...this.state.pages }
    let page = {}
    try {
      const { data } = await pageService.duplicatePage(pageCopy.id);
      page = data;
      pages[page.id] = page
      const pageIds = [...this.state.pageIds, page.id.toString()]
      this.setState({ pages, pageIds })
    } catch (ex) {
      console.log(ex)
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ originalPage })
    }
  }


  async handleDuplicateGroup(groupCopy) {
    let originalGroup = { ...this.state.groups }
    let groups = { ...this.state.groups }
    let group = {}
    let endpoints = {}
    let pages = {}
    try {
      const { data } = await groupsService.duplicateGroup(groupCopy.id);
      endpoints = { ...this.state.endpoints, ...data.endpoints }
      pages = { ...this.state.pages, ...data.pages }
      group = data.groups;
      groups[group.id] = group
      const groupIds = [...this.state.groupIds, group.id.toString()]
      const pageIds = [...this.state.pageIds, ...Object.keys(data.pages)]
      this.setState({ groups, groupIds, endpoints, pages, pageIds })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ originalGroup })
    }
  }

  async handleDuplicateVersion(versionCopy) {
    let orignalVersion = { ...this.state.versions }
    let versions = { ...this.state.versions }
    let version = {}
    let endpoints = {}
    let pages = {}
    let groups = {}
    try {
      const { data } = await collectionVersionsService.duplicateVersion(versionCopy.id);
      version = data.version;
      versions[version.id] = version
      groups = { ...this.state.groups, ...data.groups }
      endpoints = { ...this.state.endpoints, ...data.endpoints }
      pages = { ...this.state.pages, ...data.pages }
      const versionIds = [...this.state.versionIds, version.id.toString()]
      const groupIds = [...this.state.groupIds, ...Object.keys(data.groups)]
      const pageIds = [...this.state.pageIds, ...Object.keys(data.pages)]
      this.setState({ versions, versionIds, groups, groupIds, endpoints, pages, pageIds })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ orignalVersion })
    }
  }

  async handleDuplicateCollection(collectionCopy) {
    let originalCollection = { ...this.state.collections }
    let collections = { ...this.state.collections }
    let versions = {}
    let endpoints = {}
    let pages = {}
    let groups = {}
    let collection = {}
    try {
      const { data } = await collectionsService.duplicateCollection(collectionCopy.id);
      collection = data.collection;
      collections[collection.id] = collection
      versions = { ...this.state.versions, ...data.versions }
      groups = { ...this.state.groups, ...data.groups }
      endpoints = { ...this.state.endpoints, ...data.endpoints }
      pages = { ...this.state.pages, ...data.pages }
      const collectionIds = [...this.state.collectionIds, collection.id.toString()]
      const versionIds = [...this.state.versionIds, ...Object.keys(data.versions)]
      const groupIds = [...this.state.groupIds, ...Object.keys(data.groups)]
      const pageIds = [...this.state.pageIds, ...Object.keys(data.pages)]
      this.setState({ collections, collectionIds, versions, versionIds, groups, groupIds, endpoints, pages, pageIds })
    } catch (ex) {
      toast.error(ex.response ? ex.response.data : 'Something went wrong')
      this.setState({ originalCollection })
    }

  }


  onDragStart = (e, index) => {
    if (!this.state.collectionDnDFlag) return

    this.draggedItem = this.state.collectionIds[index]
  }

  onDragOver = (e, index) => {
    if (!this.state.collectionDnDFlag) return
    e.preventDefault()
    const draggedOverItem = this.state.collectionIds[index]
    if (this.draggedItem === draggedOverItem) {
      return
    }
    let collectionIds = this.state.collectionIds.filter(
      item => item !== this.draggedItem
    )
    collectionIds.splice(index, 0, this.draggedItem)
    this.setState({ collectionIds })
  }
  render() {
    const { location } = this.props

    if (location.editedEndpoint) {
      const { editedEndpoint, groupId, versionId } = location
      this.props.history.replace({ editedEndpoint: null })
      this.handleUpdateEndpoint(editedEndpoint, groupId, versionId)
    }

    if (location.deleteEndpointId) {
      const deleteEndpointId = location.deleteEndpointId;
      const groupId = location.groupId;
      this.props.history.replace({ deleteEndpointId: null });
      this.handleDeleteEndpoint(deleteEndpointId, groupId);
    }

    if (location.duplicateEndpoint) {
      const duplicateEndpoint = location.duplicateEndpoint
      this.props.history.replace({ duplicateEndpoint: null })
      this.handleDuplicateEndpoint(duplicateEndpoint)
    }

    if (location.title === 'Add Endpoint') {
      const { endpoint, groupId } = location
      this.props.history.replace({
        title: null,
        groupId: null,
        endpoint: null
      })
      this.handleAddEndpoint(groupId, endpoint, this.props.location.versions)
    }

    if (location.title === 'update Endpoint') {
      const { endpoint, groupId, endpointId } = location
      this.props.history.replace({
        title: null,
        groupId: null,
        endpoint: null,
        endpointId: null
      })
      this.updateEndpoint(
        endpointId,
        groupId,
        endpoint,
        this.props.location.versions
      )
    }

    if (location.newPage && location.groupId) {
      const { versionId, newPage, groupId } = location
      this.props.history.replace({
        versionId: null,
        groupId: null,
        newPage: null
      })
      this.handleAddGroupPage(versionId, groupId, newPage)
    }
    else if (location.newPage) {
      const { versionId, newPage } = location
      this.props.history.replace({ newPage: null })
      this.handleAddVersionPage(versionId, newPage)
    }

    if (location.editedPage && location.groupId) {
      const { id: pageId } = location.editedPage
      this.props.history.replace({ editedPage: null })
      this.handleUpdatePage(location.editedPage, pageId)
    } else if (location.editedPage) {
      const { id: pageId } = location.editedPage
      this.props.history.replace({ editedPage: null })
      this.handleUpdatePage(location.editedPage, pageId)
    }

    if (location.deletePageId) {
      const deletePageId = location.deletePageId
      this.props.history.replace({ deletedPageId: null })
      this.handleDeletePage(deletePageId)
    }

    if (location.duplicatePage) {
      const duplicatePage = location.duplicatePage
      this.props.history.replace({ duplicatePage: null })
      this.handleDuplicatePage(duplicatePage)
    }

    if (location.editedGroup) {
      const { editedGroup } = location
      this.props.history.replace({ editedGroup: null })
      this.handleUpdateGroup(editedGroup)
    }

    if (location.deletedGroupId) {
      const deletedGroupId = location.deletedGroupId
      this.props.history.replace({ deletedGroupId: null })
      this.handleDeleteGroup(deletedGroupId)
    }

    if (location.duplicateGroup) {
      const duplicateGroup = location.duplicateGroup
      this.props.history.replace({ duplicateGroup: null })
      this.handleDuplicateGroup(duplicateGroup)
    }

    if (location.newGroup) {
      const { versionId, newGroup } = location
      this.props.history.replace({ newGroup: null })
      this.handleAddGroup(versionId, newGroup)
    }

    if (location.deletedCollectionVersionId) {
      const deletedCollectionVersionId = location.deletedCollectionVersionId
      this.props.history.replace({ deletedCollectionVersionId: null })
      this.handleDeleteVersion(deletedCollectionVersionId)
    }

    if (location.editedCollectionVersion) {
      const version = location.editedCollectionVersion
      this.props.history.replace({ editedCollectionVersion: null })
      this.handleUpdateVersion(version)
    }

    if (location.newCollectionVersion) {
      const newCollectionVersion = location.newCollectionVersion
      const collectionId = location.collectionId
      this.props.history.replace({ newCollectionVersion: null })
      this.handleAddVersion(newCollectionVersion, collectionId)
    }

    if (location.duplicateVersion) {
      const duplicateVersion = location.duplicateVersion
      this.props.history.replace({ duplicateVersion: null })
      this.handleDuplicateVersion(duplicateVersion)
    }

    if (location.editedCollection) {
      const editedCollection = location.editedCollection
      this.props.history.replace({ editedCollection: null })
      this.handleUpdate(editedCollection)
    }

    if (location.newCollection) {
      const newCollection = location.newCollection
      this.props.history.replace({ newCollection: null })
      this.handleAdd(newCollection)
    }


    return (
      <div>
        <div className='App-Nav'>
          <div className='tabs'>
            <Switch>
              <Route
                path="/dashboard/collections/:id/versions/:versionId/groups/:groupId/pages/new"
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: '/dashboard/collections'
                      })
                    }}
                    title='Add new Group Page'
                  />
                )}
              />
              <Route
                path='/dashboard/collections/:id/versions/:versionId/pages/:pageId/edit'
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    title='Edit Page'
                    editPage={this.props.location.editPage}
                    versionId={this.props.location.versionId}
                  />
                )}
              />

              <Route
                path='/dashboard/collections/:id/versions/:versionId/pages/new'
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: '/dashboard/collections'
                      })
                    }}
                    title='Add New Version Page'
                    versionId={this.props.location.versionId}
                  />
                )}
              />
              <Route
                path='/dashboard/collections/:collectionId/versions/:versionId/groups/:groupId/edit'
                render={props => (
                  <GroupForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: '/dashboard/collections'
                      })
                    }}
                    title='Edit Group'
                  />
                )}
              />
              <Route
                path='/dashboard/collections/:collectionId/versions/:versionId/groups/new'
                render={props => (
                  <GroupForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: '/dashboard/collections'
                      })
                    }}
                    title='Add new Group'
                  />
                )}
              />
              <Route
                path='/dashboard/collections/:id/versions/new'
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: '/dashboard/collections'
                      })
                    }}
                    title='Add new Collection Version'
                  />
                )}
              />
              <Route
                path='/dashboard/collections/:collectionId/versions/:versionId/edit'
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: '/dashboard/collections'
                      })
                    }}
                    title='Edit Collection Version'
                  />
                )}
              />
              <Route
                path='/dashboard/collections/new'
                render={props => (
                  <CollectionForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: '/dashboard/collections'
                      })
                    }}
                    title='Add new Collection'
                  />
                )}
              />
              <Route
                path='/dashboard/collections/:id/edit'
                render={props => (
                  <CollectionForm
                    {...props}
                    show={true}
                    onHide={() => {
                      this.props.history.push({
                        pathname: '/dashboard/collections'
                      })
                    }}
                    title='Edit Collection'
                  />
                )}
              />
            </Switch>
          </div>
        </div>
        <div className='App-Side'>
          <button className='btn btn-default btn-lg'>
            <Link to='/dashboard/collections/new'>+ New Collection</Link>
          </button>
          {this.state.collectionIds.map((collectionId, index) => (
            <Accordion key={collectionId}>
              <Card>
                <Card.Header
                  draggable={this.state.collectionDnDFlag}
                  onDragOver={e => this.onDragOver(e, index)}
                  onDragStart={e => this.onDragStart(e, index)}
                  onDragEnd={this.onDragEnd}
                >
                  <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                    {this.state.collections[collectionId].name}
                  </Accordion.Toggle>
                  <DropdownButton
                    alignRight
                    title=''
                    id='dropdown-menu-align-right'
                    style={{ float: 'right' }}
                  >
                    <Dropdown.Item
                      eventKey='1'
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
                      eventKey='0'
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
                      eventKey='3'
                      onClick={() => {
                        this.props.history.push({
                          pathname: `/dashboard/collections/${collectionId}/versions/new`
                        })
                      }}
                    >
                      Add Version
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey='3'
                      onClick={() => this.handleDuplicateCollection(this.state.collections[collectionId])
                      }
                    >
                      Duplicate
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey='1'>
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
                    />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          ))}
        </div>
      </div>
    )
  }
}
export default Collections
