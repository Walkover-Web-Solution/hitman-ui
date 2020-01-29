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

class Collections extends Component {
  state = {
    collections: [],
    versions: [],
    groups: [],
    selectedCollection: {}
  }

  async fetchVersions (collections) {
    let versions = []
    for (let i = 0; i < collections.length; i++) {
      const {
        data: versions1
      } = await collectionVersionsService.getCollectionVersions(
        collections[i].identifier
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

  async componentDidMount () {
    const { data: collections } = await collectionsService.getCollections()
    this.setState({ collections })
    const versions = await this.fetchVersions(collections)
    const groups = await this.fetchGroups(versions)
    this.setState({ versions, groups })
  }

  //Add Collection
  async handleAdd (newCollection) {
    if (newCollection.identifier) {
      const body = { ...newCollection }
      delete body.identifier
      const index = this.state.collections.findIndex(
        collection => collection.identifier === newCollection.identifier
      )
      await collectionsService.updateCollection(newCollection.identifier, body)
      const collections = [...this.state.collections]
      collections[index] = body
      this.setState({ collections })
    } else {
      const { data: collection } = await collectionsService.saveCollection(
        newCollection
      )
      const collections = [...this.state.collections, collection]
      this.setState({ collections })
    }
  }

  //Delete Collection
  async handleDelete (collection) {
    this.props.history.replace({ newCollection: null })
    const collections = this.state.collections.filter(
      c => c.identifier !== collection.identifier
    )
    this.setState({ collections })
    await collectionsService.deleteCollection(collection.identifier)
  }

  //Update Collection
  handleUpdate (collection) {
    this.state.selectedCollection = collection
    this.props.history.push(`/collections/${collection.name}/edit`)
  }

  //Add Version
  handleAddVersion (collection) {
    this.state.selectedCollection = collection
    this.props.history.push(`/collections/${collection.name}/versions/new`)
  }

  //Delete Version
  async handleDeleteVersion (deletedCollectionVersionId) {
    const versions = this.state.versions.filter(
      v => v.id !== deletedCollectionVersionId
    )
    this.setState({ versions })
    await collectionVersionsService.deleteCollectionVersion(
      deletedCollectionVersionId
    )
  }

  async handleAddGroup (versionId, newGroup) {
    let groups = [...this.state.groups, { ...newGroup, versionId, id: 23 }]
    console.log(groups)
    this.setState({ groups })
    await groupsService.saveGroup(versionId, newGroup)
  }

  render () {
    console.log(this.state)
    const { location } = this.props
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
      const versions1 = this.state.versions.filter(v => v.id !== version.id)
      const versions = [...versions1, version]
      this.setState({ versions })
    }

    if (location.newCollectionVersion) {
      const newCollectionVersion = location.newCollectionVersion
      this.props.history.replace({ newCollectionVersion: null })
      const versions = [...this.state.versions, newCollectionVersion]
      this.setState({ versions })
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
                path='/collections/:collectionId/versions/:versionId/groups/new'
                render={props => (
                  <GroupForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Add new Group'
                    versionId={this.props.location.versionId}
                  />
                )}
              />
              <Route
                path='/collections/:id/versions/new'
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Add new Collection Version'
                    collectionIdentifier={
                      this.state.selectedCollection.identifier
                    }
                  />
                )}
              />
              <Route
                path='/collections/:collectionId/versions/:versionId/edit'
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
                path='/collections/new'
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
                path='/collections/:id/edit'
                render={props => (
                  <CollectionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Edit Collection'
                    selectedCollection={this.state.selectedCollection}
                  />
                )}
              />
            </Switch>
          </div>
        </div>
        <div className='App-Side'>
          <button className='btn btn-default btn-lg'>
            <Link to='/collections/new'>+ New Collection</Link>
          </button>
          {this.state.collections.map((collection, index) => (
            <Accordion key={collection.identifier}>
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
                      onClick={() => this.handleUpdate(collection)}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey='2'
                      onClick={() => this.handleDelete(collection)}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey='3'
                      onClick={() => this.handleAddVersion(collection)}
                    >
                      Add Version
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey='1'>
                  <Card.Body>
                    <CollectionVersions
                      {...this.props}
                      collectionId={collection.id}
                      versions={this.state.versions}
                      groups={this.state.groups}
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
