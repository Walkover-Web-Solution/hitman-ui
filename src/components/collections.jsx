import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'
import { Route, Switch } from 'react-router-dom'
import CollectionForm from './collectionForm'
import collectionsService from '../services/collectionsService'
import collectionVersionsService from '../services/collectionVersionsService'
import CollectionVersions from './collectionVersions'
import CollectionVersionForm from './collectionVersionForm'
import GroupForm from './groupForm'
import groupsService from '../services/groupsService'
import PageForm from './pageForm'
import pageService from '../services/pageService'
import EndpointForm from './endpointForm'
import endpointService from '../services/endpointService'
import shortId from 'shortid'
import { toast } from 'react-toastify'

class Collections extends Component {
  state = {
    collections: [],
    versions: [],
    groups: [],
    pages: [],
    endpoints: []
  }

  async fetchVersions (collections) {
    let versions = []
    for (let i = 0; i < collections.length; i++) {
      const {
        data: versions1
      } = await collectionVersionsService.getCollectionVersions(
        collections[i].id
      )

      versions = [...versions, ...versions1]
    }
    return versions
  }

  async fetchGroups (versions) {
    let groups = []
    for (let i = 0; i < versions.length; i++) {
      const { data: groups1 } = await groupsService.getGroups(versions[i].id)
      groups = [...groups, ...groups1]
    }
    return groups
  }

  async fetchPagesVersion (versions) {
    let pages = []
    for (let i = 0; i < versions.length; i++) {
      const version = versions[i]
      let { data: newPages } = await pageService.getVersionPages(version.id)
      pages = [...pages, ...newPages]
    }
    return pages
  }

  async fetchEndpoints (groups) {
    let endpoints = []
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      let { data: newEndpoint } = await endpointService.getEndpoints(group.id)
      endpoints = [...endpoints, ...newEndpoint]
    }
    return endpoints
  }

  async componentDidMount () {
    const { data: collections } = await collectionsService.getCollections()
    this.setState({ collections })
    const versions = await this.fetchVersions(collections)
    const groups = await this.fetchGroups(versions)
    const pages = await this.fetchPagesVersion(versions)
    const endpoints = await this.fetchEndpoints(groups)
    this.setState({ versions, groups, pages, endpoints })
  }

  async handleAdd (newCollection) {
    newCollection.requestId = shortId.generate()
    const originalCollections = [...this.state.collections]
    const collections = [...this.state.collections, newCollection]
    this.setState({ collections })
    try {
      const { data: collection } = await collectionsService.saveCollection(
        newCollection
      )
      const index = collections.findIndex(
        c => c.requestId === collection.requestId
      )
      collections[index] = collection
      const {
        data: version
      } = await collectionVersionsService.getCollectionVersions(collection.id)
      const versions = [...this.state.versions, ...version]
      this.setState({ collections, versions })
    } catch (ex) {
      toast.error(ex.response.data)
      this.setState({ collections: originalCollections })
    }
  }

  async handleDelete (collection) {
    const originalCollections = [...this.state.collections]
    const collections = this.state.collections.filter(
      c => c.id !== collection.id
    )
    this.setState({ collections })
    try {
      await collectionsService.deleteCollection(collection.id)
    } catch (ex) {
      toast.error(ex)
      this.setState({ collections: originalCollections })
    }
  }

  async handleUpdate (editedCollection) {
    const originalCollections = [...this.state.collections]
    const body = { ...editedCollection }
    delete body.id
    const index = this.state.collections.findIndex(
      collection => collection.id === editedCollection.id
    )
    const collections = [...this.state.collections]
    collections[index] = editedCollection
    this.setState({ collections })
    try {
      await collectionsService.updateCollection(editedCollection.id, body)
    } catch (ex) {
      toast.error(ex.response.data)
      this.setState({ collections: originalCollections })
    }
  }

  async handleAddVersion (newCollectionVersion, collectionId) {
    newCollectionVersion.requestId = shortId.generate()

    const originalVersions = [...this.state.versions]
    const versions = [...this.state.versions, newCollectionVersion]
    this.setState({ versions })
    try {
      const {
        data: version
      } = await collectionVersionsService.saveCollectionVersion(
        collectionId,
        newCollectionVersion
      )
      const index = versions.findIndex(
        v => v.requestId === newCollectionVersion.requestId
      )
      versions[index] = version
      this.setState({ versions })
    } catch (ex) {
      toast.error(ex.response.data)
      this.setState({ versions: originalVersions })
    }
  }

  async handleDeleteVersion (deletedCollectionVersionId) {
    const originalVersions = [...this.state.versions]
    const versions = this.state.versions.filter(
      v => v.id !== deletedCollectionVersionId
    )
    this.setState({ versions })
    try {
      await collectionVersionsService.deleteCollectionVersion(
        deletedCollectionVersionId
      )
    } catch (ex) {
      toast.error(ex)
      this.setState({ versions: originalVersions })
    }
  }

  async handleUpdateVersion (version) {
    const originalVersions = [...this.state.versions]
    const body = { ...version }
    delete body.id
    delete body.collectionId
    const index = this.state.versions.findIndex(v => v.id === version.id)
    const versions = [...this.state.versions]
    versions[index] = version
    this.setState({ versions })
    try {
      await collectionVersionsService.updateCollectionVersion(version.id, body)
    } catch (ex) {
      toast.error(ex.response.data)
      this.setState({ versions: originalVersions })
    }
  }

  async handleAddGroup (versionId, newGroup) {
    newGroup.requestId = shortId.generate()
    const originalGroups = [...this.state.groups]
    const groups = [...this.state.groups, { ...newGroup, versionId }]
    this.setState({ groups })
    try {
      const { data: group } = await groupsService.saveGroup(versionId, newGroup)
      const index = groups.findIndex(g => g.requestId === group.requestId)
      groups[index] = group
      this.setState({ groups })
    } catch (ex) {
      toast.error(ex.response.data)
      this.setState({ groups: originalGroups })
    }
  }

  async handleDeleteGroup (deletedGroupId) {
    const originalGroups = [...this.state.groups]
    const groups = this.state.groups.filter(g => g.id !== deletedGroupId)
    this.setState({ groups })
    try {
      await groupsService.deleteGroup(deletedGroupId)
    } catch (ex) {
      toast.error(ex)
      this.setState({ groups: originalGroups })
    }
  }

  async handleUpdateGroup (editedGroup) {
    const originalGroups = [...this.state.groups]
    const groups = [...this.state.groups]
    const index = groups.findIndex(g => g.id === editedGroup.id)
    groups[index] = editedGroup
    this.setState({ groups })
    try {
      const body = { ...editedGroup }
      delete body.versionId
      const { data: group } = await groupsService.updateGroup(
        editedGroup.id,
        body
      )
      const index = groups.findIndex(g => g.id === group.id)
      groups[index] = group
      this.setState({ groups })
    } catch (ex) {
      toast.error(ex.response.data)
      this.setState({ groups: originalGroups })
    }
  }

  async handleAddVersionPage (versionId, newPage) {
    const { data: page } = await pageService.saveVersionPage(versionId, newPage)
    let pages = [...this.state.pages, { ...page }]
    let pageId = page.id
    this.setState({ pages })
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${pageId}/edit`,
      page: page
    })
  }
  async handleAddGroupPage (versionId, groupId, newPage) {
    const { data: page } = await pageService.saveGroupPage(groupId, newPage)
    let pages = [...this.state.pages, { ...page }]
    let pageId = page.id
    this.setState({ pages })
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${pageId}/edit`,
      page: page
    })
  }

  async handleAddEndpoint (groupId, newEndpoint) {
    const originalEndpoints = [...this.state.endpoints]
    newEndpoint.requestId = shortId.generate()
    const endpoints = [...this.state.endpoints, newEndpoint]
    this.setState({ endpoints })
    let endpoint = {}
    try {
      const { data } = await endpointService.saveEndpoint(groupId, newEndpoint)
      endpoint = data
      const index = endpoints.findIndex(
        e => e.requestId === newEndpoint.requestId
      )
      endpoints[index] = endpoint
      this.setState({ endpoints })
    } catch (ex) {
      this.setState({ originalEndpoints })
    }
    this.props.history.push({
      pathname: `/dashboard/collections/endpoints/${endpoint.id}`,
      endpoint: endpoint,
      groups: this.state.groups,
      title: 'Add New Endpoint'
    })
  }

  // async handleUpdatePage(editedEndpoint, groupId, versionId) {
  //   const { data: editEndpoint } = await endpointService.updatePage(
  //     groupId,
  //     editedEndpoint
  //   );
  //   const endpoints = [
  //     ...this.state.endpoints.filter(group => group.id !== groupId),
  //     { ...editEndpoint }
  //   ];
  //   this.setState({ endpoints });
  // }

  async handleDeletePage (deletedPageId) {
    const originalPages = [...this.state.pages]
    const pages = this.state.pages.filter(page => page.id !== deletedPageId)
    this.setState({ pages })
    try {
      await pageService.deletePage(deletedPageId)
    } catch (ex) {
      toast.error(ex)
      this.setState({ pages: originalPages })
    }
  }

  async handleDeleteEndpoint (deleteEndpointId) {
    await endpointService.deleteEndpoint(deleteEndpointId)
    const endpoints = this.state.endpoints.filter(
      endpoint => endpoint.id !== deleteEndpointId
    )
    this.setState({ endpoints })
  }

  async handleUpdatePage (editedPage, pageId) {
    const originalPages = [...this.state.pages]
    let pages = [...this.state.pages]
    const index = pages.findIndex(p => p.id === pageId)
    pages[index] = editedPage
    this.setState({ pages })
    try {
      await pageService.updatePage(pageId, editedPage)
    } catch (ex) {
      toast.error(ex.response.data)
      this.setState({ pages: originalPages })
    }
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${pageId}`,
      page: editedPage
    })
  }

  render () {
    const { location } = this.props

    if (location.editedEndpoint) {
      const { editedEndpoint, groupId, versionId } = location
      this.props.history.replace({ editedEndpoint: null })
      this.handleUpdateEndpoint(editedEndpoint, groupId, versionId)
    }

    if (location.deleteEndpointId) {
      const deleteEndpointId = location.deleteEndpointId
      this.props.history.replace({ deleteEndpointId: null })
      this.handleDeleteEndpoint(deleteEndpointId)
    }

    if (location.newEndpoint) {
      const { newEndpoint, groupId } = location
      this.props.history.replace({ groupId: null, newPage: null })

      this.handleAddEndpoint(groupId, newEndpoint)
    }

    if (location.newPage && location.groupId) {
      const { versionId, newPage, groupId } = location
      this.props.history.replace({
        versionId: null,
        groupId: null,
        newPage: null
      })
      this.handleAddGroupPage(versionId, groupId, newPage)
    } else if (location.newPage) {
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
                path='/dashboard/collections/:collectionId/versions/:versionId/groups/:groupId/endpoints/:endpointId/edit'
                render={props => (
                  <EndpointForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Edit Endpoint'
                  />
                )}
              />
              <Route
                path='/dashboard/collections/:collectionId/versions/:versionId/groups/:groupId/endpoints/new'
                render={props => (
                  <EndpointForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Add New Endpoint'
                  />
                )}
              />
              <Route
                path='/dashboard/collections/:id/versions/:versionId/groups/:groupId/pages/new'
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Add New Page'
                  />
                )}
              />
              <Route
                path='/dashboard/collections/:id/versions/:versionId/pages/:pageId/edit'
                render={props => (
                  <PageForm
                    {...props}
                    show={true}
                    onHide={() => {}}
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
                    onHide={() => {}}
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
                    onHide={() => {}}
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
                    onHide={() => {}}
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
                    onHide={() => {}}
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
                    onHide={() => {}}
                    title='Edit Collection Version'
                    editCollectionVersion={this.props.editCollectionVersion}
                  />
                )}
              />
              <Route
                path='/dashboard/collections/new'
                render={props => (
                  <CollectionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
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
                    onHide={() => {}}
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
          {this.state.collections.map(collection => (
            <Accordion key={collection.id || collection.requestId}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                    {collection.name}
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
                          pathname: `/dashboard/collections/${collection.id}/edit`,
                          editedcollection: collection
                        })
                      }}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey='2'
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you wish to delete this collection?' +
                              '\n' +
                              ' All your versions, groups, pages and endpoints present in this collection will be deleted.'
                          )
                        )
                          this.handleDelete(collection)
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey='3'
                      onClick={() => {
                        this.props.history.push({
                          pathname: `/dashboard/collections/${collection.id}/versions/new`
                        })
                      }}
                    >
                      Add Version
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey='1'>
                  <Card.Body>
                    <CollectionVersions
                      {...this.props}
                      collection_id={collection.id}
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
    )
  }
}
export default Collections
